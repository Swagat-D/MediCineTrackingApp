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

// Components
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { AuthStackScreenProps } from '../../types/navigation.types';
import { ForgotPasswordData } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';

// Redux
import { useAppDispatch, useAppSelector } from '../../store';
import { clearError } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'ForgotPassword'>;

// Validation schema
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
      
      // TODO: Implement forgot password API call
      // const result = await dispatch(forgotPassword(data));
      // if (forgotPassword.fulfilled.match(result)) {
      
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Sending reset link..." />
      
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
              <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={80} color={COLORS.primary[500]} />
            </View>
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent 
                ? "We've sent you a reset link!" 
                : "Don't worry! Enter your email address and we'll send you a link to reset your password."
              }
            </Text>
          </View>

          {!emailSent ? (
            /* Email Form */
            <View style={styles.formContainer}>
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
                  <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Send Reset Link Button */}
              <Button
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                fullWidth
                style={styles.submitButton}
              />

              {/* Back to Login */}
              <TouchableOpacity 
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <Ionicons name="arrow-back" size={16} color={COLORS.primary[500]} />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Success State */
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
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
                  <Ionicons name="arrow-back" size={16} color={COLORS.primary[500]} />
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If you&apos;re having trouble receiving the email, please check your spam folder 
              or contact our support team for assistance.
            </Text>
            
            <TouchableOpacity style={styles.contactSupport}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.primary[500]} />
              <Text style={styles.contactSupportText}>Contact Support</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    paddingTop: SPACING[4],
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
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  formContainer: {
    flex: 1,
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
  submitButton: {
    marginBottom: SPACING[6],
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  backToLoginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary[500],
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
  },
  emailDisplayContainer: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING[4],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[8],
    alignItems: 'center',
  },
  emailDisplayLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  emailDisplayText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  successActions: {
    width: '100%',
    gap: SPACING[3],
  },
  primaryAction: {
    marginBottom: SPACING[2],
  },
  secondaryAction: {
    marginBottom: SPACING[4],
  },
  helpSection: {
    marginTop: SPACING[8],
    paddingTop: SPACING[6],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[4],
  },
  contactSupport: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary[50],
    gap: SPACING[2],
  },
  contactSupportText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[500],
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;