import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../../constants/themes/theme';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onClose,
  type = 'info'
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (buttonStyle?: string): ViewStyle => {
    const baseStyle = styles.button as ViewStyle;
    switch (buttonStyle) {
      case 'cancel':
        return { ...baseStyle, ...(styles.cancelButton as ViewStyle) };
      case 'destructive':
        return { ...baseStyle, ...(styles.destructiveButton as ViewStyle) };
      default:
        return { ...baseStyle, ...(styles.defaultButton as ViewStyle) };
    }
  };

  const getButtonTextStyle = (buttonStyle?: string): TextStyle => {
    const baseStyle = styles.buttonText as TextStyle;
    switch (buttonStyle) {
      case 'cancel':
        return { ...baseStyle, ...(styles.cancelButtonText as TextStyle) };
      case 'destructive':
        return { ...baseStyle, ...(styles.destructiveButtonText as TextStyle) };
      default:
        return { ...baseStyle, ...(styles.defaultButtonText as TextStyle) };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay as ViewStyle}>
        <View style={styles.alertContainer as ViewStyle}>
          {/* Alert Card */}
          <View style={styles.alertCard as ViewStyle}>
            {/* Header with Icon */}
            {(title || type !== 'info') && (
              <View style={styles.header as ViewStyle}>
                <View style={[styles.iconContainer as ViewStyle, { backgroundColor: getIconColor() + '15' }]}>
                  <Ionicons 
                    name={getIconName()} 
                    size={24} 
                    color={getIconColor()}
                  />
                </View>
                {title && (
                  <Text style={styles.title as TextStyle}>{title}</Text>
                )}
              </View>
            )}

            {/* Message */}
            {message && (
              <View style={styles.messageContainer as ViewStyle}>
                <Text style={styles.message as TextStyle}>{message}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={[
              styles.buttonContainer as ViewStyle,
              buttons.length === 3 && (styles.threeButtonContainer as ViewStyle)
            ]}>
              {buttons.length === 3 ? (
                // Special layout for 3 buttons: 2 on top row, 1 centered on bottom row
                <>
                  <View style={styles.topButtonRow as ViewStyle}>
                    {buttons.slice(0, 2).map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          getButtonStyle(button.style),
                          styles.topRowButton as ViewStyle
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}
                      >
                        <Text style={getButtonTextStyle(button.style)}>
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.bottomButtonRow as ViewStyle}>
                    <TouchableOpacity
                      key={2}
                      style={[
                        getButtonStyle(buttons[2].style),
                        styles.bottomRowButton as ViewStyle
                      ]}
                      onPress={() => handleButtonPress(buttons[2])}
                      activeOpacity={0.7}
                    >
                      <Text style={getButtonTextStyle(buttons[2].style)}>
                        {buttons[2].text}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Normal layout for 1 or 2 buttons
                buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      getButtonStyle(button.style),
                      buttons.length === 1 && (styles.singleButton as ViewStyle),
                      index === 0 && buttons.length > 1 && (styles.firstButton as ViewStyle),
                      index === buttons.length - 1 && buttons.length > 1 && (styles.lastButton as ViewStyle)
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text style={getButtonTextStyle(button.style)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[5], // 20px
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING[6], // 24px
    paddingHorizontal: SPACING[5], // 20px
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[4], // 16px
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2], // 8px
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginBottom: SPACING[5], // 20px
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '400' as const,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING[2], 
  },
  threeButtonContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  topButtonRow: {
    flexDirection: 'row',
    gap: SPACING[2], // 8px
    marginBottom: SPACING[2], // 8px
  },
  bottomButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  topRowButton: {
    flex: 1,
    paddingVertical: SPACING[2], // 16px
    paddingHorizontal: SPACING[3], // 12px (reduced for better fit)
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  bottomRowButton: {
    paddingVertical: SPACING[2], 
    paddingHorizontal: SPACING[5], 
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120, 
  },
  button: {
    flex: 1,
    paddingVertical: SPACING[2], // 16px
    paddingHorizontal: SPACING[5], // 20px
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  singleButton: {
    flex: 1,
  },
  firstButton: {
    marginRight: SPACING[1], // 4px
  },
  lastButton: {
    marginLeft: SPACING[1], // 4px
  },
  defaultButton: {
    backgroundColor: '#5283d1ff',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  defaultButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#6B7280',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});

export default CustomAlert;