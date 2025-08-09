import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

interface AboutScreenProps {
  navigation: any;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

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
          colors={['#F0FDF4', '#FFFFFF']}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="medical" size={48} color="#059669" />
              </View>
            </View>
            <Text style={styles.appName}>MediTracker</Text>
            <Text style={styles.appTagline}>Your trusted medication companion</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </LinearGradient>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            MediTracker was created to help patients and caregivers manage medications safely and effectively. 
            We believe that proper medication management is crucial for better health outcomes, and our app 
            provides the tools to prevent missed doses, avoid dangerous double-dosing, and maintain clear 
            communication between patients and their caregivers.
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="qr-code" size={20} color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Barcode System</Text>
                <Text style={styles.featureDescription}>
                  Scan medication barcodes to verify doses and prevent double-dosing
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="notifications" size={20} color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Intelligent Reminders</Text>
                <Text style={styles.featureDescription}>
                  Personalized medication reminders based on your schedule and meal times
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Caregiver Connection</Text>
                <Text style={styles.featureDescription}>
                  Connect patients with caregivers for better medication monitoring
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Safety First</Text>
                <Text style={styles.featureDescription}>
                  HIPAA-compliant security with medication verification and SOS alerts
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics" size={20} color="#059669" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Adherence Tracking</Text>
                <Text style={styles.featureDescription}>
                  Monitor medication adherence with detailed reports and insights
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With Care</Text>
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <View style={styles.techIcon}>
                <Ionicons name="phone-portrait" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.techLabel}>React Native</Text>
              <Text style={styles.techDescription}>Cross-platform mobile app</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techIcon}>
                <Ionicons name="server" size={24} color="#10B981" />
              </View>
              <Text style={styles.techLabel}>Node.js</Text>
              <Text style={styles.techDescription}>Secure backend API</Text>
            </View>

            <View style={styles.techItem}>
              <View style={styles.techIcon}>
                <Ionicons name="cloud" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.techLabel}>MongoDB</Text>
              <Text style={styles.techDescription}>Reliable data storage</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Making a Difference</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.5M+</Text>
              <Text style={styles.statLabel}>Americans harmed by medication errors yearly</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50%</Text>
              <Text style={styles.statLabel}>Of prescriptions go unused due to forgetfulness</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Medication monitoring and support</Text>
            </View>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Team</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamDescription}>
              MediTracker is developed by a dedicated team of healthcare technology specialists, 
              software engineers, and medical professionals who understand the critical importance 
              of medication adherence and patient safety.
            </Text>
            
            <View style={styles.teamValues}>
              <View style={styles.valueItem}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.valueText}>Patient-centered design</Text>
              </View>
              <View style={styles.valueItem}>
                <Ionicons name="shield" size={16} color="#3B82F6" />
                <Text style={styles.valueText}>Privacy & security first</Text>
              </View>
              <View style={styles.valueItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.valueText}>Evidence-based solutions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn More</Text>
          <View style={styles.linksList}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://meditracker.com')}
            >
              <View style={styles.linkIcon}>
                <Ionicons name="globe" size={20} color="#059669" />
              </View>
              <Text style={styles.linkText}>Visit our website</Text>
              <Ionicons name="open" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('mailto:info@meditracker.com')}
            >
              <View style={styles.linkIcon}>
                <Ionicons name="mail" size={20} color="#059669" />
              </View>
              <Text style={styles.linkText}>Contact us</Text>
              <Ionicons name="open" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://meditracker.com/research')}
            >
              <View style={styles.linkIcon}>
                <Ionicons name="document-text" size={20} color="#059669" />
              </View>
              <Text style={styles.linkText}>Research & studies</Text>
              <Ionicons name="open" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2024 MediTracker Technologies</Text>
          <Text style={styles.copyrightSubtext}>All rights reserved</Text>
          <Text style={styles.complianceText}>HIPAA Compliant • SOC 2 Certified</Text>
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
    paddingVertical: SPACING[8],
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
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#059669',
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  missionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'justify',
  },
  featuresList: {
    gap: SPACING[4],
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  techGrid: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  techItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  techIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  techLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  techDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
  },
  statsGrid: {
    gap: SPACING[4],
  },
  statItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: '#059669',
    marginBottom: SPACING[2],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    marginBottom: SPACING[5],
    textAlign: 'justify',
  },
  teamValues: {
    gap: SPACING[3],
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  valueText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  linksList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#475569',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginHorizontal: SPACING[5],
  },
  copyrightText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: SPACING[1],
  },
  copyrightSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
    marginBottom: SPACING[3],
  },
  complianceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
});

export default AboutScreen;