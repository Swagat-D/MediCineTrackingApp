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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';
type Props = CaregiverStackScreenProps<'Patients'>;

interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phoneNumber: string;
  medicationsCount: number;
  adherenceRate: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'critical';
  alerts: number;
}

const PatientsScreen: React.FC<Props> = ({ navigation }) => {
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');
  
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      age: 65,
      gender: 'Male',
      phoneNumber: '+1-555-0101',
      medicationsCount: 4,
      adherenceRate: 92,
      lastActivity: '2 hours ago',
      status: 'active',
      alerts: 0,
    },
    {
      id: '2',
      name: 'Mary Johnson',
      email: 'mary.johnson@email.com',
      age: 58,
      gender: 'Female',
      phoneNumber: '+1-555-0102',
      medicationsCount: 6,
      adherenceRate: 78,
      lastActivity: '1 day ago',
      status: 'critical',
      alerts: 2,
    },
    {
      id: '3',
      name: 'Robert Davis',
      email: 'robert.davis@email.com',
      age: 72,
      gender: 'Male',
      phoneNumber: '+1-555-0103',
      medicationsCount: 3,
      adherenceRate: 95,
      lastActivity: '30 minutes ago',
      status: 'active',
      alerts: 1,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      age: 45,
      gender: 'Female',
      phoneNumber: '+1-555-0104',
      medicationsCount: 2,
      adherenceRate: 85,
      lastActivity: '3 days ago',
      status: 'inactive',
      alerts: 0,
    },
  ]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch patients
      // const patientsData = await caregiverAPI.getPatients();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load patients. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const handleAddPatient = () => {
    navigation.navigate('AddPatient');
  };

  const handlePatientPress = (patient: Patient) => {
    navigation.navigate('PatientDetails', { patientId: patient.id });
  };

  const handleDeletePatient = (patientId: string) => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to remove this patient? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPatients(prev => prev.filter(p => p.id !== patientId));
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Patient['status']) => {
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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderPatientCard = (patient: Patient) => (
    <TouchableOpacity
      key={patient.id}
      style={styles.patientCard}
      onPress={() => handlePatientPress(patient)}
      activeOpacity={0.8}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientNameRow}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
                {patient.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.patientDetails}>
            {patient.age} years • {patient.gender}
          </Text>
          <Text style={styles.patientContact}>{patient.email}</Text>
        </View>

        {patient.alerts > 0 && (
          <View style={styles.alertBadge}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.alertCount}>{patient.alerts}</Text>
          </View>
        )}
      </View>

      <View style={styles.patientStats}>
        <View style={styles.statItem}>
          <Ionicons name="medical" size={16} color={COLORS.primary[500]} />
          <Text style={styles.statLabel}>Medications</Text>
          <Text style={styles.statValue}>{patient.medicationsCount}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={16} color={getAdherenceColor(patient.adherenceRate)} />
          <Text style={styles.statLabel}>Adherence</Text>
          <Text style={[styles.statValue, { color: getAdherenceColor(patient.adherenceRate) }]}>
            {patient.adherenceRate}%
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={COLORS.gray[500]} />
          <Text style={styles.statLabel}>Last Active</Text>
          <Text style={styles.statValue}>{patient.lastActivity}</Text>
        </View>
      </View>

      <View style={styles.patientActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddMedication', { patientId: patient.id })}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary[500]} />
          <Text style={styles.actionButtonText}>Add Med</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePatientPress(patient)}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.secondary[500]} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePatient(patient.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      {['all', 'active', 'critical', 'inactive'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterChip,
            filterStatus === filter && styles.filterChipActive,
          ]}
          onPress={() => setFilterStatus(filter as any)}
        >
          <Text style={[
            styles.filterChipText,
            filterStatus === filter && styles.filterChipTextActive,
          ]}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Patients</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPatient}
          >
            <Ionicons name="add" size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Managing {patients.length} patients
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        {renderFilterChips()}
      </View>

      {/* Patients List */}
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
        {filteredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching patients' : 'No patients yet'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchQuery
                ? 'Try adjusting your search terms or filters'
                : 'Start by adding your first patient to begin managing their medications'
              }
            </Text>
            {!searchQuery && (
              <Button
                title="Add Your First Patient"
                onPress={handleAddPatient}
                style={styles.emptyButton}
              />
            )}
          </View>
        ) : (
          <View style={styles.patientsList}>
            {filteredPatients.map(renderPatientCard)}
          </View>
        )}
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
  header: {
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[6],
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING[4],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    marginBottom: SPACING[4],
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
    marginLeft: SPACING[3],
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  filterChip: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[500],
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
  },
  patientsList: {
    gap: SPACING[4],
  },
  patientCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  patientName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginRight: SPACING[3],
  },
  statusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
  },
  patientDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  patientContact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.hint,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    gap: SPACING[1],
  },
  alertCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  patientStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
    marginBottom: SPACING[4],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING[1],
    marginBottom: SPACING[1],
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray[50],
    gap: SPACING[1],
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  deleteButton: {
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
    marginBottom: SPACING[6],
    maxWidth: '80%',
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default PatientsScreen;