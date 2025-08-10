/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Modal,
  TextInput,
  ColorValue
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  setLoading, 
  setDashboardData, 
  setNotifications,
  setConnectionStatus,
  setError,
  resetPatientData 
} from '../../store/slices/patientSlice';
import { logoutUser, updateUser } from '../../store/slices/authSlice';
import { patientAPI } from '../../services/api/patientAPI';
import { useFocusEffect } from '@react-navigation/native';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientNavbar from '../../components/common/PatientNavbar';
import Input from '../../components/common/Input/Input';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

interface Props {
  navigation: any;
}

interface ProfileStats {
  totalMedications: number;
  adherenceRate: number;
  daysTracked: number;
  caregiverConnected: boolean;
}

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  connectedDate: string;
  status: 'active' | 'pending';
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { 
    dashboardStats,
    unreadNotificationCount,
    isConnected,
    isLoading
  } = useAppSelector(state => state.patient);
  
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
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalMedications: 0,
    adherenceRate: 0,
    daysTracked: 0,
    caregiverConnected: false,
  });
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  
  // Modal states
  const [caregiverModalVisible, setCaregiverModalVisible] = useState(false);
  const [emergencyContactModalVisible, setEmergencyContactModalVisible] = useState(false);
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  
  // New contact form
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phoneNumber: '',
    isPrimary: false,
  });


  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    gradient: ['#DBEAFE', '#FFFFFF'] as [ColorValue, ColorValue],
    accent: '#3B82F6',
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadProfileData = async () => {
    dispatch(setLoading(true));
    try {
      const [dashboardData, notificationsData, caregiversData, emergencyData, profile] = await Promise.all([
        patientAPI.getDashboardData(),
        patientAPI.getNotifications(),
        patientAPI.getCaregivers(),
        patientAPI.getEmergencyContacts(),
        patientAPI.getCurrentUser()
      ]);
      
      dispatch(setDashboardData(dashboardData));
      setCaregivers(caregiversData);
      setEmergencyContacts(
        emergencyData.map((contact: any) => ({
          ...contact,
          phoneNumber: contact.phone,
          phone: undefined,
        }))
      );
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
      dispatch(setConnectionStatus(true));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setConnectionStatus(false));
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
      dispatch(setLoading(false));
    }
  };

  const handleSaveProfile = async () => {
    try {
      dispatch(setLoading(true));
      
      await patientAPI.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      });
      
      setProfileData(prev => ({
        ...prev,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      }));
      
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
      dispatch(setLoading(false));
    }
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
          onPress: () => {
            dispatch(resetPatientData());
            dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const handleAddEmergencyContact = async () => {
  if (!newContact.name || !newContact.relationship || !newContact.phoneNumber) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  try {
    const result = await patientAPI.addEmergencyContact(newContact);
    
    // Add the new contact to the local state
    setEmergencyContacts(prev => [
      {
        id: result.data.id,
        name: result.data.name,
        relationship: result.data.relationship,
        phoneNumber: result.data.phone,
        isPrimary: result.data.isPrimary,
      },
      ...prev.filter(c => c.id !== '911')
    ]);
    
    setNewContact({ name: '', relationship: '', phoneNumber: '', isPrimary: false });
    setAddContactModalVisible(false);
    Alert.alert('Success', 'Emergency contact added successfully');
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to add emergency contact');
  }
};

  const handleRemoveEmergencyContact = async (contactId: string) => {
  if (contactId === '911') {
    Alert.alert('Error', 'Cannot remove emergency services');
    return;
  }

  Alert.alert(
    'Remove Contact',
    'Are you sure you want to remove this emergency contact?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await patientAPI.removeEmergencyContact(contactId);
            setEmergencyContacts(prev => prev.filter(contact => contact.id !== contactId));
            Alert.alert('Success', 'Emergency contact removed');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove contact');
          }
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

  useEffect(() => {
    if (dashboardStats) {
      setProfileStats({
        totalMedications: dashboardStats.totalMedications,
        adherenceRate: dashboardStats.adherenceRate,
        daysTracked: 45,
        caregiverConnected: caregivers.length > 0,
      });
    }
  }, [dashboardStats, caregivers]);

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
          colors={theme.gradient}
          style={styles.headerContainer}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { shadowColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileRole}>Patient</Text>
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
                color={theme.primary}
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
                  <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="person-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <Text style={styles.fieldValue}>{profileData.name || 'Not provided'}</Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="mail-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <Text style={styles.fieldValue}>{profileData.email || 'Not provided'}</Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="call-outline" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <Text style={styles.fieldValue}>{profileData.phoneNumber || 'Not provided'}</Text>
                  </View>
                </View>

                {profileData.age > 0 && (
                  <View style={styles.profileField}>
                    <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>Age</Text>
                      <Text style={styles.fieldValue}>{profileData.age} years</Text>
                    </View>
                  </View>
                )}

                {profileData.gender && (
                  <View style={styles.profileField}>
                    <View style={[styles.fieldIcon, { backgroundColor: theme.primaryLight }]}>
                      <Ionicons name="person-outline" size={18} color={theme.primary} />
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
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
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

        {/* Care Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Team</Text>
          
          <View style={styles.careTeamContainer}>
            <TouchableOpacity
              style={styles.careTeamItem}
              onPress={() => setCaregiverModalVisible(true)}
            >
              <View style={[styles.careTeamIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="people-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.careTeamContent}>
                <Text style={styles.careTeamTitle}>Connected Caregivers</Text>
                <Text style={styles.careTeamSubtitle}>
                  {caregivers.length > 0 ? 
                    `${caregivers.length} caregiver${caregivers.length > 1 ? 's' : ''} connected` : 
                    'No caregivers connected'
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.careTeamItem}
              onPress={() => setEmergencyContactModalVisible(true)}
            >
              <View style={styles.careTeamIcon}>
                <Ionicons name="call-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.careTeamContent}>
                <Text style={styles.careTeamTitle}>Emergency Contacts</Text>
                <Text style={styles.careTeamSubtitle}>
                  {emergencyContacts.length > 0 ? 
                    `${emergencyContacts.length} contact${emergencyContacts.length > 1 ? 's' : ''} added` : 
                    'No emergency contacts'
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <View style={[styles.preferenceIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="notifications-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Push Notifications</Text>
                  <Text style={styles.preferenceDescription}>
                    Get medication reminders and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E2E8F0', true: theme.primaryLight }}
                thumbColor={notifications ? theme.primary : '#94A3B8'}
                ios_backgroundColor="#E2E8F0"
              />
            </View>
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
              <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
              </View>
              <Text style={styles.actionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleNavigation('about')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              </View>
              <Text style={styles.actionText}>About MediTracker</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleNavigation('privacy')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
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
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Caregiver Modal */}
      <Modal
        visible={caregiverModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCaregiverModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Connected Caregivers</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setCaregiverModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {caregivers.length > 0 ? (
              caregivers.map((caregiver) => (
                <View key={caregiver.id} style={styles.caregiverCard}>
                  <LinearGradient
                    colors={[theme.primaryLight, '#FFFFFF']}
                    style={styles.caregiverGradient}
                  >
                    <View style={styles.caregiverHeader}>
                      <View style={[styles.caregiverAvatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.caregiverAvatarText}>
                          {caregiver.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.caregiverInfo}>
                        <Text style={styles.caregiverName}>{caregiver.name}</Text>
                        <Text style={styles.caregiverSpecialization}>{caregiver.specialization}</Text>
                        <View style={[
                          styles.caregiverStatus,
                          { backgroundColor: caregiver.status === 'active' ? '#DCFCE7' : '#FEF3C7' }
                        ]}>
                          <Text style={[
                            styles.caregiverStatusText,
                            { color: caregiver.status === 'active' ? '#059669' : '#F59E0B' }
                          ]}>
                            {caregiver.status === 'active' ? 'Active' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.caregiverDetails}>
                      <View style={styles.caregiverDetailItem}>
                        <Ionicons name="mail-outline" size={16} color="#64748B" />
                        <Text style={styles.caregiverDetailText}>{caregiver.email}</Text>
                      </View>
                      <View style={styles.caregiverDetailItem}>
                        <Ionicons name="call-outline" size={16} color="#64748B" />
                        <Text style={styles.caregiverDetailText}>{caregiver.phoneNumber}</Text>
                      </View>
                      <View style={styles.caregiverDetailItem}>
                        <Ionicons name="calendar-outline" size={16} color="#64748B" />
                        <Text style={styles.caregiverDetailText}>Connected {caregiver.connectedDate}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No Caregivers Connected</Text>
                <Text style={styles.emptyStateText}>
                  Ask your healthcare provider to connect with you through the app
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Emergency Contacts Modal */}
      <Modal
        visible={emergencyContactModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEmergencyContactModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Contacts</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={() => setAddContactModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setEmergencyContactModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <View style={styles.contactAvatar}>
                      <Ionicons name="person" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.contactInfo}>
                      <View style={styles.contactNameRow}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        {contact.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                      <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeContactButton}
                      onPress={() => handleRemoveEmergencyContact(contact.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="call-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
                <Text style={styles.emptyStateText}>
                  Add emergency contacts to reach in case of medical emergencies
                </Text>
                <TouchableOpacity
                  style={[styles.addFirstContactButton, { backgroundColor: theme.primary }]}
                  onPress={() => setAddContactModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addFirstContactText}>Add First Contact</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        visible={addContactModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setAddContactModalVisible(false)}
      >
        <View style={styles.addContactContainer}>
          <View style={styles.addContactHeader}>
            <Text style={styles.addContactTitle}>Add Emergency Contact</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAddContactModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.addContactContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.name}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
                placeholder="e.g., Spouse, Parent, Child, Friend"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.phoneNumber}
                onChangeText={(text) => setNewContact(prev => ({ ...prev, phoneNumber: text }))}
                placeholder="Enter phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Set as Primary Contact</Text>
                <Text style={styles.switchDescription}>
                  Primary contacts will be called first in emergencies
                </Text>
              </View>
              <Switch
                value={newContact.isPrimary}
                onValueChange={(value) => setNewContact(prev => ({ ...prev, isPrimary: value }))}
                trackColor={{ false: '#E2E8F0', true: theme.primaryLight }}
                thumbColor={newContact.isPrimary ? theme.primary : '#94A3B8'}
                ios_backgroundColor="#E2E8F0"
              />
            </View>

            <View style={styles.addContactActions}>
              <TouchableOpacity
                style={styles.cancelAddButton}
                onPress={() => {
                  setNewContact({ name: '', relationship: '', phoneNumber: '', isPrimary: false });
                  setAddContactModalVisible(false);
                }}
              >
                <Text style={styles.cancelAddButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveContactButton, { backgroundColor: theme.primary }]}
                onPress={handleAddEmergencyContact}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.saveContactButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
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
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  careTeamContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  careTeamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  careTeamIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  careTeamContent: {
    flex: 1,
  },
  careTeamTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  careTeamSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
  },
  
  // Caregiver Card Styles
  caregiverCard: {
    marginBottom: SPACING[4],
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  caregiverGradient: {
    padding: SPACING[5],
  },
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  caregiverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  caregiverAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  caregiverSpecialization: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[2],
  },
  caregiverStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  caregiverStatusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  caregiverDetails: {
    gap: SPACING[2],
  },
  caregiverDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  caregiverDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },

  // Emergency Contact Styles
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[1],
  },
  contactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  primaryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  primaryBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#2563EB',
    fontWeight: '600',
  },
  contactRelationship: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    fontWeight: '500',
  },
  removeContactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[5],
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#64748B',
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[6],
  },
  addFirstContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  addFirstContactText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Add Contact Modal Styles
  addContactContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  addContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addContactTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  addContactContent: {
    flex: 1,
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
  },
  inputGroup: {
    marginBottom: SPACING[5],
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#374151',
    marginBottom: SPACING[2],
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[8],
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING[4],
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  switchDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  addContactActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingBottom: SPACING[8],
  },
  cancelAddButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelAddButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#64748B',
  },
  saveContactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  saveContactButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;