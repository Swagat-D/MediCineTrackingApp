// src/screens/patient/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PatientTabParamList } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
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
  
  const [profileStats] = useState<ProfileStats>({
    totalMedications: 4,
    adherenceRate: 89,
    daysTracked: 45,
    caregiverConnected: true,
  });

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

  const handleEmergencyContacts = () => {
    Alert.alert('Emergency Contacts', 'This feature will allow you to manage your emergency contacts');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNotificationSettings = () => {
    Alert.alert('Notification Settings', 'This feature will allow you to customize your medication reminders');
  };

  const handleMedicalHistory = () => {
    Alert.alert('Medical History', 'This feature will show your medication history and logs');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'This feature will allow you to manage your privacy preferences');
  };

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
                <Text style={styles.profileItemTitle}>{item.title}</Text>
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

  return (
    <View style={styles.container}>
      <PatientNavbar
        onNotificationPress={() => navigation.navigate('Notifications')}
        onSOSPress={() => navigation.navigate('SOS')}
        notificationCount={0}
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
          items={[
            {
              icon: 'medical-outline',
              title: 'My Medications',
              subtitle: `${profileStats.totalMedications} active prescriptions`,
              onPress: () => navigation.navigate('Medications'),
            },
            {
              icon: 'restaurant-outline',
              title: 'Meal Settings',
              subtitle: 'Configure meal times for medication timing',
              onPress: () => navigation.navigate('MealSettings'),
            },
            {
              icon: 'document-text-outline',
              title: 'Medical History',
              subtitle: 'View medication logs and history',
              onPress: handleMedicalHistory,
            },
          ]}
        />

        {/* Caregiver Connection */}
        <ProfileSection
          title="Care Team"
          items={[
            {
              icon: 'people-outline',
              title: 'Connected Caregiver',
              subtitle: profileStats.caregiverConnected ? 'Dr. Sarah Johnson' : 'No caregiver connected',
              onPress: () => Alert.alert('Caregiver', 'View caregiver details'),
              showBadge: profileStats.caregiverConnected,
              badgeColor: '#059669',
            },
            {
              icon: 'call-outline',
              title: 'Emergency Contacts',
              subtitle: 'Manage emergency contact information',
              onPress: handleEmergencyContacts,
            },
          ]}
        />

        {/* Settings */}
        <ProfileSection
          title="Settings & Privacy"
          items={[
            {
              icon: 'notifications-outline',
              title: 'Notifications',
              subtitle: 'Manage medication reminders',
              onPress: handleNotificationSettings,
            },
            {
              icon: 'shield-outline',
              title: 'Privacy & Security',
              subtitle: 'Manage your privacy settings',
              onPress: handlePrivacySettings,
            },
            {
              icon: 'settings-outline',
              title: 'App Settings',
              subtitle: 'General app preferences',
              onPress: handleSettings,
            },
          ]}
        />

        {/* Support */}
        <ProfileSection
          title="Support & Information"
          items={[
            {
              icon: 'help-circle-outline',
              title: 'Help & Support',
              subtitle: 'Get help using the app',
              onPress: () => Alert.alert('Help', 'Contact support or view FAQ'),
            },
            {
              icon: 'information-circle-outline',
              title: 'About MediTracker',
              subtitle: 'App version and information',
              onPress: () => Alert.alert('About', 'MediTracker v1.0.0'),
            },
          ]}
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