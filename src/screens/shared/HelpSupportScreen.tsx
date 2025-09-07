import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Clipboard,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import PatientSecondaryNavbar from '../../components/common/PatientSecondaryNavbar';

interface HelpSupportScreenProps {
  navigation: any;
  userRole?: 'caregiver' | 'patient';
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ 
  navigation, 
  userRole
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [animatedValues] = useState(
    Array(5).fill(0).map(() => new Animated.Value(0))
  );

  const theme = {
    primary: userRole === 'caregiver' ? '#059669' : '#2563EB',
    primaryLight: userRole === 'caregiver' ? '#ECFDF5' : '#EFF6FF',
    primaryDark: userRole === 'caregiver' ? '#047857' : '#1D4ED8',
    gradient: userRole === 'caregiver'
      ? ['#ECFDF5', '#FFFFFF'] as const
      : ['#EFF6FF', '#FFFFFF'] as const,
    accent: userRole === 'caregiver' ? '#10B981' : '#3B82F6',
    text: userRole === 'caregiver' ? '#065F46' : '#1E40AF',
    border: userRole === 'caregiver' ? '#A7F3D0' : '#BFDBFE',
  };

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

  const handleCopyToClipboard = (text: string, type: string) => {
    Clipboard.setString(text);
    Alert.alert(
      'Copied!', 
      `${type} has been copied to clipboard`,
      [{ text: 'OK' }]
    );
  };

  const toggleFAQ = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (expandedFAQ === index) {
      setExpandedFAQ(null);
      Animated.timing(animatedValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Close previously opened FAQ
      if (expandedFAQ !== null) {
        Animated.timing(animatedValues[expandedFAQ], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      
      setExpandedFAQ(index);
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const faqData = [
    {
      question: 'How do I add a new medication?',
      answer: 'Go to your patient details screen and tap "Add Medication". Fill in the required information including medicine name, dosage, frequency, and timing. A barcode will be automatically generated for tracking.',
      icon: 'medical'
    },
    {
      question: 'How does barcode scanning work?',
      answer: 'Patients scan the medication barcode using their phone camera. The app verifies if it\'s time for the dose and prevents double-dosing by tracking when medications were last taken.',
      icon: 'qr-code'
    },
    {
      question: 'Can I manage multiple patients?',
      answer: 'Yes! As a caregiver, you can add and manage multiple patients. Each patient can have their own set of medications and schedules. You\'ll receive notifications for all your patients.',
      icon: 'people'
    },
    {
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password". Enter your email address and we\'ll send you a verification code. Use this code to create a new password.',
      icon: 'lock-closed'
    },
    {
      question: 'What if I miss a medication reminder?',
      answer: 'If you miss a scheduled dose, the app will show this in your medication history. Caregivers will also be notified of missed doses. You can still take the medication and mark it as taken, but always consult your healthcare provider about missed doses.',
      icon: 'time'
    }
  ];

  return (
    <View style={styles.container}>
      <PatientSecondaryNavbar
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
          colors={theme.gradient}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { shadowColor: theme.primary }]}>
              <Ionicons name="help-circle" size={48} color={theme.primary} />
            </View>
            <Text style={styles.headerTitle}>We&apos;re Here to Help</Text>
            <Text style={styles.headerSubtitle}>
              Get assistance with MediTracker features and troubleshooting
            </Text>
          </View>
        </LinearGradient>

        {/* Enhanced Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactGrid}>
            {/* Email Support Card */}
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={[styles.contactIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="mail" size={24} color={theme.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactSubtitle}>We reply within 24 hours</Text>
                </View>
              </View>
              
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleContactPress('email')}
                >
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Send Email</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.secondaryButton, { 
                    backgroundColor: theme.primaryLight, 
                    borderColor: theme.primary 
                  }]}
                  onPress={() => handleCopyToClipboard('support@meditracker.com', 'Email address')}
                >
                  <Ionicons name="copy" size={16} color={theme.primary} />
                  <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Copy</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.contactDetail, { 
                color: theme.primary, 
                backgroundColor: theme.primaryLight 
              }]}>
                support@meditracker.com
              </Text>
            </View>

            {/* Phone Support Card */}
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={[styles.contactIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="call" size={24} color={theme.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Phone Support</Text>
                  <Text style={styles.contactSubtitle}>Mon-Fri, 9 AM - 6 PM EST</Text>
                </View>
              </View>
              
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleContactPress('phone')}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Call Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.secondaryButton, { 
                    backgroundColor: theme.primaryLight, 
                    borderColor: theme.primary 
                  }]}
                  onPress={() => handleCopyToClipboard('1-800-MEDITRACK', 'Phone number')}
                >
                  <Ionicons name="copy" size={16} color={theme.primary} />
                  <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Copy</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.contactDetail, { 
                color: theme.primary, 
                backgroundColor: theme.primaryLight 
              }]}>
                1-800-MEDITRACK
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced FAQs with Accordion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqContainer}>
            {faqData.map((faq, index) => {
              const isExpanded = expandedFAQ === index;
              const rotateAnimation = animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              });
              
              return (
                <View key={index} style={styles.faqItem}>
                  <TouchableOpacity
                    style={[
                      styles.faqQuestion,
                      isExpanded && { backgroundColor: theme.primaryLight }
                    ]}
                    onPress={() => toggleFAQ(index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.faqQuestionContent}>
                      <View style={[
                        styles.faqQuestionIcon,
                        { backgroundColor: isExpanded ? theme.primaryLight : theme.primaryLight + '80' }
                      ]}>
                        <Ionicons name={faq.icon as any} size={20} color={theme.primary} />
                      </View>
                      
                      <View style={styles.faqQuestionTextContainer}>
                        <Text style={[
                          styles.faqQuestionText,
                          isExpanded && { color: theme.primary, fontWeight: '600' }
                        ]}>
                          {faq.question}
                        </Text>
                      </View>
                      
                      <Animated.View style={[
                        styles.faqChevron,
                        { transform: [{ rotate: rotateAnimation }] }
                      ]}>
                        <Ionicons 
                          name="chevron-down" 
                          size={20} 
                          color={isExpanded ? theme.primary : "#94A3B8"} 
                        />
                      </Animated.View>
                    </View>
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <Animated.View style={[
                      styles.faqAnswer,
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
                      <LinearGradient
                        colors={theme.gradient}
                        style={styles.faqAnswerGradient}
                      >
                        <View style={styles.faqAnswerContent}>
                          <View style={[styles.faqAnswerIcon, { backgroundColor: theme.primaryLight }]}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                          </View>
                          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <LinearGradient
                colors={['#FFFBEB', '#FEF3C7']}
                style={styles.tipGradient}
              >
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.tipText}>
                  Print medication labels on adhesive paper for easy attachment to pill bottles
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.tipItem}>
              <LinearGradient
                colors={['#FFFBEB', '#FEF3C7']}
                style={styles.tipGradient}
              >
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.tipText}>
                  Set up meal times in your profile to get accurate timing reminders
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.tipItem}>
              <LinearGradient
                colors={['#FFFBEB', '#FEF3C7']}
                style={styles.tipGradient}
              >
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.tipText}>
                  Use the SOS feature for emergency contact with your caregivers
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.tipItem}>
              <LinearGradient
                colors={['#FFFBEB', '#FEF3C7']}
                style={styles.tipGradient}
              >
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                </View>
                <Text style={styles.tipText}>
                  Keep your app updated for the latest features and security improvements
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <LinearGradient
            colors={[theme.primaryLight, theme.primaryLight + '80']}
            style={styles.versionCard}
          >
            <View style={[styles.versionIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="information-circle" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.versionTextContainer}>
              <Text style={[styles.versionText, { color: theme.primaryDark }]}>
                MediTracker v1.0.0
              </Text>
              <Text style={[styles.versionSubtext, { color: theme.primary }]}>
                Last Updated Aug 2025
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
  },
  section: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  contactGrid: {
    gap: SPACING[4],
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  contactSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
  },
  contactActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[3],
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  contactDetail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: RADIUS.md,
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqQuestion: {
    padding: SPACING[4],
    backgroundColor: '#FFFFFF',
  },
  faqQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  faqQuestionTextContainer: {
    flex: 1,
  },
  faqQuestionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '500',
    color: '#1E293B',
  },
  faqChevron: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqAnswer: {
    overflow: 'hidden',
  },
  faqAnswerGradient: {
    padding: SPACING[4],
    paddingTop: 0,
  },
  faqAnswerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqAnswerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
    marginTop: 2,
  },
  faqAnswerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    lineHeight: 20,
  },
  tipsList: {
    gap: SPACING[3],
  },
  tipItem: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    paddingHorizontal: SPACING[5],
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    gap: SPACING[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  versionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionTextContainer: {
    flex: 1,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700',
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    marginTop: SPACING[1],
  },
});

export default HelpSupportScreen;