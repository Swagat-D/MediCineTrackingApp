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
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { SignupData, Gender } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { signupUser, clearError } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

type Props = AuthStackScreenProps<'Signup'>;

const signupSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`)
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  age: yup
    .number()
    .typeError('Age is required')
    .required('Age is required')
    .min(VALIDATION_RULES.AGE_MIN, `Age must be at least ${VALIDATION_RULES.AGE_MIN}`)
    .max(VALIDATION_RULES.AGE_MAX, `Age must be less than ${VALIDATION_RULES.AGE_MAX}`),
  gender: yup
    .mixed<Gender>()
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'] as Gender[], 'Please select your gender')
    .required('Please select your gender'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(VALIDATION_RULES.PHONE, 'Please enter a valid phone number'),
  role: yup
    .mixed<SignupData['role']>()
    .oneOf(['patient', 'caregiver'] as SignupData['role'][], 'Role is required')
    .required('Role is required'),
});

const genderOptions: { label: string; value: Gender | '' }[] = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const selectedRole = route.params.role;

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
    reset,
    watch,
  } = useForm<SignupData>({
    resolver: yupResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: undefined,
      gender: '' as Gender,
      phoneNumber: '',
      role: selectedRole,
    },
  });

  const watchedPassword = watch('password');

  const onSubmit = async (data: SignupData) => {
    try {
      dispatch(clearError());
      const result = await dispatch(signupUser(data));
      
      if (signupUser.fulfilled.match(result)) {
        navigation.navigate('OTPVerification', { 
          email: data.email, 
          type: 'signup' ,
          role: data.role
        });
        reset();
      } else {
        Alert.alert(
          'Signup Failed',
          result.payload || 'Failed to create account. Please try again.'
        );
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login', { role: selectedRole });
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const getRoleIcon = () => {
    return selectedRole === 'caregiver' ? 'people' : 'person';
  };

  const getRoleTitle = () => {
    return selectedRole === 'caregiver' ? 'Caregiver Signup' : 'Patient Signup';
  };

  const getRoleColor = () => {
    return selectedRole === 'caregiver' ? '#059669' : '#2563EB';
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

  // Dynamic picker styles based on role
  const getDynamicPickerStyles = () => {
    return {
      ...styles.pickerContainer,
      borderColor: errors.gender ? '#EF4444' : COLORS.gray[300],
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Creating your account..." />
      
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
            <Animated.View style={[styles.roleCard, { opacity: fadeAnim }]}>
                <View style={[styles.roleIconContainer, { backgroundColor: getRoleColor() }]}>
                  <Ionicons name={getRoleIcon()} size={24} color="#FFFFFF" />
                </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{getRoleTitle()}</Text>
                      <Text style={styles.roleDescription}>
                        {selectedRole === 'caregiver' 
                          ? 'Create Your Medication Tracking Account'
                          : 'Create your medication tracking Account'
                        }
                      </Text>
                  </View>
            </Animated.View>
          </Animated.View>

          {/* Welcome Section */}
          <Animated.View 
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.welcomeTitle}>Create Your Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join thousands of users managing their medications safely
            </Text>
          </Animated.View>

          {/* Signup Form */}
          <Animated.View 
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Personal Information Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={getRoleColor()} />
              <Text style={[styles.sectionTitle, { color: getRoleColor() }]}>Personal Information</Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    leftIcon="person-outline"
                    autoCapitalize="words"
                    autoComplete="name"
                    required
                    userRole={selectedRole} // Pass the user role
                  />
                )}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    leftIcon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    required
                    userRole={selectedRole} // Pass the user role
                  />
                )}
              />
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phoneNumber?.message}
                    leftIcon="call-outline"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    required
                    userRole={selectedRole} // Pass the user role
                  />
                )}
              />
            </View>

            {/* Age and Gender Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="age"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Age"
                      placeholder="Age"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(text ? parseInt(text) : undefined)}
                      onBlur={onBlur}
                      error={errors.age?.message}
                      leftIcon="calendar-outline"
                      keyboardType="numeric"
                      required
                      userRole={selectedRole} // Pass the user role
                    />
                  )}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View style={getDynamicPickerStyles()}>
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                      >
                        {genderOptions.map((option) => (
                          <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender.message}</Text>
                )}
              </View>
            </View>

            {/* Security Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color={getRoleColor()} />
              <Text style={[styles.sectionTitle, { color: getRoleColor() }]}>Security</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      leftIcon="lock-closed-outline"
                      secureTextEntry={!showPassword}
                      rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      onRightIconPress={() => setShowPassword(!showPassword)}
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
                    label="Confirm Password"
                    placeholder="Confirm your password"
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
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Ionicons name="document-text-outline" size={16} color="#94A3B8" />
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={[styles.termsLink, { color: getRoleColor() }]}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={[styles.termsLink, { color: getRoleColor() }]}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Signup Button */}
            <View style={styles.buttonWrapper}>
              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit as SubmitHandler<SignupData>)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                fullWidth
                style={styles.signupButton}
                userRole={selectedRole} // Pass the user role
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={[styles.loginLink, { color: getRoleColor() }]}>
                  Sign In
                </Text>
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
    opacity: 0.6,
  },
  bgCircle1: {
    width: 180,
    height: 180,
    top: -90,
    right: -40,
  },
  bgCircle2: {
    width: 120,
    height: 120,
    bottom: 150,
    left: -60,
  },
  bgCircle3: {
    width: 80,
    height: 80,
    top: '30%',
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
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[5],
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
    letterSpacing: -1,
  },
  roleSection: {
    marginBottom: SPACING[8],
    paddingHorizontal: SPACING[2],
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    color: '#334155',
    marginBottom: SPACING[1],
  },
  roleInfo: {
    flex: 1,
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
    paddingHorizontal: SPACING[4],
  },
  welcomeTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: SPACING[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
    marginTop: SPACING[2],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
    marginLeft: SPACING[2],
  },
  inputWrapper: {
    marginBottom: SPACING[2],
  },
  rowContainer: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[2],
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  required: {
    color: '#EF4444',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    minHeight: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
    color: COLORS.text.primary,
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
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginLeft: SPACING[3],
    flex: 1,
    fontWeight: '500',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#EF4444',
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[6],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    lineHeight: 16,
    marginLeft: SPACING[2],
    flex: 1,
  },
  termsLink: {
    fontWeight: '600',
  },
  buttonWrapper: {
    marginBottom: SPACING[6],
  },
  signupButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    marginHorizontal: SPACING[4],
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING[2],
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
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

export default SignupScreen;