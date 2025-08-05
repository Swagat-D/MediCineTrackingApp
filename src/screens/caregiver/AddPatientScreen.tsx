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
import { Picker } from '@react-native-picker/picker';

// Components
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { PatientFormData } from '../../types/patient.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { Gender } from '@/types/auth.types';
type Props = CaregiverStackScreenProps<'AddPatient'>;

// Validation schema
const addPatientSchema: yup.ObjectSchema<PatientFormData> = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`)
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
  age: yup
    .number()
    .required('Age is required')
    .min(VALIDATION_RULES.AGE_MIN, `Age must be at least ${VALIDATION_RULES.AGE_MIN}`)
    .max(VALIDATION_RULES.AGE_MAX, `Age must be less than ${VALIDATION_RULES.AGE_MAX}`),
  gender: yup
    .mixed<Gender>()
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'])
    .required('Please select gender'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(VALIDATION_RULES.PHONE, 'Please enter a valid phone number'),
  emergencyContacts: yup.array().of(
    yup.object({
      id: yup.string().required('Contact ID is required'),
      name: yup.string().required('Contact name is required'),
      relationship: yup.string().required('Relationship is required'),
      phoneNumber: yup.string().required('Contact phone number is required'),
      isPrimary: yup.boolean().default(false),
    })
  ).optional(),
  medicalHistory: yup.array().of(yup.string().required()).optional(),
  allergies: yup.array().of(yup.string().required()).optional(),
});

const genderOptions: { label: string; value: Gender | '' }[] = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const AddPatientScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'search' | 'register'>('search');
  const [searchEmail, setSearchEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<PatientFormData>({
    resolver: yupResolver(addPatientSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      age: undefined,
      gender: '' as Gender,
      phoneNumber: '',
      emergencyContacts: [],
      medicalHistory: [],
      allergies: [],
    },
  });

  const handleSearchPatient = async () => {
    if (!searchEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address to search');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement API call to search for existing patient
      // const patient = await caregiverAPI.searchPatient(searchEmail);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate patient found/not found
      const patientExists = Math.random() > 0.5;
      
      if (patientExists) {
        Alert.alert(
          'Patient Found',
          'We found an existing patient with this email. Would you like to add them to your patient list?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Patient',
              onPress: () => {
                Alert.alert('Success', 'Patient has been added to your list');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Patient Not Found',
          'No existing patient found with this email. Would you like to register a new patient?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register New Patient',
              onPress: () => {
                setSearchMode('register');
                setValue('email', searchEmail);
              },
            },
          ]
        );
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error(error)
      setIsLoading(false);
      Alert.alert('Error', 'Failed to search for patient. Please try again.');
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);
      
      // TODO: Implement API call to register new patient
      // const result = await caregiverAPI.addPatient(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Patient has been registered and added to your list successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              navigation.goBack();
            },
          },
        ]
      );
      
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to register patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSearchMode('search');
    setSearchEmail('');
    reset();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message={searchMode === 'search' ? 'Searching for patient...' : 'Registering patient...'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {searchMode === 'search' ? 'Add Patient' : 'Register New Patient'}
        </Text>
        
        {searchMode === 'register' && (
          <TouchableOpacity style={styles.switchButton} onPress={handleBackToSearch}>
            <Text style={styles.switchButtonText}>Back to Search</Text>
          </TouchableOpacity>
        )}
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
          {searchMode === 'search' ? (
            /* Search Mode */
            <View style={styles.searchContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="search" size={60} color={COLORS.primary[500]} />
              </View>
              
              <Text style={styles.searchTitle}>Find Existing Patient</Text>
              <Text style={styles.searchSubtitle}>
                Search for an existing patient by their email address to add them to your patient list
              </Text>

              <View style={styles.searchFormContainer}>
                <Input
                  label="Patient Email Address"
                  placeholder="Enter patient's email"
                  value={searchEmail}
                  onChangeText={setSearchEmail}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                />

                <Button
                  title="Search Patient"
                  onPress={handleSearchPatient}
                  disabled={!searchEmail.trim() || isLoading}
                  loading={isLoading}
                  fullWidth
                  style={styles.searchButton}
                />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Register New Patient"
                onPress={() => setSearchMode('register')}
                variant="outline"
                fullWidth
                icon={<Ionicons name="person-add" size={20} color={COLORS.primary[500]} />}
              />
            </View>
          ) : (
            /* Registration Mode */
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-add" size={60} color={COLORS.secondary[500]} />
                </View>
                
                <Text style={styles.formTitle}>Patient Registration</Text>
                <Text style={styles.formSubtitle}>
                  Fill in the patient&apos;s details to create their account
                </Text>
              </View>

              {/* Basic Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Full Name"
                      placeholder="Enter patient's full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                      leftIcon="person-outline"
                      autoCapitalize="words"
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email Address"
                      placeholder="Enter patient's email"
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

                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Phone Number"
                      placeholder="Enter patient's phone number"
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
              </View>

              {/* Medical Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Medical Information (Optional)</Text>
                
                <Input
                  label="Medical History"
                  placeholder="Enter any relevant medical conditions"
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                  leftIcon="medical-outline"
                />

                <Input
                  label="Known Allergies"
                  placeholder="Enter any known allergies"
                  multiline
                  numberOfLines={2}
                  style={styles.textArea}
                  leftIcon="warning-outline"
                />
              </View>

              {/* Emergency Contact */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>
                
                <Input
                  label="Contact Name"
                  placeholder="Emergency contact name"
                  leftIcon="person-outline"
                />

                <Input
                  label="Relationship"
                  placeholder="Relationship to patient"
                  leftIcon="heart-outline"
                />

                <Input
                  label="Contact Phone"
                  placeholder="Emergency contact phone"
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Terms and Consent */}
              <View style={styles.consentContainer}>
                <View style={styles.consentItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.consentText}>
                    Patient has consented to medication management
                  </Text>
                </View>
                
                <View style={styles.consentItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.consentText}>
                    HIPAA privacy notice has been provided
                  </Text>
                </View>
                
                <View style={styles.consentItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.consentText}>
                    Emergency contact permissions obtained
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                title="Register Patient"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                fullWidth
                style={styles.submitButton}
                icon={<Ionicons name="person-add" size={20} color={COLORS.background} />}
              />
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING[2],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING[4],
  },
  switchButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary[50],
  },
  switchButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.primary[500],
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
    paddingVertical: SPACING[6],
  },
  searchContainer: {
    flex: 1,
    alignItems: 'center',
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
  searchTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[8],
    maxWidth: '90%',
  },
  searchFormContainer: {
    width: '100%',
    marginBottom: SPACING[8],
  },
  searchButton: {
    marginTop: SPACING[4],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING[6],
    width: '100%',
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
  formContainer: {
    flex: 1,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: SPACING[8],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[100],
    paddingBottom: SPACING[2],
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
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  consentContainer: {
    backgroundColor: COLORS.success + '10',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[8],
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  consentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  submitButton: {
    marginBottom: SPACING[6],
  },
});

export default AddPatientScreen;