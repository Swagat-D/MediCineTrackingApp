// src/components/common/BarcodeDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { generateBarcodePattern } from '../../utils/barcodeUtils';
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
  const pattern = generateBarcodePattern(barcodeData);
  
  const sizeConfig = {
    small: { height: 30, fontSize: 10, spacing: 2 },
    medium: { height: 40, fontSize: 12, spacing: 3 },
    large: { height: 50, fontSize: 14, spacing: 4 }
  };
  
  const config = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.barcodeContainer, { height: config.height + config.spacing * 2 }]}>
        <View style={styles.barcodeStripes}>
          {pattern.map((bar, index) => (
            <View
              key={index}
              style={[
                styles.barcodeStripe,
                {
                  width: bar.width,
                  height: config.height,
                  backgroundColor: bar.isVisible ? '#000000' : 'transparent',
                }
              ]}
            />
          ))}
        </View>
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
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING[2],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 200,
  },
  barcodeStripes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  barcodeStripe: {
    // Styles will be applied dynamically
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