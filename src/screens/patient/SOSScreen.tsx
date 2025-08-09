/* eslint-disable @typescript-eslint/no-unused-vars */
// src/screens/patient/SOSScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration,
  Animated,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { PatientStackParamList } from '../../types/navigation.types';
import { useAppSelector, useAppDispatch } from '../../store';
import { sendSOSAlert, clearError } from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import * as Location from 'expo-location';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

type Props = StackScreenProps<PatientStackParamList, 'SOS'>;

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

const SOSScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isLoading, error, isConnected } = useAppSelector(state => state.patient);
  
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // Load emergency contacts
  useEffect(() => {
    const loadEmergencyContacts = async () => {
      try {
        const contacts = await patientAPI.getEmergencyContacts();
        setEmergencyContacts(contacts);
      } catch (error) {
        console.error('Failed to load emergency contacts:', error);
        // Use default contacts
        setEmergencyContacts([
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            relationship: 'Primary Caregiver',
            phone: '+1-555-0123',
            isPrimary: true,
          },
          {
            id: '2',
            name: 'Emergency Services',
            relationship: 'Emergency',
            phone: '911',
            isPrimary: false,
          },
          {
            id: '3',
            name: 'John Smith',
            relationship: 'Emergency Contact',
            phone: '+1-555-0456',
            isPrimary: false,
          },
        ]);
      }
    };

    loadEmergencyContacts();
  }, []);

  // Get current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: address[0] ? 
              `${address[0].street}, ${address[0].city}, ${address[0].region}` : 
              undefined
          });
        }
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    };

    getCurrentLocation();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'SOS Error',
        error,
        [
          { text: 'Retry', onPress: () => dispatch(clearError()) },
          { text: 'OK', onPress: () => dispatch(clearError()) }
        ]
      );
    }
  }, [error, dispatch]);

  // Pulse animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmergencyActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        Vibration.vibrate(200);
      }, 1000);
    } else if (isEmergencyActive && countdown === 0) {
      sendEmergencyAlert();
    }

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmergencyActive, countdown]);

  // Handle SOS button press
  const handleSOSPress = () => {
    Alert.alert(
      'Emergency Alert',
      `This will send an emergency alert to your caregivers and emergency contacts.${!isConnected ? '\n\nNote: You are currently offline. The alert will be sent when connection is restored.' : ''}\n\nAre you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            setIsEmergencyActive(true);
            setCountdown(5);
            Vibration.vibrate([0, 500, 200, 500]);
          },
        },
      ]
    );
  };

  // Send emergency alert
  const sendEmergencyAlert = async () => {
    try {
      setIsEmergencyActive(false);
      
      const alertData = {
        message: `Emergency alert from ${user?.name || 'Patient'}. Immediate assistance required.`,
        location: currentLocation || undefined,
        severity: 'critical' as const
      };

      const result = await dispatch(sendSOSAlert(alertData)).unwrap();
      
      Alert.alert(
        'Emergency Alert Sent',
        `Your emergency alert has been sent to all your caregivers and emergency contacts.${currentLocation ? '\n\nYour location has been shared.' : '\n\nLocation sharing was unavailable.'}\n\nHelp is on the way.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setIsEmergencyActive(false);
      Alert.alert(
        'Alert Failed',
        error || 'Failed to send emergency alert. Please try calling emergency services directly.',
        [
          { text: 'Retry', onPress: () => setIsEmergencyActive(true) },
          { text: 'Call 911', onPress: () => callContact({ phone: '911' } as EmergencyContact) },
          { text: 'Cancel' }
        ]
      );
    }
  };

  // Cancel emergency
  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setCountdown(5);
    Alert.alert('Emergency Alert Cancelled', 'The emergency alert has been cancelled.');
  };

  // Call contact
  const callContact = (contact: EmergencyContact) => {
    Alert.alert(
      `Call ${contact.name}`,
      `Do you want to call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            try {
              Linking.openURL(`tel:${contact.phone}`);
            } catch (error) {
              console.error(error)
              Alert.alert('Call Failed', `Failed to initiate call to ${contact.phone}`);
            }
          },
        },
      ]
    );
  };

  // Connection status warning
  const ConnectionWarning = () => (
    !isConnected && (
      <View style={styles.connectionWarning}>
        <Ionicons name="wifi-outline" size={20} color="#F59E0B" />
        <Text style={styles.warningText}>
          You are offline. Emergency alerts will be sent when connection is restored.
        </Text>
      </View>
    )
  );

  // Location status
  const LocationStatus = () => (
    <View style={styles.locationStatus}>
      <Ionicons 
        name={currentLocation ? "location" : "location-outline"} 
        size={16} 
        color={currentLocation ? "#059669" : "#6B7280"} 
      />
      <Text style={[
        styles.locationText,
        { color: currentLocation ? "#059669" : "#6B7280" }
      ]}>
        {currentLocation ? 
          (currentLocation.address || "Location available") : 
          "Location unavailable"
        }
      </Text>
    </View>
  );

  // Emergency contact card component
  const EmergencyContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <TouchableOpacity
      style={[styles.contactCard, contact.isPrimary && styles.primaryContactCard]}
      onPress={() => callContact(contact)}
      activeOpacity={0.7}
    >
      <View style={styles.contactInfo}>
        <View style={[
          styles.contactIcon,
          contact.isPrimary && styles.primaryContactIcon
        ]}>
          <Ionicons 
            name={contact.phone === '911' ? 'call' : 'person'} 
            size={20} 
            color={contact.isPrimary ? '#EF4444' : '#2563EB'} 
          />
        </View>
        <View style={styles.contactDetails}>
          <Text style={[
            styles.contactName,
            contact.isPrimary && styles.primaryContactName
          ]}>
            {contact.name}
          </Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
      </View>
      <View style={[
        styles.callButton,
        { opacity: isConnected ? 1 : 0.6 }
      ]}>
        <Ionicons name="call" size={18} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="Emergency SOS"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Connection warning */}
        <ConnectionWarning />
        
        {!isEmergencyActive ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="shield-checkmark" size={32} color="#EF4444" />
              </View>
              <Text style={styles.headerTitle}>Emergency Assistance</Text>
              <Text style={styles.headerSubtitle}>
                Get immediate help when you need it most
              </Text>
              <LocationStatus />
            </View>

            {/* SOS Button */}
            <View style={styles.sosSection}>
              <Animated.View style={[styles.sosButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[
                    styles.sosButton,
                    { opacity: isLoading ? 0.6 : 1 }
                  ]}
                  onPress={handleSOSPress}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size={48} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="alert-circle" size={48} color="#FFFFFF" />
                  )}
                  <Text style={styles.sosButtonText}>
                    {isLoading ? 'SENDING...' : 'EMERGENCY'}
                  </Text>
                  <Text style={styles.sosButtonSubtext}>
                    {isLoading ? 'Please wait' : 'Tap for help'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.sosDescription}>
                This will immediately alert your caregivers and emergency contacts
                {currentLocation && '\nYour location will be shared automatically'}
              </Text>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.contactsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                <Text style={styles.contactCount}>
                  {emergencyContacts.length} contacts
                </Text>
              </View>

              <View style={styles.contactsList}>
                {emergencyContacts.map((contact) => (
                  <EmergencyContactCard key={contact.id} contact={contact} />
                ))}
              </View>
            </View>

            {/* Information Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons name="information-circle" size={20} color="#2563EB" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>When to use Emergency SOS</Text>
                  <Text style={styles.infoText}>
                    • Medical emergency or severe reaction{'\n'}
                    • Unable to take medication safely{'\n'}
                    • Feeling confused about medications{'\n'}
                    • Any urgent health concern
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Emergency Active State */
          <View style={styles.emergencyActiveContainer}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIcon}>
                <Ionicons name="warning" size={48} color="#EF4444" />
              </View>
              <Text style={styles.emergencyTitle}>Emergency Alert Active</Text>
              <Text style={styles.emergencySubtitle}>
                Sending alert in {countdown} seconds...
              </Text>
            </View>

            <View style={styles.countdownContainer}>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            </View>

            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { opacity: isLoading ? 0.6 : 1 }]}
                onPress={cancelEmergency}
                disabled={isLoading}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>Cancel Alert</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sendNowButton, { opacity: isLoading ? 0.6 : 1 }]}
                onPress={sendEmergencyAlert}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size={20} color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.sendNowButtonText}>
                  {isLoading ? 'Sending...' : 'Send Now'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.emergencyNote}>
              Your location and medical information will be shared with emergency contacts
              {!isConnected && '\n\nAlert will be sent when connection is restored'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[4],
    gap: SPACING[2],
  },
  warningText: {
    color: '#F59E0B',
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING[2],
    flex: 1,
    fontWeight: '500',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[3],
    gap: SPACING[2],
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING[2],
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: SPACING[10],
  },
  sosButtonContainer: {
    marginBottom: SPACING[4],
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  sosButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: SPACING[2],
    letterSpacing: 1,
  },
  sosButtonSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: SPACING[1],
  },
  sosDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '85%',
  },
  contactsSection: {
    marginBottom: SPACING[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  contactCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    backgroundColor: '#EBF4FF',
    borderRadius: RADIUS.md,
    gap: SPACING[1],
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    fontWeight: '500',
  },
  contactsList: {
    gap: SPACING[3],
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  primaryContactCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  primaryContactIcon: {
    backgroundColor: '#FEF2F2',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  primaryContactName: {
    color: '#DC2626',
  },
  contactRelationship: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#2563EB',
    fontWeight: '500',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: SPACING[6],
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    marginRight: SPACING[3],
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: SPACING[2],
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1D4ED8',
    lineHeight: 20,
  },
  emergencyActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  emergencyHeader: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  emergencyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    borderWidth: 3,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  emergencySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#64748B',
    textAlign: 'center',
  },
  countdownContainer: {
    marginBottom: SPACING[8],
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[8],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sendNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendNowButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
});

export default SOSScreen;