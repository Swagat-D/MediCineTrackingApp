/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Picker } from '@react-native-picker/picker';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { generateBarcodeHTML, generateBarcodePattern } from '../../utils/barcodeUtils';

interface BarcodeData {
  patientName: string;
  barcodeData: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  timingRelation?: string;
}

interface PrintableBarcodeProps {
  visible: boolean;
  onClose: () => void;
  barcodes: BarcodeData[]; // Support multiple barcodes
  isBulkPrint?: boolean;
}

interface PrintSettings {
  paperSize: 'A4' | 'Letter' | 'Label';
  orientation: 'portrait' | 'landscape';
  labelsPerRow: number;
  labelSize: 'small' | 'medium' | 'large';
}

const { width, height } = Dimensions.get('window');

const PAPER_SIZES = {
  A4: { width: 595, height: 842, name: 'A4 (210 × 297 mm)' },
  Letter: { width: 612, height: 792, name: 'Letter (8.5 × 11 in)' },
  Label: { width: 288, height: 432, name: 'Label Sheet (4 × 6 in)' }
};

const LABEL_SIZES = {
  small: { width: 140, height: 80, name: 'Small (2" × 1.5")' },
  medium: { width: 180, height: 100, name: 'Medium (2.5" × 2")' },
  large: { width: 220, height: 120, name: 'Large (3" × 2.5")' }
};

const PrintableBarcode: React.FC<PrintableBarcodeProps> = ({
  visible,
  onClose,
  barcodes,
  isBulkPrint = false
}) => {
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    labelsPerRow: 2,
    labelSize: 'medium'
  });

  // Use first barcode for single print mode
  const singleBarcode = barcodes[0];

  const generateBarcodeStripes = (barcodeText: string) => {
  const pattern = generateBarcodePattern(barcodeText);
  return pattern.map((bar, index) => (
    <View
      key={index}
      style={[
        styles.barcodeStripe,
        {
          width: bar.width,
          backgroundColor: bar.isVisible ? '#000000' : 'transparent',
        }
      ]}
    />
  ));
};

  const generateSingleBarcodeHTML = (barcode: BarcodeData, labelSize: keyof typeof LABEL_SIZES) => {
  const size = LABEL_SIZES[labelSize];
  const barcodeHeight = labelSize === 'small' ? 30 : labelSize === 'medium' ? 35 : 40;
  
  return `
    <div class="barcode-label" style="
      width: ${size.width}px; 
      height: ${size.height}px;
      border: 2px solid #000; 
      padding: 8px; 
      background: white; 
      text-align: center;
      box-sizing: border-box;
      display: inline-block;
      margin: 5px;
      page-break-inside: avoid;
    ">
      <div class="patient-name" style="
        font-size: ${labelSize === 'small' ? '12px' : labelSize === 'medium' ? '14px' : '16px'}; 
        font-weight: bold; 
        color: #059669; 
        margin-bottom: 8px;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">${barcode.patientName}</div>
      
      ${generateBarcodeHTML(barcode.barcodeData, size.width - 20, barcodeHeight)}
      
      <div class="barcode-data" style="
        font-family: 'Courier New', monospace; 
        font-size: ${labelSize === 'small' ? '8px' : labelSize === 'medium' ? '9px' : '10px'}; 
        font-weight: bold; 
        letter-spacing: 0.5px; 
        margin: 4px 0;
        word-break: break-all;
        line-height: 1.2;
      ">${barcode.barcodeData}</div>
      
      <div class="medication-info" style="
        font-size: ${labelSize === 'small' ? '8px' : labelSize === 'medium' ? '9px' : '10px'}; 
        color: #666;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">${barcode.medicationName}</div>
      
      ${barcode.dosage ? `<div style="font-size: ${labelSize === 'small' ? '7px' : '8px'}; color: #888;">${barcode.dosage} • ${barcode.frequency || ''}</div>` : ''}
      
      <div class="footer" style="
        font-size: ${labelSize === 'small' ? '6px' : '7px'};
        color: #999;
        margin-top: 2px;
      ">MediTracker</div>
    </div>
  `;
};

  const generateBulkPrintHTML = () => {
    const paper = PAPER_SIZES[printSettings.paperSize];
    const isLandscape = printSettings.orientation === 'landscape';
    const pageWidth = isLandscape ? paper.height : paper.width;
    const pageHeight = isLandscape ? paper.width : paper.height;

    const labelSize = LABEL_SIZES[printSettings.labelSize];
    const labelsPerRow = printSettings.labelsPerRow;
    
    // Calculate how many labels fit per page
    const rowHeight = labelSize.height + 20; // Add margin
    const labelsPerPage = Math.floor((pageHeight - 40) / rowHeight) * labelsPerRow;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Medication Barcodes - Bulk Print</title>
        <style>
          @page {
            size: ${printSettings.paperSize} ${printSettings.orientation};
            margin: 20px;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0;
          }
          .page {
            width: ${pageWidth - 40}px;
            min-height: ${pageHeight - 40}px;
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .labels-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-content: flex-start;
            gap: 10px;
          }
          .page-header {
            text-align: center;
            margin-bottom: 15px;
            font-size: 14px;
            color: #666;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${Math.ceil(barcodes.length / labelsPerPage) === 1 ? 
          `<div class="page">
             <div class="page-header">MediTracker - Medication Labels (${barcodes.length} items)</div>
             <div class="labels-container">
               ${barcodes.map(barcode => generateSingleBarcodeHTML(barcode, printSettings.labelSize)).join('')}
             </div>
           </div>` :
          Array.from({ length: Math.ceil(barcodes.length / labelsPerPage) }, (_, pageIndex) => {
            const startIndex = pageIndex * labelsPerPage;
            const endIndex = Math.min(startIndex + labelsPerPage, barcodes.length);
            const pageItems = barcodes.slice(startIndex, endIndex);
            
            return `
              <div class="page">
                <div class="page-header">MediTracker - Medication Labels (Page ${pageIndex + 1})</div>
                <div class="labels-container">
                  ${pageItems.map(barcode => generateSingleBarcodeHTML(barcode, printSettings.labelSize)).join('')}
                </div>
              </div>
            `;
          }).join('')
        }
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      let htmlContent: string;

      if (isBulkPrint && barcodes.length > 1) {
        htmlContent = generateBulkPrintHTML();
      } else {
        // Single barcode print
        const paper = PAPER_SIZES.A4;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Medication Barcode - ${singleBarcode.patientName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
            </style>
          </head>
          <body>
            ${generateSingleBarcodeHTML(singleBarcode, 'large')}
          </body>
          </html>
        `;
      }

      await Print.printAsync({ 
        html: htmlContent,
        width: printSettings.orientation === 'landscape' ? 
          PAPER_SIZES[printSettings.paperSize].height : 
          PAPER_SIZES[printSettings.paperSize].width,
        height: printSettings.orientation === 'landscape' ? 
          PAPER_SIZES[printSettings.paperSize].width : 
          PAPER_SIZES[printSettings.paperSize].height,
      });

      Alert.alert(
        'Success', 
        isBulkPrint ? 
          `${barcodes.length} barcodes sent to printer successfully!` :
          'Barcode sent to printer successfully!'
      );
      
    } catch (error) {
      console.error('Error printing barcode:', error);
      Alert.alert('Error', 'Failed to print barcode. Please try again.');
    }
  };

  const handleDownload = async () => {
  try {
    // Check current permission status
    let { status } = await MediaLibrary.getPermissionsAsync();
    
    // If permission not granted, request it
    if (status !== 'granted') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      status = newStatus;
    }
    
    // If still not granted after request, show alert with option to open settings
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Media library access is required to save files. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              // On Android, this will open app settings
              if (Platform.OS === 'android') {
                // You might need to install expo-linking for this
                // Linking.openSettings();
              }
            }
          },
          {
            text: 'Try Again',
            onPress: () => handleDownload() // Retry the download
          }
        ]
      );
      return;
    }

    let htmlContent: string;
    let filename: string;

    if (isBulkPrint && barcodes.length > 1) {
      htmlContent = generateBulkPrintHTML();
      filename = `MediTracker_BulkBarcodes_${new Date().toISOString().split('T')[0]}.pdf`;
    } else {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medication Barcode - ${singleBarcode.patientName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          ${generateSingleBarcodeHTML(singleBarcode, 'large')}
        </body>
        </html>
      `;
      filename = `MediTracker_${singleBarcode.patientName.replace(/\s+/g, '_')}_${singleBarcode.medicationName.replace(/\s+/g, '_')}.pdf`;
    }

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ 
      html: htmlContent,
      width: PAPER_SIZES[printSettings.paperSize].width,
      height: PAPER_SIZES[printSettings.paperSize].height,
    });

    // Save to device
    const asset = await MediaLibrary.createAssetAsync(uri);
    
    Alert.alert(
      'Download Complete', 
      isBulkPrint ? 
        `${barcodes.length} barcodes downloaded as PDF successfully!\n\nSaved to: ${filename}` :
        `Barcode downloaded as PDF successfully!\n\nSaved to: ${filename}`
    );

  } catch (error) {
    console.error('Error downloading barcode:', error);
    Alert.alert(
      'Download Error', 
      'Failed to download barcode. Please check your storage space and try again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try Again', onPress: () => handleDownload() }
      ]
    );
  }
};

  const handleShare = async () => {
    try {
      let message: string;

      if (isBulkPrint && barcodes.length > 1) {
        message = `Medication Barcodes (${barcodes.length} items)\n\n${barcodes.map(barcode => 
          `Patient: ${barcode.patientName}\nMedication: ${barcode.medicationName}\nBarcode: ${barcode.barcodeData}\n`
        ).join('\n')}\nGenerated by MediTracker`;
      } else {
        message = `Medication Label for ${singleBarcode.patientName}

Barcode: ${singleBarcode.barcodeData}
Medication: ${singleBarcode.medicationName}
${singleBarcode.dosage ? `Dosage: ${singleBarcode.dosage}` : ''}
${singleBarcode.frequency ? `Frequency: ${singleBarcode.frequency}` : ''}

Generated by MediTracker`;
      }

      await Share.share({ 
        message, 
        title: isBulkPrint ? 'Medication Barcodes' : `${singleBarcode.patientName} - Medication Barcode`
      });
    } catch (error) {
      console.error('Error sharing barcode:', error);
    }
  };

const PrintSettingsModal = () => (
  <Modal
    visible={showPrintSettings}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowPrintSettings(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.settingsModalContainer}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Print Settings</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPrintSettings(false)}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {/* Paper Size */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Paper Size</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={printSettings.paperSize}
                onValueChange={(value) => setPrintSettings(prev => ({ ...prev, paperSize: value }))}
                style={styles.picker}
              >
                {Object.entries(PAPER_SIZES).map(([key, size]) => (
                  <Picker.Item key={key} label={size.name} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Orientation */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Orientation</Text>
            <View style={styles.orientationButtons}>
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  printSettings.orientation === 'portrait' && styles.orientationButtonActive
                ]}
                onPress={() => setPrintSettings(prev => ({ ...prev, orientation: 'portrait' }))}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={
                  printSettings.orientation === 'portrait' ? '#059669' : '#64748B'
                } />
                <Text style={[
                  styles.orientationButtonText,
                  printSettings.orientation === 'portrait' && styles.orientationButtonTextActive
                ]}>Portrait</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.orientationButton,
                  printSettings.orientation === 'landscape' && styles.orientationButtonActive
                ]}
                onPress={() => setPrintSettings(prev => ({ ...prev, orientation: 'landscape' }))}
              >
                <Ionicons name="phone-landscape-outline" size={20} color={
                  printSettings.orientation === 'landscape' ? '#059669' : '#64748B'
                } />
                <Text style={[
                  styles.orientationButtonText,
                  printSettings.orientation === 'landscape' && styles.orientationButtonTextActive
                ]}>Landscape</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Label Size */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Label Size</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={printSettings.labelSize}
                onValueChange={(value) => setPrintSettings(prev => ({ ...prev, labelSize: value }))}
                style={styles.picker}
              >
                {Object.entries(LABEL_SIZES).map(([key, size]) => (
                  <Picker.Item key={key} label={size.name} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Labels Per Row */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Labels Per Row</Text>
            <View style={styles.labelsPerRowContainer}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.labelsPerRowButton,
                    printSettings.labelsPerRow === num && styles.labelsPerRowButtonActive
                  ]}
                  onPress={() => setPrintSettings(prev => ({ ...prev, labelsPerRow: num }))}
                >
                  <Text style={[
                    styles.labelsPerRowButtonText,
                    printSettings.labelsPerRow === num && styles.labelsPerRowButtonTextActive
                  ]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Preview</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>
                {barcodes.length} barcode{barcodes.length > 1 ? 's' : ''} • {printSettings.labelSize} labels • {printSettings.labelsPerRow} per row
              </Text>
              <Text style={styles.previewSubtext}>
                Paper: {PAPER_SIZES[printSettings.paperSize].name} ({printSettings.orientation})
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.settingsActions}>
          <TouchableOpacity
            style={styles.settingsCancelButton}
            onPress={() => setShowPrintSettings(false)}
          >
            <Text style={styles.settingsCancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingsPrintButton}
            onPress={() => {
              setShowPrintSettings(false);
              handlePrint();
            }}
          >
            <Ionicons name="print" size={18} color="#FFFFFF" />
            <Text style={styles.settingsPrintText}>Print Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

  if (!visible) return null;

  return (
    <View>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isBulkPrint ? `${barcodes.length} Medication Barcodes` : 'Medication Barcode'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Barcode Preview */}
            {!isBulkPrint ? (
              <View style={styles.barcodePreview}>
                <View style={styles.patientNameContainer}>
                  <Text style={styles.patientNameText}>{singleBarcode.patientName.toUpperCase()}</Text>
                </View>

                <View style={styles.barcodeContainer}>
                  <View style={styles.barcodeStripes}>
                    {generateBarcodeStripes(singleBarcode.barcodeData)}
                  </View>
                </View>

                <View style={styles.barcodeDataContainer}>
                  <Text style={styles.barcodeDataText}>{singleBarcode.barcodeData}</Text>
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>MediTracker • {singleBarcode.medicationName}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bulkPreviewContainer}>
                <Text style={styles.bulkPreviewTitle}>Bulk Print Preview</Text>
                <ScrollView style={styles.bulkPreviewList} showsVerticalScrollIndicator={false}>
                  {barcodes.slice(0, 5).map((barcode, index) => (
                    <View key={index} style={styles.bulkPreviewItem}>
                      <Text style={styles.bulkPreviewPatient}>{barcode.patientName}</Text>
                      <Text style={styles.bulkPreviewMedication}>{barcode.medicationName}</Text>
                    </View>
                  ))}
                  {barcodes.length > 5 && (
                    <Text style={styles.bulkPreviewMore}>... and {barcodes.length - 5} more</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={handleDownload}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Print Button */}
            <TouchableOpacity
              style={styles.printButton}
              onPress={() => {
                if (isBulkPrint && barcodes.length > 1) {
                  setShowPrintSettings(true);
                } else {
                  handlePrint();
                }
              }}
            >
              <Ionicons name="print-outline" size={20} color="#FFFFFF" />
              <Text style={styles.printButtonText}>
                {isBulkPrint && barcodes.length > 1 ? 'Print Settings' : 'Print Label'}
              </Text>
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Printing Instructions:</Text>
              <Text style={styles.instructionsText}>
                • Use adhesive label paper for best results{'\n'}
                • Ensure printer settings match paper size{'\n'}
                • Attach labels to medication containers{'\n'}
                • Keep barcodes clean and visible
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <PrintSettingsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodePreview: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    marginBottom: SPACING[6],
    alignItems: 'center',
  },
  patientNameContainer: {
    marginBottom: SPACING[4],
    paddingBottom: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    width: '100%',
  },
  patientNameText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    letterSpacing: 1,
  },
  barcodeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    marginVertical: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  barcodeStripes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 1,
  },
  barcodeStripe: {
    height: '100%',
  },
  barcodeDataContainer: {
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    width: '100%',
  },
  barcodeDataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: SPACING[2],
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
  },
  bulkPreviewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[6],
    maxHeight: 200,
  },
  bulkPreviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  bulkPreviewList: {
    maxHeight: 150,
  },
  bulkPreviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING[3],
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bulkPreviewPatient: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
  },
  bulkPreviewMedication: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
  },
  bulkPreviewMore: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING[2],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  downloadButton: {
    backgroundColor: '#059669',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    marginBottom: SPACING[6],
    gap: SPACING[2],
  },
  printButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionsContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: SPACING[2],
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#A16207',
    lineHeight: 16,
  },
  // Print Settings Modal Styles
  settingsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[6],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  settingsContent: {
    flex: 1,
    padding: SPACING[6],
  },
  settingGroup: {
    marginBottom: SPACING[6],
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1E293B',
  },
  orientationButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  orientationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
    backgroundColor: '#FFFFFF',
  },
  orientationButtonActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  orientationButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  orientationButtonTextActive: {
    color: '#059669',
  },
  labelsPerRowContainer: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  labelsPerRowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING[3],
    backgroundColor: '#FFFFFF',
  },
  labelsPerRowButtonActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  labelsPerRowButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#64748B',
  },
  labelsPerRowButtonTextActive: {
    color: '#059669',
  },
  previewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  previewSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
  },
  settingsActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    padding: SPACING[6],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  settingsCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    backgroundColor: '#FFFFFF',
  },
  settingsCancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#64748B',
  },
  settingsPrintButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  settingsPrintText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PrintableBarcode;