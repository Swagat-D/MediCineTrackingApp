import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

// Components
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { MedicationFormData } from '../../types/medication.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { MEDICATION_CONSTANTS } from '../../constants/app';
import { caregiverAPI } from '../../services/api/caregiverAPI';
import PrintableBarcode from '@/components/common/PrintableBarcode';

type Props = CaregiverStackScreenProps<'AddMedication'>;

// Validation schema
const medicationSchema: yup.ObjectSchema<MedicationFormData> = yup.object({
  name: yup
    .string()
    .required('Medication name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  dosage: yup
    .string()
    .required('Dosage is required')
    .matches(/^\d+(\.\d+)?$/, 'Please enter a valid dosage (e.g., 500, 2.5)'),
  dosageUnit: yup
    .mixed<'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'puffs' | 'units'>()
    .oneOf(['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'puffs', 'units'])
    .required('Dosage unit is required'),
  frequency: yup
    .number()
    .required('Frequency is required')
    .min(1, 'Frequency must be at least 1')
    .max(6, 'Frequency cannot exceed 6 times daily'),
  timingRelation: yup
    .mixed<'before_food' | 'after_food' | 'with_food' | 'empty_stomach' | 'anytime'>()
    .oneOf(['before_food', 'after_food', 'with_food', 'empty_stomach', 'anytime'])
    .required('Timing relation is required'),
  expiryDate: yup
    .string()
    .required('Expiry date is required')
    .test('future-date', 'Expiry date must be in the future', function(value) {
      return value ? new Date(value) > new Date() : false;
    }),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000'),
  instructions: yup.string().optional().max(500, 'Instructions cannot exceed 500 characters'),
});

const AddMedicationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [patientName, setPatientName] = useState('');

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
  const watchedQuantity = watch('quantity');

  const onSubmit = async (data: MedicationFormData) => {
  try {
    setIsLoading(true);
    
    const result = await caregiverAPI.addMedication(patientId, data);
    
    // Get patient name for barcode
    const patientDetails = await caregiverAPI.getPatientDetails(patientId);
    
    setBarcodeData(result.barcodeData);
    setPatientName(patientDetails.patient.name);
    
    Alert.alert(
      'Success',
      'Medication has been added successfully! A barcode has been generated.',
      [
        {
          text: 'Print Barcode',
          onPress: () => {
            setShowBarcodeModal(true);
          },
        },
        {
          text: 'Add Another',
          onPress: () => {
            reset();
            setSelectedDate(new Date());
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
    
  } catch (error: any) {
    console.error('Error adding medication:', error);
    Alert.alert('Error', error.message || 'Failed to add medication. Please try again.');
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
    const quantity = watchedQuantity;
    const frequency = watchedFrequency || 1;
    if (!quantity || !frequency) return 0;
    return Math.floor(quantity / frequency);
  };

  const getExpiryWarningColor = (days: number | null) => {
    if (!days) return '#64748B';
    if (days < 30) return '#EF4444';
    if (days < 90) return '#F59E0B';
    return '#059669';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SecondaryNavbar
          title="Add Medication"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Adding medication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title="Add Medication"
        onBackPress={() => navigation.goBack()}
        subtitle="Fill in the medication details"
      />

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
              <Ionicons name="medical" size={40} color="#059669" />
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
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
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
              <Ionicons name="time-outline" size={16} color="#059669" />
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
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
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
            {watchedQuantity && watchedFrequency && (
              <View style={styles.supplyInfo}>
                <View style={styles.supplyItem}>
                  <Ionicons name="calendar-outline" size={16} color="#059669" />
                  <Text style={styles.supplyText}>
                    Supply Duration: {calculateDaysSupply()} days
                  </Text>
                </View>
                
                {watch('expiryDate') && (
                  <View style={styles.supplyItem}>
                    <Ionicons 
                      name="warning-outline" 
                      size={16} 
                      color={getExpiryWarningColor(getDaysUntilExpiry(watch('expiryDate')))} 
                    />
                    <Text style={[
                      styles.supplyText,
                      { color: getExpiryWarningColor(getDaysUntilExpiry(watch('expiryDate'))) }
                    ]}>
                      Expires in {getDaysUntilExpiry(watch('expiryDate'))} days
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Instructions - Optional */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Additional Instructions</Text>
            <Text style={styles.optionalLabel}>(Optional)</Text>
            
            <Controller
              control={control}
              name="instructions"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Special Instructions"
                  placeholder="Enter any special instructions or notes (optional)"
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
                {watchedDosage && watchedDosageUnit && ` (${watchedDosage} ${watchedDosageUnit})`}
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
                {watchedQuantity || 0} units ({calculateDaysSupply()} days)
              </Text>
            </View>
            
            {watch('expiryDate') && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expires:</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: getExpiryWarningColor(getDaysUntilExpiry(watch('expiryDate'))) }
                ]}>
                  {formatDate(watch('expiryDate'))}
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title="Add Medication"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
            icon={<Ionicons name="add-circle" size={20} color="#FFFFFF" />}
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
      <PrintableBarcode
        visible={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        patientName={patientName}
        barcodeData={barcodeData}
        medicationName={watch('name') || 'Medication'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  loadingText: {
    marginTop: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
  },
  formHeader: {
    alignItems: 'center',
    paddingBottom: SPACING[6],
    paddingTop: SPACING[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: SPACING[8],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  optionalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[4],
    fontStyle: 'italic',
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
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  required: {
    color: '#EF4444',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  picker: {
    height: 48,
    color: '#1E293B',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#EF4444',
    marginTop: SPACING[1],
    marginLeft: SPACING[1],
  },
  dosagePreview: {
    backgroundColor: '#F0FDF4',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: SPACING[2],
  },
  dosagePreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#059669',
  },
  schedulePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  schedulePreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#059669',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[3],
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    gap: SPACING[2],
  },
  dateButtonError: {
    borderColor: '#EF4444',
  },
  dateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
  },
  dateButtonPlaceholder: {
    color: '#9CA3AF',
  },
  supplyInfo: {
    backgroundColor: '#F8FAFC',
    padding: SPACING[4],
    borderRadius: RADIUS.md,
    marginTop: SPACING[3],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supplyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  supplyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#1E293B',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[6],
    borderWidth: 2,
    borderColor: '#BBF7D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1E293B',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  submitButton: {
    marginBottom: SPACING[6],
  },
});

export default AddMedicationScreen;