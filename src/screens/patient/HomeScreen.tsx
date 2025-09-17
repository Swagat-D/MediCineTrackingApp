/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
import PatientNavbar from '../../components/common/PatientNavbar';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { apiClient } from '../../services/api/apiClient';
import { patientAPI } from '../../services/api/patientAPI';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loadDashboardWithCache,
  refreshDashboard
} from '../../store/slices/patientSlice';
import { formatRelativeTime } from '../../utils/dateUtils';
import { CustomAlertStatic } from '@/components/common/CustomAlert/CustomAlertStatic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any; 
}

interface RecentActivity {
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'reminder_sent' | 'medication_added';
  medicationName: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    dashboardStats,
    todaysMedications,
    recentActivities,
    isDashboardLoading,
    isConnected,
    unreadNotificationCount
  } = useAppSelector(state => state.patient);
  const { user } = useAppSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [isRightTime, setIsRightTime] = useState(false);
  const [timingInfo, setTimingInfo] = useState<any>(null);
  const [showAdherenceModal, setShowAdherenceModal] = useState(false);

  // Blue theme for patient side
  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    gradient: ['#EBF4FF', '#FFFFFF'] as [string, string],
    accent: '#3B82F6',
    success: '#059669',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // Load from cache first - instant UI
      await Promise.all([
        dispatch(loadDashboardWithCache()),
      ]);
    } catch (error: any) {
      console.error('Error loading cached data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(refreshDashboard()).unwrap();
    } catch (error: any) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };



  const handleDoseTaken = async (medicationId: string, override: boolean = false) => {
  try {
    
    const response = await patientAPI.recordMedicationTaken(medicationId, {
      notes: 'Taken via home screen',
      override
    }) as { message: string; success: boolean; data?: { wasOverridden?: boolean; medicationName?: string } };
    
    if (response.success) {
      const wasOverridden = response.data?.wasOverridden;
      
      CustomAlertStatic.alert(
        'Success', 
        wasOverridden 
          ? `${response.data?.medicationName} recorded with safety override`
          : `${response.data?.medicationName} recorded successfully`,
        [
          {
            text: 'OK',
            onPress: () => loadData()
          }
        ]
      );
    }
    
  } catch (error: any) {
    console.error('Handle dose taken error:', error);
    
    // Check if it's a safety warning (400 status)
    if (error.response?.status === 400 && error.response?.data?.data) {
      const safetyData = error.response.data.data;
      showSafetyWarningModal(safetyData, medicationId);
    } else {
      CustomAlertStatic.alert('Error', error.message || 'Failed to record medication dose');
    }
  }
};

const showSafetyWarningModal = (safetyData: any, medicationId: string) => {
  const { reason, warnings, timingInfo } = safetyData;
  
  let warningMessage = `${reason}\n\n`;
  if (warnings && warnings.length > 0) {
    warningMessage += warnings.join('\n');
  }
  
  // Add timing info if available
  if (timingInfo?.nextWindow) {
    warningMessage += `\n\nNext recommended time: ${timingInfo.timeUntilNextWindow}`;
  }

  CustomAlertStatic.alert(
    '⚠️ Safety Warning',
    warningMessage,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Take Anyway',
        style: 'destructive',
        onPress: () => {
          // Show confirmation for override
          CustomAlertStatic.alert(
            'Override Safety Check?',
            'Are you sure you want to take this medication despite the safety warning? This should only be done in consultation with your healthcare provider.',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Yes, Take Medication',
                style: 'destructive',
                onPress: () => handleDoseTaken(medicationId, true) // Override = true
              }
            ]
          );
        }
      }
    ]
  );
};

  const checkTimingAndShowModal = async (medication: any) => {
  try {
    console.log('Checking detailed timing for medication:', medication);
    
    if (!medication.id && !medication._id) {
      console.error('Medication ID is missing:', medication);
      setSelectedMedication(medication);
      setIsRightTime(true);
      setShowDoseModal(true);
      return;
    }
    
    const medicationId = medication.id || medication._id;
    
    // Use the enhanced timing check endpoint
    const response = await apiClient.get(`/patient/medications/${medicationId}/timing-check`);
    const timingData = response.data.data;
    
    console.log('Detailed timing check response:', timingData);
    
    setSelectedMedication(medication);
    setIsRightTime(timingData.canTake);
    
    // Store additional safety info for the modal
    setTimingInfo({
      canTake: timingData.canTake,
      reason: timingData.reason,
      warnings: timingData.warnings || [],
      nextDoseTime: timingData.dosing?.nextDoseTime,
      hoursRemaining: timingData.dosing?.hoursRemaining
    });
    
    setShowDoseModal(true);
    
  } catch (error: any) {
    console.error('Error checking medication timing:', error);
    setSelectedMedication(medication);
    setIsRightTime(true);
    setShowDoseModal(true);
  }
};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'dose_taken': return 'checkmark-circle';
      case 'dose_missed': return 'close-circle';
      case 'reminder_sent': return 'notifications';
      case 'medication_added': return 'add-circle';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return '#6B7280';
    }
  };

  const adherenceTips = [
  {
    icon: "alarm",
    title: "Set Medication Reminders",
    description: "Use phone alarms or our app notifications to remind you when it's time to take your medication."
  },
  {
    icon: "calendar",
    title: "Create a Daily Routine",
    description: "Link medication taking to daily activities like meals or bedtime for better consistency."
  },
  {
    icon: "list",
    title: "Use a Pill Organizer",
    description: "Organize your weekly medications in advance to avoid missing doses."
  },
  {
    icon: "people",
    title: "Get Family Support",
    description: "Ask family members to help remind you or check in about your medication schedule."
  },
  {
    icon: "medkit",
    title: "Understand Your Medications",
    description: "Know why each medication is important for your health to stay motivated."
  }
];


  const ActivityModal = () => (
    <Modal
      visible={showActivityModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowActivityModal(false)}
    >
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>Recent Activities</Text>
            <Text style={styles.modalSubtitle}>Your medication history</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowActivityModal(false)}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalActivityList}>
            {recentActivities.slice(0,12).map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.modalActivityItem,
                  index === recentActivities.length - 1 && styles.lastModalActivityItem
                ]}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.activityIconContainer,
                  { backgroundColor: getActivityColor(activity.priority) + '15' }
                ]}>
                  <Ionicons
                    name={getActivityIcon(activity.type)}
                    size={18}
                    color={getActivityColor(activity.priority)}
                  />
                </View>
                
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityMedication}>{activity.medicationName}</Text>
                    <Text style={styles.activityTime}>{formatRelativeTime(activity.timestamp)}</Text>
                  </View>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                </View>
                
                {activity.priority === 'high' && (
                  <View style={styles.highPriorityIndicator} />
                )}
              </TouchableOpacity>
            ))}
            
            {recentActivities.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No recent activities</Text>
                <Text style={styles.emptyStateSubtext}>Your medication activities will appear here</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isDashboardLoading && !dashboardStats.totalMedications || 0) {
    return (
      <View style={styles.container}>
        <PatientNavbar
          onNotificationPress={() => navigation.navigate('Notifications')}
          onSOSPress={() => navigation.navigate('SOS')}
          notificationCount={unreadNotificationCount}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientNavbar
        onNotificationPress={() => navigation.navigate('Notifications')}
        onSOSPress={() => navigation.navigate('SOS')}
        notificationCount={unreadNotificationCount}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Greeting Section */}
        <LinearGradient
          colors={theme.gradient}
          style={styles.greetingContainer}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
              <Text style={styles.subtitle}>How are you feeling today?</Text>
              <View style={styles.connectionStatus}>
                <View style={[styles.connectionDot, { backgroundColor: isConnected ? theme.success : theme.error }]} />
                <Text style={styles.connectionText}>
                  {isConnected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
            <View style={styles.greetingIcon}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight, shadowColor: theme.primary }]}>
                <Image 
                  source={require('../../../assets/images/human.png')} 
                  style={styles.humanIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statItem, styles.primaryStat]}
              onPress={() => navigation.navigate('Medications')}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Image 
                  source={require('../../../assets/images/patientmedication.png')} 
                  style={styles.medIcon}
                  resizeMode="contain"
                />
                  <Text style={styles.statLabel}>Total Medications</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.primary }]}>{dashboardStats.totalMedications}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={styles.statLabel}>Adherence Rate</Text>
                </View>
                <Text style={styles.statValue}>{dashboardStats.adherenceRate}%</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons name="time" size={20} color={theme.warning} />
                  <Text style={styles.statLabel}>Today&apos;s Doses</Text>
                </View>
                <Text style={styles.statValue}>{dashboardStats.upcomingDoses}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statItem, dashboardStats.missedDoses > 0 && styles.alertStat]}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons 
                    name="alert-circle" 
                    size={20} 
                    color={dashboardStats.missedDoses > 0 ? theme.error : "#6B7280"} 
                  />
                  <Text style={styles.statLabel}>Missed Doses</Text>
                </View>
                <Text style={[
                  styles.statValue,
                  dashboardStats.missedDoses > 0 && styles.alertValue
                ]}>
                  {dashboardStats.missedDoses}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Medications */}
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Medications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Medications')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.medicationsList}>
            {todaysMedications && todaysMedications.length > 0 ? (
              todaysMedications.slice(0, 3).map((medication, index) => (
                <TouchableOpacity 
                  key={medication.id} 
                  style={[
                    styles.medicationCard,
                    index === Math.min(todaysMedications.length - 1, 2) && styles.lastMedicationCard
                  ]}
                >
                  <View style={styles.medicationHeader}>
                    <View style={[styles.medicationIcon, { backgroundColor: theme.primaryLight }]}>
                      <Image 
                        source={require('../../../assets/images/patientmedication.png')} 
                        style={styles.medicineicon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{medication.name}</Text>
                      <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.takeButton, { backgroundColor: theme.success }]}
                      onPress={() => checkTimingAndShowModal(medication)}
                    >
                      <Text style={styles.takeButtonText}>Take</Text>
                    </TouchableOpacity>
                  </View>
                  {medication.instructions && (
                    <Text style={styles.medicationInstructions}>{medication.instructions}</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyMedicationCard}>
                <Ionicons name="medical-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyMedicationText}>No medications for today</Text>
                <Text style={styles.emptyMedicationSubtext}>Your daily medications will appear here</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('Scanner')}
              activeOpacity={0.7}
            >
              <Ionicons name="scan" size={24} color={theme.primary} />
              <Text style={styles.actionText}>Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('MealSettings')}
              activeOpacity={0.7}
            >
              <Ionicons name="time" size={24} color={theme.primary} />
              <Text style={styles.actionText}>Meal Times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.sosCard]} 
              onPress={() => navigation.navigate('SOS')}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle" size={24} color={theme.error} />
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => setShowActivityModal(true)}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivities.length > 0 ? (
              recentActivities.slice(0,5).map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index === recentActivities.length - 1 && styles.lastActivityItem
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.activityIconContainer,
                    { backgroundColor: getActivityColor(activity.priority) + '15' }
                  ]}>
                    <Ionicons
                      name={getActivityIcon(activity.type)}
                      size={18}
                      color={getActivityColor(activity.priority)}
                    />
                  </View>
                  
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityMedication}>{activity.medicationName}</Text>
                      <Text style={styles.activityTime}>{formatRelativeTime(activity.timestamp)}</Text>
                    </View>
                    <Text style={styles.activityMessage}>{activity.message}</Text>
                  </View>
                  
                  {activity.priority === 'high' && (
                    <View style={styles.highPriorityIndicator} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyActivityCard}>
                <Ionicons name="time-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyActivityText}>No recent activities</Text>
                <Text style={styles.emptyActivitySubtext}>Your medication activities will appear here</Text>
              </View>
            )}
          </View>
        </View>

        {/* Adherence Alert */}
        {dashboardStats.adherenceRate < 80 && (
          <TouchableOpacity style={styles.adherenceAlert} activeOpacity={0.8}
          onPress={() => setShowAdherenceModal(true)}  
          >
            <View style={styles.adherenceContent}>
              <Ionicons name="warning" size={20} color={theme.warning} />
              <View style={styles.adherenceText}>
                <Text style={styles.adherenceTitle}>Improve Your Adherence</Text>
                <Text style={styles.adherenceMessage}>
                  Your medication adherence is {dashboardStats.adherenceRate}%. Try to maintain above 80% for better health outcomes.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.warning} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Activity Modal */}
      <ActivityModal />
      {showDoseModal && (
  <Modal
    visible={showDoseModal}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowDoseModal(false)}
  >
    <View style={simpleModalStyles.overlay}>
      <View style={simpleModalStyles.container}>
        {/* Header with enhanced safety info */}
        <View style={simpleModalStyles.header}>
          <Text style={simpleModalStyles.title}>
            {isRightTime ? '🟢 Safe to Take' : '🔴 Safety Warning'}
          </Text>
          {timingInfo?.warnings && timingInfo.warnings.length > 0 && (
            <View style={simpleModalStyles.warningsContainer}>
              {timingInfo.warnings.map((warning: string, index: number) => (
                <Text key={index} style={simpleModalStyles.warningText}>
                  ⚠️ {warning}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Medication Info */}
        <View style={simpleModalStyles.medicationInfo}>
          <Text style={simpleModalStyles.medicationName}>{selectedMedication?.name}</Text>
          <Text style={simpleModalStyles.medicationDosage}>
            {selectedMedication?.dosage} {selectedMedication?.dosageUnit}
          </Text>
        </View>

        {/* Enhanced Message */}
        <Text style={simpleModalStyles.message}>
          {isRightTime 
            ? 'It\'s safe to take this medication now'
            : timingInfo?.reason || 'Please check timing before taking this medication'
          }
        </Text>

        {/* Next dose info if not right time */}
        {!isRightTime && timingInfo?.hoursRemaining && (
          <Text style={simpleModalStyles.nextDoseInfo}>
            Next dose available in {timingInfo.hoursRemaining} hours
          </Text>
        )}

        {/* Buttons */}
        <View style={simpleModalStyles.buttonContainer}>
          <TouchableOpacity
            style={simpleModalStyles.cancelButton}
            onPress={() => setShowDoseModal(false)}
          >
            <Text style={simpleModalStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {isRightTime ? (
            <TouchableOpacity
              style={simpleModalStyles.takeButton}
              onPress={() => {
                setShowDoseModal(false);
                const medicationId = selectedMedication?.id || selectedMedication?._id;
                if (medicationId) {
                  handleDoseTaken(medicationId, false); // No override needed
                }
              }}
            >
              <Text style={simpleModalStyles.takeButtonText}>Take {'\n'} Medication</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={simpleModalStyles.scanButton}
                onPress={() => {
                  setShowDoseModal(false);
                  navigation.navigate('Scanner');
                }}
              >
                <Text style={simpleModalStyles.scanButtonText}>Scan {'\n'} Barcode</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={simpleModalStyles.overrideButton}
                onPress={() => {
                  setShowDoseModal(false);
                  const medicationId = selectedMedication?.id || selectedMedication?._id;
                  if (medicationId) {
                    showSafetyWarningModal(timingInfo, medicationId);
                  }
                }}
              >
                <Text style={simpleModalStyles.overrideButtonText}>Take Anyway</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  </Modal>
      )}

      {/* Adherence Tips Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showAdherenceModal}
  onRequestClose={() => setShowAdherenceModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.adherenceModalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Tips to Improve Adherence</Text>
        <TouchableOpacity 
          onPress={() => setShowAdherenceModal(false)}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
        {adherenceTips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name={tip.icon as any} size={20} color={theme.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.modalButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowAdherenceModal(false)}
      >
        <Text style={styles.modalButtonText}>Got it!</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</View>
  );
};

const simpleModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  medicationInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#64748B',
  },
  messageContainer: {
    marginBottom: 24,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  takeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  takeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scanButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  warningsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 4,
  },
  nextDoseInfo: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  overrideButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    marginLeft: 6,
  },
  overrideButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
    

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
    marginTop: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  greetingContainer: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[10],
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    flex: 1,
  },
  greetingIcon: {
    marginLeft: SPACING[4],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: SPACING[1],
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[2],
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING[2],
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  statsSection: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[5],
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING[3],
    gap: SPACING[3],
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  primaryStat: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  alertStat: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
    gap: SPACING[2],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
  },
  alertValue: {
    color: '#EF4444',
  },
  medicationsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  medicationsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicationCard: {
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastMedicationCard: {
    borderBottomWidth: 0,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicationDosage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginTop: 2,
  },
  takeButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.md,
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  medicationInstructions: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginTop: SPACING[2],
    fontStyle: 'italic',
  },
  emptyMedicationCard: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[5],
  },
  emptyMedicationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#64748B',
    marginTop: SPACING[3],
    marginBottom: SPACING[1],
  },
  emptyMedicationSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[2],
  },
  sosCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  activitySection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 120,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  activityMedication: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  activityTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
  },
  activityMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    lineHeight: 18,
  },
  humanIcon: {
    height:74,
    width:74,
    borderRadius: RADIUS.full
  },
  highPriorityIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  emptyActivityCard: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[5],
  },
  emptyActivityText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#64748B',
    marginTop: SPACING[3],
    marginBottom: SPACING[1],
  },
  medIcon:{
    height:24,
    width:24,
    borderRadius: RADIUS.full
  },
  emptyActivitySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
  },
  adherenceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: SPACING[6],
  },
  adherenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[3],
  },
  adherenceText: {
    flex: 1,
  },
  adherenceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: SPACING[1],
  },
  adherenceMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#92400E',
    lineHeight: 18,
  },
  // Modal styles
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
    ...Platform.select({
      ios: {
        paddingTop: SPACING[12],
      },
      android: {
        paddingTop: SPACING[6],
      },
    }),
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  medicineicon:{
    height:36,
    width:36,
    borderRadius: RADIUS.full
  },
  modalScrollContent: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[5],
  },
  modalActivityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: height * 0.6,
  },
  modalActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastModalActivityItem: {
    borderBottomWidth: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[6],
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#64748B',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adherenceModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalBody: {
    maxHeight: 400,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default HomeScreen;