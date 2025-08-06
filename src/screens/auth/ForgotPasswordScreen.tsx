/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { ForgotPasswordData } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearError } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

type Props = AuthStackScreenProps<'ForgotPassword'>;

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
});

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [emailSent, setEmailSent] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (emailSent) {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [emailSent]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      dispatch(clearError());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      Alert.alert(
        'Reset Link Sent',
        `We've sent a password reset code to ${data.email}. Please check your email and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', {
                email: data.email,
                type: 'forgot_password'
              });
            }
          }
        ]
      );
      
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleResendEmail = () => {
    const email = getValues('email');
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Sending reset link..." />
      
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToLogin}
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
              <Text style={styles.appTitle}>MediTracker</Text>
              <Text style={styles.appSubtitle}>Password Recovery</Text>
            </Animated.View>
          </View>

          {!emailSent ? (
            /* Email Form */
            <Animated.View 
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Icon and Title */}
              <View style={styles.iconSection}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={48} color="#2563EB" />
                </View>
                <Text style={styles.mainTitle}>Forgot Password?</Text>
                <Text style={styles.mainDescription}>
                  Don&apos;t worry! Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputSection}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email Address"
                      placeholder="Enter your email address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      leftIcon="mail-outline"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      required
                    />
                  )}
                />

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Send Reset Code Button */}
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Send Verification Code"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    fullWidth
                    style={styles.submitButton}
                  />
                </View>

                {/* Back to Login */}
                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={handleBackToLogin}
                >
                  <Ionicons name="arrow-back" size={16} color="#2563EB" />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            /* Success State */
            <Animated.View 
              style={[
                styles.successSection,
                {
                  opacity: successAnim,
                  transform: [{ scale: successAnim }]
                }
              ]}
            >
              <View style={styles.successIconSection}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                </View>
                
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We&apos;ve sent a password reset link to your email address. 
                  Please check your inbox (and spam folder) and follow the instructions.
                </Text>

                <View style={styles.emailDisplayContainer}>
                  <Text style={styles.emailDisplayLabel}>Email sent to:</Text>
                  <Text style={styles.emailDisplayText}>{getValues('email')}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <Button
                  title="Enter Reset Code"
                  onPress={() => navigation.navigate('OTPVerification', {
                    email: getValues('email'),
                    type: 'forgot_password'
                  })}
                  fullWidth
                  style={styles.primaryAction}
                />

                <Button
                  title="Resend Email"
                  onPress={handleResendEmail}
                  variant="outline"
                  fullWidth
                  style={styles.secondaryAction}
                />

                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={handleBackToLogin}
                >
                  <Ionicons name="arrow-back" size={16} color="#2563EB" />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Help Section */}
          <Animated.View 
            style={[
              styles.helpSection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.helpCard}>
              <Ionicons name="help-circle-outline" size={24} color="#64748B" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpText}>
                  If you&apos;re having trouble receiving the email, please check your spam folder 
                  or contact our support team for assistance.
                </Text>
                
                <TouchableOpacity style={styles.contactSupport}>
                  <Text style={styles.contactSupportText}>Contact Support</Text>
                  <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Security Badge */}
          <Animated.View 
            style={[
              styles.securitySection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <Text style={styles.securityText}>HIPAA Compliant & Secure</Text>
            </View>
          </Animated.View>
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
    opacity: 0.4,
  },
  bgCircle1: {
    width: 160,
    height: 160,
    backgroundColor: '#2563EB08',
    top: -80,
    right: -30,
  },
  bgCircle2: {
    width: 120,
    height: 120,
    backgroundColor: '#10B98105',
    bottom: 100,
    left: -60,
  },
  bgCircle3: {
    width: 80,
    height: 80,
    backgroundColor: '#F59E0B06',
    top: '50%',
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
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[6],
    paddingBottom: SPACING[8],
  },
  header: {
    paddingTop: SPACING[12],
    marginBottom: SPACING[6],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING[3],
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    marginBottom: SPACING[6],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING[1],
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: SPACING[8],
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  mainTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  mainDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
    paddingHorizontal: SPACING[2],
  },
  inputSection: {
    paddingHorizontal: SPACING[2],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginLeft: SPACING[3],
    flex: 1,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: SPACING[6],
    marginBottom: SPACING[6],
  },
  submitButton: {
    backgroundColor: '#2563EB',
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  backToLoginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#2563EB',
    fontWeight: '600',
  },
  successSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  successIconSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
    borderWidth: 3,
    borderColor: '#D1FAE5',
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
    maxWidth: '90%',
  },
  emailDisplayContainer: {
    backgroundColor: '#F1F5F9',
    padding: SPACING[5],
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '80%',
  },
  emailDisplayLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
    fontWeight: '500',
  },
  emailDisplayText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: '#1E293B',
  },
  successActions: {
    width: '100%',
    gap: SPACING[4],
    paddingHorizontal: SPACING[2],
  },
  primaryAction: {
    backgroundColor: '#2563EB',
    minHeight: 56,
    borderRadius: RADIUS.xl,
  },
  secondaryAction: {
    borderColor: '#E2E8F0',
    borderWidth: 2,
    minHeight: 56,
    borderRadius: RADIUS.xl,
  },
  helpSection: {
    marginBottom: SPACING[6],
    paddingHorizontal: SPACING[2],
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: SPACING[5],
    borderRadius: RADIUS.xl,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  helpContent: {
    flex: 1,
    marginLeft: SPACING[4],
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: '#334155',
    marginBottom: SPACING[2],
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: SPACING[3],
  },
  contactSupport: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.lg,
    alignSelf: 'flex-start',
  },
  contactSupportText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    fontWeight: '600',
    marginRight: SPACING[2],
  },
  securitySection: {
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: SPACING[2],
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;