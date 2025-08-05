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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

// Redux
import { useAppDispatch, useAppSelector } from '../../store';

const { width } = Dimensions.get('window');

type Props = CaregiverStackScreenProps<'Dashboard'>;

interface DashboardStats {
  totalPatients: number;
  activeMedications: number;
  upcomingReminders: number;
  criticalAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'new_patient' | 'low_stock' | 'sos_alert';
  patientName: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 12,
    activeMedications: 48,
    upcomingReminders: 8,
    criticalAlerts: 2,
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'dose_taken',
      patientName: 'John Smith',
      message: 'Took Aspirin 100mg as scheduled',
      timestamp: '2 minutes ago',
      priority: 'low',
    },
    {
      id: '2',
      type: 'sos_alert',
      patientName: 'Mary Johnson',
      message: 'Emergency alert triggered',
      timestamp: '15 minutes ago',
      priority: 'critical',
    },
    {
      id: '3',
      type: 'dose_missed',
      patientName: 'Robert Davis',
      message: 'Missed morning medication',
      timestamp: '1 hour ago',
      priority: 'high',
    },
    {
      id: '4',
      type: 'low_stock',
      patientName: 'Sarah Wilson',
      message: 'Metformin running low (2 days left)',
      timestamp: '2 hours ago',
      priority: 'medium',
    },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API calls to fetch dashboard data
      // const stats = await caregiverAPI.getDashboardStats();
      // const activities = await caregiverAPI.getRecentActivities();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'dose_taken':
        return 'checkmark-circle';
      case 'dose_missed':
        return 'alert-circle';
      case 'new_patient':
        return 'person-add';
      case 'low_stock':
        return 'warning';
      case 'sos_alert':
        return 'alert';
      default:
        return 'information-circle';
    }
  };

  const getActivityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'critical':
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.primary[500];
      case 'low':
        return COLORS.success;
      default:
        return COLORS.gray[500];
    }
  };

  const renderStatsCard = (
    title: string,
    value: number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.statsCard, { backgroundColor: color + '10' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statsCardContent}>
        <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.statsValue, { color }]}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: RecentActivity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityItem}
      activeOpacity={0.8}
    >
      <View style={[
        styles.activityIcon,
        { backgroundColor: getActivityColor(activity.priority) + '20' }
      ]}>
        <Ionicons
          name={getActivityIcon(activity.type)}
          size={20}
          color={getActivityColor(activity.priority)}
        />
      </View>
      
      <View style={styles.activityContent}>
        <Text style={styles.activityPatient}>{activity.patientName}</Text>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.timestamp}</Text>
      </View>
      
      <View style={[
        styles.priorityIndicator,
        { backgroundColor: getActivityColor(activity.priority) }
      ]} />
    </TouchableOpacity>
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
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Caregiver'}</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.background} />
                {dashboardStats.criticalAlerts > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{dashboardStats.criticalAlerts}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={24} color={COLORS.background} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatsCard(
              'Total Patients',
              dashboardStats.totalPatients,
              'people',
              COLORS.primary[500],
              () => navigation.navigate('Patients')
            )}
            {renderStatsCard(
              'Active Medications',
              dashboardStats.activeMedications,
              'medical',
              COLORS.secondary[500]
            )}
          </View>
          
          <View style={styles.statsRow}>
            {renderStatsCard(
              'Upcoming Reminders',
              dashboardStats.upcomingReminders,
              'time',
              COLORS.warning
            )}
            {renderStatsCard(
              'Critical Alerts',
              dashboardStats.criticalAlerts,
              'alert-circle',
              COLORS.error
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AddPatient')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary[100] }]}>
                <Ionicons name="person-add" size={28} color={COLORS.primary[500]} />
              </View>
              <Text style={styles.quickActionText}>Add Patient</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('BarcodeGenerator')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary[100] }]}>
                <Ionicons name="qr-code" size={28} color={COLORS.secondary[500]} />
              </View>
              <Text style={styles.quickActionText}>Generate Barcode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Patients')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="list" size={28} color={COLORS.warning} />
              </View>
              <Text style={styles.quickActionText}>View All Patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivities.map(renderActivityItem)}
          </View>
        </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.background,
    opacity: 0.9,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginTop: SPACING[1],
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: SPACING[6],
    marginTop: -SPACING[4],
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[4],
  },
  statsCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    ...SHADOWS.md,
  },
  statsCardContent: {
    alignItems: 'center',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  statsValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING[6],
    marginTop: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  activityContainer: {
    paddingHorizontal: SPACING[6],
    marginTop: SPACING[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[500],
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    position: 'relative',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  activityContent: {
    flex: 1,
  },
  activityPatient: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  activityMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[1],
  },
  activityTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.hint,
  },
  priorityIndicator: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    position: 'absolute',
    right: SPACING[4],
  },
});

export default DashboardScreen;