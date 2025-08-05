import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { LoadingOverlay } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

// Redux
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser, updateUser } from '../../store/slices/authSlice';

type Props = CaregiverStackScreenProps<'Profile'>;

interface ProfileStats {
  totalPatients: number;
  activeMedications: number;
  completionRate: number;
  joinedDate: string;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    dosageReminders: true,
    weeklyReports: true,
    darkMode: false,
  });

  const [profileStats] = useState<ProfileStats>({
    totalPatients: 12,
    activeMedications: 48,
    completionRate: 94,
    joinedDate: '2024-01-15',
  });

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Implement API call to update profile
      // await caregiverAPI.updateProfile(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user in Redux store
      dispatch(updateUser(formData));
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          onPress: () => {
            dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
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

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[COLORS.primary[500], COLORS.primary[700]]}
      style={styles.profileHeader}
    >
      <View style={styles.profileContent}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            // TODO: Implement avatar change functionality
            Alert.alert('Feature Coming Soon', 'Avatar customization will be available in a future update.');
          }}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.primary[500]} />
          </View>
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={16} color={COLORS.background} />
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileRole}>Healthcare Caregiver</Text>
          <Text style={styles.profileJoinDate}>
            Member since {new Date(profileStats.joinedDate).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "close" : "create-outline"}
            size={20}
            color={COLORS.background}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profileStats.totalPatients}</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profileStats.activeMedications}</Text>
          <Text style={styles.statLabel}>Medications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profileStats.completionRate}%</Text>
          <Text style={styles.statLabel}>Adherence</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProfileForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <Input
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        leftIcon="person-outline"
        editable={isEditing}
        style={!isEditing && styles.disabledInput}
      />

      <Input
        label="Email Address"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        leftIcon="mail-outline"
        keyboardType="email-address"
        editable={isEditing}
        style={!isEditing && styles.disabledInput}
      />

      <Input
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
        leftIcon="call-outline"
        keyboardType="phone-pad"
        editable={isEditing}
        style={!isEditing && styles.disabledInput}
      />

      {isEditing && (
        <View style={styles.formActions}>
          <Button
            title="Cancel"
            onPress={() => {
              setIsEditing(false);
              setFormData({
                name: user?.name || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
              });
            }}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      )}
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text.secondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive alerts for medication reminders</Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
            thumbColor={settings.notifications ? COLORS.primary[500] : COLORS.gray[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Email Alerts</Text>
              <Text style={styles.settingDescription}>Get email notifications for critical events</Text>
            </View>
          </View>
          <Switch
            value={settings.emailAlerts}
            onValueChange={(value) => setSettings(prev => ({ ...prev, emailAlerts: value }))}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
            thumbColor={settings.emailAlerts ? COLORS.primary[500] : COLORS.gray[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.text.secondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>SMS Alerts</Text>
              <Text style={styles.settingDescription}>Receive text messages for urgent alerts</Text>
            </View>
          </View>
          <Switch
            value={settings.smsAlerts}
            onValueChange={(value) => setSettings(prev => ({ ...prev, smsAlerts: value }))}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
            thumbColor={settings.smsAlerts ? COLORS.primary[500] : COLORS.gray[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="medical-outline" size={20} color={COLORS.text.secondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dosage Reminders</Text>
              <Text style={styles.settingDescription}>Automatic reminders for patient medications</Text>
            </View>
          </View>
          <Switch
            value={settings.dosageReminders}
            onValueChange={(value) => setSettings(prev => ({ ...prev, dosageReminders: value }))}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
            thumbColor={settings.dosageReminders ? COLORS.primary[500] : COLORS.gray[400]}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.text.secondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Receive weekly adherence summary reports</Text>
            </View>
          </View>
          <Switch
            value={settings.weeklyReports}
            onValueChange={(value) => setSettings(prev => ({ ...prev, weeklyReports: value }))}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
            thumbColor={settings.weeklyReports ? COLORS.primary[500] : COLORS.gray[400]}
          />
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionsList}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary[500]} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>App Settings</Text>
            <Text style={styles.actionDescription}>Customize app preferences and behavior</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.hint} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Feature Coming Soon', 'Data export will be available in a future update.');
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="download-outline" size={24} color={COLORS.secondary[500]} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Export Data</Text>
            <Text style={styles.actionDescription}>Download your patient data and reports</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.hint} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Help & Support', 'Contact us at support@meditracker.com for assistance.');
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Help & Support</Text>
            <Text style={styles.actionDescription}>Get help and contact support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.hint} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Privacy Policy', 'View our privacy policy at meditracker.com/privacy');
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Privacy & Security</Text>
            <Text style={styles.actionDescription}>Review privacy policy and security settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.hint} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDangerZone = () => (
    <View style={styles.dangerZone}>
      <Text style={styles.dangerTitle}>Account Management</Text>
      
      <View style={styles.dangerActions}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          icon={<Ionicons name="log-out-outline" size={18} color={COLORS.warning} />}
        />

        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          variant="outline"
          style={styles.deleteButton}
          icon={<Ionicons name="trash-outline" size={18} color={COLORS.error} />}
        />
      </View>

      <Text style={styles.dangerWarning}>
        Deleting your account will permanently remove all your data and cannot be undone.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[600]} />
      <LoadingOverlay visible={isLoading} message="Updating profile..." />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderProfileForm()}
        {renderSettingsSection()}
        {renderQuickActions()}
        {renderDangerZone()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  profileHeader: {
    paddingTop: SPACING[4],
    paddingBottom: SPACING[8],
    paddingHorizontal: SPACING[6],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING[1],
  },
  profileRole: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: SPACING[1],
  },
  profileJoinDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    opacity: 0.8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING[1],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[6],
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
  },
  disabledInput: {
    backgroundColor: COLORS.gray[50],
    opacity: 0.8,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  settingsContainer: {
    paddingHorizontal: SPACING[6],
    marginBottom: SPACING[6],
  },
  settingsList: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[3],
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  actionsContainer: {
    paddingHorizontal: SPACING[6],
    marginBottom: SPACING[6],
  },
  actionsList: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  actionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  dangerZone: {
    paddingHorizontal: SPACING[6],
    backgroundColor: COLORS.error + '05',
    marginHorizontal: SPACING[6],
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  dangerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  dangerActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  logoutButton: {
    flex: 1,
    borderColor: COLORS.warning,
  },
  deleteButton: {
    flex: 1,
    borderColor: COLORS.error,
  },
  dangerWarning: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;