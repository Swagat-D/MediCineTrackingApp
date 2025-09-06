import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input/Input';
import CaregiverNavbar from '../../components/common/CaregiverNavbar';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

// Types and Constants
import { CaregiverStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

// Redux and API
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser, updateUser } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api/authAPI';

type Props = CaregiverStackScreenProps<'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    age: 0,
    gender: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  useEffect(() => {
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      // Get current user profile from API
      const profile = await authAPI.getCurrentUser();
      setProfileData({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        age: profile.age || 0,
        gender: profile.gender || '',
      });
      setFormData({
        name: profile.name,
        phoneNumber: profile.phoneNumber || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to Redux state if API fails
      if (user) {
        setProfileData({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          age: user.age || 0,
          gender: user.gender || '',
        });
        setFormData({
          name: user.name,
          phoneNumber: user.phoneNumber || '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      // Call actual API
      await authAPI.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      }));
      
      // Update Redux store
      dispatch(updateUser({
        ...user,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      }));
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
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

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'about':
        navigation.navigate('About');
        break;
      case 'privacy':
        navigation.navigate('Privacy');
        break;
      default:
        break;
    }
  };

  if (isLoading && !profileData.name) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CaregiverNavbar
        title="Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.headerContainer}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileRole}>Healthcare Caregiver</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              <Ionicons
                name={isEditing ? "checkmark" : "create-outline"}
                size={20}
                color="#059669"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formContainer}>
            {!isEditing ? (
              // Display Mode
              <>
                <View style={styles.profileField}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="person-outline" size={18} color="#059669" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <Text style={styles.fieldValue}>{profileData.name || 'Not provided'}</Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="mail-outline" size={18} color="#059669" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <Text style={styles.fieldValue}>{profileData.email || 'Not provided'}</Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <View style={styles.fieldIcon}>
                    <Ionicons name="call-outline" size={18} color="#059669" />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <Text style={styles.fieldValue}>{profileData.phoneNumber || 'Not provided'}</Text>
                  </View>
                </View>

                {profileData.age > 0 && (
                  <View style={styles.profileField}>
                    <View style={styles.fieldIcon}>
                      <Ionicons name="calendar-outline" size={18} color="#059669" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>Age</Text>
                      <Text style={styles.fieldValue}>{profileData.age} years</Text>
                    </View>
                  </View>
                )}

                {profileData.gender && (
                  <View style={styles.profileField}>
                    <View style={styles.fieldIcon}>
                      <Ionicons name="person-outline" size={18} color="#059669" />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>Gender</Text>
                      <Text style={styles.fieldValue}>{profileData.gender}</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              // Edit Mode
              <>
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  leftIcon="person-outline"
                />

                <View style={styles.disabledFieldContainer}>
                  <Text style={styles.disabledFieldLabel}>Email Address</Text>
                  <View style={styles.disabledField}>
                    <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                    <Text style={styles.disabledFieldText}>{profileData.email}</Text>
                    <Ionicons name="lock-closed" size={16} color="#94A3B8" />
                  </View>
                  <Text style={styles.disabledFieldNote}>Email cannot be changed</Text>
                </View>

                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profileData.name,
                        phoneNumber: profileData.phoneNumber,
                      });
                    }}
                  >
                    <Ionicons name="close" size={18} color="#EF4444" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsList}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleNavigation('help')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="help-circle-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.actionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleNavigation('about')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="information-circle-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.actionText}>About MediTracker</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleNavigation('privacy')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.actionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#059669',
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
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  headerContainer: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[6],
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  profileRole: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    marginBottom: SPACING[3],
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING[4],
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
    fontWeight: '500',
  },
  disabledFieldContainer: {
    marginBottom: SPACING[4],
  },
  disabledFieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[2],
    fontWeight: '500',
  },
  disabledField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[2],
  },
  disabledFieldText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  disabledFieldNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
    marginTop: SPACING[1],
    fontStyle: 'italic',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[5],
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: SPACING[2],
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#EF4444',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  preferencesSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[5],
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  actionsSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#475569',
  },
  logoutSection: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[8],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: SPACING[2],
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default ProfileScreen;