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
  ColorValue
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { CustomAlertStatic } from '@/components/common/CustomAlert/CustomAlertStatic';

interface AboutScreenProps {
  navigation: any;
  userRole?: 'caregiver' | 'patient'; // Add this prop to determine role
}

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation, userRole = 'caregiver' }) => {


  const theme = {
    primary: userRole === 'caregiver' ? '#059669' : '#2196F3',
    primaryLight: userRole === 'caregiver' ? '#F0FDF4' : '#E3F2FD',
    primaryDark: userRole === 'caregiver' ? '#047857' : '#1976D2',
    gradient: (userRole === 'caregiver'
      ? ['#F0FDF4', '#FFFFFF']
      : ['#E3F2FD', '#FFFFFF']) as [ColorValue, ColorValue],
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleCopyEmail = () => {
    Clipboard.setString('info@meditracker.com');
    CustomAlertStatic.alert('Email Copied', 'Email address has been copied to clipboard');
  };


  const roleSpecificContent = {
    caregiver: {
      heroTitle: "Supporting Caregivers in Medication Management",
      heroSubtitle: "Empowering you to provide the best care for your patients",
      benefits: [
        {
          icon: "people-outline",
          title: "Manage Multiple Patients",
          description: "Efficiently track medications for all your patients in one place"
        },
        {
          icon: "qr-code-outline",
          title: "Smart Barcode System",
          description: "Generate unique barcodes for each medication to prevent dosing errors"
        },
        {
          icon: "notifications-outline",
          title: "Medication Alerts",
          description: "Get notified when patients miss doses or medications are running low"
        },
        {
          icon: "shield-checkmark-outline",
          title: "Safety Monitoring",
          description: "Prevent double-dosing and ensure medication adherence"
        }
      ],
      howItWorks: [
        {
          step: "1",
          title: "Add Patients",
          description: "Register patients using their mobile number or email address"
        },
        {
          step: "2",
          title: "Input Medications",
          description: "Add medicine details including dosage, frequency, and timing"
        },
        {
          step: "3",
          title: "Generate Barcodes",
          description: "Print unique barcodes for each medication package"
        },
        {
          step: "4",
          title: "Monitor Progress",
          description: "Track patient adherence and receive important alerts"
        }
      ]
    },
    patient: {
      heroTitle: "Never Miss Your Medication Again",
      heroSubtitle: "Take control of your health with smart medication reminders",
      benefits: [
        {
          icon: "time-outline",
          title: "Personalized Reminders",
          description: "Get medication alerts based on your meal times and schedule"
        },
        {
          icon: "scan-outline",
          title: "Easy Barcode Scanning",
          description: "Scan medication barcodes to confirm you're taking the right dose"
        },
        {
          icon: "checkmark-circle-outline",
          title: "Track Your Progress",
          description: "See your medication history and adherence progress"
        },
        {
          icon: "call-outline",
          title: "Emergency Support",
          description: "Quick SOS feature to contact your caregiver in emergencies"
        }
      ],
      howItWorks: [
        {
          step: "1",
          title: "Set Meal Times",
          description: "Configure your breakfast, lunch, and dinner schedule"
        },
        {
          step: "2",
          title: "Receive Reminders",
          description: "Get timely notifications when it's time to take your medicine"
        },
        {
          step: "3",
          title: "Scan & Confirm",
          description: "Scan the barcode to verify and record your medication intake"
        },
        {
          step: "4",
          title: "Stay Connected",
          description: "Your caregiver stays informed about your medication adherence"
        }
      ]
    }
  };

  const currentContent = roleSpecificContent[userRole];

  return (
    <View style={styles.container}>
      <SecondaryNavbar
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
              Your trusted medication companion
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
                  name={userRole === 'caregiver' ? 'medical' : 'heart'} 
                  size={32} 
                  color={theme.primary} 
                />
              </View>
              <Text style={styles.heroTitle}>{currentContent.heroTitle}</Text>
              <Text style={styles.heroSubtitle}>{currentContent.heroSubtitle}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              We&apos;re committed to solving medication adherence challenges that affect millions worldwide. 
              Our app helps prevent medication errors, reduces confusion about dosing, and ensures 
              patients receive the right medication at the right time, every time.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>1.5M+</Text>
                <Text style={styles.statLabel}>Americans affected by medication errors annually</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>50%</Text>
                <Text style={styles.statLabel}>Of prescriptions unused due to confusion</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userRole === 'caregiver' ? 'Benefits for Caregivers' : 'Benefits for Patients'}
          </Text>
          
          <View style={styles.benefitsList}>
            {currentContent.benefits.map((benefit, index) => (
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
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            {currentContent.howItWorks.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {index < currentContent.howItWorks.length - 1 && (
                  <View style={[styles.stepConnector, { backgroundColor: theme.primaryLight }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Safety & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Privacy</Text>
          
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <View style={[styles.safetyIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
              </View>
              <Text style={styles.safetyTitle}>Your Data is Protected</Text>
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
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: theme.primary }]}
              onPress={() => handleLinkPress('mailto:info@meditracker.com')}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Send us an Email</Text>
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
            
            <Text style={styles.contactEmail}>info@meditracker.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 MediTracker Technologies</Text>
          <Text style={styles.footerSubtext}>Making medication management safer for everyone</Text>
          <View style={[styles.complianceBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.complianceText, { color: theme.primary }]}>
              HIPAA Compliant • SOC 2 Certified
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

export default AboutScreen;