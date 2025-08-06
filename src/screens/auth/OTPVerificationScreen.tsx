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
  Dimensions,
  Animated,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

type Props = AuthStackScreenProps<'OTPVerification'>;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { email, type } = route.params;
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation for OTP inputs
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return type === 'signup' ? 'Verify Your Account' : 'Reset Password';
  };

  const getDescription = () => {
    return type === 'signup' 
      ? 'We\'ve sent a secure 6-digit verification code to complete your registration and ensure account safety.'
      : 'Enter the 6-digit security code we sent to reset your password safely.';
  };

  const getRoleColor = () => {
    // You can determine this based on the previous screen's role or default
    return COLORS.primary[500]; // Default color
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Verifying code..." />
      
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.bgCircle, styles.bgCircle1, { backgroundColor: getRoleColor() + '08' }]} />
        <View style={[styles.bgCircle, styles.bgCircle2, { backgroundColor: getRoleColor() + '05' }]} />
        <View style={[styles.bgCircle, styles.bgCircle3, { backgroundColor: '#10B981' + '06' }]} />
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#475569" />
            </TouchableOpacity>
            
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoSection,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../../assets/images/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.appTitle}>MediTracker</Text>
            </Animated.View>
          </View>

          {/* Verification Section */}
          <Animated.View 
            style={[
              styles.verificationSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.description}>{getDescription()}</Text>
            </View>
            
            <View style={styles.emailContainer}>
              <View style={styles.emailInfo}>
                <Ionicons name="mail" size={20} color={getRoleColor()} />
                <View style={styles.emailTextContainer}>
                  <Text style={styles.emailLabel}>Code sent to:</Text>
                  <Text style={styles.emailText} numberOfLines={1} adjustsFontSizeToFit>
                    {email}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleChangeEmail}
                style={styles.changeEmailButton}
              >
                <Text style={[styles.changeEmailText, { color: getRoleColor() }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* OTP Input */}
          <Animated.View 
            style={[
              styles.otpContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.otpLabel}>Enter Verification Code</Text>
            
            <Animated.View 
              style={[
                styles.otpInputContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
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
            </Animated.View>

            {/* Error Message */}
            {error && (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Timer and Resend */}
          <Animated.View 
            style={[
              styles.timerContainer,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.timerCard}>
              <Ionicons 
                name={timeLeft > 0 ? "time-outline" : "refresh-circle"} 
                size={24} 
                color={timeLeft > 0 ? getRoleColor() : "#EF4444"} 
              />
              <View style={styles.timerTextContainer}>
                {timeLeft > 0 ? (
                  <>
                    <Text style={styles.timerLabel}>Code expires in</Text>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.expiredLabel}>Code has expired</Text>
                    <Text style={styles.expiredText}>Request a new code</Text>
                  </>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.resendButton,
                !canResend && styles.resendButtonDisabled
              ]}
              onPress={handleResendOTP}
              disabled={!canResend}
            >
              <Ionicons 
                name="refresh" 
                size={18} 
                color={canResend ? COLORS.background : COLORS.gray[400]} 
              />
              <Text style={[
                styles.resendText,
                !canResend && styles.resendTextDisabled
              ]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Verify Button */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Button
              title="Verify & Continue"
              onPress={() => handleVerifyOTP()}
              disabled={otp.some(digit => !digit) || isLoading}
              loading={isLoading}
              fullWidth
              style={{ ...styles.verifyButton, backgroundColor: getRoleColor() }}
              icon={<Ionicons name="checkmark-circle" size={20} color={COLORS.background} />}
            />
          </Animated.View>

          {/* Security Notice */}
          <Animated.View 
            style={[
              styles.securitySection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <Text style={styles.securityText}>Secure verification • Your data is protected</Text>
            </View>
            
            <Text style={styles.helpText}>
              Didn&apos;t receive the code? Check your spam folder or contact support if the issue persists.
            </Text>
          </Animated.View>
        </View>
              </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.6,
  },
  bgCircle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  bgCircle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  bgCircle3: {
    width: 100,
    height: 100,
    top: '40%',
    right: -20,
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[6],
    zIndex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: isShortDevice ? SPACING[8] : SPACING[12],
    marginBottom: isShortDevice ? SPACING[4] : SPACING[8],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING[3],
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: isShortDevice ? SPACING[2] : SPACING[4],
  },
  logoImage: {
    width: isSmallDevice ? 70 : isShortDevice ? 80 : 100,
    height: isSmallDevice ? 70 : isShortDevice ? 80 : 100,
  },
  appTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : isShortDevice ? TYPOGRAPHY.fontSize['2xl'] : TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -1,
  },
  verificationSection: {
    marginBottom: isShortDevice ? SPACING[4] : SPACING[8],
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
  },
  title: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.lg : isShortDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  description: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 22,
    maxWidth: '90%',
  },
  emailContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: isSmallDevice ? SPACING[4] : SPACING[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0, // Allows text to shrink
  },
  emailTextContainer: {
    marginLeft: SPACING[3],
    flex: 1,
    minWidth: 0, // Allows text to shrink
  },
  emailLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  emailText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#334155',
  },
  changeEmailButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    marginLeft: SPACING[2],
  },
  changeEmailText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: isShortDevice ? SPACING[4] : SPACING[8],
  },
  otpLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.md : TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
    paddingHorizontal: isSmallDevice ? SPACING[1] : SPACING[2],
  },
  otpInput: {
    width: isSmallDevice ? width * 0.12 : width * 0.13,
    height: isSmallDevice ? 50 : isShortDevice ? 55 : 60,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.xl,
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: COLORS.primary[500],
    backgroundColor: '#F0F9FF',
    shadowOpacity: 0.1,
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING[3],
    borderRadius: RADIUS.lg,
    marginTop: SPACING[3],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginLeft: SPACING[2],
    textAlign: 'center',
    fontWeight: '500',
  },
  timerContainer: {
    marginBottom: isShortDevice ? SPACING[4] : SPACING[8],
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: isSmallDevice ? SPACING[3] : SPACING[4],
    marginBottom: SPACING[4],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timerTextContainer: {
    marginLeft: SPACING[3],
    flex: 1,
  },
  timerLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  timerText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.md : TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#1E293B',
  },
  expiredLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  expiredText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? SPACING[2] : SPACING[3],
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[6],
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary[500],
    gap: SPACING[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButtonDisabled: {
    backgroundColor: COLORS.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  resendText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: COLORS.gray[400],
  },
  buttonContainer: {
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
  },
  verifyButton: {
    minHeight: isSmallDevice ? 48 : 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  securitySection: {
    alignItems: 'center',
    paddingBottom: SPACING[4],
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: isSmallDevice ? SPACING[2] : SPACING[3],
    paddingHorizontal: isSmallDevice ? SPACING[3] : SPACING[5],
    borderRadius: RADIUS.full,
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: SPACING[2],
  },
  securityText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '600',
  },
  helpText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 18 : 20,
    maxWidth: '85%',
  },
});

export default OTPVerificationScreen;