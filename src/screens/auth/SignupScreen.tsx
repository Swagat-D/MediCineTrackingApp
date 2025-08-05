import React, { useState } from 'react';
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

type Props = AuthStackScreenProps<'Signup'>;

// Validation schema
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
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say', ''] as Gender[], 'Please select your gender')
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

const genderOptions: { label: string; value: Gender }[] = [
  { label: 'Select Gender', value: '' as Gender },
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
        // Navigate to OTP verification
        navigation.navigate('OTPVerification', { 
          email: data.email, 
          type: 'signup' 
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

  const handleBackToRoleSelection = () => {
    navigation.navigate('RoleSelection');
  };

  const getRoleIcon = () => {
    return selectedRole === 'caregiver' ? 'people' : 'person';
  };

  const getRoleTitle = () => {
    return selectedRole === 'caregiver' ? 'Caregiver Signup' : 'Patient Signup';
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: COLORS.gray[400] };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: COLORS.error };
    if (strength <= 3) return { strength, text: 'Fair', color: COLORS.warning };
    if (strength <= 4) return { strength, text: 'Good', color: COLORS.secondary[500] };
    return { strength, text: 'Strong', color: COLORS.success };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Creating your account..." />
      
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
              onPress={handleBackToRoleSelection}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
            </TouchableOpacity>
            
            <View style={styles.roleIndicator}>
              <View style={styles.roleIconContainer}>
                <Ionicons name={getRoleIcon()} size={28} color={COLORS.primary[500]} />
              </View>
              <Text style={styles.roleTitle}>{getRoleTitle()}</Text>
            </View>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>
              Please fill in the details to get started
            </Text>

            {/* Name Input */}
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
                />
              )}
            />

            {/* Email Input */}
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
                />
              )}
            />

            {/* Phone Number Input */}
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
                />
              )}
            />

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
                    <View style={[styles.pickerContainer, errors.gender && styles.pickerError]}>
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

            {/* Password Input */}
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

            {/* Confirm Password Input */}
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
                />
              )}
            />

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Signup Button */}
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit as SubmitHandler<SignupData>)}
              disabled={!isValid || isLoading}
              loading={isLoading}
              fullWidth
              style={styles.signupButton}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
  },
  header: {
    paddingTop: SPACING[4],
    marginBottom: SPACING[6],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING[2],
    marginBottom: SPACING[4],
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING[6],
  },
  rowContainer: {
    flexDirection: 'row',
    gap: SPACING[3],
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
    color: COLORS.error,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    minHeight: 48,
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: COLORS.error,
  },
  picker: {
    height: 48,
    color: COLORS.text.primary,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[2],
    marginBottom: SPACING[2],
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: 2,
    marginRight: SPACING[3],
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[4],
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginLeft: SPACING[2],
    flex: 1,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
  termsContainer: {
    marginBottom: SPACING[6],
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary[500],
    fontWeight: '500',
  },
  signupButton: {
    marginBottom: SPACING[6],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING[6],
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary[500],
    fontWeight: '600',
  },
});

export default SignupScreen;