import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../constants/themes/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
  userRole?: 'patient' | 'caregiver'; // New prop for role-based styling
  customColor?: string; // Allow custom color override
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      required = false,
      disabled = false,
      secureTextEntry,
      userRole,
      customColor,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    // Get role-based colors
    const getRoleColors = () => {
      if (customColor) {
        return {
          primary: customColor,
          focused: customColor,
        };
      }

      if (userRole === 'patient') {
        return {
          primary: '#2563EB', // Blue for patient
          focused: '#2563EB',
        };
      } else if (userRole === 'caregiver') {
        return {
          primary: '#059669', // Green for caregiver
          focused: '#059669',
        };
      }

      // Default colors from theme
      return {
        primary: COLORS.secondary[500],
        focused: COLORS.secondary[500],
      };
    };

    const roleColors = getRoleColors();

    const toggleSecureEntry = () => {
      setIsSecure(!isSecure);
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    // Dynamic icon color based on focus and role
    const getIconColor = () => {
      if (error) {
        return COLORS.error;
      }
      if (isFocused) {
        return roleColors.focused;
      }
      return COLORS.gray[500];
    };

    // Dynamic border color based on state and role
    const getBorderColor = () => {
      if (error) {
        return COLORS.error;
      }
      if (isFocused) {
        return roleColors.focused;
      }
      return COLORS.gray[300];
    };

    const inputContainerStyles = [
      styles.inputContainer,
      {
        borderColor: getBorderColor(),
        borderWidth: isFocused ? 2 : 1.5,
      },
      disabled && styles.disabled,
    ];

    const textInputStyles = [
      styles.textInput,
      leftIcon && styles.withLeftIcon,
      (rightIcon || secureTextEntry) && styles.withRightIcon,
      inputStyle,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}
        
        <View style={inputContainerStyles}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={ref}
            style={textInputStyles}
            placeholderTextColor={COLORS.gray[400]}
            secureTextEntry={isSecure}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {secureTextEntry && (
            <TouchableOpacity
              onPress={toggleSecureEntry}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}
          
          {rightIcon && !secureTextEntry && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  labelContainer: {
    marginBottom: SPACING[2],
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    minHeight: 48,
  },
  disabled: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[200],
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[3],
  },
  withLeftIcon: {
    paddingLeft: SPACING[2],
  },
  withRightIcon: {
    paddingRight: SPACING[2],
  },
  leftIcon: {
    marginLeft: SPACING[3],
  },
  rightIcon: {
    marginRight: SPACING[3],
    padding: SPACING[1],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
});

Input.displayName = 'Input';

export default Input;