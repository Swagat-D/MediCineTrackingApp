// src/screens/patient/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  fetchDashboardData, 
  logMedicationTaken,
  fetchNotifications,
  setConnectionStatus,
  updateDashboardData,
  clearError
} from '../../store/slices/patientSlice';
import { patientRealtimeService } from '../../services/api/patientAPI';
import { useFocusEffect } from '@react-navigation/native';


import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientNavbar from '../../components/common/PatientNavbar';

interface Props {
  navigation: any; 
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { 
    dashboardStats,
    todaysMedications,
    upcomingReminders,
    isDashboardLoading,
    dashboardError,
    isConnected,
    unreadNotificationCount
  } = useAppSelector(state => state.patient);
  const { user } = useAppSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  // Initialize data and real-time connection
  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        try {
          // Fetch initial data
          await dispatch(fetchDashboardData()).unwrap();
          await dispatch(fetchNotifications({})).unwrap();
          
          // Setup real-time connection
          if (user?.id) {
            patientRealtimeService.connect(user.id, (data) => {
              dispatch(updateDashboardData(data));
            });
            dispatch(setConnectionStatus(true));
          }
        } catch (error) {
          console.error('Failed to initialize dashboard:', error);
        }
      };

      initializeData();

      // Cleanup on unmount
      return () => {
        patientRealtimeService.disconnect();
        dispatch(setConnectionStatus(false));
      };
    }, [dispatch, user?.id])
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchDashboardData()).unwrap();
      await dispatch(fetchNotifications({})).unwrap();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle medication dose taken
  const handleDoseTaken = async (medicationId: string) => {
    try {
      await dispatch(logMedicationTaken({
        medicationId,
        data: {
          takenAt: new Date().toISOString(),
          notes: 'Taken via home screen'
        }
      })).unwrap();
      
      Alert.alert(
        'Dose Recorded',
        'Your medication dose has been logged successfully.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error || 'Failed to log medication dose',
        [{ text: 'OK' }]
      );
    }
  };

  // Show error if needed
  useEffect(() => {
    if (dashboardError) {
      Alert.alert(
        'Error',
        dashboardError,
        [
          { text: 'Retry', onPress: () => dispatch(fetchDashboardData()) },
          { text: 'OK', onPress: () => dispatch(clearError()) }
        ]
      );
    }
  }, [dashboardError, dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate stats from real data
  const getTodayStats = () => {
    if (!dashboardStats) {
      return { totalDoses: 0, takenDoses: 0, adherenceRate: 0 };
    }
    
    return {
      totalDoses: dashboardStats.totalMedications,
      takenDoses: dashboardStats.activeMedications,
      adherenceRate: dashboardStats.adherenceRate
    };
  };

  const { totalDoses, takenDoses, adherenceRate } = getTodayStats();

  // Loading state
  if (isDashboardLoading && !dashboardStats) {
    return (
      <View style={styles.container}>
        <PatientNavbar
          onNotificationPress={() => navigation.navigate('Notifications')}
          onSOSPress={() => navigation.navigate('SOS')}
          notificationCount={unreadNotificationCount}
        />
        <View style={[styles.scrollView, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 16, color: '#64748B' }}>Loading your dashboard...</Text>
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
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <LinearGradient
          colors={['#EBF4FF', '#FFFFFF']}
          style={styles.greetingContainer}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
              <Text style={styles.subtitle}>How are you feeling today?</Text>
              {/* Connection status */}
              <View style={styles.connectionStatus}>
                <View style={[
                  styles.connectionDot, 
                  { backgroundColor: isConnected ? '#059669' : '#EF4444' }
                ]} />
                <Text style={styles.connectionText}>
                  {isConnected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
            <View style={styles.greetingIcon}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart" size={28} color="#2563EB" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Medication Adherence</Text>
                <Text style={styles.progressSubtitle}>
                  {takenDoses} of {totalDoses} doses taken
                </Text>
              </View>
              <View style={[styles.adherenceCircle, { borderColor: adherenceRate >= 80 ? '#059669' : '#F59E0B' }]}>
                <Text style={[styles.adherenceText, { color: adherenceRate >= 80 ? '#059669' : '#F59E0B' }]}>
                  {adherenceRate}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0}%`,
                    backgroundColor: adherenceRate >= 80 ? '#059669' : '#F59E0B'
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Today's Medications */}
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Medications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MedicationList')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.medicationsList}>
            {todaysMedications && todaysMedications.length > 0 ? (
              todaysMedications.map((medication) => (
                <TouchableOpacity
                  key={medication.id}
                  style={styles.medicationCard}
                  onPress={() => navigation.navigate('MedicationList')}
                  activeOpacity={0.7}
                >
                  <View style={styles.medicationHeader}>
                    <View style={[styles.medicationIcon, { backgroundColor: medication.color + '20' }]}>
                      <Ionicons name="medical" size={20} color={medication.color} />
                    </View>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{medication.name}</Text>
                      <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                    </View>
                    <View style={styles.medicationStatus}>
                      <Text style={styles.nextDoseText}>Next: {medication.nextDoseTime}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.doseTimes}>
                    {medication.times.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.doseTime}
                        onPress={() => !medication.taken[index] && handleDoseTaken(medication.id)}
                        disabled={medication.taken[index]}
                      >
                        <View style={[
                          styles.doseIndicator,
                          { backgroundColor: medication.taken[index] ? '#059669' : '#E2E8F0' }
                        ]}>
                          <Ionicons 
                            name={medication.taken[index] ? "checkmark" : "time-outline"} 
                            size={12} 
                            color={medication.taken[index] ? "#FFFFFF" : "#6B7280"} 
                          />
                        </View>
                        <Text style={[
                          styles.doseTimeText,
                          { color: medication.taken[index] ? '#059669' : '#6B7280' }
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={styles.medicationInstructions}>{medication.instructions}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyMedicationsCard}>
                <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyMedicationsTitle}>No medications for today</Text>
                <Text style={styles.emptyMedicationsText}>
                  Your daily medications will appear here once your caregiver adds them
                </Text>
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
              onPress={() => navigation.navigate('BarcodeScanner')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="scan" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionText}>Scan Medication</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MealSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="time" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionText}>Meal Times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SOS')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Reminders */}
        <View style={styles.remindersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          </View>
          
          <View style={styles.remindersList}>
            {upcomingReminders && upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderIcon}>
                    <Ionicons name="alarm" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderMedication}>{reminder.medicationName}</Text>
                    <Text style={styles.reminderDetails}>{reminder.dosage} at {reminder.time}</Text>
                  </View>
                  {reminder.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="warning" size={14} color="#F59E0B" />
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyRemindersCard}>
                <Ionicons name="alarm-outline" size={32} color="#D1D5DB" />
                <Text style={styles.emptyRemindersText}>No upcoming reminders</Text>
              </View>
            )}
          </View>
        </View>

        {/* Health Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Today&apos;s Health Tip</Text>
              <Text style={styles.tipText}>
                Take your medications at the same time each day to build a routine and improve adherence.
              </Text>
            </View>
          </View>
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
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Added missing styles for connection status
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[2],
    marginBottom: SPACING[1],
    gap: SPACING[2],
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING[1],
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  progressSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[2],
  },
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  progressSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  adherenceCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
    color: '#2563EB',
    fontWeight: '600',
  },
  medicationsList: {
    gap: SPACING[3],
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
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
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  medicationStatus: {
    alignItems: 'flex-end',
  },
  nextDoseText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#2563EB',
    fontWeight: '600',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  doseTimes: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  doseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  doseIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doseTimeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
  },
  medicationInstructions: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontStyle: 'italic',
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
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  remindersSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  remindersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reminderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  reminderContent: {
    flex: 1,
  },
  reminderMedication: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  reminderDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  urgentBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: SPACING[1],
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#A16207',
    lineHeight: 20,
  },
  emptyMedicationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[3],
  },
  emptyMedicationsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#64748B',
    marginTop: SPACING[3],
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  emptyMedicationsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: SPACING[1],
  },
  emptyRemindersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[3],
  },
  emptyRemindersText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: SPACING[2],
  },
});

export default HomeScreen;