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
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { MedicationFormData, DosageUnit, TimingRelation } from '../../types/medication.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { MEDICATION_CONSTANTS } from '../../constants/app';

type Props = CaregiverStackScreenProps<'AddMedication'>;

// Validation schema
const medicationSchema: yup.ObjectSchema<MedicationFormData> = yup.object({
  name: yup
    .string()
    .required('Medication name is required')
    .min(2, 'Name must be at least 2 characters'),
  dosage: yup
    .string()
    .required('Dosage is required')
    .matches(/^\d+(\.\d+)?$/, 'Please enter a valid dosage (e.g., 500, 2.5)'),
  dosageUnit: yup
    .mixed<DosageUnit>()
    .oneOf(['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'puffs', 'units'])
    .required('Dosage unit is required'),
  frequency: yup
    .number()
    .required('Frequency is required')
    .min(1, 'Frequency must be at least 1')
    .max(6, 'Frequency cannot exceed 6 times daily'),
  timingRelation: yup
    .mixed<TimingRelation>()
    .oneOf(['before_food', 'after_food', 'with_food', 'empty_stomach', 'anytime'])
    .required('Timing relation is required'),
  expiryDate: yup
    .string()
    .required('Expiry date is required'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1'),
  instructions: yup.string().optional(),
});

const AddMedicationScreen: React.FC<Props> = ({ navigation, route }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<MedicationFormData>({
    resolver: yupResolver(medicationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      dosage: '',
      dosageUnit: 'mg',
      frequency: 1,
      timingRelation: 'anytime',
      expiryDate: '',
      quantity: 30,
      instructions: '',
    },
  });

  const watchedDosage = watch('dosage');
  const watchedDosageUnit = watch('dosageUnit');
  const watchedFrequency = watch('frequency');

  const onSubmit = async (data: MedicationFormData) => {
    try {
      setIsLoading(true);
      
      // TODO: Implement API call to add medication
      // const result = await caregiverAPI.addMedication(patientId, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Medication has been added successfully! A barcode has been generated for this medication.',
        [
          {
            text: 'View Barcode',
            onPress: () => {
              reset();
              // Navigate to barcode generator with the new medication ID
              // In real implementation, you'd get the medication ID from the API response
              navigation.navigate('BarcodeGenerator', { medicationId: 'new-med-id' });
            },
          },
          {
            text: 'Add Another',
            onPress: () => {
              reset();
            },
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setValue('expiryDate', date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDosesPerDay = () => {
    return watchedFrequency || 1;
  };

  const calculateDaysSupply = () => {
    const quantity = watch('quantity');
    const frequency = watchedFrequency || 1;
    if (!quantity || !frequency) return 0;
    return Math.floor(quantity / frequency);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Adding medication..." />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Add Medication</Text>
        
        <View style={styles.headerPlaceholder} />
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
          {/* Form Header */}
          <View style={styles.formHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={60} color={COLORS.primary[500]} />
            </View>
            <Text style={styles.formTitle}>Medication Details</Text>
            <Text style={styles.formSubtitle}>
              Fill in the information below to add a new medication
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
                  label="Medication Name"
                  placeholder="Enter medication name (e.g., Aspirin)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  leftIcon="medical-outline"
                  autoCapitalize="words"
                  required
                />
              )}
            />

            {/* Dosage Row */}
            <View style={styles.rowContainer}>
              <View style={styles.dosageContainer}>
                <Controller
                  control={control}
                  name="dosage"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Dosage Amount"
                      placeholder="500"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.dosage?.message}
                      keyboardType="decimal-pad"
                      required
                    />
                  )}
                />
              </View>

              <View style={styles.unitContainer}>
                <Text style={styles.inputLabel}>
                  Unit <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="dosageUnit"
                  render={({ field: { onChange, value } }) => (
                    <View style={[
                      styles.pickerContainer,
                      errors.dosageUnit && styles.pickerError
                    ]}>
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                      >
                        {MEDICATION_CONSTANTS.DOSAGE_UNITS.map((unit) => (
                          <Picker.Item key={unit} label={unit} value={unit} />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                {errors.dosageUnit && (
                  <Text style={styles.errorText}>{errors.dosageUnit.message}</Text>
                )}
              </View>
            </View>

            {/* Dosage Preview */}
            {watchedDosage && watchedDosageUnit && (
              <View style={styles.dosagePreview}>
                <Text style={styles.dosagePreviewText}>
                  Dosage: {watchedDosage} {watchedDosageUnit}
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Schedule Information</Text>
            
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>
                  Daily Frequency <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field: { onChange, value } }) => (
                    <View style={[
                      styles.pickerContainer,
                      errors.frequency && styles.pickerError
                    ]}>
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                      >
                        {MEDICATION_CONSTANTS.FREQUENCIES.map((freq) => (
                          <Picker.Item 
                            key={freq.value} 
                            label={freq.label} 
                            value={freq.value} 
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                {errors.frequency && (
                  <Text style={styles.errorText}>{errors.frequency.message}</Text>
                )}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>
                  Timing <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="timingRelation"
                  render={({ field: { onChange, value } }) => (
                    <View style={[
                      styles.pickerContainer,
                      errors.timingRelation && styles.pickerError
                    ]}>
                      <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                      >
                        {MEDICATION_CONSTANTS.TIMING_RELATIONS.map((timing) => (
                          <Picker.Item 
                            key={timing.value} 
                            label={timing.label} 
                            value={timing.value} 
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />
                {errors.timingRelation && (
                  <Text style={styles.errorText}>{errors.timingRelation.message}</Text>
                )}
              </View>
            </View>

            {/* Schedule Preview */}
            <View style={styles.schedulePreview}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary[500]} />
              <Text style={styles.schedulePreviewText}>
                Take {calculateDosesPerDay()} time{calculateDosesPerDay() > 1 ? 's' : ''} daily
              </Text>
            </View>
          </View>

          {/* Quantity & Expiry */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quantity & Expiry</Text>
            
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Total Quantity"
                      placeholder="30"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(text ? parseInt(text) : undefined)}
                      onBlur={onBlur}
                      error={errors.quantity?.message}
                      leftIcon="grid-outline"
                      keyboardType="numeric"
                      required
                    />
                  )}
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>
                  Expiry Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    errors.expiryDate && styles.dateButtonError
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.gray[500]} />
                  <Text style={[
                    styles.dateButtonText,
                    !watch('expiryDate') && styles.dateButtonPlaceholder
                  ]}>
                    {watch('expiryDate') ? formatDate(watch('expiryDate')) : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {errors.expiryDate && (
                  <Text style={styles.errorText}>{errors.expiryDate.message}</Text>
                )}
              </View>
            </View>

            {/* Supply Information */}
            {watch('quantity') && watchedFrequency && (
              <View style={styles.supplyInfo}>
                <View style={styles.supplyItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.secondary[500]} />
                  <Text style={styles.supplyText}>
                    Supply Duration: {calculateDaysSupply()} days
                  </Text>
                </View>
                
                {watch('expiryDate') && (
                  <View style={styles.supplyItem}>
                    <Ionicons 
                      name="warning-outline" 
                      size={16} 
                      color={getDaysUntilExpiry(watch('expiryDate'))! < 30 ? COLORS.error : COLORS.success} 
                    />
                    <Text style={[
                      styles.supplyText,
                      { color: getDaysUntilExpiry(watch('expiryDate'))! < 30 ? COLORS.error : COLORS.success }
                    ]}>
                      Expires in {getDaysUntilExpiry(watch('expiryDate'))} days
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Additional Instructions (Optional)</Text>
            
            <Controller
              control={control}
              name="instructions"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Special Instructions"
                  placeholder="Enter any special instructions or notes"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.instructions?.message}
                  leftIcon="document-text-outline"
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              )}
            />
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Medication Summary</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Medication:</Text>
              <Text style={styles.summaryValue}>
                {watch('name') || 'Not specified'} 
                {watch('dosage') && watch('dosageUnit') && ` (${watch('dosage')} ${watch('dosageUnit')})`}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Schedule:</Text>
              <Text style={styles.summaryValue}>
                {watchedFrequency || 1} time{(watchedFrequency || 1) > 1 ? 's' : ''} daily
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Supply:</Text>
              <Text style={styles.summaryValue}>
                {watch('quantity') || 0} units ({calculateDaysSupply()} days)
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title="Add Medication"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
            icon={<Ionicons name="add-circle" size={20} color={COLORS.background} />}
          />

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
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
  },
  headerPlaceholder: {
    width: 40,
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
  formHeader: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
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
  dosageContainer: {
    flex: 2,
  },
  unitContainer: {
    flex: 1,
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
  dosagePreview: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    alignItems: 'center',
  },
  dosagePreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.primary[600],
  },
  schedulePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    gap: SPACING[2],
  },
  schedulePreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.secondary[600],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[3],
    minHeight: 48,
    backgroundColor: COLORS.background,
    gap: SPACING[2],
  },
  dateButtonError: {
    borderColor: COLORS.error,
  },
  dateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  dateButtonPlaceholder: {
    color: COLORS.gray[400],
  },
  supplyInfo: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING[4],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    gap: SPACING[2],
  },
  supplyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  supplyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[6],
    borderWidth: 2,
    borderColor: COLORS.primary[100],
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  submitButton: {
    marginBottom: SPACING[6],
  },
});

export default AddMedicationScreen;