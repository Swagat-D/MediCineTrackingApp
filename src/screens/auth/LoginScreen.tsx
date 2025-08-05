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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import type { SubmitHandler } from 'react-hook-form';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { LoginCredentials } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES, ALERT_MESSAGES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'Login'>;

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`),
  role: yup
    .mixed<LoginCredentials['role']>()
    .oneOf(['patient', 'caregiver'])
    .required('Role is required'),
});

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const selectedRole = route.params?.role || 'patient';

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      role: selectedRole,
    },
  });


  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    try {
      dispatch(clearError());
      const result = await dispatch(loginUser(data));
      
      if (loginUser.fulfilled.match(result)) {
        // Navigation will be handled by MainNavigator based on auth state
        reset();
      } else {
        Alert.alert(
          'Login Failed',
          result.payload || ALERT_MESSAGES.ERROR.INVALID_CREDENTIALS
        );
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup', { role: selectedRole });
  };

  const handleRoleChange = () => {
    navigation.goBack();
  };

  const getRoleIcon = () => {
    return selectedRole === 'caregiver' ? 'people' : 'person';
  };

  const getRoleTitle = () => {
    return selectedRole === 'caregiver' ? 'Caregiver Login' : 'Patient Login';
  };

  const getRoleDescription = () => {
    return selectedRole === 'caregiver' 
      ? 'Access your patient management dashboard'
      : 'Access your medication tracking dashboard';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Signing you in..." />
      
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
              onPress={handleRoleChange}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
            </TouchableOpacity>
            
            <View style={styles.roleIndicator}>
              <View style={styles.roleIconContainer}>
                <Ionicons name={getRoleIcon()} size={32} color={COLORS.primary[500]} />
              </View>
              <Text style={styles.roleTitle}>{getRoleTitle()}</Text>
              <Text style={styles.roleDescription}>{getRoleDescription()}</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Please sign in to your account
            </Text>

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

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
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
                  autoComplete="password"
                  required
                />
              )}
            />

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: SPACING[8],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING[2],
    marginBottom: SPACING[6],
  },
  roleIndicator: {
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
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
    marginBottom: SPACING[8],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[4],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginLeft: SPACING[2],
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING[6],
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[500],
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: SPACING[6],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING[4],
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING[6],
  },
  signupText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  signupLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary[500],
    fontWeight: '600',
  },
});

export default LoginScreen;