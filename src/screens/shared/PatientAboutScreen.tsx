import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  Clipboard,
  Alert,
  ColorValue
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

interface PatientAboutScreenProps {
  navigation: any;
}

const PatientAboutScreen: React.FC<PatientAboutScreenProps> = ({ navigation }) => {
  // Patient-specific blue theme (matching HelpSupportScreen)
  const theme = {
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    gradient: ['#EFF6FF', '#FFFFFF'] as [ColorValue, ColorValue],
    accent: '#3B82F6',
    text: '#1E40AF',
    border: '#BFDBFE',
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleCopyEmail = () => {
    Clipboard.setString('support@meditracker.com');
    Alert.alert('Email Copied', 'Email address has been copied to clipboard');
  };

  const patientContent = {
    heroTitle: "Your Personal Medication Safety Companion",
    heroSubtitle: "Take control of your health with smart medication management and safety features",
    benefits: [
      {
        icon: "scan-outline",
        title: "Smart Barcode Scanning",
        description: "Scan medication barcodes to confirm you're taking the right medicine at the right time"
      },
      {
        icon: "shield-checkmark-outline",
        title: "Overdose Prevention",
        description: "Get instant alerts if you try to take a medication you've already taken"
      },
      {
        icon: "people-outline",
        title: "Multiple Caregiver Support",
        description: "Stay connected with all your caregivers who help manage your medications"
      },
      {
        icon: "call-outline",
        title: "Emergency SOS Feature",
        description: "One-tap emergency alerts to your caregivers and quick access to emergency contacts"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Set Your Meal Schedule",
        description: "Configure your breakfast, lunch, and dinner times for accurate medication timing"
      },
      {
        step: "2",
        title: "Receive Smart Reminders",
        description: "Get personalized notifications when it's time to take your medications"
      },
      {
        step: "3",
        title: "Scan & Verify",
        description: "Use barcode scanning to confirm the right medication and prevent double-dosing"
      },
      {
        step: "4",
        title: "Stay Safe & Connected",
        description: "Use SOS alerts for emergencies and keep your caregivers informed of your progress"
      }
    ],
    safetyFeatures: [
      {
        icon: "shield-checkmark-outline",
        title: "Overdose Prevention",
        description: "Prevents accidental double-dosing with smart tracking"
      },
      {
        icon: "warning-outline",
        title: "Safety Alerts",
        description: "Instant notifications for medication conflicts or missed doses"
      },
      {
        icon: "call-outline",
        title: "Emergency Access",
        description: "Quick access to emergency contacts and SOS alerts"
      },
      {
        icon: "people-outline",
        title: "Caregiver Network",
        description: "Multiple caregivers can monitor and support your medication routine"
      }
    ]
  };

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
        title="About MediTracker"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradient}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { shadowColor: theme.primary }]}>
                <Image 
                  source={require('../../../assets/images/logo.png')} 
                  style={styles.logoIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.appName}>MediTracker</Text>
            <Text style={[styles.appTagline, { color: theme.primary }]}>
              Your trusted medication safety companion
            </Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </LinearGradient>

        {/* Hero Section */}
        <View style={styles.section}>
          <View style={[styles.heroCard, { borderColor: theme.primaryLight }]}>
            <LinearGradient
              colors={theme.gradient}
              style={styles.heroGradient}
            >
              <View style={[styles.heroIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons 
                  name="heart" 
                  size={32} 
                  color={theme.primary} 
                />
              </View>
              <Text style={styles.heroTitle}>{patientContent.heroTitle}</Text>
              <Text style={styles.heroSubtitle}>{patientContent.heroSubtitle}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empowering Safe Medication Management</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              We understand that managing medications can be challenging and sometimes overwhelming. 
              Our app is designed specifically to help you take the right medication at the right time, 
              prevent dangerous overdoses, and keep you connected with your caregivers for support when you need it most.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>125K+</Text>
                <Text style={styles.statLabel}>Medication errors prevented annually</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>95%</Text>
                <Text style={styles.statLabel}>Improvement in medication adherence</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How MediTracker Keeps You Safe</Text>
          
          <View style={styles.benefitsList}>
            {patientContent.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={benefit.icon as any} size={24} color={theme.primary} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started is Easy</Text>
          
          <View style={styles.stepsContainer}>
            {patientContent.howItWorks.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {index < patientContent.howItWorks.length - 1 && (
                  <View style={[styles.stepConnector, { backgroundColor: theme.primaryLight }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Safety Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Safety Features</Text>
          
          <View style={styles.safetyGrid}>
            {patientContent.safetyFeatures.map((feature, index) => (
              <View key={index} style={styles.safetyFeatureCard}>
                <View style={[styles.safetyFeatureIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={feature.icon as any} size={24} color={theme.primary} />
                </View>
                <Text style={styles.safetyFeatureTitle}>{feature.title}</Text>
                <Text style={styles.safetyFeatureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Support</Text>
          
          <View style={styles.emergencyCard}>
            <LinearGradient
              colors={['#FEF2F2', '#FEE2E2']}
              style={styles.emergencyGradient}
            >
              <View style={styles.emergencyHeader}>
                <View style={styles.emergencyIcon}>
                  <Ionicons name="warning" size={28} color="#DC2626" />
                </View>
                <Text style={styles.emergencyTitle}>SOS Alert System</Text>
              </View>
              
              <Text style={styles.emergencyDescription}>
                In case of emergency, tap the SOS button to instantly alert all your connected caregivers. 
                You can also quickly access your emergency contacts with one tap to call for immediate help.
              </Text>
              
              <View style={styles.emergencyFeatures}>
                <View style={styles.emergencyFeature}>
                  <Ionicons name="flash" size={16} color="#DC2626" />
                  <Text style={styles.emergencyFeatureText}>Instant caregiver alerts</Text>
                </View>
                <View style={styles.emergencyFeature}>
                  <Ionicons name="call" size={16} color="#DC2626" />
                  <Text style={styles.emergencyFeatureText}>Quick emergency contact access</Text>
                </View>
                <View style={styles.emergencyFeature}>
                  <Ionicons name="location" size={16} color="#DC2626" />
                  <Text style={styles.emergencyFeatureText}>Location sharing with caregivers</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy & Security</Text>
          
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <View style={[styles.safetyIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
              </View>
              <Text style={styles.safetyTitle}>Your Health Data is Protected</Text>
            </View>
            
            <View style={styles.safetyFeatures}>
              <View style={styles.safetyFeature}>
                <Ionicons name="lock-closed" size={16} color={theme.primary} />
                <Text style={styles.safetyFeatureText}>HIPAA Compliant Security</Text>
              </View>
              <View style={styles.safetyFeature}>
                <Ionicons name="shield" size={16} color={theme.primary} />
                <Text style={styles.safetyFeatureText}>End-to-End Encryption</Text>
              </View>
              <View style={styles.safetyFeature}>
                <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                <Text style={styles.safetyFeatureText}>SOC 2 Certified</Text>
              </View>
              <View style={styles.safetyFeature}>
                <Ionicons name="eye-off" size={16} color={theme.primary} />
                <Text style={styles.safetyFeatureText}>You control who sees your data</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: theme.primary }]}
              onPress={() => handleLinkPress('mailto:support@meditracker.com')}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactButtonSecondary, { borderColor: theme.primary }]}
              onPress={handleCopyEmail}
            >
              <Ionicons name="copy" size={20} color={theme.primary} />
              <Text style={[styles.contactButtonSecondaryText, { color: theme.primary }]}>
                Copy Email Address
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.contactEmail}>support@meditracker.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 MediTracker Technologies</Text>
          <Text style={styles.footerSubtext}>Empowering patients with safe medication management</Text>
          <View style={[styles.complianceBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.complianceText, { color: theme.primary }]}>
              HIPAA Compliant • Patient-First Design
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
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 100 : 56,
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  headerSection: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[8],
    paddingTop: SPACING[12],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING[4],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
    height: 60,
    width: 60,
    borderRadius: RADIUS.full,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginBottom: SPACING[2],
    fontWeight: '500',
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[5],
    textAlign: 'center',
  },
  heroCard: {
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroGradient: {
    padding: SPACING[6],
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 26,
    textAlign: 'justify',
    marginBottom: SPACING[5],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING[4],
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: SPACING[1],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  benefitsList: {
    gap: SPACING[4],
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  benefitDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: SPACING[5],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
    zIndex: 1,
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: SPACING[1],
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 40,
    zIndex: 0,
  },
  safetyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[4],
  },
  safetyFeatureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safetyFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  safetyFeatureTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  safetyFeatureDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  emergencyCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyGradient: {
    padding: SPACING[5],
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#DC2626',
  },
  emergencyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#991B1B',
    lineHeight: 20,
    marginBottom: SPACING[4],
  },
  emergencyFeatures: {
    gap: SPACING[2],
  },
  emergencyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  emergencyFeatureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#991B1B',
    fontWeight: '500',
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  safetyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  safetyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  safetyFeatures: {
    gap: SPACING[3],
  },
  safetyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  safetyFeatureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[6],
    marginBottom: SPACING[3],
    width: '100%',
    gap: SPACING[2],
  },
  contactButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
    borderWidth: 1,
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  contactButtonSecondaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  contactEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[5],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  complianceBadge: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
  },
  complianceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
});

export default PatientAboutScreen;