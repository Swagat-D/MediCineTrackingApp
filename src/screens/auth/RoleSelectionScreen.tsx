/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { UserRole } from '../../types/auth.types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/themes/theme';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Props = AuthStackScreenProps<'RoleSelection'>;

const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Quick initialization - no weird loading states
    const timer = setTimeout(() => {
      setIsReady(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelection = (role: UserRole) => {
    navigation.navigate('Login', { role });
  };

  // Simple loading dots instead of containers
  const LoadingDots = () => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]).start(() => animateDots());
      };
      animateDots();
    }, []);

    return (
      <View style={styles.loadingDotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    );
  };

  const RoleCard: React.FC<{
    role: UserRole;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    benefits: string[];
    gradientColors: [string, string];
    delay?: number;
  }> = ({ role, title, description, icon, benefits, gradientColors, delay = 0 }) => {
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: delay,
        useNativeDriver: true,
      }).start();
    }, [delay]);

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          { opacity: cardOpacity, transform: [{ scale: cardScale }] }
        ]}
      >
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection(role)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.98}
        >
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: gradientColors[0] },
              role === 'caregiver' && styles.caregiverIconAdjustment
            ]}>
              <Ionicons name={icon} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDescription}>{description}</Text>
            </View>
          </View>

          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitDot, { backgroundColor: gradientColors[0] }]} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.continueText, { color: gradientColors[0] }]}>
              Continue as {title}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={gradientColors[0]} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.appTitle}>MediTracker</Text>
            <Text style={styles.appSubtitle}>Your trusted medication companion</Text>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Choose Your Role</Text>
            <Text style={styles.welcomeDescription}>
              Select your role to access personalized features designed for your healthcare needs
            </Text>
          </View>
        </Animated.View>

        {/* Role Cards or Loading */}
        {isReady ? (
          <View style={styles.rolesContainer}>
            <RoleCard
              role="caregiver"
              title="Caregiver"
              description="For healthcare providers & family caregivers"
              icon="people"
              benefits={[
                'Manage multiple patient medications',
                'Set and monitor medication schedules',
                'Track adherence and generate reports',
                'Receive alerts for missed doses'
              ]}
              gradientColors={['#059669', '#047857']}
              delay={100}
            />

            <RoleCard
              role="patient"
              title="Patient"
              description="For individuals managing their medications"
              icon="person"
              benefits={[
                'Track your personal medications',
                'Receive timely reminders',
                'Log medication intake easily',
                'Share progress with caregivers'
              ]}
              gradientColors={['#2563EB', '#1D4ED8']}
              delay={200}
            />
          </View>
        ) : (
          <View style={styles.loadingSection}>
            <Text style={styles.loadingText}>Loading your options</Text>
            <LoadingDots />
          </View>
        )}

        {/* Features Section */}
        {isReady && (
          <Animated.View 
            style={[
              styles.featuresSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.featuresTitle}>Why Choose MediTracker?</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={22} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Secure & Private</Text>
                <Text style={styles.featureDescription}>HIPAA compliant data protection</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="notifications" size={22} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Smart Reminders</Text>
                <Text style={styles.featureDescription}>Never miss a medication dose</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="qr-code" size={22} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Barcode Scanning</Text>
                <Text style={styles.featureDescription}>Quick medication identification</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="analytics" size={22} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Health Insights</Text>
                <Text style={styles.featureDescription}>Track adherence patterns</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Help Section */}
        {isReady && (
          <Animated.View 
            style={[
              styles.helpSection,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={18} color="#64748B" />
              <Text style={styles.helpText}>Need help choosing? Contact Support</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  logoContainer: {
    marginBottom: SPACING[5],
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '600',
    color: '#334155',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  loadingSection: {
    alignItems: 'center',
    paddingVertical: SPACING[10],
    marginBottom: SPACING[10],
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: SPACING[6],
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#059669',
  },
  rolesContainer: {
    gap: SPACING[6],
    marginBottom: SPACING[10],
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING[6],
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...SHADOWS.lg,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[5],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
    ...SHADOWS.md,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  cardTitleContainer: {
    flex: 1,
    paddingTop: SPACING[1],
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[1],
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  benefitsList: {
    marginBottom: SPACING[5],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: SPACING[3],
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#475569',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  caregiverIconAdjustment: {
    marginTop: SPACING[1],
  },
  continueText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: SPACING[8],
  },
  featuresTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[4],
    justifyContent: 'space-between',
  },
  featureItem: {
    width: (width - SPACING[5] * 2 - SPACING[4]) / 2,
    backgroundColor: '#FFFFFF',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  helpSection: {
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[5],
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default RoleSelectionScreen;