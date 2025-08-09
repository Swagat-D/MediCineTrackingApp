// src/screens/patient/MedicationListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PatientTabParamList } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  fetchMedications, 
  fetchMedicationDetails,
  logMedicationTaken,
  clearError
} from '../../store/slices/patientSlice';
import { useFocusEffect } from '@react-navigation/native';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

type Props = BottomTabScreenProps<PatientTabParamList, 'Medications'>;

const MedicationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    medications,
    isMedicationsLoading,
    medicationsError,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed' | 'due' | 'low'>('all');

  // Initialize data
  useFocusEffect(
    useCallback(() => {
      const loadMedications = async () => {
        try {
          await dispatch(fetchMedications()).unwrap();
        } catch (error) {
          console.error('Failed to load medications:', error);
        }
      };

      loadMedications();
    }, [dispatch])
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMedications({
        search: searchQuery || undefined,
        status: ['all', 'active', 'paused', 'completed'].includes(filterStatus)
          ? (filterStatus === 'all' ? undefined : filterStatus as 'active' | 'paused' | 'completed')
          : undefined,
      })).unwrap();
    } catch (error) {
      console.error('Failed to refresh medications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      dispatch(fetchMedications({
        search: searchQuery || undefined,
        status: ['all', 'active', 'paused', 'completed'].includes(filterStatus)
          ? (filterStatus === 'all' ? undefined : filterStatus as 'active' | 'paused' | 'completed')
          : undefined,
      }));
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filterStatus, dispatch]);

  // Handle medication action
  const handleMedicationAction = async (action: string, medicationId: string) => {
    try {
      switch (action) {
        case 'take_now':
          await dispatch(logMedicationTaken({
            medicationId,
            data: {
              takenAt: new Date().toISOString(),
              notes: 'Taken from medication list'
            }
          })).unwrap();
          
          Alert.alert(
            'Dose Recorded',
            'Your medication dose has been logged successfully.',
            [{ text: 'OK' }]
          );
          break;
          
        case 'details':
          try {
            await dispatch(fetchMedicationDetails(medicationId)).unwrap();
            Alert.alert('Medication Details', 'Details would be shown here');
          } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Failed to load medication details');
          }
          break;
          
        case 'reminders':
          Alert.alert('Reminders', 'Reminder settings would be shown here');
          break;
          
        default:
          break;
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error || 'Failed to perform action',
        [{ text: 'OK' }]
      );
    }
  };

  // Show error if needed
  useEffect(() => {
    if (medicationsError) {
      Alert.alert(
        'Error',
        medicationsError,
        [
          { text: 'Retry', onPress: () => dispatch(fetchMedications()) },
          { text: 'OK', onPress: () => dispatch(clearError()) }
        ]
      );
    }
  }, [medicationsError, dispatch]);

  // Filter medications based on search and filter
  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    
    switch (filterStatus) {
      case 'active':
        matchesFilter = medication.status === 'active';
        break;
      case 'due':
        matchesFilter = medication.nextDose.includes('Today') || medication.nextDose.includes('Now');
        break;
      case 'low':
        matchesFilter = medication.remainingQuantity <= 5;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Get status color and text
  const getStatusColor = (medication: any) => {
    if (medication.remainingQuantity <= 3) return '#EF4444';
    if (medication.adherenceRate < 80) return '#F59E0B';
    return '#059669';
  };

  const getStatusText = (medication: any) => {
    if (medication.remainingQuantity <= 3) return 'Running Low';
    if (medication.adherenceRate < 80) return 'Poor Adherence';
    return 'On Track';
  };

  // Calculate summary stats
  const summaryStats = {
    total: medications.length,
    dueToday: medications.filter(med => med.nextDose.includes('Today') || med.nextDose.includes('Now')).length,
    lowStock: medications.filter(med => med.remainingQuantity <= 5).length,
  };

  // FilterChip component
  const FilterChip: React.FC<{
    filterKey: 'all' | 'active' | 'due' | 'low';
    label: string;
    isActive: boolean;
  }> = ({ filterKey, label, isActive }) => (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={() => setFilterStatus(filterKey)}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MedicationCard = ({ medication }: { medication: any }) => (
    <TouchableOpacity
      style={styles.medicationCard}
      activeOpacity={0.7}
      onPress={() => handleMedicationAction('details', medication.id)}
    >
      <View style={styles.medicationHeader}>
        <View style={[styles.medicationIcon, { backgroundColor: getStatusColor(medication) + '20' }]}>
          <Ionicons name="medical" size={24} color={getStatusColor(medication)} />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>{medication.dosage}{medication.dosageUnit} • {medication.frequency}x daily</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(medication) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(medication) }]}>
            {getStatusText(medication)}
          </Text>
        </View>
      </View>

      <View style={styles.medicationDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>Next: {medication.nextDose}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{medication.adherenceRate}% adherence</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="medkit-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{medication.remainingQuantity} doses left</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>Expires {new Date(medication.expiryDate).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.dosageProgress}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Doses Remaining</Text>
          <Text style={styles.progressValue}>
            {medication.remainingQuantity}/{medication.totalQuantity}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${(medication.remainingQuantity / medication.totalQuantity) * 100}%`,
                  backgroundColor: getStatusColor(medication)
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {medication.instructions && (
        <Text style={styles.medicationInstructions}>{medication.instructions}</Text>
      )}

      <View style={styles.medicationActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleMedicationAction('details', medication.id)}
        >
          <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleMedicationAction('reminders', medication.id)}
        >
          <Ionicons name="notifications-outline" size={16} color="#2563EB" />
          <Text style={styles.actionButtonText}>Reminders</Text>
        </TouchableOpacity>
        
        {medication.status === 'active' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#059669' }]}
            onPress={() => handleMedicationAction('take_now', medication.id)}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Take Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const ConnectionIndicator = () => (
    <View style={styles.connectionIndicator}>
      <View style={[
        styles.connectionDot, 
        { backgroundColor: isConnected ? '#059669' : '#EF4444' }
      ]} />
      <Text style={styles.connectionText}>
        {isConnected ? 'Synced' : 'Offline'}
      </Text>
    </View>
  );

  // Loading state
  if (isMedicationsLoading && medications.length === 0) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="My Medications"
          subtitle="Loading medications..."
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
        <View style={[styles.scrollView, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 16, color: '#64748B' }}>Loading your medications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="My Medications"
        subtitle={`${filteredMedications.length} medications`}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#EBF4FF', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="medical" size={32} color="#2563EB" />
            </View>
            <Text style={styles.headerTitle}>Medication Management</Text>
            <Text style={styles.headerSubtitle}>
              Track and manage your daily medications
            </Text>
            <ConnectionIndicator />
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
            <FilterChip
              filterKey="all"
              label="All"
              isActive={filterStatus === 'all'}
            />
            <FilterChip
              filterKey="active"
              label="Active"
              isActive={filterStatus === 'active'}
            />
            <FilterChip
              filterKey="due"
              label="Due Today"
              isActive={filterStatus === 'due'}
            />
            <FilterChip
              filterKey="low"
              label="Low Stock"
              isActive={filterStatus === 'low'}
            />
          </View>
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summaryStats.total}</Text>
              <Text style={styles.summaryLabel}>Total Meds</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#2563EB' }]} />
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
                {summaryStats.dueToday}
              </Text>
              <Text style={styles.summaryLabel}>Due Today</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>
                {summaryStats.lowStock}
              </Text>
              <Text style={styles.summaryLabel}>Low Stock</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#EF4444' }]} />
            </View>
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${filteredMedications.length})` : 'Your Medications'}
            </Text>
          </View>
          
          {filteredMedications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching medications found' : 'No medications yet'}
              </Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Try adjusting your search terms or change the filter'
                  : 'Your medications will appear here once your caregiver adds them'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.medicationsList}>
              {filteredMedications.map(medication => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </View>
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
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[10],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[3],
    gap: SPACING[2],
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING[2],
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#2563EB',
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
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
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
    flexWrap: 'wrap',
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
  summarySection: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[5],
  },
  summaryGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[4],
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: SPACING[1],
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryIndicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
    marginTop: SPACING[2],
  },
  medicationsSection: {
    paddingHorizontal: SPACING[5],
  },
  sectionHeader: {
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicationsList: {
    gap: SPACING[4],
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
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
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
    backgroundColor: '#F8FAFC',
    gap: SPACING[1],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  medicationDetails: {
    marginBottom: SPACING[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    flex: 1,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  dosageProgress: {
    marginBottom: SPACING[4],
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1E293B',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: SPACING[2],
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  medicationInstructions: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: SPACING[4],
    lineHeight: 20,
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
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[16],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[6],
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
  },
});

export default MedicationListScreen;