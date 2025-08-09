// src/screens/patient/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PatientTabParamList } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchDashboardData, fetchNotifications } from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import { useFocusEffect } from '@react-navigation/native';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientNavbar from '../../components/common/PatientNavbar';

type Props = BottomTabScreenProps<PatientTabParamList, 'Profile'>;

interface ProfileStats {
  totalMedications: number;
  adherenceRate: number;
  daysTracked: number;
  caregiverConnected: boolean;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { 
    dashboardStats,
    unreadNotificationCount,
    isConnected
  } = useAppSelector(state => state.patient);
  
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalMedications: 0,
    adherenceRate: 0,
    daysTracked: 0,
    caregiverConnected: false,
  });
  const [caregivers, setCaregivers] = useState<any[]>([]);

  // Load profile data
  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          // Refresh dashboard data
          await dispatch(fetchDashboardData()).unwrap();
          await dispatch(fetchNotifications({})).unwrap();
          
          // Load caregivers
          const caregiversData = await patientAPI.getCaregivers();
          setCaregivers(caregiversData);
        } catch (error) {
          console.error('Failed to load profile data:', error);
        }
      };

      loadProfileData();
    }, [dispatch])
  );

  // Update profile stats when dashboard data changes
  useEffect(() => {
    if (dashboardStats) {
      setProfileStats({
        totalMedications: dashboardStats.totalMedications,
        adherenceRate: dashboardStats.adherenceRate,
        daysTracked: 45, // This would come from user data
        caregiverConnected: caregivers.length > 0,
      });
    }
  }, [dashboardStats, caregivers]);

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Health Data',
        'Choose the format for your health data export:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'PDF Report',
            onPress: async () => {
              try {
                const result = await patientAPI.exportHealthData('pdf', {
                  includePersonalInfo: true,
                  includeMedications: true,
                  includeLogs: true,
                  includeAdherence: true
                });
                Alert.alert('Export Ready', `Your data has been exported. File: ${result.fileName}`);
              } catch (error: any) {
                Alert.alert('Export Failed', error || 'Failed to export data');
              }
            }
          },
          {
            text: 'CSV Data',
            onPress: async () => {
              try {
                const result = await patientAPI.exportHealthData('csv', {
                  includePersonalInfo: false,
                  includeMedications: true,
                  includeLogs: true,
                  includeAdherence: true
                });
                Alert.alert('Export Ready', `Your data has been exported. File: ${result.fileName}`);
              } catch (error: any) {
                Alert.alert('Export Failed', error || 'Failed to export data');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle notification settings
  const handleNotificationSettings = async () => {
    try {
      const settings = await patientAPI.getNotificationSettings();
      
      Alert.alert(
        'Notification Settings',
        `Current Settings:\n• Medication Reminders: ${settings.medicationReminders ? 'On' : 'Off'}\n• Refill Reminders: ${settings.refillReminders ? 'On' : 'Off'}\n• Adherence Alerts: ${settings.adherenceAlerts ? 'On' : 'Off'}\n• SOS Alerts: ${settings.sosAlerts ? 'On' : 'Off'}`,
        [
          { text: 'OK' },
          { text: 'Change Settings', onPress: () => navigation.navigate('Settings') }
        ]
      );
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to load notification settings');
    }
  };

  // Handle caregiver management
  const handleCaregiverManagement = () => {
    const caregiverNames = caregivers.map(c => c.name).join(', ');
    
    Alert.alert(
      'Connected Caregivers',
      caregivers.length > 0 ? 
        `You are connected to: ${caregiverNames}` : 
        'No caregivers connected',
      [
        { text: 'OK' },
        ...(caregivers.length > 0 ? [{
          text: 'Manage Connections',
          onPress: () => {
            Alert.alert('Caregiver Management', 'This feature allows you to manage your caregiver connections');
          }
        }] : [{
          text: 'Connect Caregiver',
          onPress: () => {
            Alert.prompt(
              'Connect to Caregiver',
              'Enter your caregiver\'s email address:',
              async (email) => {
                if (email) {
                  try {
                    await patientAPI.requestCaregiverConnection(email, 'Connection request from patient');
                    Alert.alert('Request Sent', 'Connection request sent to caregiver');
                  } catch (error: any) {
                    Alert.alert('Request Failed', error || 'Failed to send connection request');
                  }
                }
              },
              'plain-text'
            );
          }
        }])
      ]
    );
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View style={[
        styles.connectionDot, 
        { backgroundColor: isConnected ? '#059669' : '#EF4444' }
      ]} />
      <Text style={styles.connectionText}>
        {isConnected ? 'All data synced' : 'Some data may be outdated'}
      </Text>
    </View>
  );

  // Profile section component
  const ProfileSection = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: {
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      subtitle?: string;
      onPress: () => void;
      showBadge?: boolean;
      badgeColor?: string;
    }[];
  }) => (
    <View style={styles.profileSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.profileItem,
              index === items.length - 1 && styles.profileItemLast
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.profileItemLeft}>
              <View style={[
                styles.profileItemIcon,
                item.showBadge && { backgroundColor: item.badgeColor + '20' }
              ]}>
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={item.showBadge ? item.badgeColor : '#64748B'} 
                />
              </View>
              <View style={styles.profileItemContent}>
                <View style={styles.profileItemTitleRow}>
                  <Text style={styles.profileItemTitle}>{item.title}</Text>
                  {item.showBadge && (
                    <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                      <Text style={styles.badgeText}>•</Text>
                    </View>
                  )}
                </View>
                {item.subtitle && (
                  <Text style={styles.profileItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Health management items
  const healthManagementItems = [
    {
      icon: 'medical-outline' as keyof typeof Ionicons.glyphMap,
      title: 'My Medications',
      subtitle: `${profileStats.totalMedications} active prescriptions`,
      onPress: () => navigation.navigate('Medications'),
    },
    {
      icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Meal Settings',
      subtitle: 'Configure meal times for medication timing',
      onPress: () => navigation.navigate('MealSettings'),
    },
    {
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Medical History',
      subtitle: 'View medication logs and history',
      onPress: handleExportData,
    },
    {
      icon: 'stats-chart-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Adherence Report',
      subtitle: `${profileStats.adherenceRate}% current adherence rate`,
      onPress: () => Alert.alert('Adherence Report', 'Detailed adherence analytics would be shown here'),
    },
  ];

  // Care team items
  const careTeamItems = [
    {
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Connected Caregivers',
      subtitle: caregivers.length > 0 ? 
        `${caregivers.length} caregiver${caregivers.length > 1 ? 's' : ''} connected` : 
        'No caregivers connected',
      onPress: handleCaregiverManagement,
      showBadge: caregivers.length > 0,
      badgeColor: '#059669',
    },
    {
      icon: 'call-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Emergency Contacts',
      subtitle: 'Manage emergency contact information',
      onPress: () => navigation.navigate('SOS'),
    },
  ];

  // Settings items
  const settingsItems = [
    {
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Notifications',
      subtitle: `${unreadNotificationCount} unread notifications`,
      onPress: handleNotificationSettings,
      showBadge: unreadNotificationCount > 0,
      badgeColor: '#F59E0B',
    },
    {
      icon: 'shield-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: () => Alert.alert('Privacy Settings', 'Privacy and security settings would be managed here'),
    },
    {
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      title: 'App Settings',
      subtitle: 'General app preferences',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'download-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Export Health Data',
      subtitle: 'Download your medical data',
      onPress: handleExportData,
    },
  ];

  // Support items
  const supportItems = [
    {
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Help & Support',
      subtitle: 'Get help using the app',
      onPress: () => Alert.alert('Help', 'Contact support or view FAQ'),
    },
    {
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      title: 'About MediTracker',
      subtitle: 'App version and information',
      onPress: () => Alert.alert('About', 'MediTracker v1.0.0'),
    },
  ];

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
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={['#EBF4FF', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#2563EB" />
              </View>
              <ConnectionStatus />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'patient@example.com'}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.userRole}>Patient</Text>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Health Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="medical" size={20} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>{profileStats.totalMedications}</Text>
              <Text style={styles.statLabel}>Medications</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>
              <Text style={[styles.statValue, { color: '#059669' }]}>
                {profileStats.adherenceRate}%
              </Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={20} color="#8B5CF6" />
              </View>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                {profileStats.daysTracked}
              </Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
          </View>
        </View>

        {/* Health Management */}
        <ProfileSection
          title="Health Management"
          items={healthManagementItems}
        />

        {/* Care Team */}
        <ProfileSection
          title="Care Team"
          items={careTeamItems}
        />

        {/* Settings & Privacy */}
        <ProfileSection
          title="Settings & Privacy"
          items={settingsItems}
        />

        {/* Support & Information */}
        <ProfileSection
          title="Support & Information"
          items={supportItems}
        />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Ionicons name="scan" size={20} color="#2563EB" />
              <Text style={styles.quickActionText}>Scan Medication</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionItem, styles.sosAction]}
              onPress={() => navigation.navigate('SOS')}
            >
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.quickActionText, { color: '#EF4444' }]}>Emergency SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>MediTracker v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with care for your health</Text>
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
    paddingBottom: SPACING[8],
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[8],
    paddingTop: SPACING[10],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#EBF4FF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    marginBottom: SPACING[2],
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  userRole: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '500',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[2],
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
  statsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  statCard: {
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
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  profileSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  profileItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING[2],
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  profileItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  quickActionsSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
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
  sosAction: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  signOutSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: SPACING[2],
  },
  signOutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: SPACING[1],
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#CBD5E1',
  },
});

export default ProfileScreen;