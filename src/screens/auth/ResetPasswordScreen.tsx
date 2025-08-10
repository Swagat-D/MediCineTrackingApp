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
import { ResetPasswordData } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetPassword, clearError } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

type Props = AuthStackScreenProps<'ResetPassword'>;

const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('Password is required')
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { email, otp, role } = route.params;
  
  // Get role from params or default to patient
  const selectedRole = role || 'patient';

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

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

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      dispatch(clearError());
      
      const result = await dispatch(resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }));
      
      if (resetPassword.fulfilled.match(result)) {
        Alert.alert(
          'Password Reset Successfully',
          'Your password has been reset successfully. Please login with your new password.',
          [
            {
              text: 'Login Now',
              onPress: () => {
                // Redirect to login with the appropriate role
                navigation.navigate('Login', { role: selectedRole });
              }
            }
          ]
        );
        reset();
      } else {
        Alert.alert(
          'Reset Failed',
          result.payload || 'Failed to reset password. Please try again.'
        );
      }
    } catch (err) {
      console.error('Reset password error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleBackToOTP = () => {
    navigation.goBack();
  };

  // Role-based color functions
  const getRoleColor = () => {
    return selectedRole === 'caregiver' ? '#059669' : '#2563EB';
  };

  const getRoleIcon = () => {
    return selectedRole === 'caregiver' ? 'people' : 'person';
  };

  const getRoleTitle = () => {
    return selectedRole === 'caregiver' ? 'Caregiver' : 'Patient';
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: COLORS.gray[400] };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: '#EF4444' };
    if (strength <= 3) return { strength, text: 'Fair', color: '#F59E0B' };
    if (strength <= 4) return { strength, text: 'Good', color: '#10B981' };
    return { strength, text: 'Strong', color: '#059669' };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Resetting your password..." />
      
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToOTP}
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
              <Text style={styles.appSubtitle}>Create New Password</Text>
            </Animated.View>
          </View>

          {/* Role Indicator */}
          <Animated.View 
            style={[
              styles.roleSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.roleCard}>
              <View style={[styles.roleIconContainer, { backgroundColor: getRoleColor() }]}>
                <Ionicons name={getRoleIcon()} size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.roleText}>{getRoleTitle()} Password Reset</Text>
            </View>
          </Animated.View>

          {/* Reset Password Form */}
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
              <View style={[styles.iconContainer, { backgroundColor: getRoleColor() + '15', borderColor: getRoleColor() + '30' }]}>
                <Ionicons name="shield-checkmark" size={48} color={getRoleColor()} />
              </View>
              <Text style={styles.mainTitle}>Create New Password</Text>
              <Text style={styles.mainDescription}>
                Your identity has been verified. Please create a strong new password for your account.
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.inputSection}>
              {/* Email Display */}
              <View style={[styles.emailContainer, { backgroundColor: getRoleColor() + '10', borderColor: getRoleColor() + '30' }]}>
                <View style={styles.emailInfo}>
                  <Ionicons name="mail" size={18} color={getRoleColor()} />
                  <Text style={[styles.emailText, { color: getRoleColor() }]}>Resetting password for: {email}</Text>
                </View>
              </View>

              {/* New Password Input */}
              <View style={styles.inputWrapper}>
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <Input
                        label="New Password"
                        placeholder="Enter your new password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.newPassword?.message}
                        leftIcon="lock-closed-outline"
                        secureTextEntry={!showNewPassword}
                        rightIcon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                        autoComplete="new-password"
                        required
                        userRole={selectedRole} // Pass the user role
                      />
                      {/* Password Strength Indicator */}
                      {value && (
                        <View style={styles.passwordStrengthContainer}>
                          <View style={styles.passwordStrengthBar}>
                            <View 
                              style={[
                                styles.passwordStrengthFill,
                                { 
                                  width: `${(passwordStrength.strength / 5) * 100}%`,
                                  backgroundColor: passwordStrength.color 
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                            {passwordStrength.text}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Confirm New Password"
                      placeholder="Confirm your new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      leftIcon="lock-closed-outline"
                      secureTextEntry={!showConfirmPassword}
                      rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      autoComplete="new-password"
                      required
                      userRole={selectedRole} // Pass the user role
                    />
                  )}
                />
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={watchedPassword && watchedPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={watchedPassword && watchedPassword.length >= 6 ? getRoleColor() : "#94A3B8"} 
                    />
                    <Text style={[styles.requirementText, watchedPassword && watchedPassword.length >= 6 && { ...styles.requirementMet, color: getRoleColor() }]}>
                      At least 6 characters
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={watchedPassword && /[A-Z]/.test(watchedPassword) ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={watchedPassword && /[A-Z]/.test(watchedPassword) ? getRoleColor() : "#94A3B8"} 
                    />
                    <Text style={[styles.requirementText, watchedPassword && /[A-Z]/.test(watchedPassword) && { ...styles.requirementMet, color: getRoleColor() }]}>
                      One uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={watchedPassword && /[a-z]/.test(watchedPassword) ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={watchedPassword && /[a-z]/.test(watchedPassword) ? getRoleColor() : "#94A3B8"} 
                    />
                    <Text style={[styles.requirementText, watchedPassword && /[a-z]/.test(watchedPassword) && { ...styles.requirementMet, color: getRoleColor() }]}>
                      One lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={watchedPassword && /\d/.test(watchedPassword) ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={watchedPassword && /\d/.test(watchedPassword) ? getRoleColor() : "#94A3B8"} 
                    />
                    <Text style={[styles.requirementText, watchedPassword && /\d/.test(watchedPassword) && { ...styles.requirementMet, color: getRoleColor() }]}>
                      One number
                    </Text>
                  </View>
                </View>
              </View>

              {/* Reset Password Button */}
              <View style={styles.buttonWrapper}>
                <Button
                  title="Reset Password"
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || isLoading}
                  loading={isLoading}
                  fullWidth
                  style={styles.submitButton}
                  userRole={selectedRole} // Pass the user role
                />
              </View>

              {/* Back to OTP */}
              <TouchableOpacity 
                style={styles.backToOTPButton}
                onPress={handleBackToOTP}
              >
                <Ionicons name="arrow-back" size={16} color={getRoleColor()} />
                <Text style={[styles.backToOTPText, { color: getRoleColor() }]}>Back to Verification</Text>
              </TouchableOpacity>
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
    top: -80,
    right: -30,
  },
  bgCircle2: {
    width: 120,
    height: 120,
    bottom: 100,
    left: -60,
  },
  bgCircle3: {
    width: 80,
    height: 80,
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
  logoContainer: {
    marginBottom: SPACING[3],
  },
  logoImage: {
    width: isSmallDevice ? 70 : 80,
    height: isSmallDevice ? 70 : 80,
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
  roleSection: {
    marginBottom: SPACING[8],
    paddingHorizontal: SPACING[2],
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[6],
    borderRadius: RADIUS.xl,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  roleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: '#334155',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
    borderWidth: 2,
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
  emailContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[6],
    borderWidth: 1,
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    marginLeft: SPACING[2],
    flex: 1,
  },
  inputWrapper: {
    marginBottom: SPACING[4],
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[2],
    marginBottom: SPACING[1],
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: SPACING[3],
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
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
  requirementsContainer: {
    backgroundColor: '#F8FAFC',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[6],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#334155',
    marginBottom: SPACING[3],
  },
  requirementsList: {
    gap: SPACING[2],
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginLeft: SPACING[2],
  },
  requirementMet: {
    fontWeight: '500',
  },
  buttonWrapper: {
    marginBottom: SPACING[6],
  },
  submitButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backToOTPButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  backToOTPText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
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

export default ResetPasswordScreen;