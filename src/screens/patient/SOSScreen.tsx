import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Vibration,
  Animated,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store';
import { setLoading, setError } from '../../store/slices/patientSlice';
import { patientAPI } from '../../services/api/patientAPI';
import * as Location from 'expo-location';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { CustomAlertStatic } from '@/components/common/CustomAlert/CustomAlertStatic';

interface Props {
  navigation: any;
};

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
};

interface Caregiver {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  status: string;
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isShortScreen = height < 700;

const SOSScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isLoading, isConnected } = useAppSelector(state => state.patient);
  
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  // Patient theme colors
  const theme = {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    primaryDark: '#1D4ED8',
    gradient: ['#DBEAFE', '#FFFFFF'],
    accent: '#3B82F6',
  };

  useEffect(() => {
    loadContactsAndCaregivers();
    getCurrentLocation();
  }, []);

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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
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

  const loadContactsAndCaregivers = async () => {
    try {
      const [contacts, caregiversData] = await Promise.all([
        patientAPI.getEmergencyContacts(),
        patientAPI.getCaregivers()
      ]);
      
      setEmergencyContacts(contacts);
      setCaregivers(caregiversData);
    } catch (error) {
      console.error('Failed to load contacts and caregivers:', error);
      
      // Set default emergency contacts
      setEmergencyContacts([
        {
          id: '108',
          name: 'Emergency Services',
          relationship: 'Emergency',
          phone: '108',
          isPrimary: false,
        }
      ]);
    }
  };

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

  const handleSOSPress = () => {
    CustomAlertStatic.alert(
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

  const sendEmergencyAlert = async () => {
    setIsEmergencyActive(false);
    dispatch(setLoading(true));
    
    try {
      const alertData = {
        message: `Emergency alert from ${user?.name || 'Patient'}. Immediate assistance required.`,
        location: currentLocation || undefined,
        severity: 'critical' as const
      };

      await patientAPI.sendSOSAlert(alertData);
      
      CustomAlertStatic.alert(
        'Emergency Alert Sent',
        `Your emergency alert has been sent to all your caregivers and emergency contacts.${currentLocation ? '\n\nYour location has been shared.' : '\n\nLocation sharing was unavailable.'}\n\nHelp is on the way.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      dispatch(setError(error.message));
      CustomAlertStatic.alert(
        'Alert Failed',
        error.message || 'Failed to send emergency alert. Please try calling emergency services directly.',
        [
          { text: 'Retry', onPress: () => setIsEmergencyActive(true) },
          { text: 'Call 108', onPress: () => makeDirectCall('108') },
          { text: 'Cancel' }
        ]
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setCountdown(5);
    CustomAlertStatic.alert('Emergency Alert Cancelled', 'The emergency alert has been cancelled.');
  };

  const makeDirectCall = (phoneNumber: string) => {
    try {
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      Linking.openURL(`tel:${cleanPhone}`);
    } catch (error) {
      console.error('Call failed:', error);
      CustomAlertStatic.alert('Call Failed', `Unable to make call to ${phoneNumber}`);
    }
  };

  const handleContactCall = (contact: EmergencyContact | Caregiver) => {
    const name = contact.name;
    const phone = 'phone' in contact ? contact.phone : contact.phoneNumber;
    
    CustomAlertStatic.alert(
      `Call ${name}`,
      `Do you want to call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => makeDirectCall(phone),
        },
      ]
    );
  };

  const renderContactCard = (contact: EmergencyContact, index: number) => (
    <TouchableOpacity
      key={contact.id}
      style={[
        styles.contactCard, 
        contact.isPrimary && styles.primaryContactCard,
        index === emergencyContacts.length - 1 && styles.lastCard
      ]}
      onPress={() => handleContactCall(contact)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={contact.isPrimary ? ['#FEF2F2', '#FFFFFF'] : ['#FFFFFF', '#F8FAFC']}
        style={styles.contactCardGradient}
      >
        <View style={styles.contactInfo}>
          <View style={[
            styles.contactIcon, 
            contact.isPrimary && styles.primaryContactIcon,
            { backgroundColor: contact.phone === '108' ? '#FEF2F2' : theme.primaryLight }
          ]}>
            <Ionicons 
              name={contact.phone === '108' ? 'call' : 'person'} 
              size={20} 
              color={contact.phone === '108' ? '#EF4444' : theme.primary} 
            />
          </View>
          <View style={styles.contactDetails}>
            <View style={styles.contactNameRow}>
              <Text style={[
                styles.contactName, 
                contact.isPrimary && styles.primaryContactName
              ]}>
                {contact.name}
              </Text>
              {contact.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <Text style={styles.contactRelationship}>{contact.relationship}</Text>
            <Text style={[
              styles.contactPhone,
              { color: contact.phone === '108' ? '#EF4444' : theme.primary }
            ]}>
              {contact.phone}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.callButton,
            { backgroundColor: contact.phone === '108' ? '#EF4444' : '#059669' }
          ]}
          onPress={() => handleContactCall(contact)}
        >
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCaregiverCard = (caregiver: Caregiver, index: number) => (
    <TouchableOpacity
      key={caregiver.id}
      style={[
        styles.contactCard,
        index === caregivers.length - 1 && styles.lastCard
      ]}
      onPress={() => handleContactCall(caregiver)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.contactCardGradient}
      >
        <View style={styles.contactInfo}>
          <View style={[styles.contactIcon, { backgroundColor: '#DCFCE7' }]}>
            <Image 
                  source={require('../../../assets/images/nurse.png')} 
                  style={styles.nurseIcon}
                  resizeMode="contain"
                />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{caregiver.name}</Text>
            <Text style={styles.contactRelationship}>{caregiver.specialization}</Text>
            <Text style={[styles.contactPhone, { color: '#059669' }]}>
              {caregiver.phoneNumber}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.callButton, { backgroundColor: '#059669' }]}
          onPress={() => handleContactCall(caregiver)}
        >
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isEmergencyActive) {
    return (
      <View style={styles.container}>
        <PatientSecondaryNavbar
          title="Emergency Active"
          onBackPress={() => {}}
        />
        
        <View style={styles.emergencyActiveContainer}>
          <LinearGradient
            colors={['#FEF2F2', '#FFFFFF']}
            style={styles.emergencyActiveGradient}
          >
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIcon}>
                <Ionicons name="warning" size={isSmallScreen ? 40 : 48} color="#EF4444" />
              </View>
              <Text style={[
                styles.emergencyTitle,
                { fontSize: isSmallScreen ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'] }
              ]}>
                Emergency Alert Active
              </Text>
              <Text style={styles.emergencySubtitle}>
                Sending alert in {countdown} seconds...
              </Text>
            </View>

            <View style={styles.countdownContainer}>
              <View style={[
                styles.countdownCircle,
                { 
                  width: isSmallScreen ? 100 : 120,
                  height: isSmallScreen ? 100 : 120,
                  borderRadius: isSmallScreen ? 50 : 60
                }
              ]}>
                <Text style={[
                  styles.countdownText,
                  { fontSize: isSmallScreen ? TYPOGRAPHY.fontSize['3xl'] : TYPOGRAPHY.fontSize['4xl'] }
                ]}>
                  {countdown}
                </Text>
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
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="Emergency SOS"
        subtitle="Get immediate help"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Warning */}
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="wifi-outline" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              You are offline. Emergency alerts will be sent when connection is restored.
            </Text>
          </View>
        )}

        {/* Header */}
        <LinearGradient colors={['#FEF2F2', '#FFFFFF']} style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={32} color="#EF4444" />
            </View>
            <Text style={styles.headerTitle}>Emergency Assistance</Text>
            <Text style={styles.headerSubtitle}>
              Get immediate help when you need it most
            </Text>
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
          </View>
        </LinearGradient>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <Animated.View style={[
            styles.sosButtonContainer, 
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <TouchableOpacity
              style={[
                styles.sosButton, 
                { 
                  opacity: isLoading ? 0.6 : 1,
                  width: isSmallScreen ? 160 : 180,
                  height: isSmallScreen ? 160 : 180,
                  borderRadius: isSmallScreen ? 80 : 90
                }
              ]}
              onPress={handleSOSPress}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={isSmallScreen ? 40 : 48} color="#FFFFFF" />
              ) : (
                <Ionicons name="alert-circle" size={isSmallScreen ? 40 : 48} color="#FFFFFF" />
              )}
              <Text style={[
                styles.sosButtonText,
                { fontSize: isSmallScreen ? TYPOGRAPHY.fontSize.md : TYPOGRAPHY.fontSize.lg }
              ]}>
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

        {/* Quick Call Section */}
        <View style={styles.quickCallSection}>
          <Text style={styles.sectionTitle}>Quick Call</Text>
          <View style={styles.quickCallGrid}>
            <TouchableOpacity 
              style={styles.quickCallButton}
              onPress={() => makeDirectCall('108')}
            >
              <View style={[styles.quickCallIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="call" size={24} color="#EF4444" />
              </View>
              <Text style={styles.quickCallText}>108</Text>
              <Text style={styles.quickCallSubtext}>Emergency</Text>
            </TouchableOpacity>
            
            {caregivers.length > 0 && (
              <TouchableOpacity 
                style={styles.quickCallButton}
                onPress={() => handleContactCall(caregivers[0])}
              >
                <View style={[styles.quickCallIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Image 
                  source={require('../../../assets/images/nurse.png')} 
                  style={styles.nurseIcon}
                  resizeMode="contain"
                />
                </View>
                <Text style={styles.quickCallText}>Caregiver</Text>
                <Text style={styles.quickCallSubtext}>Primary</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Caregivers Section */}
        {caregivers.length > 0 && (
          <View style={styles.contactsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Caregivers</Text>
              <Text style={styles.contactCount}>{caregivers.length} connected</Text>
            </View>
            <View style={styles.contactsList}>
              {caregivers.map((caregiver, index) => renderCaregiverCard(caregiver, index))}
            </View>
          </View>
        )}

        {/* Emergency Contacts Section */}
        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.contactCount}>{emergencyContacts.length} contacts</Text>
          </View>
          <View style={styles.contactsList}>
            {emergencyContacts.map((contact, index) => renderContactCard(contact, index))}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <Text style={styles.infoTitle}>Emergency Guidelines</Text>
            </View>
            <Text style={styles.infoText}>
              • Use the emergency button for life-threatening situations{'\n'}
              • Call 108 immediately for severe medical emergencies{'\n'}
              • Contact your caregiver for medication-related concerns{'\n'}
              • Your location will be shared automatically when possible
            </Text>
          </View>
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
  emergencyActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 114 : 70,
  },
  emergencyActiveGradient: {
    width: '90%',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  emergencyHeader: {
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  emergencyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  emergencyTitle: {
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  emergencySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: SPACING[2],
    fontWeight: '500',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  countdownCircle: {
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECACA',
    marginBottom: SPACING[2],
  },
  countdownText: {
    color: '#DC2626',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emergencyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING[4],
    marginBottom: SPACING[4],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
    marginRight: SPACING[2],
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: SPACING[2],
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  sendNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
    marginLeft: SPACING[2],
  },
  sendNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: SPACING[2],
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  emergencyNote: {
    color: '#64748B',
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    marginTop: SPACING[2],
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 114 : 70,
  },
  scrollContent: {
    paddingBottom: SPACING[8],
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: SPACING[5],
    padding: SPACING[3],
    borderRadius: RADIUS.md,
    marginBottom: SPACING[4],
    gap: SPACING[2],
    marginTop: SPACING[4],
  },
  warningText: {
    color: '#F59E0B',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  headerSection: {
    marginHorizontal: SPACING[5],
    borderRadius: RADIUS.xl,
    marginBottom: SPACING[6],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: SPACING[10]
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  headerTitle: {
    fontSize: isSmallScreen ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
    gap: SPACING[2],
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
    paddingHorizontal: SPACING[5],
  },
  sosButtonContainer: {
    marginBottom: SPACING[4],
  },
  sosButton: {
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
  quickCallSection: {
    paddingHorizontal: SPACING[5],
    marginBottom: SPACING[6],
  },
  quickCallGrid: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  quickCallButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickCallIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  quickCallText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  quickCallSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  contactsSection: {
    paddingHorizontal: SPACING[5],
    marginBottom: SPACING[6],
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
  contactsList: {
    gap: SPACING[3],
  },
  contactCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryContactCard: {
    borderColor: '#FECACA',
  },
  lastCard: {
    marginBottom: 0,
  },
  contactCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[4],
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
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  contactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: SPACING[2],
  },
  primaryContactName: {
    color: '#DC2626',
  },
  nurseIcon: {
    height:48,
    width:48,
    borderRadius: RADIUS.full
  },
  primaryBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  primaryBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#DC2626',
    fontWeight: '600',
  },
  contactRelationship: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: SPACING[5],
    marginBottom: SPACING[6],
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 2,
  },
})

export default SOSScreen;