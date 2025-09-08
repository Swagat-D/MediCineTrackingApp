/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import CaregiverNavbar from '../../components/common/CaregiverNavbar';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';
import { caregiverAPI, Patient as PatientType } from '../../services/api/caregiverAPI';

import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

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

type SortField = 'name' | 'adherenceRate' | 'medicationsCount';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface SortOption {
  field: SortField;
  label: string;
  icon: string;
  description: string;
}

const sortOptions: SortOption[] = [
  {
    field: 'name',
    label: 'Patient Name',
    icon: 'person-outline',
    description: 'Sort alphabetically by patient name'
  },
  {
    field: 'adherenceRate',
    label: 'Adherence Rate',
    icon: 'checkmark-circle-outline',
    description: 'Sort by medication adherence percentage'
  },
  {
    field: 'medicationsCount',
    label: 'Medications Count',
    icon: 'medkit-outline',
    description: 'Sort by number of medications'
  }
];

const PatientsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [modalAnimation] = useState(new Animated.Value(0));

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await caregiverAPI.getPatients({
        search: '',
        status: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      // Transform the data to include calculated fields
      const patientsWithStats = await Promise.all(
        data.map(async (patient: PatientType) => {
          try {
            const patientDetails = await caregiverAPI.getPatientDetails(patient.id);
            return {
              ...patient,
              medicationsCount: patientDetails.medications?.length || 0,
              adherenceRate: patientDetails.patient?.adherenceRate || 0,
              alerts: 0,
            };
          } catch (error) {
            console.error(`Error fetching details for patient ${patient.id}:`, error);
            return {
              ...patient,
              medicationsCount: 0,
              adherenceRate: 0,
              alerts: 0,
            };
          }
        })
      );
      
      setPatients(patientsWithStats);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phoneNumber.includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'adherenceRate':
          aValue = a.adherenceRate;
          bValue = b.adherenceRate;
          break;
        case 'medicationsCount':
          aValue = a.medicationsCount;
          bValue = b.medicationsCount;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortConfig.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [patients, searchQuery, filterStatus, sortConfig]);

  const handlePatientPress = (patient: Patient) => {
    navigation.navigate('PatientDetails', { patientId: patient.id });
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    Alert.alert(
      'Remove Patient',
      `Are you sure you want to remove ${patientName} from your patient list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await caregiverAPI.removePatient(patientId);
              Alert.alert('Success', `${patientName} has been removed from your patient list`);
              await loadPatients();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove patient');
            }
          },
        },
      ]
    );
  };

  const openSortModal = () => {
  setShowSortModal(true);
};

useEffect(() => {
  if (showSortModal) {
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [showSortModal]);

  const closeSortModal = () => {
  setShowSortModal(false);
};

  const handleSortSelect = (field: SortField, order: SortOrder) => {
    setSortConfig({ field, order });
    closeSortModal();
  };

  const getSortDisplayText = () => {
  const option = sortOptions.find(opt => opt.field === sortConfig.field);

  let orderText = '';
  switch (sortConfig.field) {
    case 'name':
      orderText = sortConfig.order === 'asc' ? 'A-Z' : 'Z-A';
      break;
    case 'adherenceRate':
    case 'medicationsCount':
      orderText = sortConfig.order === 'asc' ? 'Low to High' : 'High to Low';
      break;
    default:
      orderText = sortConfig.order === 'asc' ? 'A-Z' : 'Z-A';
  }

  return `${option?.label} (${orderText})`;
};

  const getStatusColor = (status: Patient['status']) => {
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

  const getFilterCounts = () => {
    return {
      all: patients.length,
      active: patients.filter(p => p.status === 'active').length,
      critical: patients.filter(p => p.status === 'critical').length,
      inactive: patients.filter(p => p.status === 'inactive').length,
    };
  };

  const exportPatientList = async () => {
    try {
      setIsLoading(true);

      const exportData = filteredAndSortedPatients.map((patient, index) => ({
        'S.No': index + 1,
        'Patient Name': patient.name,
        'Email': patient.email,
        'Phone Number': patient.phoneNumber,
        'Age': patient.age,
        'Gender': patient.gender,
        'Status': patient.status.charAt(0).toUpperCase() + patient.status.slice(1),
        'Number of Medications': patient.medicationsCount,
        'Adherence Rate (%)': patient.adherenceRate,
        'Last Activity': patient.lastActivity,
        'Alerts': patient.alerts,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const columnWidths = [
        { wch: 8 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 8 },
        { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 10 },
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient List');

      const excelBuffer = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `patient_list_${currentDate}.xlsx`;
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          const base64 = excelBuffer;
          
          await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .then(async (uri) => {
              await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
              Alert.alert(
                'Download Complete',
                `Patient list has been downloaded successfully as ${fileName}`,
                [{ text: 'OK' }]
              );
            })
            .catch((error) => {
              console.error(error);
              Alert.alert('Download Failed', 'Unable to save file to Downloads folder.');
            });
        } else {
          Alert.alert('Permission Required', 'Please grant permission to save files to Downloads folder.');
        }
      } else {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Save Patient List',
            UTI: 'com.microsoft.excel.xlsx',
          });
        }
      }

    } catch (error) {
      console.error('Error exporting patient list:', error);
      Alert.alert('Export Failed', 'Unable to export patient list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCounts = getFilterCounts();

  const FilterChip = ({
    filterKey,
    label,
    count,
    isActive,
  }: {
    filterKey: 'all' | 'active' | 'inactive' | 'critical';
    label: string;
    count: number;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={() => setFilterStatus(filterKey)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterChipText,
        isActive && styles.filterChipTextActive,
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="none"
      onRequestClose={closeSortModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={closeSortModal}
        />
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: modalAnimation,
              transform: [{
                translateY: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort Patients</Text>
            <TouchableOpacity onPress={closeSortModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSubtitle}>Choose how to sort your patient list</Text>
            
            {sortOptions.map((option) => (
              <View key={option.field} style={styles.sortOptionGroup}>
                <View style={styles.sortOptionHeader}>
                  <View style={styles.sortOptionTitleContainer}>
                    <View style={styles.sortOptionIcon}>
                      <Ionicons name={option.icon as any} size={20} color="#059669" />
                    </View>
                    <View>
                      <Text style={styles.sortOptionTitle}>{option.label}</Text>
                      <Text style={styles.sortOptionDescription}>{option.description}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.sortOrderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      sortConfig.field === option.field && sortConfig.order === 'asc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => handleSortSelect(option.field, 'asc')}
                  >
                    <Ionicons 
                      name="arrow-up" 
                      size={16} 
                      color={sortConfig.field === option.field && sortConfig.order === 'asc' ? '#FFFFFF' : '#64748B'} 
                    />
                    <Text style={[
                      styles.sortOrderButtonText,
                      sortConfig.field === option.field && sortConfig.order === 'asc' && styles.sortOrderButtonTextActive
                    ]}>
                      {option.field === 'name' ? 'A to Z' : 'Low to High'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      sortConfig.field === option.field && sortConfig.order === 'desc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => handleSortSelect(option.field, 'desc')}
                  >
                    <Ionicons 
                      name="arrow-down" 
                      size={16} 
                      color={sortConfig.field === option.field && sortConfig.order === 'desc' ? '#FFFFFF' : '#64748B'} 
                    />
                    <Text style={[
                      styles.sortOrderButtonText,
                      sortConfig.field === option.field && sortConfig.order === 'desc' && styles.sortOrderButtonTextActive
                    ]}>
                      {option.field === 'name' ? 'Z to A' : 'High to Low'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Apply Sort"
              onPress={closeSortModal}
              style={styles.modalApplyButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CaregiverNavbar
        title="My Patients"
        onNotificationPress={() => navigation.navigate('Notifications')}
        rightActions={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddPatient')}
          >
            <Image 
              source={require('../../../assets/images/addpatient.png')} 
              style={styles.addpatientIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
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
        {/* Header Section */}
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Image 
                source={require('../../../assets/images/patient.png')} 
                style={styles.patientIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>Patient Management</Text>
            <Text style={styles.headerSubtitle}>
              Managing {patients.length} patients across your healthcare practice
            </Text>
          </View>
        </LinearGradient>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients by name, email, or phone..."
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
              count={filterCounts.all}
              isActive={filterStatus === 'all'}
            />
            <FilterChip
              filterKey="active"
              label="Active"
              count={filterCounts.active}
              isActive={filterStatus === 'active'}
            />
            <FilterChip
              filterKey="critical"
              label="Critical"
              count={filterCounts.critical}
              isActive={filterStatus === 'critical'}
            />
            <FilterChip
              filterKey="inactive"
              label="Inactive"
              count={filterCounts.inactive}
              isActive={filterStatus === 'inactive'}
            />
          </View>
        </View>

        {/* Statistics Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{filterCounts.active}</Text>
              <Text style={styles.summaryLabel}>Active Patients</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#059669' }]} />
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>{filterCounts.critical}</Text>
              <Text style={styles.summaryLabel}>Critical Cases</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{filterCounts.inactive}</Text>
              <Text style={styles.summaryLabel}>Inactive</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
          </View>
        </View>

        {/* Patients List */}
        <View style={styles.patientsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${filteredAndSortedPatients.length})` : 'Patient List'}
            </Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={openSortModal}
            >
              <Ionicons name="funnel-outline" size={18} color="#059669" />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>

          {/* Current Sort Display */}
          <View style={styles.currentSortContainer}>
            <Text style={styles.currentSortText}>
              Sorted by: {getSortDisplayText()}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size="large" />
              <Text style={styles.loadingText}>Loading patients...</Text>
            </View>
          ) : filteredAndSortedPatients.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching patients found' : 'No patients yet'}
              </Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Try adjusting your search terms or change the filter'
                  : 'Start by adding your first patient to begin managing their medications and health tracking'
                }
              </Text>
              {!searchQuery && (
                <Button
                  title="Add Your First Patient"
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.emptyButton}
                  icon={<Ionicons name="person-add" size={18} color="#FFFFFF" />}
                />
              )}
            </View>
          ) : (
            <View style={styles.patientsList}>
              {filteredAndSortedPatients.map(patient => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.patientCard}
                  onPress={() => handlePatientPress(patient)}
                  activeOpacity={0.9}
                >
                  <View style={styles.patientHeader}>
                    <View style={styles.patientInfo}>
                      <View style={styles.patientNameRow}>
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(patient.status) + '22' }
                        ]}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(patient.status) }
                          ]} />
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(patient.status) }
                          ]}>
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.patientMeta}>
                        <Text style={styles.patientDetails}>{patient.email} • {patient.gender}, {patient.age}</Text>
                        <Text style={styles.patientActivity}>Last activity: {patient.lastActivity}</Text>
                      </View>
                    </View>
                    {patient.alerts > 0 && (
                      <View style={styles.alertBadge}>
                        <Ionicons name="alert-circle" size={16} color="#EF4444" />
                        <Text style={styles.alertCount}>{patient.alerts}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.patientStats}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="medkit" size={16} color="#059669" />
                      </View>
                      <View style={styles.statContent}>
                        <Text style={styles.statValue}>{patient.medicationsCount}</Text>
                        <Text style={styles.statLabel}>Medications</Text>
                      </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="checkmark-circle" size={16} color={getAdherenceColor(patient.adherenceRate)} />
                      </View>
                      <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: getAdherenceColor(patient.adherenceRate) }]}>
                          {patient.adherenceRate}%
                        </Text>
                        <Text style={styles.statLabel}>Adherence</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.patientActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('PatientDetails', { patientId: patient.id })}
                    >
                      <Ionicons name="information-circle-outline" size={16} color="#059669" />
                      <Text style={styles.actionButtonText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePatient(patient.id, patient.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Remove</Text>
                    </TouchableOpacity>
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
              onPress={() => navigation.navigate('AddPatient')}
            >
              <Ionicons name="person-add-outline" size={20} color="#059669" />
              <Text style={styles.quickActionText}>Add Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionItem, isLoading && styles.disabledButton]}
              onPress={exportPatientList}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Ionicons name="download-outline" size={20} color="#8B5CF6" />
              )}
              <Text style={styles.quickActionText}>
                {isLoading ? 'Exporting...' : 'Export List'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SortModal />
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
    paddingVertical: SPACING[1],
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
    backgroundColor: '#059669',
    borderColor: '#059669',
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
    color: '#059669',
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
  patientsSection: {
    paddingHorizontal: SPACING[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
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
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '500',
  },
  currentSortContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currentSortText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: SPACING[16],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  patientsList: {
    gap: SPACING[4],
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
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
    fontWeight: '600',
    color: '#1E293B',
    marginRight: SPACING[3],
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
  },
  patientMeta: {
    gap: SPACING[1],
  },
  patientDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  patientActivity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#9CA3AF',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    gap: SPACING[1],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: '#EF4444',
  },
  patientStats: {
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
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    gap: SPACING[1],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: '#475569',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    flex: 0,
    paddingHorizontal: SPACING[2],
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
  patientIcon: {
    height: 64, 
    width: 64,
    borderRadius: RADIUS.full,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[6],
    maxWidth: '85%',
  },
  emptyButton: {
    minWidth: 200,
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
  addpatientIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
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
  // Sort Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[6],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING[6],
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    marginBottom: SPACING[6],
    marginTop: SPACING[4],
  },
  sortOptionGroup: {
    marginBottom: SPACING[6],
  },
  sortOptionHeader: {
    marginBottom: SPACING[3],
  },
  sortOptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  sortOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  sortOptionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  sortOrderButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: SPACING[2],
  },
  sortOrderButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  sortOrderButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  sortOrderButtonTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    padding: SPACING[6],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalApplyButton: {
    width: '100%',
  },
})

export default PatientsScreen;