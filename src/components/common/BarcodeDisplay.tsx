import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SPACING, RADIUS } from '../../constants/themes/theme';

interface BarcodeDisplayProps {
  barcodeData: string;
  showData?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  barcodeData,
  showData = true,
  size = 'medium',
  style
}) => {
  const sizeConfig = {
    small: { height: 60, fontSize: 10, width: 200 },
    medium: { height: 80, fontSize: 12, width: 250 },
    large: { height: 100, fontSize: 14, width: 300 }
  };
  
  const config = sizeConfig[size];

  const barcodeHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <style>
        body { 
          margin: 0; 
          padding: 10px; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          background: transparent;
        }
        #barcode { background: white; }
      </style>
    </head>
    <body>
      <svg id="barcode"></svg>
      <script>
        try {
          JsBarcode("#barcode", "${barcodeData}", {
            format: "CODE128",
            width: 2,
            height: ${config.height - 20},
            displayValue: false,
            margin: 10,
            background: "#ffffff",
            lineColor: "#000000"
          });
        } catch (e) {
          document.body.innerHTML = '<div style="font-family: monospace; padding: 10px; border: 1px solid #ccc; background: white;">${barcodeData}</div>';
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.barcodeContainer, { height: config.height, width: config.width }]}>
        <WebView
          source={{ html: barcodeHTML }}
          style={styles.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
        />
      </View>
      
      {showData && (
        <Text style={[styles.barcodeText, { fontSize: config.fontSize }]}>
          {barcodeData}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  webview: {
    backgroundColor: 'transparent',
  },
  barcodeText: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[2],
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default BarcodeDisplay;