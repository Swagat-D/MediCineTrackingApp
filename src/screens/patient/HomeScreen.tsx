import React, { useState, useCallback } from 'react';
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
  setDashboardLoading, 
  setDashboardData, 
  setNotifications,
  setConnectionStatus,
  setError 
} from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
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
    isDashboardLoading,
    isConnected,
    unreadNotificationCount
  } = useAppSelector(state => state.patient);
  const { user } = useAppSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadData = async () => {
    dispatch(setDashboardLoading(true));
    try {
      const [dashboardData, notificationsData] = await Promise.all([
        patientAPI.getDashboardData(),
        patientAPI.getNotifications()
      ]);
      
      dispatch(setDashboardData(dashboardData));
      dispatch(setNotifications(notificationsData));
      dispatch(setConnectionStatus(true));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setConnectionStatus(false));
    } finally {
      dispatch(setDashboardLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDoseTaken = async (medicationId: string) => {
    try {
      await patientAPI.logMedicationTaken(medicationId, {
        takenAt: new Date().toISOString(),
        notes: 'Taken via home screen'
      });
      
      Alert.alert('Success', 'Dose recorded successfully');
      loadData(); // Refresh data
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isDashboardLoading && !dashboardStats) {
    return (
      <View style={styles.container}>
        <PatientNavbar
          onNotificationPress={() => navigation.navigate('Notifications')}
          onSOSPress={() => navigation.navigate('SOS')}
          notificationCount={unreadNotificationCount}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
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
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {/* Greeting Section */}
        <LinearGradient colors={['#EBF4FF', '#FFFFFF']} style={styles.greetingContainer}>
          <View style={styles.greetingContent}>
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
              <Text style={styles.subtitle}>How are you feeling today?</Text>
              <View style={styles.connectionStatus}>
                <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#059669' : '#EF4444' }]} />
                <Text style={styles.connectionText}>
                  {isConnected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Card */}
        {dashboardStats && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Medication Adherence</Text>
                  <Text style={styles.progressSubtitle}>
                    {dashboardStats.activeMedications} of {dashboardStats.totalMedications} medications
                  </Text>
                </View>
                <View style={styles.adherenceCircle}>
                  <Text style={styles.adherenceText}>{dashboardStats.adherenceRate}%</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Today's Medications */}
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Medications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Medications')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {todaysMedications.length > 0 ? (
            todaysMedications.map((medication) => (
              <TouchableOpacity key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationIcon}>
                    <Ionicons name="medical" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.takeButton}
                    onPress={() => handleDoseTaken(medication.id)}
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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No medications for today</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Scanner')}>
              <Ionicons name="scan" size={24} color="#2563EB" />
              <Text style={styles.actionText}>Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MealSettings')}>
              <Ionicons name="time" size={24} color="#2563EB" />
              <Text style={styles.actionText}>Meal Times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, styles.sosCard]} onPress={() => navigation.navigate('SOS')}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
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
  greetingContainer: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
    paddingTop: SPACING[10],
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: SPACING[1],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
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
  progressSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginTop: SPACING[1],
  },
  adherenceCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adherenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: '#2563EB',
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
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF4FF',
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
    backgroundColor: '#059669',
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  quickActionsSection: {
    paddingHorizontal: SPACING[5],
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
  },
  sosCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
    marginTop: SPACING[2],
  },
});

export default HomeScreen;