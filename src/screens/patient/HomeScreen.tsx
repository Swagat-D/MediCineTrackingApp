// src/screens/patient/HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../store';

import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientNavbar from '../../components/common/PatientNavbar';

interface TodayMedication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  taken: boolean[];
  nextDoseTime: string;
  instructions: string;
  color: string;
}

interface UpcomingReminder {
  id: string;
  medicationName: string;
  time: string;
  dosage: string;
  isUrgent: boolean;
}

interface Props {
  navigation: any; 
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  
  const [todaysMedications] = useState<TodayMedication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      times: ['08:00', '20:00'],
      taken: [true, false],
      nextDoseTime: '20:00',
      instructions: 'Take with food',
      color: '#3B82F6',
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      times: ['08:00'],
      taken: [true],
      nextDoseTime: 'Tomorrow 08:00',
      instructions: 'Take on empty stomach',
      color: '#059669',
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      times: ['22:00'],
      taken: [false],
      nextDoseTime: '22:00',
      instructions: 'Take before bed',
      color: '#8B5CF6',
    },
  ]);

  const [upcomingReminders] = useState<UpcomingReminder[]>([
    {
      id: '1',
      medicationName: 'Atorvastatin',
      time: '22:00',
      dosage: '20mg',
      isUrgent: false,
    },
    {
      id: '2',
      medicationName: 'Metformin',
      time: '08:00 Tomorrow',
      dosage: '500mg',
      isUrgent: false,
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTodayStats = () => {
    const totalDoses = todaysMedications.reduce((total, med) => total + med.times.length, 0);
    const takenDoses = todaysMedications.reduce((total, med) => 
      total + med.taken.filter(Boolean).length, 0);
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    return { totalDoses, takenDoses, adherenceRate };
  };

  const { totalDoses, takenDoses, adherenceRate } = getTodayStats();

  return (
    <View style={styles.container}>
      <PatientNavbar
        onNotificationPress={() => navigation.navigate('Notifications')}
        onSOSPress={() => navigation.navigate('SOS')}
        notificationCount={2}
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
                    width: `${(takenDoses / totalDoses) * 100}%`,
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
            {todaysMedications.map((medication) => (
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
                    <View key={index} style={styles.doseTime}>
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
                    </View>
                  ))}
                </View>
                
                <Text style={styles.medicationInstructions}>{medication.instructions}</Text>
              </TouchableOpacity>
            ))}
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
            {upcomingReminders.map((reminder) => (
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
            ))}
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
});

export default HomeScreen;