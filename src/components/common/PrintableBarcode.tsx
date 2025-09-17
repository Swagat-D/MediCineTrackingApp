/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CustomAlertStatic } from '../../components/common/CustomAlert';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import BarcodeDisplay from './BarcodeDisplay';

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
  barcodes: BarcodeData[];
  isBulkPrint?: boolean;
}

interface PrintSettings {
  paperSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  labelsPerRow: number;
  labelSize: 'small' | 'medium' | 'large';
  startPosition: { row: number; col: number };
}

const { width, height } = Dimensions.get('window');

const PAPER_SIZES = {
  A4: { width: 595, height: 842, name: 'A4 (210 × 297 mm)' },
  Letter: { width: 612, height: 792, name: 'Letter (8.5 × 11 in)' }
};

const LABEL_SIZES = {
  small: { width: 180, height: 90, name: 'Small (2.5" × 1.25")' },
  medium: { width: 220, height: 110, name: 'Medium (3" × 1.5")' },
  large: { width: 260, height: 130, name: 'Large (3.5" × 1.8")' }
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
    labelsPerRow: 3,
    labelSize: 'medium',
    startPosition: { row: 1, col: 1 }
  });

  const updatePrintSetting = useCallback(<K extends keyof PrintSettings>(
    key: K, 
    value: PrintSettings[K]
  ) => {
    setPrintSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateStartPosition = useCallback((position: Partial<{ row: number; col: number }>) => {
    setPrintSettings(prev => ({ 
      ...prev, 
      startPosition: { ...prev.startPosition, ...position }
    }));
  }, []);

  // Memoize computed values
  const previewText = useMemo(() => {
    return `${barcodes.length} label${barcodes.length > 1 ? 's' : ''} • ${printSettings.labelSize} size • ${printSettings.labelsPerRow} per row`;
  }, [barcodes.length, printSettings.labelSize, printSettings.labelsPerRow]);

  const previewSubtext = useMemo(() => {
    return `Starting at Row ${printSettings.startPosition.row}, Column ${printSettings.startPosition.col}`;
  }, [printSettings.startPosition.row, printSettings.startPosition.col]);

  const singleBarcode = barcodes[0];

  const generateSimpleBarcodeHTML = (barcode: BarcodeData, labelSize: keyof typeof LABEL_SIZES) => {
  const size = LABEL_SIZES[labelSize];
  const barcodeHeight = labelSize === 'small' ? 35 : labelSize === 'medium' ? 40 : 45;
  
  // Use the same API service as your display component
  const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcode.barcodeData)}&scale=3&width=200&height=${barcodeHeight}&includetext=false&backgroundcolor=FFFFFF`;
  
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
      margin: 3px;
      page-break-inside: avoid;
      font-family: Arial, sans-serif;
    ">
      <div style="
        font-size: ${labelSize === 'small' ? '11px' : labelSize === 'medium' ? '13px' : '15px'}; 
        font-weight: bold; 
        color: #000; 
        margin-bottom: 6px;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.5px;
      ">${barcode.patientName}</div>
      
      <div style="display: flex; justify-content: center; margin: 6px 0;">
        <img src="${barcodeImageUrl}" 
             alt="${barcode.barcodeData}" 
             style="max-width: ${size.width - 20}px; height: ${barcodeHeight}px; object-fit: contain; image-rendering: pixelated;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div style="display: none; font: 8px monospace; padding: 2px; border: 1px solid #000; background: #fff; text-align: center;">
          ${barcode.barcodeData}
        </div>
      </div>
      
      <div style="
        font-size: ${labelSize === 'small' ? '9px' : labelSize === 'medium' ? '10px' : '11px'}; 
        color: #333;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
      ">${barcode.medicationName}</div>
    </div>
  `;
};

const generatePositionedPrintHTML = () => {
  const paper = PAPER_SIZES[printSettings.paperSize];
  const isLandscape = printSettings.orientation === 'landscape';
  const pageWidth = isLandscape ? paper.height : paper.width;
  const pageHeight = isLandscape ? paper.width : paper.height;

  const labelSize = LABEL_SIZES[printSettings.labelSize];
  const labelsPerRow = printSettings.labelsPerRow;
  const labelWidthWithMargin = labelSize.width + 6;
  const labelHeightWithMargin = labelSize.height + 6;
  
  const maxRows = Math.floor((pageHeight - 40) / labelHeightWithMargin);
  const maxCols = labelsPerRow;
  
  const startRow = printSettings.startPosition.row - 1;
  const startCol = printSettings.startPosition.col - 1;
  
  const grid = Array(maxRows).fill(null).map(() => Array(maxCols).fill(null));
  
  let barcodeIndex = 0;
  let currentRow = startRow;
  let currentCol = startCol;
  
  while (barcodeIndex < barcodes.length && currentRow < maxRows) {
    grid[currentRow][currentCol] = barcodes[barcodeIndex];
    barcodeIndex++;
    
    currentCol++;
    if (currentCol >= maxCols) {
      currentCol = 0;
      currentRow++;
    }
  }

  const generateGridHTML = () => {
    return grid.map((row) => {
      return `
        <div style="
          display: flex; 
          justify-content: flex-start; 
          margin-bottom: 3px;
          height: ${labelHeightWithMargin}px;
        ">
          ${row.map((barcode) => {
            if (barcode) {
              return generateSimpleBarcodeHTML(barcode, printSettings.labelSize);
            } else {
              return `<div style="
                width: ${labelSize.width}px; 
                height: ${labelSize.height}px;
                margin: 3px;
                display: inline-block;
              "></div>`;
            }
          }).join('')}
        </div>
      `;
    }).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Medication Labels</title>
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
        }
        img {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      </style>
    </head>
    <body>
      <div class="page">
        ${generateGridHTML()}
      </div>
    </body>
    </html>
  `;
};

const generateSingleBarcodeHTML = () => {
  const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(singleBarcode.barcodeData)}&scale=3&width=200&height=60&includetext=false&backgroundcolor=FFFFFF`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Medication Label - ${singleBarcode.patientName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 20px;
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
        }
        .barcode-container {
          position: absolute;
          top: 20px;
          left: 20px;
        }
        img {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      </style>
    </head>
    <body>
      <div class="barcode-container">
        <div class="barcode-label" style="
          width: 260px; 
          height: 130px;
          border: 2px solid #000; 
          padding: 8px; 
          background: white; 
          text-align: center;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        ">
          <div style="
            font-size: 15px; 
            font-weight: bold; 
            color: #000; 
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">${singleBarcode.patientName}</div>
          
          <div style="display: flex; justify-content: center; margin: 6px 0;">
            <img src="${barcodeImageUrl}" 
                 alt="${singleBarcode.barcodeData}" 
                 style="max-width: 240px; height: 60px; object-fit: contain; image-rendering: pixelated;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div style="display: none; font: 10px monospace; padding: 5px; border: 1px solid #000; background: #fff; text-align: center;">
              ${singleBarcode.barcodeData}
            </div>
          </div>
          
          <div style="
            font-size: 11px; 
            color: #333;
            margin-top: 4px;
            font-weight: 500;
          ">${singleBarcode.medicationName}</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

  const handlePrint = async () => {
    try {
      let htmlContent: string;

      if (isBulkPrint && barcodes.length > 1) {
        htmlContent = generatePositionedPrintHTML();
      } else {
        htmlContent = generateSingleBarcodeHTML();
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

      CustomAlertStatic.alert(
        'Success', 
        isBulkPrint ? 
          `${barcodes.length} labels sent to printer successfully!` :
          'Label sent to printer successfully!'
      );
      
    } catch (error) {
      console.error('Error printing barcode:', error);
      CustomAlertStatic.alert('Error', 'Failed to print labels. Please try again.');
    }
  };

  const handleDownload = () => {
    CustomAlertStatic.alert(
      'Feature Temporarily Unavailable',
      'We are currently not supporting barcode downloads due to privacy concerns. We will add this feature soon with enhanced security measures.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleShare = async () => {
    try {
      let message: string;

      if (isBulkPrint && barcodes.length > 1) {
        message = `Medication Labels (${barcodes.length} items)\n\n${barcodes.map(barcode => 
          `Patient: ${barcode.patientName}\nMedication: ${barcode.medicationName}\nBarcode: ${barcode.barcodeData}\n`
        ).join('\n')}\nGenerated by MediTracker`;
      } else {
        message = `Medication Label\n\nPatient: ${singleBarcode.patientName}\nMedication: ${singleBarcode.medicationName}\nBarcode: ${singleBarcode.barcodeData}\n\nGenerated by MediTracker`;
      }

      await Share.share({ 
        message, 
        title: isBulkPrint ? 'Medication Labels' : `${singleBarcode.patientName} - Medication Label`
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
                  onValueChange={(value) => updatePrintSetting('paperSize', value)}
                  style={styles.picker}
                >
                  {Object.entries(PAPER_SIZES).map(([key, size]) => (
                    <Picker.Item key={key} label={size.name} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Label Size */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Label Size</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={printSettings.labelSize}
                  onValueChange={(value) => updatePrintSetting('labelSize', value)}
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
                    onPress={() => updatePrintSetting('labelsPerRow', num)}
                  >
                    <Text style={[
                      styles.labelsPerRowButtonText,
                      printSettings.labelsPerRow === num && styles.labelsPerRowButtonTextActive
                    ]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Starting Position */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Start Position (Row, Column)</Text>
              <View style={styles.positionContainer}>
                <View style={styles.positionInputContainer}>
                  <Text style={styles.positionLabel}>Row:</Text>
                  <View style={styles.positionButtons}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.positionButton,
                          printSettings.startPosition.row === num && styles.positionButtonActive
                        ]}
                        onPress={() => updateStartPosition({ row: num })}
                      >
                        <Text style={[
                          styles.positionButtonText,
                          printSettings.startPosition.row === num && styles.positionButtonTextActive
                        ]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.positionInputContainer}>
                  <Text style={styles.positionLabel}>Col:</Text>
                  <View style={styles.positionButtons}>
                    {Array.from({ length: printSettings.labelsPerRow }, (_, i) => i + 1).map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.positionButton,
                          printSettings.startPosition.col === num && styles.positionButtonActive
                        ]}
                        onPress={() => updateStartPosition({ col: num })}
                      >
                        <Text style={[
                          styles.positionButtonText,
                          printSettings.startPosition.col === num && styles.positionButtonTextActive
                        ]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Preview</Text>
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>{previewText}</Text>
                <Text style={styles.previewSubtext}>{previewSubtext}</Text>
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
                {isBulkPrint ? `${barcodes.length} Medication Labels` : 'Medication Label'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Simple Preview */}
            {!isBulkPrint ? (
              <View style={styles.simpleBarcodePreview}>
                <Text style={styles.previewPatientName}>{singleBarcode.patientName.toUpperCase()}</Text>
                
                <View style={styles.barcodeContainer}>
                  <BarcodeDisplay 
                    barcodeData={singleBarcode.barcodeData}
                    size='medium'
                    showData={false}
                  />
                </View>

                <Text style={styles.previewMedicationName}>{singleBarcode.medicationName}</Text>
              </View>
            ) : (
              <View style={styles.bulkPreviewContainer}>
                <Text style={styles.bulkPreviewTitle}>Ready to Print {barcodes.length} Labels</Text>
                <Text style={styles.bulkPreviewSubtitle}>Configure position and settings below</Text>
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
  simpleBarcodePreview: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    marginBottom: SPACING[6],
    alignItems: 'center',
  },
  previewPatientName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: SPACING[3],
    letterSpacing: 0.5,
  },
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: SPACING[3],
    marginVertical: SPACING[3],
    alignItems: 'center',
  },
  previewMedicationName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#333333',
    textAlign: 'center',
    marginTop: SPACING[2],
    fontWeight: '500',
  },
  bulkPreviewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[6],
    marginBottom: SPACING[6],
    alignItems: 'center',
  },
  bulkPreviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  bulkPreviewSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
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
    marginBottom: SPACING[4],
    gap: SPACING[2],
  },
  printButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Print Settings Modal Styles
  settingsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    width: '100%',
    minHeight: height * 0.75,
    maxHeight: height * 0.9,
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
  positionContainer: {
    gap: SPACING[4],
  },
  positionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  positionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
    minWidth: 40,
  },
  positionButtons: {
    flexDirection: 'row',
    gap: SPACING[2],
    flex: 1,
  },
  positionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
  },
  positionButtonActive: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  positionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  positionButtonTextActive: {
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