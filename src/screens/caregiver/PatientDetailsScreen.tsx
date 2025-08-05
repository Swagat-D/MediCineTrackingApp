/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import Button from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

const { width } = Dimensions.get('window');

type Props = CaregiverStackScreenProps<'PatientDetails'>;

interface PatientDetails {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: string;
  createdAt: string;
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
  expiryDate: string;
  status: 'active' | 'paused' | 'completed';
  adherenceRate: number;
  lastTaken?: string;
  daysLeft: number;
}

interface PatientStats {
  totalMedications: number;
  activeMedications: number;
  completedToday: number;
  missedToday: number;
  averageAdherence: number;
  medicationsRunningLow: number;
}

  const PatientDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'history'>('overview');
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    id: patientId,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phoneNumber: '+1-555-0101',
    age: 65,
    gender: 'Male',
    createdAt: '2024-01-15',
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

  const [patientStats, setPatientStats] = useState<PatientStats>({
    totalMedications: 4,
    activeMedications: 4,
    completedToday: 3,
    missedToday: 1,
    averageAdherence: 92,
    medicationsRunningLow: 1,
  });

  const [medications, setMedications] = useState<PatientMedication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 2,
      timingRelation: 'after_food',
      remainingQuantity: 15,
      totalQuantity: 60,
      expiryDate: '2024-12-31',
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
      expiryDate: '2025-03-15',
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
      expiryDate: '2024-11-20',
      status: 'active',
      adherenceRate: 92,
      lastTaken: '1 day ago',
      daysLeft: 8,
    },
    {
      id: '4',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 1,
      timingRelation: 'with_food',
      remainingQuantity: 45,
      totalQuantity: 100,
      expiryDate: '2025-06-30',
      status: 'active',
      adherenceRate: 94,
      lastTaken: '18 hours ago',
      daysLeft: 45,
    },
  ]);

  useEffect(() => {
    loadPatientDetails();
  }, []);

  const loadPatientDetails = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch patient details
      // const details = await caregiverAPI.getPatientDetails(patientId);
      
      // Simulate API delay
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

  const handleEditMedication = (medicationId: string) => {
    navigation.navigate('EditMedication', { medicationId, patientId });
  };

  const handleDeleteMedication = (medicationId: string) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedications(prev => prev.filter(med => med.id !== medicationId));
          },
        },
      ]
    );
  };

  const getStatusColor = (status: PatientDetails['status']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'critical':
        return COLORS.error;
      case 'inactive':
        return COLORS.warning;
      default:
        return COLORS.gray[500];
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return COLORS.success;
    if (rate >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const getMedicationStatusColor = (status: PatientMedication['status']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'paused':
        return COLORS.warning;
      case 'completed':
        return COLORS.gray[500];
      default:
        return COLORS.gray[500];
    }
  };

  const formatTimingRelation = (relation: string) => {
    switch (relation) {
      case 'before_food':
        return 'Before Food';
      case 'after_food':
        return 'After Food';
      case 'with_food':
        return 'With Food';
      case 'empty_stomach':
        return 'Empty Stomach';
      case 'anytime':
        return 'Anytime';
      default:
        return relation;
    }
  };

  const renderStatsCard = (
    title: string,
    value: number | string,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    suffix?: string
  ) => (
    <View style={[styles.statsCard, { backgroundColor: color + '10' }]}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statsValue, { color }]}>
        {value}{suffix}
      </Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const renderMedicationCard = (medication: PatientMedication) => (
    <TouchableOpacity
      key={medication.id}
      style={styles.medicationCard}
      onPress={() => navigation.navigate('MedicationDetails', { 
        medicationId: medication.id, 
        patientId 
      })}
      activeOpacity={0.8}
    >
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>
            {medication.dosage} • {medication.frequency}x daily • {formatTimingRelation(medication.timingRelation)}
          </Text>
          <Text style={styles.medicationLastTaken}>
            Last taken: {medication.lastTaken || 'Never'}
          </Text>
        </View>
        
        <View style={[
          styles.medicationStatus,
          { backgroundColor: getMedicationStatusColor(medication.status) + '20' }
        ]}>
          <Text style={[
            styles.medicationStatusText,
            { color: getMedicationStatusColor(medication.status) }
          ]}>
            {medication.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.medicationStats}>
        <View style={styles.medicationStat}>
          <Text style={styles.medicationStatLabel}>Remaining</Text>
          <Text style={[
            styles.medicationStatValue,
            { color: medication.daysLeft < 7 ? COLORS.error : COLORS.text.primary }
          ]}>
            {medication.remainingQuantity}/{medication.totalQuantity}
          </Text>
        </View>

        <View style={styles.medicationStat}>
          <Text style={styles.medicationStatLabel}>Days Left</Text>
          <Text style={[
            styles.medicationStatValue,
            { color: medication.daysLeft < 7 ? COLORS.error : COLORS.text.primary }
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
          onPress={() => handleEditMedication(medication.id)}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.primary[500]} />
          <Text style={styles.medicationActionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.medicationAction}
          onPress={() => navigation.navigate('BarcodeGenerator', { medicationId: medication.id })}
        >
          <Ionicons name="qr-code-outline" size={16} color={COLORS.secondary[500]} />
          <Text style={styles.medicationActionText}>Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.medicationAction, styles.deleteAction]}
          onPress={() => handleDeleteMedication(medication.id)}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {renderStatsCard('Total Meds', patientStats.totalMedications, 'medical', COLORS.primary[500])}
              {renderStatsCard('Active', patientStats.activeMedications, 'checkmark-circle', COLORS.success)}
              {renderStatsCard('Completed Today', patientStats.completedToday, 'checkmark-done', COLORS.secondary[500])}
              {renderStatsCard('Missed Today', patientStats.missedToday, 'alert-circle', COLORS.error)}
            </View>

            {/* Patient Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} />
                  <Text style={styles.infoLabel}>Age & Gender</Text>
                  <Text style={styles.infoValue}>{patientDetails.age} years, {patientDetails.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} />
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{patientDetails.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color={COLORS.text.secondary} />
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{patientDetails.phoneNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                  <Text style={styles.infoLabel}>Last Active</Text>
                  <Text style={styles.infoValue}>{patientDetails.lastActivity}</Text>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            {patientDetails.emergencyContact && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={20} color={COLORS.text.secondary} />
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.text.secondary} />
                    <Text style={styles.infoLabel}>Relationship</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.relationship}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color={COLORS.text.secondary} />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{patientDetails.emergencyContact.phoneNumber}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Medical Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <View style={styles.infoCard}>
                {patientDetails.medicalHistory && patientDetails.medicalHistory.length > 0 && (
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoColumnTitle}>Medical History</Text>
                    {patientDetails.medicalHistory.map((condition, index) => (
                      <View key={index} style={styles.conditionItem}>
                        <Ionicons name="medical-outline" size={16} color={COLORS.primary[500]} />
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
                        <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                        <Text style={styles.conditionText}>{allergy}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        );

      case 'medications':
        return (
          <View style={styles.tabContent}>
            <View style={styles.medicationsHeader}>
              <Text style={styles.sectionTitle}>Medications ({medications.length})</Text>
              <Button
                title="Add Medication"
                onPress={handleAddMedication}
                size="small"
                icon={<Ionicons name="add" size={16} color={COLORS.background} />}
              />
            </View>
            
            <View style={styles.medicationsList}>
              {medications.map(renderMedicationCard)}
            </View>
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Activity History</Text>
            {/* TODO: Implement history view */}
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={80} color={COLORS.gray[300]} />
              <Text style={styles.emptyTitle}>History Coming Soon</Text>
              <Text style={styles.emptyMessage}>
                Patient activity history will be available here
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[600]} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary[500]}
            colors={[COLORS.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary[500], COLORS.primary[700]]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.background} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.patientHeaderInfo}>
              <Text style={styles.patientName}>{patientDetails.name}</Text>
              <View style={styles.patientMeta}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(patientDetails.status) + '30' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: COLORS.background }
                  ]}>
                    {patientDetails.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.adherenceText}>
                  {patientDetails.adherenceRate}% adherence
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.sosButton}>
              <Ionicons name="alert-circle" size={24} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: 'grid-outline' },
            { key: 'medications', label: 'Medications', icon: 'medical-outline' },
            { key: 'history', label: 'History', icon: 'time-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={activeTab === tab.key ? COLORS.primary[500] : COLORS.text.secondary}
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  header: {
    paddingTop: SPACING[2],
    paddingBottom: SPACING[6],
    paddingHorizontal: SPACING[6],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientHeaderInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING[2],
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  statusBadge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    opacity: 0.9,
    fontWeight: '500',
  },
  sosButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[2],
    borderRadius: RADIUS.md,
    gap: SPACING[2],
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary[50],
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  tabButtonTextActive: {
    color: COLORS.primary[500],
  },
  tabContent: {
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginBottom: SPACING[8],
  },
  statsCard: {
    width: (width - SPACING[6] * 2 - SPACING[3]) / 2,
    padding: SPACING[4],
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  statsValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING[3],
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  infoColumn: {
    marginBottom: SPACING[4],
  },
  infoColumnTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
  },
  medicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  medicationsList: {
    gap: SPACING[4],
  },
  medicationCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
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
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  medicationDosage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  medicationLastTaken: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.hint,
  },
  medicationStatus: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  medicationStatusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
  },
  medicationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
    marginBottom: SPACING[3],
  },
  medicationStat: {
    alignItems: 'center',
  },
  medicationStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  medicationStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.gray[50],
    gap: SPACING[1],
  },
  medicationActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  deleteAction: {
    backgroundColor: COLORS.error + '10',
    paddingHorizontal: SPACING[3],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[16],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default PatientDetailsScreen;