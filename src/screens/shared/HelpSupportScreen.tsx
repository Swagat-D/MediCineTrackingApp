import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

interface HelpSupportScreenProps {
  navigation: any;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  const handleContactPress = (type: 'email' | 'phone') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@meditracker.com?subject=Help Request');
        break;
      case 'phone':
        Linking.openURL('tel:+1-800-MEDITRACK');
        break;
    }
  };

  const handleFAQPress = (question: string, answer: string) => {
    Alert.alert(question, answer, [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title="Help & Support"
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
            <View style={styles.headerIcon}>
              <Ionicons name="help-circle" size={48} color="#059669" />
            </View>
            <Text style={styles.headerTitle}>We&apos;re Here to Help</Text>
            <Text style={styles.headerSubtitle}>
              Get assistance with MediTracker features and troubleshooting
            </Text>
          </View>
        </LinearGradient>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactGrid}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleContactPress('email')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#059669" />
              </View>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@meditracker.com</Text>
              <Text style={styles.contactDescription}>
                Get detailed help within 24 hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleContactPress('phone')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={24} color="#059669" />
              </View>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactSubtitle}>1-800-MEDITRACK</Text>
              <Text style={styles.contactDescription}>
                Mon-Fri, 9 AM - 6 PM EST
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqList}>
            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => handleFAQPress(
                'How do I add a new medication?',
                'Go to your patient details screen and tap "Add Medication". Fill in the required information including medicine name, dosage, frequency, and timing. A barcode will be automatically generated for tracking.'
              )}
            >
              <View style={styles.faqIcon}>
                <Ionicons name="medical" size={20} color="#059669" />
              </View>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>How do I add a new medication?</Text>
                <Text style={styles.faqPreview}>Learn about adding medications and generating barcodes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => handleFAQPress(
                'How does barcode scanning work?',
                'Patients scan the medication barcode using their phone camera. The app verifies if it\'s time for the dose and prevents double-dosing by tracking when medications were last taken.'
              )}
            >
              <View style={styles.faqIcon}>
                <Ionicons name="qr-code" size={20} color="#059669" />
              </View>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>How does barcode scanning work?</Text>
                <Text style={styles.faqPreview}>Understanding the barcode verification system</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => handleFAQPress(
                'Can I manage multiple patients?',
                'Yes! As a caregiver, you can add and manage multiple patients. Each patient can have their own set of medications and schedules. You\'ll receive notifications for all your patients.'
              )}
            >
              <View style={styles.faqIcon}>
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>Can I manage multiple patients?</Text>
                <Text style={styles.faqPreview}>Managing multiple patients as a caregiver</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => handleFAQPress(
                'How do I reset my password?',
                'On the login screen, tap "Forgot Password". Enter your email address and we\'ll send you a verification code. Use this code to create a new password.'
              )}
            >
              <View style={styles.faqIcon}>
                <Ionicons name="lock-closed" size={20} color="#059669" />
              </View>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>How do I reset my password?</Text>
                <Text style={styles.faqPreview}>Password recovery and account security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => handleFAQPress(
                'What if I miss a medication reminder?',
                'If you miss a scheduled dose, the app will show this in your medication history. Caregivers will also be notified of missed doses. You can still take the medication and mark it as taken, but always consult your healthcare provider about missed doses.'
              )}
            >
              <View style={styles.faqIcon}>
                <Ionicons name="time" size={20} color="#059669" />
              </View>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>What if I miss a medication reminder?</Text>
                <Text style={styles.faqPreview}>Handling missed doses and notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.tipText}>
                Print medication labels on adhesive paper for easy attachment to pill bottles
              </Text>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.tipText}>
                Set up meal times in your profile to get accurate timing reminders
              </Text>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.tipText}>
                Use the SOS feature for emergency contact with your caregivers
              </Text>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.tipText}>
                Keep your app updated for the latest features and security improvements
              </Text>
            </View>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>MediTracker v1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 2024.12.15</Text>
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
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  contactGrid: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#059669',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  faqList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  faqPreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 18,
  },
  tipsList: {
    gap: SPACING[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#A16207',
    lineHeight: 20,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#94A3B8',
    marginTop: SPACING[1],
  },
});

export default HelpSupportScreen;