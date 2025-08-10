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
import { CameraView, Camera } from 'expo-camera';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  setScanningBarcode, 
  setScannedBarcodeData, 
  clearBarcodeData,
  setError,
  clearError
} from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const BarcodeScannerScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    isScanningBarcode,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setHasPermission(false);
      }
    };

    getPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isScanningBarcode) return;
    
    setScanned(true);
    dispatch(setScanningBarcode(true));
    
    try {
      Vibration.vibrate(200);
    } catch (error) {
      console.error(error);
      console.log('Vibration not available');
    }

    try {
      const result = await patientAPI.scanMedicationBarcode(data);
      dispatch(setScannedBarcodeData(result));
      showMedicationDialog(result);
    } catch (error: any) {
      dispatch(setError(error.message));
      Alert.alert(
        'Scan Failed',
        error.message || 'Failed to scan barcode. Please try again.',
        [
          { text: 'Retry', onPress: resetScanner },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      dispatch(setScanningBarcode(false));
    }
  };

  const showMedicationDialog = (data: any) => {
    const { medication } = data;
    
    Alert.alert(
      'Medication Found',
      `${medication.name} (${medication.dosage}${medication.dosageUnit})\n\nInstructions: ${medication.instructions || 'No special instructions'}\n\nDays left: ${medication.daysLeft}\n\nTake this medication now?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: resetScanner,
        },
        {
          text: 'Take Now',
          style: 'default',
          onPress: () => confirmMedicationTaken(medication),
        },
      ]
    );
  };

  const confirmMedicationTaken = async (medication: any) => {
    try {
      await patientAPI.logMedicationTaken(medication.id, {
        takenAt: new Date().toISOString(),
        notes: 'Taken via barcode scan'
      });

      Alert.alert(
        'Dose Recorded',
        `Your ${medication.name} dose has been logged successfully.`,
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
      Alert.alert('Error', error.message, [{ text: 'OK', onPress: resetScanner }]);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    dispatch(clearBarcodeData());
    dispatch(clearError());
  };

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
          <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan medication barcodes
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
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
        <View style={styles.cameraView}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8"],
            }}
          />
          
          <View style={styles.scannerOverlay}>
            {!isConnected && (
              <View style={styles.connectionWarning}>
                <Ionicons name="wifi-outline" size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Offline mode: Scan results may not be real-time
                </Text>
              </View>
            )}
            
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scannerFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
              <View style={styles.overlaySide} />
            </View>
          </View>

          {isScanningBarcode && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.scanningText}>Processing barcode...</Text>
            </View>
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <View style={styles.instructionCard}>
            <Ionicons name="qr-code" size={24} color="#2563EB" />
            <Text style={styles.instructionTitle}>Scan Medication Barcode</Text>
            <Text style={styles.instructionText}>
              Position the barcode within the frame. The app will automatically detect and process it.
            </Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetScanner}
            disabled={isScanningBarcode}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Reset</Text>
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
  permissionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    marginVertical: SPACING[4],
    textAlign: 'center',
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
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
  overlayMiddle: {
    flexDirection: 'row',
    height: 200,
    marginTop: 100,
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
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    width: 150,
  },
  scanningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFFFFF',
    marginTop: SPACING[2],
    textAlign: 'center',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 50,
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
    marginVertical: SPACING[2],
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: SPACING[8],
    left: SPACING[5],
    right: SPACING[5],
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    backgroundColor: '#2563EB',
    minWidth: 120,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: SPACING[1],
  },
});

export default BarcodeScannerScreen;