import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { caregiverAPI } from '../../services/api/caregiverAPI';

type Props = CaregiverStackScreenProps<'AddPatient'>;

interface SearchResult {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: string;
  lastSeen: string;
}

const AddPatientScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SearchResult | null>(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Error', 'Please enter an email or phone number');
      return;
    }

    const cleanQuery = searchQuery.trim();
    
    if (!isValidEmail(cleanQuery) && !isValidPhone(cleanQuery)) {
      Alert.alert(
        'Invalid Input', 
        'Please enter a valid email address or phone number'
      );
      return;
    }

    setIsSearching(true);
    try {
      const results = await caregiverAPI.searchExistingPatients(cleanQuery);
      // Map results to ensure all SearchResult properties exist
      const mappedResults: SearchResult[] = results.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        lastSeen: patient.lastSeen,
        age: patient.age ?? 0,
        gender: patient.gender ?? 'Not specified',
      }));
      setSearchResults(mappedResults);
      
      if (results.length === 0) {
        Alert.alert(
          'No Results', 
          'No patient found with this email or phone number'
        );
      }
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Failed to search patients');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExistingPatient = async (patient: SearchResult) => {
    try {
      setSelectedPatient(patient);
      const response = await caregiverAPI.sendPatientOTP(patient.id);
      setPatientEmail(response.patientEmail);
      setOtpModalVisible(true);
      Alert.alert(
        'OTP Sent', 
        `Verification code sent to ${response.patientEmail}. Please ask the patient to share the code with you.`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    if (!selectedPatient) return;

    setIsVerifying(true);
    try {
      await caregiverAPI.verifyPatientOTP(selectedPatient.id, otp);
      setOtpModalVisible(false);
      setOtp('');
      setSelectedPatient(null);
      setSearchQuery('');
      setSearchResults([]);
      Alert.alert('Success', 'Patient added successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegisterNewPatient = () => {
    setShowConfirmationModal(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderOTPModal = () => (
    <Modal
      visible={otpModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOtpModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.otpModalContainer}>
          <View style={styles.otpModalHeader}>
            <Ionicons name="shield-checkmark" size={32} color="#059669" />
            <Text style={styles.otpModalTitle}>Verify Patient</Text>
            <Text style={styles.otpModalSubtitle}>
              OTP sent to {patientEmail}
            </Text>
          </View>

          <Text style={styles.otpModalText}>
            Please ask {selectedPatient?.name} to share the 6-digit verification code sent to their email.
          </Text>
          
          <TextInput
            style={styles.otpInput}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
            placeholderTextColor="#9CA3AF"
          />
          
          <View style={styles.otpModalActions}>
            <TouchableOpacity
              style={styles.otpCancelButton}
              onPress={() => {
                setOtpModalVisible(false);
                setOtp('');
                setSelectedPatient(null);
              }}
            >
              <Text style={styles.otpCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.otpVerifyButton, isVerifying && styles.disabledButton]}
              onPress={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <LoadingSpinner size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.otpVerifyText}>Verify & Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConfirmationModal = () => (
    <Modal
      visible={showConfirmationModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowConfirmationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Ionicons name="person-add" size={32} color="#059669" />
            </View>
            <Text style={styles.modalTitle}>Register New Patient</Text>
            <Text style={styles.modalSubtitle}>
              New patients need to create their own MediTracker account first
            </Text>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Patient downloads MediTracker app
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Patient creates account with &quot;Patient&quot; role
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                You can then search and add them using their email/phone
              </Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title="Add Patient"
        onBackPress={() => navigation.goBack()}
        subtitle="Search by email or phone number"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="person-add-outline" size={32} color="#059669" />
            </View>
            <Text style={styles.headerTitle}>Add Patient to Your Care</Text>
            <Text style={styles.headerSubtitle}>
              Search for existing patients using their email or phone number
            </Text>
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Existing Patients</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter email address or phone number..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
            
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.searchButton, isSearching && styles.disabledButton]}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <LoadingSpinner size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={styles.resultsTitle}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              
              {searchResults.map(patient => (
                <View key={patient.id} style={styles.patientResultCard}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.patientInitials}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientEmail}>{patient.email}</Text>
                    <Text style={styles.patientDetails}>
                      {patient.phoneNumber} • {patient.gender}, {patient.age}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.addPatientButton}
                    onPress={() => handleAddExistingPatient(patient)}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {searchQuery.length === 0 && (
            <View style={styles.searchPlaceholder}>
              <View style={styles.placeholderIcon}>
                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.placeholderTitle}>Search for Patients</Text>
              <Text style={styles.placeholderText}>
                Enter an email address or phone number to find existing patients
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register New Patient Section */}
        <View style={styles.registerSection}>
          <Text style={styles.sectionTitle}>New Patient?</Text>
          
          <View style={styles.registerCard}>
            <View style={styles.registerIcon}>
              <Ionicons name="person-add-outline" size={32} color="#059669" />
            </View>
            
            <View style={styles.registerContent}>
              <Text style={styles.registerTitle}>Patient Registration</Text>
              <Text style={styles.registerDescription}>
                New patients need to create their own MediTracker account first. 
                Once they register, you can search and add them.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterNewPatient}
          >
            <Ionicons name="information-circle-outline" size={20} color="#059669" />
            <Text style={styles.registerButtonText}>How to Register New Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderOTPModal()}
      {renderConfirmationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[8],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingLeft: SPACING[4],
    paddingRight: SPACING[2],
    paddingVertical: SPACING[2],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
    paddingVertical: SPACING[2],
  },
  clearButton: {
    padding: SPACING[2],
  },
  searchButton: {
    backgroundColor: '#059669',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.md,
    marginLeft: SPACING[2],
  },
  disabledButton: {
    opacity: 0.6,
  },
  searchResults: {
    marginTop: SPACING[4],
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[3],
    fontWeight: '500',
  },
  patientResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  patientInitials: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
  },
  addPatientButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  placeholderTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
    marginHorizontal: SPACING[4],
  },
  registerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  registerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  registerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  registerContent: {
    flex: 1,
  },
  registerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  registerDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  registerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  otpModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  otpModalHeader: {
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  otpModalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: SPACING[2],
    marginBottom: SPACING[1],
  },
  otpModalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  otpModalText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[6],
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    marginBottom: SPACING[6],
    letterSpacing: 4,
    fontWeight: '600',
  },
  otpModalActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  otpCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    alignItems: 'center',
  },
  otpCancelText: {
    color: '#64748B',
    fontWeight: '500',
  },
  otpVerifyButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    alignItems: 'center',
  },
  otpVerifyText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContent: {
    marginBottom: SPACING[6],
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[3],
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  cancelButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddPatientScreen;