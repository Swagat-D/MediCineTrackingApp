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
  userRole?: 'patient' | 'caregiver'; // New prop for role-based styling
  customColor?: string; // Allow custom color override
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
  userRole,
  customColor,
}) => {
  // Get role-based colors
  const getRoleColors = () => {
    if (customColor) {
      return {
        primary: customColor,
        secondary: customColor,
      };
    }

    if (userRole === 'patient') {
      return {
        primary: '#2563EB', // Blue for patient
        secondary: '#2563EB',
      };
    } else if (userRole === 'caregiver') {
      return {
        primary: '#059669', // Green for caregiver
        secondary: '#059669',
      };
    }

    // Default colors from theme
    return {
      primary: COLORS.primary[500],
      secondary: COLORS.secondary[500],
    };
  };

  const roleColors = getRoleColors();

  // Dynamic styles based on role
  const getDynamicStyles = () => {
    const baseStyle = {
      ...styles.base,
      ...styles[size],
    };

    if (fullWidth) {
      Object.assign(baseStyle, styles.fullWidth);
    }

    if (disabled) {
      return {
        ...baseStyle,
        ...styles.disabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: roleColors.primary,
          ...SHADOWS.sm,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: roleColors.secondary,
          ...SHADOWS.sm,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: roleColors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: COLORS.error,
          ...SHADOWS.sm,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: roleColors.secondary,
          ...SHADOWS.sm,
        };
    }
  };

  // Dynamic text colors based on role
  const getDynamicTextColor = () => {
    if (disabled) {
      return COLORS.gray[500];
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return COLORS.background;
      case 'outline':
      case 'ghost':
        return roleColors.primary;
      default:
        return COLORS.background;
    }
  };

  const buttonStyles = [
    getDynamicStyles(),
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    { color: getDynamicTextColor() },
    textStyle,
  ];

  const getActivityIndicatorColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return roleColors.primary;
    }
    return COLORS.background;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={getActivityIndicatorColor()}
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
});

export default Button;