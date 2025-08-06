/* eslint-disable react-hooks/exhaustive-deps */
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
import type { SubmitHandler } from 'react-hook-form';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { LoginCredentials } from '../../types/auth.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES, ALERT_MESSAGES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Props = AuthStackScreenProps<'Login'>;

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

  const getRoleColor = () => {
    return selectedRole === 'caregiver' ? '#059669' : '#2563EB';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Signing you in..." />
      
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
              onPress={handleRoleChange}
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
                    ? 'Access your patient management dashboard'
                    : 'Access your medication tracking dashboard'
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
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Please sign in to your account to continue
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View 
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
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
                  />
                )}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
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
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: getRoleColor() }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Animated.View style={[
              styles.buttonWrapper,
              { opacity: fadeAnim } 
            ]}>
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                fullWidth
                style={{ ...styles.loginButton, backgroundColor: getRoleColor() }}
              />
            </Animated.View>

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
                <Text style={[styles.signupLink, { color: getRoleColor() }]}>
                  Sign Up
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
    marginBottom: SPACING[4],
    paddingTop: SPACING[0],
  },
  logoImage: {
    width: isSmallDevice ? 90 : 110,
    height: isSmallDevice ? 90 : 110,
  },
  appTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize['2xl'] : TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING[1],
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
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#334155',
    marginBottom: SPACING[1],
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
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: SPACING[6],
  },
  inputWrapper: {
    marginBottom: SPACING[2],
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING[1],
    paddingHorizontal: SPACING[2],
    marginBottom: SPACING[2],
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  buttonWrapper: {
    marginBottom: SPACING[6],
  },
  loginButton: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  signupLink: {
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

export default LoginScreen;