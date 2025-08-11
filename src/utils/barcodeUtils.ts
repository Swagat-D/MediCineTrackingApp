/**
 * Generate a structured barcode data string that contains all medication info
 */
export const generateMedicationBarcodeData = (medicationData: {
  patientId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
}): string => {
  // Create a structured barcode that can be parsed
  // Format: MED|PatientID|MedicationID|Name|Dosage|Frequency
  return `MED|${medicationData.patientId}|${medicationData.medicationId}|${medicationData.medicationName}|${medicationData.dosage}|${medicationData.frequency}`;
};

/**
 * Parse barcode data to extract medication information  
 */
export const parseMedicationBarcodeData = (barcodeData: string) => {
  try {
    const parts = barcodeData.split('|');
    
    if (parts[0] !== 'MED' || parts.length !== 6) {
      throw new Error('Invalid medication barcode format');
    }
    
    return {
      type: parts[0],
      patientId: parts[1], 
      medicationId: parts[2],
      medicationName: parts[3],
      dosage: parts[4],
      frequency: parts[5]
    };
  } catch (error) {
    console.error(error)
    throw new Error('Unable to parse barcode data');
  }
};

/**
 * Validate short barcode format on frontend
 */
export const isValidShortBarcode = (barcodeData: string): boolean => {
  // Check if it's MT followed by exactly 8 characters
  return barcodeData.startsWith('MT') && barcodeData.length === 10 && /^MT[A-Z0-9]{8}$/.test(barcodeData);
};

/**
 * Generate display barcode pattern for short format
 */
export const generateBarcodePattern = (barcodeData: string): {width: number, isVisible: boolean}[] => {
  if (!barcodeData || barcodeData.length === 0) {
    return [];
  }

  const pattern = [];
  
  // Add start pattern
  pattern.push({ width: 2, isVisible: true });
  pattern.push({ width: 1, isVisible: false });
  
  // Encode each character of the short barcode
  for (let i = 0; i < barcodeData.length; i++) {
    const char = barcodeData[i];
    const charCode = char.charCodeAt(0);
    
    // Create pattern based on character
    const bars = [
      { width: 1, isVisible: true },
      { width: 1, isVisible: charCode % 2 === 0 },
      { width: 1, isVisible: true },
      { width: 1, isVisible: charCode % 3 === 0 }
    ];
    
    pattern.push(...bars);
    
    // Add separator between characters
    if (i < barcodeData.length - 1) {
      pattern.push({ width: 1, isVisible: false });
    }
  }
  
  // Add end pattern
  pattern.push({ width: 1, isVisible: false });
  pattern.push({ width: 2, isVisible: true });
  
  return pattern;
};

// Keep existing HTML generation functions for printing...
export const generateBarcodeHTML = (barcodeData: string, width: number = 200, height: number = 40): string => {
  const barcodeId = `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div style="display: flex; justify-content: center; align-items: center; padding: 5px;">
      <svg id="${barcodeId}" style="max-width: ${width}px; height: ${height}px;"></svg>
    </div>
    <script>
      if (typeof JsBarcode !== 'undefined') {
        try {
          JsBarcode("#${barcodeId}", "${barcodeData}", {
            format: "CODE128",
            width: 2,
            height: ${height},
            displayValue: false,
            margin: 0
          });
        } catch (e) {
          console.error('Barcode generation failed:', e);
        }
      }
    </script>
  `;
};