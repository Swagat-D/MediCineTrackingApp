import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  setMedicationsLoading, 
  setMedications, 
  setConnectionStatus,
  setError 
} from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import { useFocusEffect } from '@react-navigation/native';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

interface Props {
  navigation: any;
}

const MedicationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    medications,
    isMedicationsLoading,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, filterStatus])
  );

  const loadMedications = async () => {
    dispatch(setMedicationsLoading(true));
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const data = await patientAPI.getMedications(params);
      dispatch(setMedications(data));
      dispatch(setConnectionStatus(true));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setConnectionStatus(false));
    } finally {
      dispatch(setMedicationsLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  };

  const handleMedicationAction = async (action: string, medicationId: string) => {
    try {
      switch (action) {
        case 'take_now':
          await patientAPI.logMedicationTaken(medicationId, {
            takenAt: new Date().toISOString(),
            notes: 'Taken from medication list'
          });
          Alert.alert('Success', 'Dose recorded successfully');
          loadMedications();
          break;
        case 'details':
          const medication = await patientAPI.getMedicationDetails(medicationId);
          Alert.alert(
            medication.name,
            `Dosage: ${medication.dosage} ${medication.dosageUnit}\nRemaining: ${medication.remainingQuantity} doses\nAdherence: ${medication.adherenceRate}%\n\n${medication.instructions || 'No special instructions'}`
          );
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const FilterChip = ({ filterKey, label, isActive }: {
    filterKey: 'all' | 'active' | 'paused' | 'completed';
    label: string;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={() => setFilterStatus(filterKey)}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isMedicationsLoading && medications.length === 0) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="My Medications"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading medications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="My Medications"
        subtitle={`${medications.length} medications`}
        onBackPress={() => navigation.goBack()}
        onSOSPress={() => navigation.navigate('SOS')}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#EBF4FF', '#FFFFFF']} style={styles.headerSection}>
          <Text style={styles.headerTitle}>Medication Management</Text>
          <View style={styles.connectionIndicator}>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#059669' : '#EF4444' }]} />
            <Text style={styles.connectionText}>
              {isConnected ? 'Synced' : 'Offline'}
            </Text>
          </View>
        </LinearGradient>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterContainer}>
            <FilterChip filterKey="all" label="All" isActive={filterStatus === 'all'} />
            <FilterChip filterKey="active" label="Active" isActive={filterStatus === 'active'} />
            <FilterChip filterKey="paused" label="Paused" isActive={filterStatus === 'paused'} />
            <FilterChip filterKey="completed" label="Completed" isActive={filterStatus === 'completed'} />
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.medicationsSection}>
          {medications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No medications found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery 
                  ? 'Try adjusting your search or filter'
                  : 'Your medications will appear here'
                }
              </Text>
            </View>
          ) : (
            medications.map((medication) => (
              <TouchableOpacity
                key={medication.id}
                style={styles.medicationCard}
                onPress={() => handleMedicationAction('details', medication.id)}
              >
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationIcon}>
                    <Ionicons name="medical" size={24} color="#2563EB" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDosage}>
                      {medication.dosage}{medication.dosageUnit} • {medication.frequency}x daily
                    </Text>
                    <Text style={styles.medicationStatus}>
                      {medication.remainingQuantity} doses left • {medication.adherenceRate}% adherence
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { 
                      color: medication.status === 'active' ? '#059669' : 
                             medication.status === 'paused' ? '#F59E0B' : '#6B7280' 
                    }]}>
                      {medication.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.medicationActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleMedicationAction('details', medication.id)}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>
                  
                  {medication.status === 'active' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.takeButton]}
                      onPress={() => handleMedicationAction('take_now', medication.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Take Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING[2],
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[5],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  medicationsSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
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
  medicationDosage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  medicationStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    backgroundColor: '#F8FAFC',
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  medicationActions: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: '#EBF4FF',
    gap: SPACING[1],
    flex: 1,
    justifyContent: 'center',
  },
  takeButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[16],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
   emptyMessage: {
   fontSize: TYPOGRAPHY.fontSize.md,
   color: '#64748B',
   textAlign: 'center',
   maxWidth: '80%',
 },
});

export default MedicationListScreen;