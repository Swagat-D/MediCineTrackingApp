// src/screens/shared/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  ColorValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import CaregiverSecondaryNavbar from '../../components/common/SecondaryNavbar';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const isCaregiver = user?.role === 'caregiver';

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    medicationReminders: true,
    sosAlerts: true,
    weeklyReports: isCaregiver,
    soundEnabled: true,
    vibrationEnabled: true,
    biometricAuth: false,
  });


  const themeColors = {
    primary: isCaregiver ? '#059669' : '#2563EB',
    primaryLight: isCaregiver ? '#ECFDF5' : '#EBF4FF',
    primaryBorder: isCaregiver ? '#D1FAE5' : '#BFDBFE',
    gradient: isCaregiver
      ? (['#F0FDF4', '#FFFFFF'] as [ColorValue, ColorValue])
      : (['#EBF4FF', '#FFFFFF'] as [ColorValue, ColorValue]),
  };

  const handleToggleSetting = (settingKey: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

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

  const handleResetApp = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear all app data including settings, notifications, and cached information. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'App data has been reset'),
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      isCaregiver 
        ? 'Export patient data and reports for backup or sharing with healthcare providers.'
        : 'Export your medication history and adherence reports.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Exported', 'Data exported successfully') },
      ]
    );
  };

  const SettingSection = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: {
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      subtitle?: string;
      onPress?: () => void;
      toggle?: keyof typeof settings;
      showChevron?: boolean;
      destructive?: boolean;
    }[];
  }) => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.settingItem,
              index === items.length - 1 && styles.settingItemLast
            ]}
          >
            <TouchableOpacity
              style={styles.settingItemContent}
              onPress={item.onPress}
              activeOpacity={item.onPress ? 0.7 : 1}
              disabled={!item.onPress && !item.toggle}
            >
              <View style={styles.settingItemLeft}>
                <View style={[
                  styles.settingItemIcon,
                  item.destructive && styles.destructiveIcon
                ]}>
                  <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={item.destructive ? '#EF4444' : '#64748B'} 
                  />
                </View>
                <View style={styles.settingItemContent}>
                  <Text style={[
                    styles.settingItemTitle,
                    item.destructive && styles.destructiveText
                  ]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              
              {item.toggle ? (
                <Switch
                  value={settings[item.toggle]}
                  onValueChange={() => handleToggleSetting(item.toggle!)}
                  trackColor={{ 
                    false: '#F1F5F9', 
                    true: themeColors.primary + '40' 
                  }}
                  thumbColor={settings[item.toggle] ? themeColors.primary : '#FFFFFF'}
                  ios_backgroundColor="#F1F5F9"
                />
              ) : item.showChevron ? (
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isCaregiver ? (
        <CaregiverSecondaryNavbar
          title="Settings"
          onBackPress={() => navigation.goBack()}
        />
      ) : (
        <PatientSecondaryNavbar
          title="Settings"
          onBackPress={() => navigation.goBack()}
          onSOSPress={() => navigation.navigate('SOS')}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={themeColors.gradient}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: themeColors.primaryLight }]}>
              <Ionicons name="settings" size={24} color={themeColors.primary} />
            </View>
            <Text style={styles.headerTitle}>App Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your {isCaregiver ? 'caregiving' : 'medication tracking'} experience
            </Text>
          </View>
        </LinearGradient>

        {/* Notifications Settings */}
        <SettingSection
          title="Notifications"
          items={[
            {
              icon: 'notifications-outline',
              title: 'Push Notifications',
              subtitle: 'Receive notifications on this device',
              toggle: 'pushNotifications',
            },
            {
              icon: 'mail-outline',
              title: 'Email Notifications',
              subtitle: 'Receive notifications via email',
              toggle: 'emailNotifications',
            },
            {
              icon: 'medical-outline',
              title: 'Medication Reminders',
              subtitle: isCaregiver ? 'Patient medication alerts' : 'Daily medication reminders',
              toggle: 'medicationReminders',
            },
            {
              icon: 'alert-circle-outline',
              title: 'SOS Alerts',
              subtitle: isCaregiver ? 'Emergency patient alerts' : 'Emergency notification system',
              toggle: 'sosAlerts',
            },
            ...(isCaregiver ? [{
              icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
              title: 'Weekly Reports',
              subtitle: 'Patient adherence summary reports',
              toggle: 'weeklyReports' as keyof typeof settings,
            }] : []),
          ]}
        />

        {/* Sound & Vibration */}
        <SettingSection
          title="Sound & Vibration"
          items={[
            {
              icon: 'volume-high-outline',
              title: 'Sound',
              subtitle: 'Play sounds for notifications',
              toggle: 'soundEnabled',
            },
            {
              icon: 'phone-portrait-outline',
              title: 'Vibration',
              subtitle: 'Vibrate for important alerts',
              toggle: 'vibrationEnabled',
            },
          ]}
        />

        {/* Security Settings */}
        <SettingSection
          title="Security & Privacy"
          items={[
            {
              icon: 'finger-print-outline',
              title: 'Biometric Authentication',
              subtitle: 'Use fingerprint or face ID to unlock',
              toggle: 'biometricAuth',
            },
            {
              icon: 'shield-checkmark-outline',
              title: 'Privacy Policy',
              subtitle: 'View our privacy policy',
              onPress: () => Alert.alert('Privacy Policy', 'This will open our privacy policy'),
              showChevron: true,
            },
            {
              icon: 'document-text-outline',
              title: 'Terms of Service',
              subtitle: 'View terms and conditions',
              onPress: () => Alert.alert('Terms of Service', 'This will open our terms of service'),
              showChevron: true,
            },
          ]}
        />

        {/* Data Management */}
        <SettingSection
          title="Data Management"
          items={[
            {
              icon: 'cloud-download-outline',
              title: 'Export Data',
              subtitle: isCaregiver ? 'Export patient reports and data' : 'Export medication history',
              onPress: handleExportData,
              showChevron: true,
            },
            {
              icon: 'refresh-outline',
              title: 'Reset App Data',
              subtitle: 'Clear all app data and settings',
              onPress: handleResetApp,
              showChevron: true,
              destructive: true,
            },
          ]}
        />

        {/* Support */}
        <SettingSection
          title="Support & Information"
          items={[
            {
              icon: 'help-circle-outline',
              title: 'Help & Support',
              subtitle: 'Get help using the app',
              onPress: () => Alert.alert('Support', 'Contact support team'),
              showChevron: true,
            },
            {
              icon: 'chatbubble-outline',
              title: 'Send Feedback',
              subtitle: 'Share your thoughts and suggestions',
              onPress: () => Alert.alert('Feedback', 'Thank you for your feedback'),
              showChevron: true,
            },
            {
              icon: 'star-outline',
              title: 'Rate the App',
              subtitle: 'Rate us on the App Store',
              onPress: () => Alert.alert('Rate App', 'This will open the App Store'),
              showChevron: true,
            },
            {
              icon: 'information-circle-outline',
              title: 'About MediTracker',
              subtitle: 'Version 1.0.0',
              onPress: () => Alert.alert('About', 'MediTracker v1.0.0\nMade with care for your health'),
              showChevron: true,
            },
          ]}
        />

        {/* Account */}
        <SettingSection
          title="Account"
          items={[
            {
              icon: 'person-outline',
              title: 'Account Information',
              subtitle: `${user?.name} (${user?.email})`,
              onPress: () => Alert.alert('Account', 'View account details'),
              showChevron: true,
            },
            {
              icon: 'log-out-outline',
              title: 'Sign Out',
              subtitle: 'Sign out of your account',
              onPress: handleLogout,
              destructive: true,
              showChevron: true,
            },
          ]}
        />

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>MediTracker v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            {isCaregiver ? 'Professional healthcare management' : 'Personal medication companion'}
          </Text>
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
    paddingBottom: SPACING[6],
    paddingTop: SPACING[8],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
  settingSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[3],
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[4],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  destructiveIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#EF4444',
  },
  settingItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  versionSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
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
    textAlign: 'center',
  },
});

export default SettingsScreen;