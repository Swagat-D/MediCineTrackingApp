import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../../constants/themes/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary[500] : COLORS.background}
        />
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return <Text style={textStyles}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary[500],
  },
  secondary: {
    backgroundColor: COLORS.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    minHeight: 44,
  },
  large: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    minHeight: 52,
  },
  
  // States
  disabled: {
    backgroundColor: COLORS.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Variant text styles
  primaryText: {
    color: COLORS.background,
  },
  secondaryText: {
    color: COLORS.background,
  },
  outlineText: {
    color: COLORS.primary[500],
  },
  ghostText: {
    color: COLORS.primary[500],
  },
  dangerText: {
    color: COLORS.background,
  },
  
  // Size text styles
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
  },
  
  disabledText: {
    color: COLORS.gray[500],
  },
});

export default Button;