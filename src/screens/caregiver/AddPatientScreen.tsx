import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import Input from '../../components/common/Input/Input';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

type Props = CaregiverStackScreenProps<'AddPatient'>;

const AddPatientScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Mock patient data for search
  const [suggestedPatients] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phoneNumber: '+1-555-0101',
      lastSeen: '2 days ago',
    },
    {
      id: '2',
      name: 'Mary Johnson', 
      email: 'mary.johnson@email.com',
      phoneNumber: '+1-555-0102',
      lastSeen: '1 week ago',
    },
    {
      id: '3',
      name: 'Robert Davis',
      email: 'robert.davis@email.com', 
      phoneNumber: '+1-555-0103',
      lastSeen: '3 days ago',
    },
  ]);

  const filteredPatients = suggestedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExistingPatient = (patientId: string) => {
    // Add existing patient to caregiver's list
    navigation.goBack();
  };

  const handleRegisterNewPatient = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmRedirect = () => {
    setShowConfirmationModal(false);
    // Navigate to role selection screen for new patient registration
    navigation.navigate('RoleSelection');
  };

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
              You will be redirected to the registration page where you can sign up a new patient account.
            </Text>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Make sure the patient is near you
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Choose &quot;Patient&quot; role during registration
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Complete the sign-up process together
              </Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmRedirect}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
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
        subtitle="Search existing or register new"
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
              <Ionicons name="people-outline" size={32} color="#059669" />
            </View>
            <Text style={styles.headerTitle}>Add Patient to Your Care</Text>
            <Text style={styles.headerSubtitle}>
              Search for existing patients or help register a new patient account
            </Text>
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Existing Patients</Text>
          
          <View style={styles.searchContainer}>
            <Image
              source={require('../../../assets/images/search.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              containerStyle={styles.searchInputContainer}
            />
          </View>

          {searchQuery.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={styles.resultsTitle}>
                {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''} found
              </Text>
              
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.patientResultCard}
                    onPress={() => handleAddExistingPatient(patient.id)}
                  >
                    <View style={styles.patientAvatar}>
                      <Text style={styles.patientInitials}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientEmail}>{patient.email}</Text>
                      <Text style={styles.patientLastSeen}>Last seen: {patient.lastSeen}</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.addPatientButton}
                      onPress={() => handleAddExistingPatient(patient.id)}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.noResultsTitle}>No patients found</Text>
                  <Text style={styles.noResultsText}>
                    Try adjusting your search or register a new patient
                  </Text>
                </View>
              )}
            </View>
          )}

          {searchQuery.length === 0 && (
            <View style={styles.searchPlaceholder}>
              <View style={styles.placeholderIcon}>
                <Image
                  source={require('../../../assets/images/search.png')}
                  style={styles.placeholderSearchIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.placeholderTitle}>Search for Patients</Text>
              <Text style={styles.placeholderText}>
                Start typing to search for existing patients by name or email
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
          <Text style={styles.sectionTitle}>Register New Patient</Text>
          
          <View style={styles.registerCard}>
            <View style={styles.registerIcon}>
              <Ionicons name="person-add-outline" size={32} color="#059669" />
            </View>
            
            <View style={styles.registerContent}>
              <Text style={styles.registerTitle}>Help Patient Sign Up</Text>
              <Text style={styles.registerDescription}>
                Guide your patient through the registration process to create their own MediTracker account
              </Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.benefitText}>Patient gets their own secure account</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.benefitText}>Direct medication reminders</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.benefitText}>Better care coordination</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterNewPatient}
          >
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.registerButtonText}>Register New Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    paddingVertical: SPACING[6],
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: SPACING[3],
  },
  searchInputContainer: {
    marginBottom: 0,
    flex: 1,
  },
  searchInput: {
    borderWidth: 0,
    backgroundColor: 'transparent',
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
  patientLastSeen: {
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
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
  },
  noResultsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[3],
    marginBottom: SPACING[2],
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
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
  placeholderSearchIcon: {
    width: 32,
    height: 32,
    tintColor: '#94A3B8',
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
    marginBottom: SPACING[3],
  },
  benefitsList: {
    gap: SPACING[2],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    flex: 1,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    gap: SPACING[2],
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddPatientScreen;