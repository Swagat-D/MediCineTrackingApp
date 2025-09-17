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
 * Generate barcode image URL using external API service (for React Native display)
 */
export function generateBarcodeSVG(data: string, width = 200, height = 40): string {
  return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(data)}&scale=2&height=${height}&includetext=false&backgroundcolor=FFFFFF`;
}

/**
 * Generate barcode image URL for printing (PNG format for better print quality)
 */
export function generateBarcodeImageURL(data: string, width = 200, height = 40): string {
  return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(data)}&scale=3&height=${height}&includetext=false&backgroundcolor=FFFFFF`;
}

export async function fetchBarcodeSVG(data: string, width = 200, height = 40): Promise<string> {
  const url = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(data)}&scale=2&height=${height}&width=${width}&includetext=false`;
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error('Error fetching barcode:', error);
    return `<svg width="${width}" height="${height}"><text x="50%" y="50%" text-anchor="middle" font-size="12">${data}</text></svg>`;
  }
}