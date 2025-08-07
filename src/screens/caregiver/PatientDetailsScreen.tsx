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

type Props = CaregiverStackScreenProps<'PatientDetails'>;

interface PatientDetails {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'critical';
  adherenceRate: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
}

interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  timingRelation: string;
  remainingQuantity: number;
  totalQuantity: number;
  status: 'active' | 'paused' | 'completed';
  adherenceRate: number;
  lastTaken?: string;
  daysLeft: number;
}

const PatientDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'medications'>('info');
  
  const [patientDetails] = useState<PatientDetails>({
    id: patientId,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phoneNumber: '+1-555-0101',
    age: 65,
    gender: 'Male',
    lastActivity: '2 hours ago',
    status: 'active',
    adherenceRate: 92,
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0102',
    },
    medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'High Cholesterol'],
    allergies: ['Penicillin', 'Shellfish'],
  });

  const [medications] = useState<PatientMedication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 2,
      timingRelation: 'after_food',
      remainingQuantity: 15,
      totalQuantity: 60,
      status: 'active',
      adherenceRate: 95,
      lastTaken: '8 hours ago',
      daysLeft: 7,
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 1,
      timingRelation: 'anytime',
      remainingQuantity: 25,
      totalQuantity: 30,
      status: 'active',
      adherenceRate: 88,
      lastTaken: '12 hours ago',
      daysLeft: 25,
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 1,
      timingRelation: 'before_food',
      remainingQuantity: 8,
      totalQuantity: 30,
      status: 'active',
      adherenceRate: 92,
      lastTaken: '1 day ago',
      daysLeft: 8,
    },
  ]);

  useEffect(() => {
    loadPatientDetails();
  }, []);

  const loadPatientDetails = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading patient details:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load patient details. Please try again.');
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

  const getStatusColor = (status: PatientDetails['status']) => {
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

  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title={patientDetails.name}
        onBackPress={() => navigation.goBack()}
        subtitle={`${patientDetails.adherenceRate}% adherence`}
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
                {patientDetails.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.patientDetails}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(patientDetails.status) }]} />
                <Text style={styles.statusText}>
                  {patientDetails.status.charAt(0).toUpperCase() + patientDetails.status.slice(1)}
                </Text>
                <Text style={styles.lastActivity}>• {patientDetails.lastActivity}</Text>
              </View>
              
              <Text style={styles.patientMeta}>
                {patientDetails.age} years • {patientDetails.gender}
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
              <Text style={[styles.statNumber, { color: getAdherenceColor(patientDetails.adherenceRate) }]}>
                {patientDetails.adherenceRate}%
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
                  <Text style={styles.infoValue}>{patientDetails.age} years, {patientDetails.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{patientDetails.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{patientDetails.phoneNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#64748B" />
                  <Text style={styles.infoLabel}>Last Active</Text>
                  <Text style={styles.infoValue}>{patientDetails.lastActivity}</Text>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            {patientDetails.emergencyContact && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="heart-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Relationship</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.relationship}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#64748B" />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.phoneNumber}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Medical Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <View style={styles.infoCard}>
                {patientDetails.medicalHistory && patientDetails.medicalHistory.length > 0 && (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoColumnTitle}>Medical History</Text>
                    {patientDetails.medicalHistory.map((condition, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Ionicons name="medical-outline" size={16} color="#059669" />
                        <Text style={styles.conditionText}>{condition}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {patientDetails.allergies && patientDetails.allergies.length > 0 && (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoColumnTitle}>Allergies</Text>
                    {patientDetails.allergies.map((allergy, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Ionicons name="warning-outline" size={16} color="#EF4444" />
                        <Text style={styles.conditionText}>{allergy}</Text>
                      </View>
                    ))}
                  </View>
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
              {medications.map((medication) => (
                <View key={medication.id} style={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{medication.name}</Text>
                      <Text style={styles.medicationDetails}>
                        {medication.dosage} • {medication.frequency}x daily • {formatTimingRelation(medication.timingRelation)}
                      </Text>
                      <Text style={styles.medicationStatus}>
                        Last taken: {medication.lastTaken || 'Never'}
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
                      <Text style={styles.medicationStatLabel}>Adherence</Text>
                      <Text style={[
                        styles.medicationStatValue,
                        { color: getAdherenceColor(medication.adherenceRate) }
                      ]}>
                        {medication.adherenceRate}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.medicationActions}>
                    <TouchableOpacity
                      style={styles.medicationAction}
                      onPress={() => {
                        Alert.alert('Edit Medication', `Edit ${medication.name} settings`);
                      }}
                    >
                      <Ionicons name="create-outline" size={16} color="#059669" />
                      <Text style={styles.medicationActionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.medicationAction}
                      onPress={() => navigation.navigate('BarcodeGenerator', { medicationId: medication.id })}
                    >
                      <Ionicons name="qr-code-outline" size={16} color="#059669" />
                      <Text style={styles.medicationActionText}>Barcode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.medicationAction, styles.deleteAction]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Medication',
                          `Are you sure you want to delete ${medication.name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive' },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
  addMedicationSection: {
    marginBottom: SPACING[6],
  },
  addButton: {
    width: '100%',
  },
  medicationsSection: {
    marginBottom: SPACING[6],
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
  },
  medicationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    gap: SPACING[1],
  },
  medicationActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
  },
  deleteAction: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING[3],
  },
  infoList: {
    gap: SPACING[3],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    paddingVertical: SPACING[2],
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    flex: 1,
  },
  medicalSection: {
    marginBottom: SPACING[4],
  },
  medicalTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[1],
    gap: SPACING[2],
  },
  medicalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#059669',
  },
  medicalText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
  },
  medicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stockInfo: {
    flex: 1,
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    marginBottom: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default PatientDetailsScreen;