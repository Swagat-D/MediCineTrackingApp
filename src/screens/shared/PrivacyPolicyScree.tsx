import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SecondaryNavbar from '../../components/common/SecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SecondaryNavbar
        title="Privacy Policy"
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
              <Ionicons name="shield-checkmark" size={48} color="#059669" />
            </View>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>
              Your privacy and data security are our top priorities
            </Text>
            <Text style={styles.lastUpdated}>Last updated: December 15, 2024</Text>
          </View>
        </LinearGradient>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.bodyText}>
            MediTracker Technologies (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and 
            ensuring the security of your personal health information. This Privacy Policy explains how 
            we collect, use, disclose, and safeguard your information when you use our MediTracker mobile 
            application and related services.
          </Text>
        </View>

        {/* HIPAA Compliance */}
        <View style={styles.section}>
          <View style={styles.highlightBox}>
            <View style={styles.highlightHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#059669" />
              <Text style={styles.highlightTitle}>HIPAA Compliance</Text>
            </View>
            <Text style={styles.highlightText}>
              MediTracker is fully HIPAA compliant. We implement administrative, physical, and technical 
              safeguards to protect your Protected Health Information (PHI) in accordance with federal 
              health information privacy laws.
            </Text>
          </View>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Personal Information</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Name, age, gender, and contact information</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Email address and phone number</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Account credentials and authentication data</Text>
              </View>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Health Information</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Medication names, dosages, and schedules</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Medication adherence and intake records</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Medical history and allergy information (when provided)</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Emergency contact information</Text>
              </View>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Usage Information</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>App usage patterns and preferences</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Device information and technical data</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Log files and error reports (anonymized)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.bodyText}>
            We use your information solely to provide and improve our medication management services:
          </Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Provide technical support and customer service</Text>
            </View>
          </View>
        </View>

        {/* Information Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing and Disclosure</Text>
          <Text style={styles.bodyText}>
            We do not sell, trade, or rent your personal health information. We may share your information only in the following circumstances:
          </Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>With your designated caregivers (with your explicit consent)</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>When required by law or legal process</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>To protect health and safety in emergency situations</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>With service providers who assist in app functionality (under strict confidentiality agreements)</Text>
            </View>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.bodyText}>
            We implement industry-leading security measures to protect your information:
          </Text>
          
          <View style={styles.securityGrid}>
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="lock-closed" size={20} color="#2196F3" />
              </View>
              <Text style={styles.securityTitle}>Encryption</Text>
              <Text style={styles.securityDescription}>End-to-end encryption for all data transmission</Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="server" size={20} color="#2196F3" />
              </View>
              <Text style={styles.securityTitle}>Secure Storage</Text>
              <Text style={styles.securityDescription}>HIPAA-compliant cloud infrastructure</Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
              </View>
              <Text style={styles.securityTitle}>Access Control</Text>
              <Text style={styles.securityDescription}>Multi-factor authentication and role-based access</Text>
            </View>
          </View>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
          <Text style={styles.bodyText}>
            Under HIPAA and applicable privacy laws, you have the right to:
          </Text>
          
          <View style={styles.rightsGrid}>
            <View style={styles.rightItem}>
              <Ionicons name="eye" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Access your health information</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="create" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Request corrections to your data</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="download" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Export your data</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="trash" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Request deletion of your account</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="ban" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Restrict certain uses of your information</Text>
            </View>
            <View style={styles.rightItem}>
              <Ionicons name="document-text" size={18} color="#4CAF50" />
              <Text style={styles.rightText}>Receive an accounting of disclosures</Text>
            </View>
          </View>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.bodyText}>
            We retain your information only as long as necessary to provide our services and comply with legal obligations. Medication logs older than 1 year are automatically archived, and inactive accounts are deleted after 3 years of inactivity (with prior notice).
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
          <Text style={styles.bodyText}>
            MediTracker is not intended for children under 13. We do not knowingly collect personal information from children under 13. If a parent or guardian becomes aware that their child has provided personal information, please contact us immediately.
          </Text>
        </View>

        {/* International Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>International Users</Text>
          <Text style={styles.bodyText}>
            If you are accessing MediTracker from outside the United States, please note that your information may be transferred to, stored, and processed in the United States where our servers are located and our central database is operated.
          </Text>
        </View>

        {/* Changes to Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.bodyText}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and sending you an email notification. Changes become effective immediately upon posting.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have questions about this Privacy Policy or our privacy practices, please contact us:
          </Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#64748B" />
              <Text style={styles.contactText}>privacy@meditracker.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#64748B" />
              <Text style={styles.contactText}>1-800-MEDITRACK</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color="#64748B" />
              <Text style={styles.contactText}>MediTracker Technologies{'\n'}Privacy Officer{'\n'}123 Healthcare Blvd{'\n'}Medical City, MC 12345</Text>
            </View>
          </View>
        </View>

        {/* Compliance Badge */}
        <View style={styles.complianceSection}>
          <View style={styles.complianceBadge}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <View style={styles.complianceText}>
              <Text style={styles.complianceTitle}>HIPAA Compliant</Text>
              <Text style={styles.complianceSubtext}>SOC 2 Type II Certified</Text>
            </View>
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
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
    shadowColor: '#4CAF50',
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
    marginBottom: SPACING[2],
  },
  lastUpdated: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.full,
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[5],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[4],
  },
  subsectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#374151',
    marginBottom: SPACING[3],
    marginTop: SPACING[4],
  },
  bodyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'justify',
  },
  highlightBox: {
    backgroundColor: '#E8F5E8',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  highlightTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#2E7D32',
  },
  highlightText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#2E7D32',
    lineHeight: 22,
  },
  subsection: {
    marginBottom: SPACING[4],
  },
  bulletList: {
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[4],
    marginTop: SPACING[4],
  },
  securityItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  securityDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  rightsGrid: {
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    gap: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rightText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    fontWeight: '500',
  },
  contactInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    marginTop: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[4],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 22,
  },
  complianceSection: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
    marginHorizontal: SPACING[5],
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    gap: SPACING[3],
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  complianceText: {
    alignItems: 'center',
  },
  complianceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#2E7D32',
  },
  complianceSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#388E3C',
    marginTop: SPACING[1],
  },
});

export default PrivacyPolicyScreen;