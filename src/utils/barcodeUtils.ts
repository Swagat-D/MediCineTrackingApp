/**
 * Generate short barcode data using medication ID
 */
export const generateShortBarcodeData = (medicationId: string): string => {
  const idHash = medicationId.slice(-8).toUpperCase();
  return `MT${idHash}`;
};

/**
 * Parse barcode data
 */
export const parseMedicationBarcodeData = (barcodeData: string) => {
  try {
    if (barcodeData.startsWith('MT') && barcodeData.length === 10) {
      return {
        type: 'SHORT',
        barcodeData: barcodeData
      };
    }
    
    throw new Error('Invalid barcode format');
  } catch (error) {
    console.error(error)
    throw new Error('Invalid barcode format. Please scan a valid medication barcode.');
  }
};

/**
 * Validate barcode format
 */
export const isValidShortBarcode = (barcodeData: string): boolean => {
  return barcodeData.startsWith('MT') && barcodeData.length === 10 && /^MT[A-Z0-9]{8}$/.test(barcodeData);
};

/**
 * Generate HTML with real barcode for printing
 */
export const generateBarcodeHTML = (barcodeData: string, width: number = 200, height: number = 40): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    </head>
    <body style="margin: 0; padding: 10px; display: flex; justify-content: center;">
      <div>
        <svg id="barcode"></svg>
        <div style="text-align: center; margin-top: 5px; font-family: monospace; font-size: 12px;">${barcodeData}</div>
      </div>
      <script>
        JsBarcode("#barcode", "${barcodeData}", {
          format: "CODE128",
          width: 2,
          height: ${height},
          displayValue: false,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000"
        });
      </script>
    </body>
    </html>
  `;
};