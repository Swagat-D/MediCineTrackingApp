/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

// Components
import Button from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

const { width } = Dimensions.get('window');

type Props = CaregiverStackScreenProps<'BarcodeGenerator'>;

interface MedicationInfo {
  id: string;
  name: string;
  patientName: string;
  dosage: string;
  dosageUnit: string;
  frequency: number;
  timingRelation: string;
  instructions?: string;
  barcode: string;
  createdAt: string;
}

const BarcodeGeneratorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { medicationId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo>({
    id: medicationId,
    name: 'Metformin',
    patientName: 'John Smith',
    dosage: '500',
    dosageUnit: 'mg',
    frequency: 2,
    timingRelation: 'after_food',
    instructions: 'Take with plenty of water',
    barcode: 'MEDI_MTF500_JS_001',
    createdAt: '2024-08-05T10:30:00Z',
  });

  const barcodeRef = React.useRef<View>(null);

  useEffect(() => {
    loadMedicationInfo();
  }, []);

  const loadMedicationInfo = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch medication info
      // const info = await caregiverAPI.getMedicationInfo(medicationId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading medication info:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load medication information.');
    }
  };

  const generateBarcodeData = () => {
    return `${medicationInfo.name}|${medicationInfo.dosage}${medicationInfo.dosageUnit}|${medicationInfo.frequency}x|${medicationInfo.timingRelation}|${medicationInfo.patientName}`;
  };

  const formatTimingRelation = (relation: string) => {
    switch (relation) {
      case 'before_food':
        return 'Before Food';
      case 'after_food':
        return 'After Food';
      case 'with_food':
        return 'With Food';
      case 'empty_stomach':
        return 'Empty Stomach';
      case 'anytime':
        return 'Anytime';
      default:
        return relation;
    }
  };

  const handleSaveBarcode = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your gallery.');
        return;
      }

      // Capture the barcode view
      const uri = await captureRef(barcodeRef, {
        format: 'png',
        quality: 1,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('MediTracker Barcodes', asset, false);

      Alert.alert('Success', 'Barcode saved to your gallery!');
    } catch (error) {
      console.error('Error saving barcode:', error);
      Alert.alert('Error', 'Failed to save barcode to gallery.');
    }
  };

  const handlePrintBarcode = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medication Barcode</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .barcode-container {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px auto;
              max-width: 300px;
              background: white;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 20px 0;
              padding: 10px;
              background: #f0f0f0;
              border: 1px solid #ccc;
            }
            .medication-info {
              text-align: left;
              margin: 15px 0;
            }
            .patient-name {
              font-size: 18px;
              font-weight: bold;
              color: #2196F3;
              margin-bottom: 10px;
            }
            .medication-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .dosage-info {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .instructions {
              font-size: 12px;
              color: #888;
              font-style: italic;
              margin-top: 10px;
            }
            .footer {
              font-size: 10px;
              color: #999;
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="patient-name">${medicationInfo.patientName}</div>
            <div class="medication-name">${medicationInfo.name}</div>
            <div class="dosage-info">
              ${medicationInfo.dosage} ${medicationInfo.dosageUnit} • 
              ${medicationInfo.frequency} times daily • 
              ${formatTimingRelation(medicationInfo.timingRelation)}
            </div>
            <div class="barcode">${medicationInfo.barcode}</div>
            ${medicationInfo.instructions ? `<div class="instructions">${medicationInfo.instructions}</div>` : ''}
            <div class="footer">
              MediTracker • Generated on ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `;

      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error printing barcode:', error);
      Alert.alert('Error', 'Failed to print barcode.');
    }
  };

  const handleShareBarcode = async () => {
    try {
      const message = `Medication Barcode for ${medicationInfo.patientName}

Medication: ${medicationInfo.name}
Dosage: ${medicationInfo.dosage} ${medicationInfo.dosageUnit}
Frequency: ${medicationInfo.frequency} times daily
Timing: ${formatTimingRelation(medicationInfo.timingRelation)}
${medicationInfo.instructions ? `Instructions: ${medicationInfo.instructions}` : ''}

Barcode: ${medicationInfo.barcode}

Generated by MediTracker`;

      await Share.share({
        message,
        title: 'Medication Barcode',
      });
    } catch (error) {
      console.error('Error sharing barcode:', error);
    }
  };

  const renderBarcodeDisplay = () => (
    <View ref={barcodeRef} style={styles.barcodeContainer}>
      {/* Patient Header */}
      <View style={styles.barcodeHeader}>
        <Text style={styles.patientName}>{medicationInfo.patientName}</Text>
        <View style={styles.medicationBadge}>
          <Ionicons name="medical" size={16} color={COLORS.primary[500]} />
          <Text style={styles.medicationBadgeText}>MEDICATION</Text>
        </View>
      </View>

      {/* Medication Info */}
      <View style={styles.medicationDetails}>
        <Text style={styles.medicationName}>{medicationInfo.name}</Text>
        <Text style={styles.dosageInfo}>
          {medicationInfo.dosage} {medicationInfo.dosageUnit} • {medicationInfo.frequency} times daily
        </Text>
        <Text style={styles.timingInfo}>
          Take {formatTimingRelation(medicationInfo.timingRelation).toLowerCase()}
        </Text>
      </View>

      {/* Barcode */}
      <View style={styles.barcodeDisplay}>
        <View style={styles.barcodeStripes}>
          {/* Simulated barcode stripes */}
          {Array.from({ length: 30 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.barcodeStripe,
                {
                  width: Math.random() > 0.5 ? 2 : 4,
                  backgroundColor: Math.random() > 0.3 ? COLORS.gray[900] : 'transparent',
                }
              ]}
            />
          ))}
        </View>
        <Text style={styles.barcodeText}>{medicationInfo.barcode}</Text>
      </View>

      {/* Instructions */}
      {medicationInfo.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>Instructions:</Text>
          <Text style={styles.instructionsText}>{medicationInfo.instructions}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.barcodeFooter}>
        <Text style={styles.footerText}>
          Generated by MediTracker • {new Date(medicationInfo.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.scanInstructions}>
          Scan this code when taking medication
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Medication Barcode</Text>
        
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="scan-outline" size={24} color={COLORS.primary[500]} />
            <Text style={styles.instructionsTitle}>How to Use This Barcode</Text>
          </View>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Print or save this barcode</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Attach to medication container</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Patient scans when taking medication</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>System tracks adherence automatically</Text>
            </View>
          </View>
        </View>

        {/* Barcode Display */}
        {renderBarcodeDisplay()}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <Button
              title="Save to Gallery"
              onPress={handleSaveBarcode}
              variant="outline"
              style={styles.actionButton}
              icon={<Ionicons name="download-outline" size={18} color={COLORS.primary[500]} />}
            />
            
            <Button
              title="Print"
              onPress={handlePrintBarcode}
              variant="outline"
              style={styles.actionButton}
              icon={<Ionicons name="print-outline" size={18} color={COLORS.primary[500]} />}
            />
          </View>

          <Button
            title="Share Barcode"
            onPress={handleShareBarcode}
            style={styles.shareButton}
            icon={<Ionicons name="share-outline" size={18} color={COLORS.background} />}
          />
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Print on white paper for better scanning</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Keep barcode clean and unfolded</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Store in a dry place away from direct sunlight</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Test scanning before attaching to medication</Text>
            </View>
          </View>
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.warning} />
            <Text style={styles.safetyTitle}>Important Safety Information</Text>
          </View>
          <Text style={styles.safetyText}>
            This barcode is unique to this specific medication and patient. 
            Do not share with others or use for different medications. 
            Always verify medication details before taking.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING[2],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  infoButton: {
    padding: SPACING[2],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[6],
  },
  instructionsCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[6],
    borderWidth: 1,
    borderColor: COLORS.primary[100],
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
    gap: SPACING[3],
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.primary[700],
  },
  instructionsList: {
    gap: SPACING[3],
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[500],
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[700],
    flex: 1,
  },
  barcodeContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    marginBottom: SPACING[6],
    ...SHADOWS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  barcodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
    paddingBottom: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  patientName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  medicationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    gap: SPACING[1],
  },
  medicationBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  medicationDetails: {
    marginBottom: SPACING[5],
  },
  medicationName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  dosageInfo: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
    fontWeight: '500',
    marginBottom: SPACING[1],
  },
  timingInfo: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.hint,
    fontStyle: 'italic',
  },
  barcodeDisplay: {
    alignItems: 'center',
    marginBottom: SPACING[4],
    backgroundColor: COLORS.gray[50],
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
  },
  barcodeStripes: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: SPACING[3],
    gap: 1,
  },
  barcodeStripe: {
    height: '100%',
  },
  barcodeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  instructionsContainer: {
    backgroundColor: COLORS.warning + '10',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[3],
  },
  instructionsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING[1],
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  barcodeFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING[3],
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.hint,
    marginBottom: SPACING[1],
  },
  scanInstructions: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary[500],
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: SPACING[6],
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  actionButton: {
    flex: 1,
  },
  shareButton: {
    width: '100%',
  },
  tipsContainer: {
    backgroundColor: COLORS.success + '10',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[6],
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING[4],
  },
  tipsList: {
    gap: SPACING[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[2],
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  safetyNotice: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  safetyTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  safetyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});

export default BarcodeGeneratorScreen;