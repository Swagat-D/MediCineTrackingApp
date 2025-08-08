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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PatientTabParamList } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width, height } = Dimensions.get('window');

type Props = BottomTabScreenProps<PatientTabParamList, 'Scanner'>;

interface ScannedMedication {
  id: string;
  name: string;
  dosage: string;
  nextDoseTime: string;
  instructions: string;
  alreadyTaken: boolean;
}

const BarcodeScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // In a real app, you would request camera permissions here
    setHasPermission(true);
  }, []);

  // Mock barcode scanning result
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setIsScanning(false);
    Vibration.vibrate(200);

    // Mock medication data based on scanned barcode
    const mockMedication: ScannedMedication = {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      nextDoseTime: '20:00',
      instructions: 'Take with food',
      alreadyTaken: Math.random() > 0.5, // Random for demo
    };

    setTimeout(() => {
      if (mockMedication.alreadyTaken) {
        showAlreadyTakenDialog(mockMedication);
      } else {
        showConfirmDoseDialog(mockMedication);
      }
    }, 500);
  };

  const showConfirmDoseDialog = (medication: ScannedMedication) => {
    Alert.alert(
      'Medication Confirmed',
      `${medication.name} (${medication.dosage})\n\nNext dose: ${medication.nextDoseTime}\nInstructions: ${medication.instructions}\n\nTake this medication now?`,
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

  const showAlreadyTakenDialog = (medication: ScannedMedication) => {
    Alert.alert(
      'Already Taken',
      `${medication.name} (${medication.dosage})\n\nYou have already taken this medication for the scheduled time. Taking it again may cause an overdose.\n\nPlease wait for your next scheduled dose.`,
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
            // Navigate to emergency/contact
            navigation.navigate('SOS');
          },
        },
      ]
    );
  };

  const confirmMedicationTaken = (medication: ScannedMedication) => {
    Alert.alert(
      'Dose Recorded',
      `Your ${medication.name} dose has been logged successfully.\n\nNext dose: Tomorrow at ${medication.nextDoseTime}`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetScanner();
            // Navigate back to home or medication list
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const resetScanner = () => {
    setScanned(false);
    setIsScanning(true);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
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
          <TouchableOpacity style={styles.permissionButton} onPress={() => setHasPermission(true)}>
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
        {/* Mock Camera View */}
        <View style={styles.cameraView}>
          <View style={styles.scannerOverlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />
            
            {/* Middle section with scanner frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scannerFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                {isScanning && (
                  <View style={styles.scanningLine} />
                )}
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom overlay */}
            <View style={styles.overlayBottom} />
          </View>
        </View>

        {/* Scanner Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionCard}>
            <Ionicons name="qr-code" size={24} color="#2563EB" />
            <Text style={styles.instructionTitle}>Scan Medication Barcode</Text>
            <Text style={styles.instructionText}>
              Position the barcode within the frame. The app will automatically detect and scan it.
            </Text>
          </View>

          {scanned && (
            <View style={styles.processingCard}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <Text style={styles.processingText}>Barcode scanned successfully!</Text>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
          >
            <Ionicons 
              name={flashOn ? "flash" : "flash-off"} 
              size={24} 
              color={flashOn ? "#F59E0B" : "#FFFFFF"} 
            />
            <Text style={styles.controlButtonText}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.scanButton]}
            onPress={() => handleBarCodeScanned({ data: 'mock-barcode-123' })}
            disabled={scanned}
          >
            <Ionicons name="scan" size={28} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>
              {scanned ? 'Processing...' : 'Tap to Scan'}
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  scanButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: SPACING[6],
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
});

export default BarcodeScannerScreen;