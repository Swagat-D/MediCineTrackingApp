import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import Button from '../../components/common/Button/Button';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { AuthStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { APP_CONFIG } from '../../constants/app';

// Redux
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyOTP, clearError } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'OTPVerification'>;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { email, type } = route.params;
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (value: string, index: number) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < APP_CONFIG.OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOTP.every(digit => digit !== '') && newOTP.join('').length === APP_CONFIG.OTP_LENGTH) {
      Keyboard.dismiss();
      handleVerifyOTP(newOTP.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== APP_CONFIG.OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code.');
      return;
    }

    try {
      dispatch(clearError());
      const result = await dispatch(verifyOTP({ 
        email, 
        otp: otpToVerify 
      }));
      
      if (verifyOTP.fulfilled.match(result)) {
        // Navigation will be handled by MainNavigator based on auth state
        Alert.alert(
          'Success',
          type === 'signup' ? 'Account created successfully!' : 'Email verified successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          result.payload || 'Invalid OTP. Please try again.'
        );
        // Clear OTP inputs on failure
        setOTP(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      // Reset timer and state
      setTimeLeft(300);
      setCanResend(false);
      setOTP(['', '', '', '', '', '']);
      
      // TODO: Implement resend OTP API call
      // await authAPI.resendOTP(email);
      
      Alert.alert(
        'OTP Sent',
        'A new verification code has been sent to your email.'
      );
      
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const handleChangeEmail = () => {
    navigation.goBack();
  };

  const getTitle = () => {
    return type === 'signup' ? 'Verify Your Email' : 'Reset Password';
  };

  const getDescription = () => {
    return type === 'signup' 
      ? 'We\'ve sent a 6-digit verification code to your email address. Please enter it below to complete your registration.'
      : 'We\'ve sent a 6-digit code to your email address. Enter it below to reset your password.';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Verifying code..." />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open" size={80} color={COLORS.primary[500]} />
          </View>
          
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>
          
          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Code sent to:</Text>
            <Text style={styles.emailText}>{email}</Text>
            <TouchableOpacity onPress={handleChangeEmail}>
              <Text style={styles.changeEmailText}>Change Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter Verification Code</Text>
          
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Timer and Resend */}
        <View style={styles.timerContainer}>
          {timeLeft > 0 ? (
            <Text style={styles.timerText}>
              Code expires in {formatTime(timeLeft)}
            </Text>
          ) : (
            <Text style={styles.expiredText}>
              Code has expired
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
            onPress={handleResendOTP}
            disabled={!canResend}
          >
            <Ionicons 
              name="refresh" 
              size={16} 
              color={canResend ? COLORS.primary[500] : COLORS.gray[400]} 
            />
            <Text style={[
              styles.resendText,
              !canResend && styles.resendTextDisabled
            ]}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <Button
          title="Verify Code"
          onPress={() => handleVerifyOTP()}
          disabled={otp.some(digit => !digit) || isLoading}
          loading={isLoading}
          fullWidth
          style={styles.verifyButton}
        />

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Didn&apos;t receive the code? Check your spam folder or try resending.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING[2],
    marginBottom: SPACING[6],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
  },
  emailContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING[4],
    borderRadius: RADIUS.md,
  },
  emailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  emailText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  changeEmailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[500],
    fontWeight:'500',
  },
  otpContainer: {
    marginBottom: SPACING[8],
  },
  otpLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[4],
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
    paddingHorizontal: SPACING[4],
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  otpInputFilled: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginTop: SPACING[2],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginLeft: SPACING[2],
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING[3],
  },
  expiredText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    fontWeight: '500',
    marginBottom: SPACING[3],
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary[50],
  },
  resendButtonDisabled: {
    backgroundColor: COLORS.gray[100],
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[500],
    fontWeight: '500',
    marginLeft: SPACING[2],
  },
  resendTextDisabled: {
    color: COLORS.gray[400],
  },
  verifyButton: {
    marginBottom: SPACING[6],
  },
  helpContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OTPVerificationScreen;