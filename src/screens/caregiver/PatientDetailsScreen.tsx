import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import Button from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { caregiverAPI, PatientDetails } from '../../services/api/caregiverAPI';

type Props = CaregiverStackScreenProps<'PatientDetails'>;

const PatientDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'medications'>('info');
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);

  useEffect(() => {
    loadPatientDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPatientDetails = async () => {
    try {
      setIsLoading(true);
      const data = await caregiverAPI.getPatientDetails(patientId);
      setPatientData(data);
    } catch (error: any) {
      console.error('Error loading patient details:', error);
      Alert.alert('Error', error.message || 'Failed to load patient details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientDetails();
    setRefreshing(false);
  };

  const handleAddMedication = () => {
    navigation.navigate('AddMedication', { patientId });
  };

  const handleDeleteMedication = async (medicationId: string, medicationName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await caregiverAPI.deleteMedication(medicationId);
              Alert.alert('Success', 'Medication deleted successfully');
              await loadPatientDetails();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'critical': return '#EF4444';
      case 'inactive': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#059669';
    if (rate >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const formatTimingRelation = (relation: string) => {
    switch (relation) {
      case 'before_food': return 'Before Food';
      case 'after_food': return 'After Food';
      case 'with_food': return 'With Food';
      case 'empty_stomach': return 'Empty Stomach';
      case 'anytime': return 'Anytime';
      default: return relation;
    }
  };

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours < 1 ? 'Just now' : `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  const formatLastTaken = (lastTaken?: string) => {
    if (!lastTaken) return 'Never';
    return formatLastActivity(lastTaken);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SecondaryNavbar
          title="Patient Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContent}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading patient details...</Text>
        </View>
      </View>
    );
  }

  if (!patientData) {
    return (
      <View style={styles.container}>
        <SecondaryNavbar
          title="Patient Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Patient Not Found</Text>
          <Text style={styles.errorText}>Unable to load patient details</Text>
          <Button
            title="Try Again"
            onPress={loadPatientDetails}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  const { patient, medications } = patientData;

  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title={patient.name}
        onBackPress={() => navigation.goBack()}
        subtitle={`${patient.adherenceRate}% adherence`}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={['#059669']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Header */}
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.patientInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.patientDetails}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(patient.status) }]} />
                <Text style={styles.statusText}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </Text>
                <Text style={styles.lastActivity}>• {formatLastActivity(patient.lastActivity)}</Text>
              </View>
              
              <Text style={styles.patientMeta}>
                {patient.age} years • {patient.gender}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{medications.length}</Text>
              <Text style={styles.statLabel}>Medications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: getAdherenceColor(patient.adherenceRate) }]}>
                {patient.adherenceRate}%
              </Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {medications.filter(m => m.daysLeft < 7).length}
              </Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Ionicons 
              name="person-outline" 
              size={18} 
              color={activeTab === 'info' ? '#059669' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
              Information
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'medications' && styles.activeTab]}
            onPress={() => setActiveTab('medications')}
          >
            <Ionicons 
              name="medical-outline" 
              size={18} 
              color={activeTab === 'medications' ? '#059669' : '#64748B'} 
            />
            <Text style={[styles.tabText, activeTab === 'medications' && styles.activeTabText]}>
              Medications ({medications.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <View style={styles.tabContent}>
            {/* Patient Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Age & Gender</Text>
                  <Text style={styles.infoValue}>{patient.age} years, {patient.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{patient.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{patient.phoneNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Last Active</Text>
                  <Text style={styles.infoValue}>{formatLastActivity(patient.lastActivity)}</Text>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            {patient.emergencyContact && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{patient.emergencyContact.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="heart-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Relationship</Text>
                    <Text style={styles.infoValue}>{patient.emergencyContact.relationship}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{patient.emergencyContact.phoneNumber}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Medical Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <View style={styles.infoCard}>
                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoColumnTitle}>Medical History</Text>
                    {patient.medicalHistory.map((condition, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Ionicons name="medical-outline" size={16} color="#059669" />
                        <Text style={styles.conditionText}>{condition}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {patient.allergies && patient.allergies.length > 0 && (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoColumnTitle}>Allergies</Text>
                    {patient.allergies.map((allergy, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Ionicons name="warning-outline" size={16} color="#EF4444" />
                        <Text style={styles.conditionText}>{allergy}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {(!patient.medicalHistory || patient.medicalHistory.length === 0) && 
                 (!patient.allergies || patient.allergies.length === 0) && (
                  <Text style={styles.noDataText}>No medical history or allergies recorded</Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* Add Medication Button */}
            <View style={styles.addMedicationSection}>
              <Button
                title="Add New Medication"
                onPress={handleAddMedication}
                icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
                style={styles.addButton}
              />
            </View>

            {/* Medications List */}
            <View style={styles.medicationsSection}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              {medications.length === 0 ? (
                <View style={styles.emptyMedicationsContainer}>
                  <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyMedicationsTitle}>No Medications Yet</Text>
                  <Text style={styles.emptyMedicationsText}>
                    Add the first medication for this patient
                  </Text>
                </View>
              ) : (
                medications.map((medication) => (
                  <View key={medication.id} style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        <Text style={styles.medicationDetails}>
                          {medication.dosage} {medication.dosageUnit} • {medication.frequency}x daily • {formatTimingRelation(medication.timingRelation)}
                        </Text>
                        <Text style={styles.medicationStatus}>
                          Last taken: {formatLastTaken(medication.lastTaken)}
                        </Text>
                      </View>
                      
                      <View style={styles.adherenceIndicator}>
                        <Text style={[styles.adherenceText, { color: getAdherenceColor(medication.adherenceRate) }]}>
                          {medication.adherenceRate}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.medicationStats}>
                      <View style={styles.medicationStat}>
                        <Text style={styles.medicationStatLabel}>Remaining</Text>
                        <Text style={[
                          styles.medicationStatValue,
                          { color: medication.daysLeft < 7 ? '#EF4444' : '#1E293B' }
                        ]}>
                          {medication.remainingQuantity}/{medication.totalQuantity}
                        </Text>
                      </View>

                      <View style={styles.medicationStat}>
                        <Text style={styles.medicationStatLabel}>Days Left</Text>
                        <Text style={[
                          styles.medicationStatValue,
                          { color: medication.daysLeft < 7 ? '#EF4444' : '#1E293B' }
                        ]}>
                          {medication.daysLeft}
                        </Text>
                      </View>

                      <View style={styles.medicationStat}>
                        <Text style={styles.medicationStatLabel}>Status</Text>
                        <Text style={[
                          styles.medicationStatValue,
                          { color: medication.status === 'active' ? '#059669' : '#F59E0B' }
                        ]}>
                          {medication.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.medicationActions}>
                      <TouchableOpacity
                        style={styles.medicationAction}
                        onPress={() => navigation.navigate('BarcodeGenerator', { medicationId: medication.id })}
                      >
                        <Ionicons name="qr-code-outline" size={16} color="#059669" />
                        <Text style={styles.medicationActionText}>Barcode</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.medicationAction, styles.deleteAction]}
                        onPress={() => handleDeleteMedication(medication.id, medication.name)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text style={[styles.medicationActionText, { color: '#EF4444' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 100 : 56,
  },
  loadingText: {
    marginTop: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    marginTop: Platform.OS === 'ios' ? 100 : 56,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  retryButton: {
    minWidth: 120,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 100 : 56,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[12],
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientDetails: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING[2],
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
  },
  lastActivity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginLeft: SPACING[2],
  },
  patientMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING[2],
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[3],
    marginHorizontal: SPACING[1],
    borderRadius: RADIUS.md,
    gap: SPACING[2],
  },
  activeTab: {
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#059669',
  },
  tabContent: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  section: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginLeft: SPACING[3],
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#1E293B',
    maxWidth: '60%',
    textAlign: 'right',
  },
  infoColumn: {
    marginBottom: SPACING[4],
  },
  infoColumnTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    gap: SPACING[2],
  },
  conditionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1E293B',
  },
  noDataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: SPACING[4],
  },
  addMedicationSection: {
    marginBottom: SPACING[6],
  },
  addButton: {
    width: '100%',
  },
  medicationsSection: {
    marginBottom: SPACING[6],
  },
  emptyMedicationsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING[12],
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyMedicationsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyMedicationsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  medicationDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  medicationStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
  },
  adherenceIndicator: {
    alignItems: 'center',
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  medicationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: SPACING[3],
  },
  medicationStat: {
    alignItems: 'center',
  },
  medicationStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  medicationStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING[3],
  },
  medicationAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING[3],
    gap: SPACING[1],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicationActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
  },
  deleteAction: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
});

export default PatientDetailsScreen;