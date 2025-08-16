import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
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
const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const BarcodeScannerScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    isScanningBarcode,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isActive, setIsActive] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  // Blue theme colors
  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    success: '#059669',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  useEffect(() => {
    // Request permissions on mount
    if (!permission?.granted) {
      requestPermission();
    }

    // Focus/unfocus handling
    const unsubscribe = navigation.addListener('focus', () => {
      setIsActive(true);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsActive(false);
      resetScanner();
    });

    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, permission]);
  
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
  if (scanned || isScanningBarcode || !isActive) return;
  
  setScanned(true);
  dispatch(setScanningBarcode(true));
  
  // Haptic feedback
  try {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([100]);
    } else {
      Vibration.vibrate(200);
    }
  } catch (error) {
    console.error(error)
    console.log('Vibration not available');
  }

  try {
    // DETAILED LOGGING
    console.log('=== BARCODE SCAN DEBUG ===');
    console.log('Raw scanned data:', JSON.stringify(data));
    console.log('Data length:', data.length);
    console.log('Starts with MT:', data.startsWith('MT'));
    console.log('Character codes:', data.split('').map(char => `${char}:${char.charCodeAt(0)}`));
    console.log('=========================');
    
    // Check for hidden characters or whitespace
    const trimmedData = data.trim();
    console.log('Trimmed data:', JSON.stringify(trimmedData));
    console.log('Trimmed length:', trimmedData.length);
    
    // Validate barcode format - use trimmed data
    if (!trimmedData || !trimmedData.startsWith('MT') || trimmedData.length !== 10) {
      console.log('VALIDATION FAILED:');
      console.log('- Has data:', !!trimmedData);
      console.log('- Starts with MT:', trimmedData.startsWith('MT'));
      console.log('- Length is 10:', trimmedData.length === 10);
      throw new Error(`Invalid medication barcode. Please scan a valid MediTracker barcode. Got: "${trimmedData}" (length: ${trimmedData.length})`);
    }

    // Call API with the trimmed barcode data
    const result = await patientAPI.scanMedicationBarcode(trimmedData);
    dispatch(setScannedBarcodeData(result));
    showMedicationDialog(result);
  } catch (error: any) {
    console.error('Barcode scan error:', error);
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
  const { medication, dosingSafety } = data;
  
  if (!dosingSafety.canTake) {
    // RED LIGHT - Cannot take medication
    Alert.alert(
      '🔴 STOP - Do Not Take',
      `${medication.name} (${medication.dosage}${medication.dosageUnit})\n\n❌ ${dosingSafety.reason}\n\n` +
      `${dosingSafety.nextDoseTime ? 
        `Next dose: ${new Date(dosingSafety.nextDoseTime).toLocaleTimeString()}\n` +
        `Time remaining: ${dosingSafety.hoursRemaining} hours` 
        : ''}\n\n` +
      `Last taken: ${medication.lastTaken ? 
        new Date(medication.lastTaken).toLocaleString() : 'Never'}\n\n` +
      `⚠️ Taking this medication now could be dangerous.`,
      [
        {
          text: 'I Understand',
          style: 'default',
          onPress: resetScanner,
        },
        {
          text: 'Emergency Override',
          style: 'destructive',
          onPress: () => showEmergencyOverride(medication),
        },
      ]
    );
  } else {
    // GREEN LIGHT - Safe to take medication
    Alert.alert(
      '🟢 SAFE TO TAKE',
      `${medication.name} (${medication.dosage}${medication.dosageUnit})\n\n` +
      `✅ Safe to take now\n\n` +
      `Frequency: ${medication.frequency} times daily\n` +
      `Timing: ${dosingSafety.recommendedTiming}\n` +
      `Instructions: ${medication.instructions || 'Take as directed'}\n\n` +
      `Days left: ${medication.daysLeft}\n\n` +
      `Take this medication now?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: resetScanner,
        },
        {
          text: '✅ Take Medication',
          style: 'default',
          onPress: () => confirmMedicationTaken(medication),
        },
      ]
    );
  }
};

const showEmergencyOverride = (medication: any) => {
  Alert.alert(
    '⚠️ Emergency Override',
    'This should only be used in medical emergencies or under doctor supervision.\n\nAre you sure you want to record this dose?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: resetScanner,
      },
      {
        text: 'Emergency Take',
        style: 'destructive',
        onPress: () => confirmMedicationTaken(medication, true),
      },
    ]
  );
};

const confirmMedicationTaken = async (medication: any, isEmergency = false) => {
  try {
    console.log('Recording medication taken:', medication.id);
    
    const result = await patientAPI.recordMedicationTaken(medication.id, {
      notes: isEmergency ? 'Emergency override dose' : 'Taken via barcode scan',
      takenAt: new Date().toISOString()
    });

    console.log('Medication recorded successfully:', result);

    Alert.alert(
      '✅ Dose Recorded',
      `Your ${medication.name} dose has been logged successfully.\n\n` +
      `Taken at: ${new Date().toLocaleTimeString()}\n` +
      `Remaining quantity: ${result.data?.remainingQuantity || 'Unknown'}\n` +
      `Days left: ${result.data?.remainingDays || 'Unknown'}`,
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
    console.error('Error recording medication:', error);
    Alert.alert(
      'Error', 
      error.message || 'Failed to record medication. Please try again.',
      [{ text: 'OK', onPress: resetScanner }]
    );
  }
};
  

  const resetScanner = () => {
    setScanned(false);
    dispatch(clearBarcodeData());
    dispatch(clearError());
    setIsActive(true);
  };

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
  };

  const flipCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  // Permission states
  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <PatientSecondaryNavbar
          title="Scanner"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
            style={[styles.permissionButton, { backgroundColor: theme.primary }]} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <PatientSecondaryNavbar
        title="Scan Medication"
        subtitle="Point camera at barcode"
        onBackPress={() => navigation.goBack()}
        onSOSPress={() => navigation.navigate('SOS')}
      />

      <View style={styles.scannerContainer}>
        {isActive && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={cameraType}
            flash={flashMode}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'code128',
                'code39',
                'code93',
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'codabar',
                'itf14',
                'pdf417',
                'aztec',
                'datamatrix'
              ],
            }}
          >
            {/* Scanner Overlay */}
            <View style={styles.scannerOverlay}>
              {/* Connection Warning */}
              {!isConnected && (
                <View style={styles.connectionWarning}>
                  <Ionicons name="wifi-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.warningText}>
                    Offline mode: Scan results may not be real-time
                  </Text>
                </View>
              )}

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionCard}>
                  <Ionicons name="qr-code" size={20} color={theme.primary} />
                  <Text style={styles.instructionTitle}>Scan Medication Barcode</Text>
                  <Text style={styles.instructionText}>
                    Position the barcode within the frame
                  </Text>
                </View>
              </View>

              {/* Scanning Frame */}
              <View style={styles.overlayContent}>
                <View style={styles.overlayTop} />
                
                <View style={styles.overlayMiddle}>
                  <View style={styles.overlaySide} />
                  <View style={styles.scannerFrame}>
                    <View style={[styles.corner, styles.cornerTL, { borderColor: theme.primary }]} />
                    <View style={[styles.corner, styles.cornerTR, { borderColor: theme.primary }]} />
                    <View style={[styles.corner, styles.cornerBL, { borderColor: theme.primary }]} />
                    <View style={[styles.corner, styles.cornerBR, { borderColor: theme.primary }]} />
                    
                    {/* Scanning Line Animation */}
                    {!scanned && (
                      <View style={styles.scanLineContainer}>
                        <View style={[styles.scanLine, { backgroundColor: theme.primary }]} />
                      </View>
                    )}
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                
                <View style={styles.overlayBottom} />
              </View>

              {/* Camera Controls */}
              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={[styles.controlButton, styles.flashButton]}
                  onPress={toggleFlash}
                  disabled={isScanningBarcode}
                >
                  <Ionicons 
                    name={flashMode === 'on' ? 'flash' : 'flash-off'} 
                    size={24} 
                    color={flashMode === 'on' ? theme.warning : '#FFFFFF'} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.resetButton, { backgroundColor: theme.primary }]}
                  onPress={resetScanner}
                  disabled={isScanningBarcode}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.controlButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.flipButton]}
                  onPress={flipCamera}
                  disabled={isScanningBarcode}
                >
                  <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Scanning Indicator */}
              {isScanningBarcode && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.scanningText}>Processing barcode...</Text>
                </View>
              )}
            </View>
          </CameraView>
        )}
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
    lineHeight: 22,
  },
  permissionButton: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  scannerOverlay: {
    flex: 1,
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
    marginTop: SPACING[2],
    gap: SPACING[2],
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    left: SPACING[4],
    right: SPACING[4],
    zIndex: 10,
  },
  instructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING[2],
  },
  instructionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    flex: 1,
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: Math.min(width * 0.6, 200),
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerFrame: {
    width: Math.min(width * 0.7, 280),
    height: Math.min(width * 0.6, 200),
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLineContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    transform: [{ translateY: -1 }],
  },
  scanLine: {
    height: 2,
    opacity: 0.8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING[8],
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flashButton: {
    width: 50,
    height: 50,
  },
  flipButton: {
    width: 50,
    height: 50,
  },
  resetButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    flexDirection: 'row',
    gap: SPACING[1],
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -40 }],
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    width: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  scanningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFFFFF',
    marginTop: SPACING[2],
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default BarcodeScannerScreen;