/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, RootState,AppDispatch } from '../../store';
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import CaregiverNavbar from '../../components/common/CaregiverNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { loadDashboardWithCache, refreshDashboard } from '../../store/slices/caregiverSlice';

const { width, height } = Dimensions.get('window');

type Props = CaregiverStackScreenProps<'Dashboard'>;

interface RecentActivity {
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'low_stock' | 'sos_alert';
  patientName: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
const {
  dashboardStats,
  recentActivities,
} = useSelector((state: RootState) => state.caregiver);

  const onRefresh = async () => {
  setRefreshing(true);
  try {
    await dispatch(refreshDashboard()).unwrap();
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
  } finally {
    setRefreshing(false);
  }
};

  useEffect(() => {
    dispatch(loadDashboardWithCache());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      case 'low_stock': return 'warning';
      case 'sos_alert': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#059669';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

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
            <Text style={styles.modalSubtitle}>Last 7 days</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowActivityModal(false)}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
        <ScrollView>
          <View style={styles.modalActivityList}>
            {recentActivities.slice(0,12).map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.modalActivityItem,
                  index === recentActivities.length - 1 && styles.lastModalActivityItem
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (activity.type === 'sos_alert') {
                    setShowActivityModal(false);
                    navigation.navigate('PatientDetails', { patientId: activity.id });
                  }
                }}
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
                    <Text style={styles.activityPatient}>{activity.patientName}</Text>
                    <Text style={styles.activityTime}>{activity.timestamp}</Text>
                  </View>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                </View>
                
                {activity.priority === 'critical' && (
                  <View style={styles.criticalIndicator} />
                )}
              </TouchableOpacity>
            ))}
            
            {recentActivities.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyStateText}>No recent activities</Text>
                <Text style={styles.emptyStateSubtext}>Activities will appear here as they happen</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CaregiverNavbar
        onNotificationPress={() => navigation.navigate('Notifications')}
        notificationCount={dashboardStats?.criticalAlerts || 0}
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
        {/* Enhanced Greeting Section */}
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.greetingContainer}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Caregiver'}</Text>
              <Text style={styles.subtitle}>Here&apos;s your patient overview for today</Text>
            </View>
            <View style={styles.greetingIcon}>
                <Image 
                  source={require('../../../assets/images/caregiver.png')} 
                  style={styles.caregiverIcon}
                  resizeMode="contain"
                />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statItem, styles.primaryStat]}
              onPress={() => navigation.navigate('Patients')}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons name="people" size={20} color="#059669" />
                  <Text style={styles.statLabel}>Total Patients</Text>
                </View>
                <Text style={styles.statValue}>{dashboardStats?.totalPatients || 0}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Image 
                  source={require('../../../assets/images/tablet.png')} 
                  style={styles.medicineIcon}
                  resizeMode="contain"
                />
                  <Text style={styles.statLabel}>Medications</Text>
                </View>
                <Text style={styles.statValue}>{dashboardStats?.activeMedications || 0}</Text>
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
                  <Ionicons name="time" size={20} color="#F59E0B" />
                  <Text style={styles.statLabel}>Reminders</Text>
                </View>
                <Text style={styles.statValue}>{dashboardStats?.todayReminders || 0}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statItem, dashboardStats.criticalAlerts > 0 && styles.alertStat]}
              activeOpacity={0.7}
            >
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Ionicons 
                    name="alert-circle" 
                    size={20} 
                    color={dashboardStats.criticalAlerts > 0 ? "#EF4444" : "#6B7280"} 
                  />
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>
                <Text style={[
                  styles.statValue,
                  dashboardStats.criticalAlerts > 0 && styles.alertValue
                ]}>
                  {dashboardStats?.criticalAlerts || 0}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddPatient')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={24} color="#059669" />
              <Text style={styles.actionText}>Add Patient</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BarcodeGenerator')}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={24} color="#059669" />
              <Text style={styles.actionText}>Generate Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Patients')}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={24} color="#059669" />
              <Text style={styles.actionText}>All Patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => setShowActivityModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivities.slice(0, 5).map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  index === recentActivities.length - 1 && styles.lastActivityItem
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (activity.type === 'sos_alert') {
                    navigation.navigate('PatientDetails', { patientId: activity.id });
                  }
                }}
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
                    <Text style={styles.activityPatient}>{activity.patientName}</Text>
                    <Text style={styles.activityTime}>{activity.timestamp}</Text>
                  </View>
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                </View>
                
                {activity.priority === 'critical' && (
                  <View style={styles.criticalIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Alert */}
        {dashboardStats.criticalAlerts > 0 && (
          <TouchableOpacity style={styles.emergencyAlert} activeOpacity={0.8}>
            <View style={styles.emergencyContent}>
              <Ionicons name="warning" size={20} color="#EF4444" />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Emergency Attention Required</Text>
                <Text style={styles.emergencyMessage}>
                  {dashboardStats.criticalAlerts} critical alert{dashboardStats.criticalAlerts > 1 ? 's' : ''} need immediate attention
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Activity Modal */}
      <ActivityModal />
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
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  caregiverIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full
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
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  activityPatient: {
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
  criticalIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  emergencyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: SPACING[6],
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[3],
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: SPACING[1],
  },
  emergencyMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#B91C1C',
    lineHeight: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  medicineIcon: {
    height:24,
    width:24
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
});

export default DashboardScreen;