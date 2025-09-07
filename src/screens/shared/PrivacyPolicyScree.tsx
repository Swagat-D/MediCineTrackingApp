import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Linking,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
  userRole?: 'caregiver' | 'patient';
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ 
  navigation, 
  userRole
}) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [animatedValues] = useState(
    Array(10).fill(0).map(() => new Animated.Value(0))
  );

  const theme = {
  primary: userRole === 'caregiver' ? '#059669' : '#2563EB', // Changed patient blue to match login
  primaryLight: userRole === 'caregiver' ? '#ECFDF5' : '#EFF6FF', // Lighter backgrounds
  primaryDark: userRole === 'caregiver' ? '#047857' : '#1D4ED8', // Darker variants
  gradient: userRole === 'caregiver'
    ? ['#ECFDF5', '#FFFFFF'] as const // Softer green gradient
    : ['#EFF6FF', '#FFFFFF'] as const, // Softer blue gradient
  accent: userRole === 'caregiver' ? '#10B981' : '#3B82F6', // Better accent colors
  text: userRole === 'caregiver' ? '#065F46' : '#1E40AF', // Darker text colors for better contrast
  border: userRole === 'caregiver' ? '#A7F3D0' : '#BFDBFE', // Subtle border colors
};

  const toggleSection = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const isExpanded = expandedSections[index];
    setExpandedSections(prev => ({
      ...prev,
      [index]: !isExpanded
    }));

    Animated.timing(animatedValues[index], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleContactPress = (type: 'email' | 'phone') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:privacy@meditracker.com');
        break;
      case 'phone':
        Linking.openURL('tel:+1-800-MEDITRACK');
        break;
    }
  };

  const handleCopyEmail = () => {
    Clipboard.setString('privacy@meditracker.com');
    Alert.alert('Email Copied', 'Privacy email address has been copied to clipboard');
  };

  const collapsibleSections = [
    {
      title: "Information We Collect",
      icon: "information-circle",
      content: {
        intro: "We collect different types of information to provide you with the best medication management experience:",
        subsections: [
          {
            title: "Personal Information",
            items: [
              "Name, age, gender, and contact information",
              "Email address and phone number", 
              "Account credentials and authentication data"
            ]
          },
          {
            title: "Health Information", 
            items: [
              "Medication names, dosages, and schedules",
              "Medication adherence and intake records",
              "Medical history and allergy information (when provided)",
              "Emergency contact information"
            ]
          },
          {
            title: "Usage Information",
            items: [
              "App usage patterns and preferences",
              "Device information and technical data",
              "Log files and error reports (anonymized)"
            ]
          }
        ]
      }
    },
    {
      title: "How We Use Your Information",
      icon: "construct",
      content: {
        intro: "We use your information solely to provide and improve our medication management services:",
        items: [
          "Send medication reminders and alerts",
          "Enable caregiver-patient connections",
          "Track medication adherence and generate reports",
          "Provide technical support and customer service",
          "Improve app functionality and user experience",
          "Ensure medication safety and prevent errors"
        ]
      }
    },
    {
      title: "Information Sharing and Disclosure", 
      icon: "share",
      content: {
        intro: "We do not sell, trade, or rent your personal health information. We may share your information only in the following circumstances:",
        items: [
          "With your designated caregivers (with your explicit consent)",
          "When required by law or legal process", 
          "To protect health and safety in emergency situations",
          "With service providers who assist in app functionality (under strict confidentiality agreements)"
        ]
      }
    },
    {
      title: "Your Privacy Rights",
      icon: "shield-checkmark",
      content: {
        intro: "Under HIPAA and applicable privacy laws, you have the right to:",
        rights: [
          { icon: "eye", text: "Access your health information" },
          { icon: "create", text: "Request corrections to your data" },
          { icon: "download", text: "Export your data" },
          { icon: "trash", text: "Request deletion of your account" },
          { icon: "ban", text: "Restrict certain uses of your information" },
          { icon: "document-text", text: "Receive an accounting of disclosures" }
        ]
      }
    }
  ];

  return (
  <View style={styles.container}>
    <PatientSecondaryNavbar
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
        colors={theme.gradient}
        style={styles.headerSection}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { shadowColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={48} color={theme.primary} />
          </View>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>
            Your privacy and data security are our top priorities
          </Text>
          <View style={[styles.lastUpdatedBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.lastUpdated, { color: theme.primary }]}>
              Last updated: December 15, 2024
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Introduction</Text>
        <View style={styles.introCard}>
          <Text style={styles.bodyText}>
            MediTracker Technologies (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and 
            ensuring the security of your personal health information. This Privacy Policy explains how 
            we collect, use, disclose, and safeguard your information when you use our MediTracker mobile 
            application and related services.
          </Text>
        </View>
      </View>

      {/* HIPAA Compliance Highlight */}
      <View style={styles.section}>
        <View style={[styles.highlightBox, { 
          backgroundColor: theme.primaryLight,
          borderColor: theme.primary + '30'
        }]}>
          <LinearGradient
            colors={[theme.primaryLight, theme.primaryLight + '80']}
            style={styles.highlightGradient}
          >
            <View style={styles.highlightHeader}>
              <View style={[styles.highlightIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.highlightTitle, { color: theme.primaryDark }]}>
                HIPAA Compliance Guarantee
              </Text>
            </View>
            <Text style={[styles.highlightText, { color: theme.primaryDark }]}>
              MediTracker is fully HIPAA compliant. We implement administrative, physical, and technical 
              safeguards to protect your Protected Health Information (PHI) in accordance with federal 
              health information privacy laws.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Collapsible Sections */}
      {collapsibleSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <TouchableOpacity
            style={[
              styles.collapsibleHeader,
              expandedSections[index] && { backgroundColor: theme.primaryLight }
            ]}
            onPress={() => toggleSection(index)}
            activeOpacity={0.8}
          >
            <View style={styles.collapsibleHeaderContent}>
              <View style={[
                styles.collapsibleIcon,
                { backgroundColor: expandedSections[index] ? theme.primary : theme.primaryLight }
              ]}>
                <Ionicons 
                  name={section.icon as any} 
                  size={20} 
                  color={expandedSections[index] ? '#FFFFFF' : theme.primary} 
                />
              </View>
              <Text style={[
                styles.collapsibleTitle,
                expandedSections[index] && { color: theme.primary }
              ]}>
                {section.title}
              </Text>
              <Animated.View style={{
                transform: [{
                  rotate: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  })
                }]
              }}>
                <Ionicons 
                  name="chevron-down" 
                  size={20} 
                  color={expandedSections[index] ? theme.primary : '#94A3B8'} 
                />
              </Animated.View>
            </View>
          </TouchableOpacity>

          {expandedSections[index] && (
            <Animated.View style={[
              styles.collapsibleContent,
              {
                opacity: animatedValues[index],
                transform: [{
                  scale: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })
                }]
              }
            ]}>
              <Text style={styles.contentIntro}>{section.content.intro}</Text>
              
              {section.content.subsections ? (
                section.content.subsections.map((subsection, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                    <View style={styles.bulletList}>
                      {subsection.items.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.bulletItem}>
                          <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                          <Text style={styles.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              ) : section.content.rights ? (
                <View style={styles.rightsGrid}>
                  {section.content.rights.map((right, rightIndex) => (
                    <View key={rightIndex} style={styles.rightItem}>
                      <View style={[styles.rightIcon, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name={right.icon as any} size={16} color={theme.primary} />
                      </View>
                      <Text style={styles.rightText}>{right.text}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.bulletList}>
                  {section.content.items?.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.bulletItem}>
                      <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </View>
      ))}

      {/* Data Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.bodyText}>
          We implement industry-leading security measures to protect your information:
        </Text>
        
        <View style={styles.securityGrid}>
          <View style={styles.securityItem}>
            <LinearGradient
              colors={[theme.primaryLight, '#FFFFFF']}
              style={styles.securityGradient}
            >
              <View style={[styles.securityIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="lock-closed" size={20} color={theme.primary} />
              </View>
              <Text style={styles.securityTitle}>Encryption</Text>
              <Text style={styles.securityDescription}>End-to-end encryption for all data transmission</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.securityItem}>
            <LinearGradient
              colors={[theme.primaryLight, '#FFFFFF']}
              style={styles.securityGradient}
            >
              <View style={[styles.securityIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="server" size={20} color={theme.primary} />
              </View>
              <Text style={styles.securityTitle}>Secure Storage</Text>
              <Text style={styles.securityDescription}>HIPAA-compliant cloud infrastructure</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.securityItem}>
            <LinearGradient
              colors={[theme.primaryLight, '#FFFFFF']}
              style={styles.securityGradient}
            >
              <View style={[styles.securityIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              </View>
              <Text style={styles.securityTitle}>Access Control</Text>
              <Text style={styles.securityDescription}>Multi-factor authentication and role-based access</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Additional Policies */}
      <View style={styles.section}>
        <View style={styles.additionalPolicies}>
          <View style={styles.policyCard}>
            <View style={[styles.policyIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="time" size={20} color={theme.primary} />
            </View>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Data Retention</Text>
              <Text style={styles.policyText}>
                We retain your information only as long as necessary. Medication logs older than 1 year are automatically archived.
              </Text>
            </View>
          </View>

          <View style={styles.policyCard}>
            <View style={[styles.policyIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people" size={20} color={theme.primary} />
            </View>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Children&apos;s Privacy</Text>
              <Text style={styles.policyText}>
                MediTracker is not intended for children under 13. We do not knowingly collect personal information from children.
              </Text>
            </View>
          </View>

          <View style={styles.policyCard}>
            <View style={[styles.policyIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="globe" size={20} color={theme.primary} />
            </View>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>International Users</Text>
              <Text style={styles.policyText}>
                Your information may be transferred to, stored, and processed in the United States where our servers are located.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions? Contact Our Privacy Team</Text>
        
        <View style={styles.contactCard}>
          <Text style={styles.contactIntro}>
            If you have questions about this Privacy Policy or our privacy practices, please contact us:
          </Text>
          
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: theme.primary }]}
              onPress={() => handleContactPress('email')}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Email Privacy Team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactButtonSecondary, { borderColor: theme.primary }]}
              onPress={handleCopyEmail}
            >
              <Ionicons name="copy" size={18} color={theme.primary} />
              <Text style={[styles.contactButtonSecondaryText, { color: theme.primary }]}>
                Copy Email
              </Text>
            </TouchableOpacity>
          </View>

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
              <Text style={styles.contactText}>
                MediTracker Technologies{'\n'}Privacy Officer{'\n'}123 Healthcare Blvd{'\n'}Medical City, MC 12345
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Compliance Footer */}
      <View style={styles.complianceSection}>
        <LinearGradient
          colors={[theme.primaryLight, theme.primaryLight + '80']}
          style={styles.complianceBadge}
        >
          <View style={[styles.complianceIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.complianceTextContainer}>
            <Text style={[styles.complianceTitle, { color: theme.primaryDark }]}>
              HIPAA Compliant & SOC 2 Certified
            </Text>
            <Text style={[styles.complianceSubtext, { color: theme.primary }]}>
              Your health data is protected by the highest security standards
            </Text>
          </View>
        </LinearGradient>
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
    marginBottom: SPACING[4],
  },
  lastUpdatedBadge: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
  },
  lastUpdated: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[2],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  introCard: {
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
  bodyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'justify',
  },
  highlightBox: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightGradient: {
    padding: SPACING[5],
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
    gap: SPACING[3],
  },
  highlightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  highlightText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: 22,
  },
  collapsibleHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[2],
  },
  collapsibleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsibleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  collapsibleTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  collapsibleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING[4],
  },
  contentIntro: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    marginBottom: SPACING[4],
  },
  subsection: {
    marginBottom: SPACING[4],
  },
  subsectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#374151',
    marginBottom: SPACING[3],
  },
  bulletList: {
    gap: SPACING[2],
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
    marginTop: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
  },
  rightsGrid: {
    gap: SPACING[3],
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING[3],
    gap: SPACING[3],
  },
  rightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    fontWeight: '500',
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[4],
    marginTop: SPACING[4],
  },
  securityItem: {
    flex: 1,
    minWidth: '30%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityGradient: {
    padding: SPACING[4],
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  additionalPolicies: {
    gap: SPACING[4],
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  policyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  policyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactIntro: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#475569',
    lineHeight: 24,
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  contactActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[5],
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  contactButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderWidth: 1,
    gap: SPACING[2],
  },
  contactButtonSecondaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  contactInfo: {
    gap: SPACING[3],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    lineHeight: 20,
  },
  complianceSection: {
    alignItems: 'center',
    paddingVertical: SPACING[6],
    marginHorizontal: SPACING[5],
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    gap: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complianceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complianceTextContainer: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
  },
  complianceSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    marginTop: SPACING[1],
  },
});

export default PrivacyPolicyScreen;