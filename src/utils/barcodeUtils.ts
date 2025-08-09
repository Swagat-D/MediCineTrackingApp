
/**
 * Generates a consistent barcode pattern based on the barcode data string
 * This ensures the same barcode data always produces the same visual pattern
 */
export const generateBarcodePattern = (barcodeData: string): {width: number, isVisible: boolean}[] => {
  const pattern = [];
  const cleanData = barcodeData.replace(/[^A-Z0-9_]/g, ''); // Clean the barcode data
  
  // Use a consistent algorithm to generate pattern
  for (let i = 0; i < Math.min(cleanData.length, 35); i++) {
    const char = cleanData[i];
    const charCode = char.charCodeAt(0);
    
    // Create consistent width and visibility based on character
    const width = (charCode % 3) + 1; // 1, 2, or 3 pixels wide
    const isVisible = (charCode % 2 === 0) || (charCode % 7 === 0); // Consistent visibility pattern
    
    pattern.push({ width, isVisible });
    
    // Add separator between characters for better readability
    if (i < cleanData.length - 1) {
      pattern.push({ width: 1, isVisible: false });
    }
  }
  
  return pattern;
};

/**
 * Generates SVG barcode for high-quality rendering
 */
export const generateBarcodeSVG = (barcodeData: string, width: number = 200, height: number = 50): string => {
  const pattern = generateBarcodePattern(barcodeData);
  let x = 0;
  let bars = '';
  
  const totalPatternWidth = pattern.reduce((sum, bar) => sum + bar.width, 0);
  const scaleX = width / totalPatternWidth;
  
  pattern.forEach(bar => {
    if (bar.isVisible) {
      bars += `<rect x="${x * scaleX}" y="0" width="${bar.width * scaleX}" height="${height}" fill="#000000"/>`;
    }
    x += bar.width;
  });
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FFFFFF"/>
      ${bars}
    </svg>
  `;
};

/**
 * Generates HTML for barcode rendering in print/PDF
 */
export const generateBarcodeHTML = (barcodeData: string, width: number = 200, height: number = 40): string => {
  const pattern = generateBarcodePattern(barcodeData);
  let html = '';
  
  const totalPatternWidth = pattern.reduce((sum, bar) => sum + bar.width, 0);
  const scaleX = width / totalPatternWidth;
  
  pattern.forEach(bar => {
    const barWidth = bar.width * scaleX;
    html += `<div style="
      width: ${barWidth}px;
      height: ${height}px;
      background-color: ${bar.isVisible ? '#000000' : 'transparent'};
      display: inline-block;
    "></div>`;
  });
  
  return `<div style="display: flex; align-items: center; justify-content: center; background: #f0f0f0; border: 1px solid #ccc; height: ${height + 10}px; padding: 5px;">${html}</div>`;
};