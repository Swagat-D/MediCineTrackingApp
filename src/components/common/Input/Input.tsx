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
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

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

    const inputContainerStyles = [
      styles.inputContainer,
      isFocused && styles.focused,
      error && styles.error,
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
              color={isFocused ? COLORS.secondary[500] : COLORS.gray[500]}
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
                color={COLORS.gray[500]}
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
                color={isFocused ? COLORS.secondary[500] : COLORS.gray[500]}
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
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    minHeight: 48,
  },
  focused: {
    borderColor: COLORS.secondary[500],
  },
  error: {
    borderColor: COLORS.error,
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