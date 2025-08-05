import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';
import { APP_CONFIG } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'navigation' | 'action';
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  disabled?: boolean;
}

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Settings
    pushNotifications: true,
    medicationReminders: true,
    sosAlerts: true,
    weeklyReports: true,
    emailNotifications: false,
    smsNotifications: false,
    
    // App Preferences
    darkMode: false,
    soundEnabled: true,
    vibrationEnabled: true,
    autoLock: true,
    biometricAuth: false,
    
    // Data & Privacy
    dataSync: true,
    analytics: true,
    crashReporting: true,
    locationServices: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Save to backend/storage
  };

  
  const handleCheckForUpdates = async () => {
    try {
      setIsLoading(true);
      
      if (__DEV__) {
        Alert.alert('Development Mode', 'Updates are not available in development mode.');
        setIsLoading(false);
        return;
      }

      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', 'You are running the latest version of MediTracker.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking for updates:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to check for updates. Please try again later.');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will create a backup of all your medication data and patient information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Data export will be available in a future update.');
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data from this device. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm permanent data deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', style: 'destructive' },
              ]
            );
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact our support team:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@meditracker.com') },
        { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
      ]
    );
  };

  const handleRateApp = () => {
    // TODO: Implement store rating
    Alert.alert('Feature Coming Soon', 'App rating will be available when published to app stores.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Receive notifications on this device',
          type: 'toggle',
          icon: 'notifications-outline',
          value: settings.pushNotifications,
          onToggle: (value) => {
            updateSetting('pushNotifications', value);
          
          },
        },
        {
          id: 'medicationReminders',
          title: 'Medication Reminders',
          description: 'Get reminded when it\'s time to take medications',
          type: 'toggle',
          icon: 'medical-outline',
          value: settings.medicationReminders,
          onToggle: (value) => updateSetting('medicationReminders', value),
          disabled: !settings.pushNotifications,
        },
        {
          id: 'sosAlerts',
          title: 'SOS Alerts',
          description: 'Receive emergency alerts from patients',
          type: 'toggle',
          icon: 'alert-circle-outline',
          value: settings.sosAlerts,
          onToggle: (value) => updateSetting('sosAlerts', value),
          disabled: !settings.pushNotifications,
        },
        {
          id: 'weeklyReports',
          title: 'Weekly Reports',
          description: 'Get weekly adherence summary reports',
          type: 'toggle',
          icon: 'document-text-outline',
          value: settings.weeklyReports,
          onToggle: (value) => updateSetting('weeklyReports', value),
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          type: 'toggle',
          icon: 'moon-outline',
          value: settings.darkMode,
          onToggle: (value) => {
            updateSetting('darkMode', value);
            Alert.alert('Feature Coming Soon', 'Dark mode will be available in a future update.');
          },
        },
        {
          id: 'soundEnabled',
          title: 'Sound Effects',
          description: 'Play sounds for notifications and actions',
          type: 'toggle',
          icon: 'volume-high-outline',
          value: settings.soundEnabled,
          onToggle: (value) => updateSetting('soundEnabled', value),
        },
        {
          id: 'vibrationEnabled',
          title: 'Vibration',
          description: 'Use vibration for alerts and notifications',
          type: 'toggle',
          icon: 'phone-portrait-outline',
          value: settings.vibrationEnabled,
          onToggle: (value) => updateSetting('vibrationEnabled', value),
        },
        {
          id: 'biometricAuth',
          title: 'Biometric Authentication',
          description: 'Use fingerprint or face ID to unlock app',
          type: 'toggle',
          icon: 'finger-print-outline',
          value: settings.biometricAuth,
          onToggle: (value) => {
            updateSetting('biometricAuth', value);
            Alert.alert('Feature Coming Soon', 'Biometric authentication will be available in a future update.');
          },
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'dataSync',
          title: 'Data Synchronization',
          description: 'Sync data across your devices',
          type: 'toggle',
          icon: 'sync-outline',
          value: settings.dataSync,
          onToggle: (value) => updateSetting('dataSync', value),
        },
        {
          id: 'analytics',
          title: 'Usage Analytics',
          description: 'Help improve the app by sharing anonymous usage data',
          type: 'toggle',
          icon: 'analytics-outline',
          value: settings.analytics,
          onToggle: (value) => updateSetting('analytics', value),
        },
        {
          id: 'exportData',
          title: 'Export Data',
          description: 'Download a copy of your data',
          type: 'action',
          icon: 'download-outline',
          onPress: handleExportData,
        },
        {
          id: 'privacyPolicy',
          title: 'Privacy Policy',
          description: 'View our privacy policy',
          type: 'navigation',
          icon: 'shield-checkmark-outline',
          onPress: () => Linking.openURL('https://meditracker.com/privacy'),
        },
      ],
    },
    {
      title: 'Support & Feedback',
      items: [
        {
          id: 'checkUpdates',
          title: 'Check for Updates',
          description: 'Check if a newer version is available',
          type: 'action',
          icon: 'refresh-outline',
          onPress: handleCheckForUpdates,
        },
        {
          id: 'contactSupport',
          title: 'Contact Support',
          description: 'Get help from our support team',
          type: 'action',
          icon: 'help-circle-outline',
          onPress: handleContactSupport,
        },
        {
          id: 'rateApp',
          title: 'Rate This App',
          description: 'Leave a review on the app store',
          type: 'action',
          icon: 'star-outline',
          onPress: handleRateApp,
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          description: 'View our terms of service',
          type: 'navigation',
          icon: 'document-outline',
          onPress: () => Linking.openURL('https://meditracker.com/terms'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          description: 'Sign out of your account',
          type: 'action',
          icon: 'log-out-outline',
          onPress: handleLogout,
          destructive: true,
        },
        {
          id: 'deleteData',
          title: 'Delete All Data',
          description: 'Permanently delete all data from this device',
          type: 'action',
          icon: 'trash-outline',
          onPress: handleDeleteAllData,
          destructive: true,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    const isDisabled = item.disabled || false;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingsItem,
          isDisabled && styles.disabledItem,
          item.destructive && styles.destructiveItem,
        ]}
        onPress={item.onPress}
        disabled={isDisabled || (item.type === 'toggle' && !item.onToggle)}
        activeOpacity={0.8}
      >
        <View style={styles.settingsItemContent}>
          <View style={[
            styles.settingsIcon,
            item.destructive && styles.destructiveIcon,
            isDisabled && styles.disabledIcon,
          ]}>
            <Ionicons
              name={item.icon}
              size={20}
              color={
                item.destructive 
                  ? COLORS.error 
                  : isDisabled 
                    ? COLORS.gray[400] 
                    : COLORS.text.secondary
              }
            />
          </View>
          
          <View style={styles.settingsText}>
            <Text style={[
              styles.settingsTitle,
              item.destructive && styles.destructiveText,
              isDisabled && styles.disabledText,
            ]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={[
                styles.settingsDescription,
                isDisabled && styles.disabledText,
              ]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.settingsAction}>
          {item.type === 'toggle' && item.onToggle && (
            <Switch
              value={item.value || false}
              onValueChange={item.onToggle}
              disabled={isDisabled}
              trackColor={{ 
                false: COLORS.gray[300], 
                true: COLORS.primary[200] 
              }}
              thumbColor={
                (item.value && !isDisabled) 
                  ? COLORS.primary[500] 
                  : COLORS.gray[400]
              }
            />
          )}
          
          {(item.type === 'navigation' || item.type === 'action') && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                item.destructive 
                  ? COLORS.error 
                  : isDisabled 
                    ? COLORS.gray[400] 
                    : COLORS.text.hint
              }
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettingsSection = (section: SettingsSection) => (
    <View key={section.title} style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingsItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoadingOverlay visible={isLoading} message="Checking for updates..." />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Settings</Text>
        
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={32} color={COLORS.primary[500]} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'caregiver' ? 'Healthcare Caregiver' : 'Patient'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map(renderSettingsSection)}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.appVersion}>Version {APP_CONFIG.VERSION}</Text>
          <Text style={styles.appCopyright}>
            © 2024 MediTracker. All rights reserved.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING[2],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    paddingBottom: SPACING[10],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginBottom: SPACING[8],
    borderWidth: 1,
    borderColor: COLORS.primary[100],
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
    ...SHADOWS.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  userRole: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: '500',
    marginBottom: SPACING[1],
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  settingsSection: {
    marginBottom: SPACING[8],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
    marginLeft: SPACING[1],
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[5],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  disabledItem: {
    opacity: 0.5,
  },
  destructiveItem: {
    backgroundColor: COLORS.error + '05',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  destructiveIcon: {
    backgroundColor: COLORS.error + '20',
  },
  disabledIcon: {
    backgroundColor: COLORS.gray[50],
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  destructiveText: {
    color: COLORS.error,
  },
  disabledText: {
    color: COLORS.gray[400],
  },
  settingsDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  settingsAction: {
    marginLeft: SPACING[3],
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
    marginTop: SPACING[4],
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.primary[500],
    marginBottom: SPACING[2],
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING[2],
  },
  appCopyright: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.hint,
    textAlign: 'center',
  },
});

export default SettingsScreen;