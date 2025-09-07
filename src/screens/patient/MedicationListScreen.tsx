/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Modal,
  Dimensions,
  ColorValue,
  Image
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
import BarcodeDisplay from '@/components/common/BarcodeDisplay';

interface Props {
  navigation: any;
}

interface MedicationDetails {
  id: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: number;
  remainingQuantity: number;
  totalQuantity: number;
  status: 'active' | 'completed' | 'paused';
  adherenceRate: number;
  expiryDate: string;
  instructions?: string;
}

const { width } = Dimensions.get('window');

const MedicationListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    medications,
    isMedicationsLoading,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [currentSortBy, setCurrentSortBy] = useState<'name' | 'status' | 'adherence' | 'daysLeft'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    gradient: ['#DBEAFE', '#FFFFFF'] as [ColorValue, ColorValue],
    accent: '#3B82F6',
  };

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
          await showMedicationDetails(medicationId);
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const showMedicationDetails = async (medicationId: string) => {
    setIsLoadingDetails(true);
    setDetailsModalVisible(true);
    try {
      const medication = await patientAPI.getMedicationDetails(medicationId);
      setSelectedMedication(medication);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setDetailsModalVisible(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#059669';
    if (rate >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const sortMedications = (medications: any[], sortBy: string, order: 'asc' | 'desc') => {
  return [...medications].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        const statusOrder = { 'active': 1, 'paused': 2, 'completed': 3 };
        aValue = statusOrder[a.status as keyof typeof statusOrder] || 4;
        bValue = statusOrder[b.status as keyof typeof statusOrder] || 4;
        break;
      case 'adherence':
        aValue = a.adherenceRate;
        bValue = b.adherenceRate;
        break;
      case 'daysLeft':
        aValue = Math.ceil(a.remainingQuantity / a.frequency);
        bValue = Math.ceil(b.remainingQuantity / b.frequency);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

const handleSort = (sortBy: string, order: 'asc' | 'desc') => {
  setCurrentSortBy(sortBy as any);
  setSortOrder(order);
  setSortModalVisible(false);
  
  // Apply sorting to medications
  const sortedMeds = sortMedications(medications, sortBy, order);
  dispatch(setMedications(sortedMeds));
};

  const getFilterCounts = () => {
    return {
      all: medications.length,
      active: medications.filter((m: any) => m.status === 'active').length,
      completed: medications.filter((m: any) => m.status === 'completed').length,
    };
  };

  const filterCounts = getFilterCounts();

  const FilterChip = ({ filterKey, label, count, isActive }: {
    filterKey: 'all' | 'active' | 'completed';
    label: string;
    count: number;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterChip, isActive && [styles.filterChipActive, { backgroundColor: theme.primary }]]}
      onPress={() => setFilterStatus(filterKey)}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label} ({count})
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
          <ActivityIndicator size="large" color={theme.primary} />
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
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header */}
        <LinearGradient colors={theme.gradient} style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: '#FFFFFF', shadowColor: theme.primary }]}>
              <Image 
                  source={require('../../../assets/images/medications.png')} 
                  style={styles.medicineIcon}
                  resizeMode="contain"
                />
            </View>
            <Text style={styles.headerTitle}>Medication Management</Text>
            <Text style={styles.headerSubtitle}>
              Track and manage your daily medications with ease
            </Text>
            <View style={styles.connectionIndicator}>
              <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#059669' : '#EF4444' }]} />
              <Text style={styles.connectionText}>
                {isConnected ? 'All data synced' : 'Some data may be outdated'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Statistics Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>{filterCounts.active}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: theme.primary }]} />
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#6B7280' }]}>{filterCounts.completed}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#6B7280' }]} />
            </View>
          </View>
        </View>

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
            <FilterChip filterKey="all" label="All" count={filterCounts.all} isActive={filterStatus === 'all'} />
            <FilterChip filterKey="active" label="Active" count={filterCounts.active} isActive={filterStatus === 'active'} />
            <FilterChip filterKey="completed" label="Completed" count={filterCounts.completed} isActive={filterStatus === 'completed'} />
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${medications.length})` : 'Your Medications'}
            </Text>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => setSortModalVisible(true)}
            >
              <Ionicons name="funnel-outline" size={18} color={theme.primary} />
              <Text style={[styles.sortButtonText, { color: theme.primary }]}>Sort</Text>
            </TouchableOpacity>
          </View>

          {medications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No medications found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your medications will appear here when added by your caregiver'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.medicationsList}>
              {medications.map((medication: any) => (
                <TouchableOpacity
                  key={medication.id}
                  style={styles.medicationCard}
                  onPress={() => handleMedicationAction('details', medication.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.medicationHeader}>
                    <View style={[styles.medicationIcon, { backgroundColor: theme.primaryLight }]}>
                      <Image 
                        source={require('../../../assets/images/patientmedication.png')} 
                        style={styles.medicineIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.medicationInfo}>
                      <View style={styles.medicationNameRow}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(medication.status) + '22' }
                        ]}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(medication.status) }
                          ]} />
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(medication.status) }
                          ]}>
                            {medication.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.medicationDosage}>
                        {medication.dosage}{medication.dosageUnit} • {medication.frequency}x daily
                      </Text>
                      <Text style={styles.medicationMeta}>
                        {medication.remainingQuantity} doses left • Next dose: {medication.nextDose || 'Today 08:00'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.medicationStats}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="checkmark-circle" size={16} color={getAdherenceColor(medication.adherenceRate)} />
                      </View>
                      <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: getAdherenceColor(medication.adherenceRate) }]}>
                          {medication.adherenceRate}%
                        </Text>
                        <Text style={styles.statLabel}>Adherence</Text>
                      </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="calendar" size={16} color={theme.primary} />
                      </View>
                      <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>
                          {Math.ceil(medication.remainingQuantity / medication.frequency)}
                        </Text>
                        <Text style={styles.statLabel}>Days Left</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.medicationActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { borderColor: theme.primary + '40' }]}
                      onPress={() => handleMedicationAction('details', medication.id)}
                    >
                      <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                      <Text style={[styles.actionButtonText, { color: theme.primary }]}>Details</Text>
                    </TouchableOpacity>
                    
                    {medication.status === 'active' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.takeButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Scanner')}
                      >
                        <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Scan Barcode</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions Footer */}
        <View style={styles.quickActionsFooter}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Ionicons name="scan-outline" size={20} color={theme.primary} />
              <Text style={styles.quickActionText}>Scan Medication</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('MealSettings')}
            >
              <Ionicons name="restaurant-outline" size={20} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Meal Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Medication Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Medication Details</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isLoadingDetails ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : selectedMedication ? (
            <ScrollView style={styles.modalContent}>
              <LinearGradient
                colors={theme.gradient}
                style={styles.medicationDetailHeader}
              >
                <View style={[styles.medicationDetailIcon, { backgroundColor: theme.primary }]}>
                  <Image 
                  source={require('../../../assets/images/patientmedication.png')} 
                  style={styles.onemedicineIcon}
                  resizeMode="contain"
                />
                </View>
                <Text style={styles.medicationDetailName}>{selectedMedication.name}</Text>
                <View style={[
                  styles.medicationDetailStatus,
                  { backgroundColor: getStatusColor(selectedMedication.status) + '20' }
                ]}>
                  <Text style={[
                    styles.medicationDetailStatusText,
                    { color: getStatusColor(selectedMedication.status) }
                  ]}>
                    {selectedMedication.status.charAt(0).toUpperCase() + selectedMedication.status.slice(1)}
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.medicationDetailInfo}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Dosage Information</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Dosage</Text>
                      <Text style={styles.detailValue}>{selectedMedication.dosage} {selectedMedication.dosageUnit}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Frequency</Text>
                      <Text style={styles.detailValue}>{selectedMedication.frequency}x daily</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Supply Information</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Remaining</Text>
                      <Text style={styles.detailValue}>{selectedMedication.remainingQuantity} doses</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Total Quantity</Text>
                      <Text style={styles.detailValue}>{selectedMedication.totalQuantity} doses</Text>
                    </View>
                  </View>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Days Remaining</Text>
                      <Text style={styles.detailValue}>
                        {Math.ceil(selectedMedication.remainingQuantity / selectedMedication.frequency)} days
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Expiry Date</Text>
                      <Text style={styles.detailValue}>{selectedMedication.expiryDate}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Adherence</Text>
                  <View style={styles.adherenceContainer}>
                    <View style={styles.adherenceProgress}>
                      <View 
                        style={[
                          styles.adherenceBar, 
                          { 
                            width: `${selectedMedication.adherenceRate}%`,
                            backgroundColor: getAdherenceColor(selectedMedication.adherenceRate)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[
                      styles.adherenceText,
                      { color: getAdherenceColor(selectedMedication.adherenceRate) }
                    ]}>
                      {selectedMedication.adherenceRate}% Adherence Rate
                    </Text>
                  </View>
                </View>

                {selectedMedication.instructions && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Instructions</Text>
                    <View style={styles.instructionsContainer}>
                      <Ionicons name="information-circle" size={20} color={theme.primary} />
                      <Text style={styles.instructionsText}>{selectedMedication.instructions}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalActions}>
                  {selectedMedication.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.modalActionButton, { backgroundColor: theme.primary }]}
                      onPress={() => navigation.navigate('Scanner')}
                    >
                      <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>Take Now</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionButtonSecondary]}
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Text style={[styles.modalActionButtonText, { color: theme.primary }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>

      {/* Sort Modal */}
<Modal
  visible={sortModalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setSortModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Sort Medications</Text>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setSortModalVisible(false)}
      >
        <Ionicons name="close" size={24} color="#64748B" />
      </TouchableOpacity>
    </View>

    <View style={styles.sortModalContent}>
      <Text style={styles.sortSectionTitle}>Sort by</Text>
      
      <View style={styles.sortOptions}>
        {[
          { key: 'name', label: 'Medication Name', icon: 'medical-outline' },
          { key: 'status', label: 'Status', icon: 'checkmark-circle-outline' },
          { key: 'adherence', label: 'Adherence Rate', icon: 'trending-up-outline' },
          { key: 'daysLeft', label: 'Days Remaining', icon: 'calendar-outline' },
        ].map((option) => (
          <View key={option.key} style={styles.sortOptionGroup}>
            <View style={styles.sortOptionHeader}>
              <View style={styles.sortOptionInfo}>
                <Ionicons name={option.icon as any} size={20} color={theme.primary} />
                <Text style={styles.sortOptionLabel}>{option.label}</Text>
              </View>
              {currentSortBy === option.key && (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              )}
            </View>
            
            <View style={styles.sortDirections}>
              <TouchableOpacity
                style={[
                  styles.sortDirectionButton,
                  currentSortBy === option.key && sortOrder === 'asc' && {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary
                  }
                ]}
                onPress={() => handleSort(option.key, 'asc')}
              >
                <Ionicons 
                  name="arrow-up-outline" 
                  size={16} 
                  color={currentSortBy === option.key && sortOrder === 'asc' ? theme.primary : '#64748B'} 
                />
                <Text style={[
                  styles.sortDirectionText,
                  currentSortBy === option.key && sortOrder === 'asc' && { color: theme.primary, fontWeight: '600' }
                ]}>
                  {option.key === 'name' ? 'A to Z' : 'Low to High'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortDirectionButton,
                  currentSortBy === option.key && sortOrder === 'desc' && {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary
                  }
                ]}
                onPress={() => handleSort(option.key, 'desc')}
              >
                <Ionicons 
                  name="arrow-down-outline" 
                  size={16} 
                  color={currentSortBy === option.key && sortOrder === 'desc' ? theme.primary : '#64748B'} 
                />
                <Text style={[
                  styles.sortDirectionText,
                  currentSortBy === option.key && sortOrder === 'desc' && { color: theme.primary, fontWeight: '600' }
                ]}>
                  {option.key === 'name' ? 'Z to A' : 'High to Low'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sortModalActions}>
        <TouchableOpacity
          style={[styles.sortResetButton, { borderColor: theme.primary }]}
          onPress={() => handleSort('name', 'asc')}
        >
          <Ionicons name="refresh-outline" size={20} color={theme.primary} />
          <Text style={[styles.sortResetButtonText, { color: theme.primary }]}>Reset to Default</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
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
    fontSize: TYPOGRAPHY.fontSize.md,
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
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
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
    marginBottom: SPACING[4],
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
  summarySection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[5],
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[4],
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  medicationInfo: {
    flex: 1,
  },
  medicationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  },
  medicationName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
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
    textTransform: 'capitalize',
  },
  medicationDosage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
    fontWeight: '500',
  },
  medicationMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#9CA3AF',
  },
  medicationStats: {
    flexDirection: 'row',
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: SPACING[4],
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING[2],
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  medicationActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    gap: SPACING[1],
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
  },
  medicineIcon: {
    height:48,
    width:48,
    borderRadius: RADIUS.full
  },
  onemedicineIcon: {
    height:72,
    width:72,
    borderRadius: RADIUS.full
  },
  takeButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
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
  quickActionsFooter: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  quickActionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[2],
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  medicationDetailHeader: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[8],
    alignItems: 'center',
  },
  medicationDetailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  medicationDetailName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  medicationDetailStatus: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
  },
  medicationDetailStatusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  medicationDetailInfo: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[8],
  },
  detailSection: {
    marginBottom: SPACING[6],
  },
  detailSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  detailGrid: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[3],
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: SPACING[1],
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
    fontWeight: '600',
  },
  adherenceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adherenceProgress: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: SPACING[3],
  },
  adherenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[3],
  },
  instructionsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  modalActionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  modalActionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sortModalContent: {
  flex: 1,
  paddingHorizontal: SPACING[5],
  paddingTop: SPACING[6],
},
sortSectionTitle: {
  fontSize: TYPOGRAPHY.fontSize.lg,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING[4],
},
sortOptions: {
  gap: SPACING[5],
},
sortOptionGroup: {
  backgroundColor: '#FFFFFF',
  borderRadius: RADIUS.xl,
  padding: SPACING[4],
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
sortOptionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: SPACING[3],
},
sortOptionInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING[3],
},
sortOptionLabel: {
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: '600',
  color: '#1E293B',
},
sortDirections: {
  flexDirection: 'row',
  gap: SPACING[3],
},
sortDirectionButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: SPACING[3],
  paddingHorizontal: SPACING[4],
  borderRadius: RADIUS.lg,
  backgroundColor: '#F8FAFC',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  gap: SPACING[2],
},
sortDirectionText: {
  fontSize: TYPOGRAPHY.fontSize.sm,
  color: '#64748B',
  fontWeight: '500',
},
sortModalActions: {
  paddingVertical: SPACING[6],
  borderTopWidth: 1,
  borderTopColor: '#E2E8F0',
  marginTop: SPACING[6],
},
sortResetButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: SPACING[4],
  borderRadius: RADIUS.lg,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  gap: SPACING[2],
},
sortResetButtonText: {
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: '600',
},
});

export default MedicationListScreen;