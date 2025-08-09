// src/screens/patient/BarcodeScannerScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PatientTabParamList } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  scanMedicationBarcode, 
  logMedicationTaken,
  clearBarcodeData,
  clearError
} from '../../store/slices/patientSlice';
// Updated imports for expo-barcode-scanner
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

const { width, height } = Dimensions.get('window');

type Props = BottomTabScreenProps<PatientTabParamList, 'Scanner'>;

const BarcodeScannerScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    scannedBarcodeData,
    isScanningBarcode,
    barcodeError,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Request camera permissions
    const getBarCodeScannerPermissions = async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setHasPermission(false);
      }
    };

    getBarCodeScannerPermissions();
  }, []);

  // Handle barcode scan
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isScanningBarcode) return;
    
    setScanned(true);
    setIsScanning(false);
    
    // Add vibration if available
    try {
      Vibration.vibrate(200);
    } catch (error) {
      console.log('Vibration not available');
    }

    try {
      // Scan the barcode using the API
      await dispatch(scanMedicationBarcode(data)).unwrap();
    } catch (error: any) {
      Alert.alert(
        'Scan Failed',
        error || 'Failed to scan barcode. Please try again.',
        [
          { text: 'Retry', onPress: resetScanner },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  // Handle scanned medication data
  useEffect(() => {
    if (scannedBarcodeData) {
      const { medication, patient } = scannedBarcodeData;
      
      // Check if medication was already taken today
      const lastTaken = medication.lastTaken ? new Date(medication.lastTaken) : null;
      const today = new Date();
      const isTakenToday = lastTaken && 
        lastTaken.toDateString() === today.toDateString();
      
      if (isTakenToday) {
        showAlreadyTakenDialog(medication);
      } else {
        showConfirmDoseDialog(medication);
      }
    }
  }, [scannedBarcodeData]);

  // Handle barcode errors
  useEffect(() => {
    if (barcodeError) {
      Alert.alert(
        'Scan Error',
        barcodeError,
        [
          { text: 'Retry', onPress: resetScanner },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  }, [barcodeError]);

  const showConfirmDoseDialog = (medication: any) => {
    Alert.alert(
      'Medication Confirmed',
      `${medication.name} (${medication.dosage}${medication.dosageUnit})\n\nInstructions: ${medication.instructions}\n\nDays left: ${medication.daysLeft}\n\nTake this medication now?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: resetScanner,
        },
        {
          text: 'Confirm & Take',
          style: 'default',
          onPress: () => confirmMedicationTaken(medication),
        },
      ]
    );
  };

  const showAlreadyTakenDialog = (medication: any) => {
    Alert.alert(
      'Already Taken',
      `${medication.name} (${medication.dosage}${medication.dosageUnit})\n\nYou have already taken this medication today. Taking it again may cause an overdose.\n\nPlease wait for your next scheduled dose.`,
      [
        {
          text: 'Understood',
          style: 'default',
          onPress: resetScanner,
        },
        {
          text: 'Contact Caregiver',
          style: 'default',
          onPress: () => {
            resetScanner();
            navigation.navigate('SOS');
          },
        },
      ]
    );
  };

  const confirmMedicationTaken = async (medication: any) => {
    try {
      await dispatch(logMedicationTaken({
        medicationId: medication.id,
        data: {
          takenAt: new Date().toISOString(),
          notes: 'Taken via barcode scan'
        }
      })).unwrap();

      Alert.alert(
        'Dose Recorded',
        `Your ${medication.name} dose has been logged successfully.\n\nNext dose: Check your medication schedule`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetScanner();
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error || 'Failed to log medication dose',
        [{ text: 'OK', onPress: resetScanner }]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsScanning(true);
    dispatch(clearBarcodeData());
    dispatch(clearError());
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  // Scanning indicator
  const ScanningIndicator = () => (
    isScanningBarcode && (
      <View style={styles.scanningIndicator}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.scanningText}>Processing barcode...</Text>
      </View>
    )
  );

  // Connection status warning
  const ConnectionWarning = () => (
    !isConnected && (
      <View style={styles.connectionWarning}>
        <Ionicons name="wifi-outline" size={20} color="#F59E0B" />
        <Text style={styles.warningText}>
          Offline mode: Scan results may not be real-time
        </Text>
      </View>
    )
  );

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="Scanner"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="Scanner"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan medication barcodes
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="Scan Medication"
        subtitle="Point camera at barcode"
        onBackPress={() => navigation.goBack()}
        onSOSPress={() => navigation.navigate('SOS')}
      />

      <View style={styles.scannerContainer}>
        {/* Camera View */}
        <View style={styles.cameraView}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr, BarCodeScanner.Constants.BarCodeType.code128]}
          />
          
          <View style={styles.scannerOverlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop}>
              <ConnectionWarning />
            </View>
            
            {/* Middle section with scanner frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scannerFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                {isScanning && !scanned && (
                  <View style={styles.scanningLine} />
                )}
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom overlay */}
            <View style={styles.overlayBottom} />
          </View>

          {/* Scanning indicator */}
          <ScanningIndicator />
        </View>

        {/* Scanner Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionCard}>
            <Ionicons name="qr-code" size={24} color="#2563EB" />
            <Text style={styles.instructionTitle}>Scan Medication Barcode</Text>
            <Text style={styles.instructionText}>
              Position the QR code or barcode within the frame. The app will automatically detect and process it.
            </Text>
          </View>

          {scannedBarcodeData && (
            <View style={styles.processingCard}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <Text style={styles.processingText}>
                {scannedBarcodeData.medication.name} found!
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              // For testing purposes - simulate a scan
              handleBarCodeScanned({ type: 'qr', data: 'MT_JS_MET500MG_12345678_ABC' });
            }}
            disabled={scanned || isScanningBarcode}
          >
            <Ionicons name="scan" size={28} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>
              {isScanningBarcode ? 'Processing...' : scanned ? 'Scanned!' : 'Test Scan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetScanner}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={18} color="#64748B" />
            <Text style={styles.helpText}>Need help scanning?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[8],
    backgroundColor: '#F8FAFC',
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  permissionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannerContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 200,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerFrame: {
    width: 250,
    height: 200,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2563EB',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2563EB',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2563EB',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2563EB',
  },
  scanningLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563EB',
    top: '50%',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING[5],
    right: SPACING[5],
  },
  instructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[2],
    marginBottom: SPACING[2],
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  processingCard: {
    backgroundColor: 'rgba(5, 150, 105, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    marginTop: SPACING[3],
    flexDirection: 'row',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING[2],
  },
  controlsContainer: {
    position: 'absolute',
    bottom: SPACING[8],
    left: SPACING[5],
    right: SPACING[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: RADIUS.lg,
    backgroundColor: '#2563EB',
    minWidth: 100,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: SPACING[1],
    textAlign: 'center',
  },
  helpSection: {
    position: 'absolute',
    bottom: SPACING[3],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
  },
  scanningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFFFFF',
    marginTop: SPACING[2],
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    margin: SPACING[4],
    gap: SPACING[2],
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
});

export default BarcodeScannerScreen;