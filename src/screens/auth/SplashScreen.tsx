/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/themes/theme';
import { APP_CONFIG } from '../../constants/app';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isShortDevice = height < 700;

const SplashScreen: React.FC = () => {
  // Animation refs
  const logoFadeAnim = React.useRef(new Animated.Value(0)).current;
  const logoScaleAnim = React.useRef(new Animated.Value(0.3)).current;
  const titleSlideAnim = React.useRef(new Animated.Value(50)).current;
  const titleFadeAnim = React.useRef(new Animated.Value(0)).current;
  const caregiverAnim = React.useRef(new Animated.Value(-width - 100)).current; // Start completely off-screen
  const patientAnim = React.useRef(new Animated.Value(width + 100)).current; // Start completely off-screen
  const connectionAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const featuresFadeAnim = React.useRef(new Animated.Value(0)).current;
  const taglineFadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequential animation
    Animated.sequence([
      // 1. Logo animation
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Title animation
      Animated.parallel([
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Tagline animation
      Animated.timing(taglineFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // 4. Caregiver and Patient animation - animate to final positions
      Animated.parallel([
        Animated.spring(caregiverAnim, {
          toValue: 0, // Move to normal position
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(patientAnim, {
          toValue: 0, // Move to normal position
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 5. Connection animation
      Animated.timing(connectionAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // 6. Features fade in
      Animated.timing(featuresFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for connection lines
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const AnimatedFeature: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    delay: number;
    color: string;
  }> = ({ icon, text, delay, color }) => {
    const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
    const itemSlideAnim = React.useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(itemSlideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.feature,
          {
            opacity: itemFadeAnim,
            transform: [{ translateY: itemSlideAnim }],
          },
        ]}
      >
        <View style={[styles.featureIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={isSmallDevice ? 18 : 20} color="#FFFFFF" />
        </View>
        <Text style={styles.featureText}>{text}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Background Decorative Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
        <View style={[styles.bgCircle, styles.bgCircle4]} />
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoBackground}>
            <Image 
              source={require('../../../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App Title Animation */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleFadeAnim,
              transform: [{ translateY: titleSlideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{APP_CONFIG.NAME}</Text>
          <Animated.View
            style={[
              styles.taglineContainer,
              { opacity: taglineFadeAnim }
            ]}
          >
            <Text style={styles.subtitle}>Your Medicine Companion</Text>
            <Text style={styles.tagline}>
              Connecting caregivers and patients for better health outcomes
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Care Connection Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationContainer}>
            {/* Caregiver */}
            <Animated.View
              style={[
                styles.caregiverContainer,
                {
                  transform: [{ translateX: caregiverAnim }],
                },
              ]}
            >
              <View style={styles.caregiverIcon}>
                <Ionicons name="people" size={isSmallDevice ? 26 : 30} color="#059669" />
              </View>
              <Text style={styles.personLabel}>Caregiver</Text>
              <Text style={styles.personSubLabel}>Manages & Monitors</Text>
            </Animated.View>

            {/* Patient */}
            <Animated.View
              style={[
                styles.patientContainer,
                {
                  transform: [{ translateX: patientAnim }],
                },
              ]}
            >
              <View style={styles.patientIcon}>
                <Ionicons name="person" size={isSmallDevice ? 26 : 30} color="#2196F3" />
              </View>
              <Text style={styles.personLabel}>Patient</Text>
              <Text style={styles.personSubLabel}>Takes & Tracks</Text>
            </Animated.View>
          </View>
        </View>

        {/* Features Animation */}
        <Animated.View
          style={[
            styles.featuresContainer,
            { opacity: featuresFadeAnim },
          ]}
        >
          <AnimatedFeature
            icon="notifications"
            text="Smart Reminders"
            delay={3500}
            color="#F59E0B"
          />
          <AnimatedFeature
            icon="qr-code"
            text="Easy Scanning"
            delay={3800}
            color="#8B5CF6"
          />
          <AnimatedFeature
            icon="analytics"
            text="Track Progress"
            delay={4100}
            color="#10B981"
          />
        </Animated.View>

        {/* Mission Statement */}
        <Animated.View
          style={[
            styles.missionContainer,
            { opacity: featuresFadeAnim }
          ]}
        >
          <Text style={styles.missionText}>
            &quot;Empowering healthcare through technology, one dose at a time&quot;
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Branding */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: featuresFadeAnim },
        ]}
      >
        <View style={styles.brandingContainer}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.securityText}>HIPAA Compliant & Secure</Text>
          </View>
          <Text style={styles.footerText}>
            Version {APP_CONFIG.VERSION} • Powered by Healthcare Innovation
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.6,
  },
  bgCircle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
    backgroundColor: COLORS.primary[500] + '08',
  },
  bgCircle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
    backgroundColor: COLORS.secondary[500] + '05',
  },
  bgCircle3: {
    width: 100,
    height: 100,
    top: '30%',
    right: -20,
    backgroundColor: '#10B981' + '06',
  },
  bgCircle4: {
    width: 80,
    height: 80,
    bottom: '30%',
    right: '20%',
    backgroundColor: COLORS.primary[300] + '04',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[6],
    zIndex: 1,
    paddingTop: isShortDevice ? SPACING[4] : SPACING[8],
    paddingBottom: isShortDevice ? SPACING[4] : SPACING[8],
  },
  logoContainer: {
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
  },
  logoBackground: {
    width: isSmallDevice ? 100 : isShortDevice ? 120 : 140,
    height: isSmallDevice ? 100 : isShortDevice ? 120 : 140,
    borderRadius: isSmallDevice ? 50 : isShortDevice ? 60 : 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoImage: {
    width: isSmallDevice ? 70 : isShortDevice ? 85 : 100,
    height: isSmallDevice ? 70 : isShortDevice ? 85 : 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: isShortDevice ? SPACING[6] : SPACING[8],
  },
  title: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize['2xl'] : isShortDevice ? TYPOGRAPHY.fontSize['3xl'] : TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
    letterSpacing: -1,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.md : isShortDevice ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  tagline: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 22,
    maxWidth: width * 0.85,
  },
  illustrationWrapper: {
    width: '100%',
    height: isSmallDevice ? 120 : 140,
    marginBottom: isShortDevice ? SPACING[6] : SPACING[8],
    position: 'relative',
    overflow: 'hidden',
  },
  illustrationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[8],
    height: '100%',
  },
  caregiverContainer: {
    alignItems: 'center',
    width: isSmallDevice ? 100 : 120,
  },
  patientContainer: {
    alignItems: 'center',
    width: isSmallDevice ? 100 : 120,
  },
  caregiverIcon: {
    width: isSmallDevice ? 50 : isShortDevice ? 55 : 60,
    height: isSmallDevice ? 50 : isShortDevice ? 55 : 60,
    borderRadius: isSmallDevice ? 25 : isShortDevice ? 27.5 : 30,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    marginBottom: SPACING[2],
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  patientIcon: {
    width: isSmallDevice ? 50 : isShortDevice ? 55 : 60,
    height: isSmallDevice ? 50 : isShortDevice ? 55 : 60,
    borderRadius: isSmallDevice ? 25 : isShortDevice ? 27.5 : 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    marginBottom: SPACING[2],
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  personLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: SPACING[1],
    textAlign: 'center',
  },
  personSubLabel: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  connectionContainer: {
    position: 'absolute',
    top: isSmallDevice ? 25 : isShortDevice ? 27.5 : 30,
    left: '50%',
    width: isSmallDevice ? 140 : 160,
    marginLeft: isSmallDevice ? -70 : -80,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  connectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#CBD5E1',
  },
  connectionDot: {
    width: isSmallDevice ? 28 : 32,
    height: isSmallDevice ? 28 : 32,
    borderRadius: isSmallDevice ? 14 : 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING[1],
    borderWidth: 2,
    borderColor: '#FEF2F2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
    paddingHorizontal: isSmallDevice ? SPACING[3] : SPACING[4],
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SPACING[1],
    maxWidth: width * 0.28,
  },
  featureIcon: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  featureText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: isSmallDevice ? 14 : 16,
  },
  missionContainer: {
    alignItems: 'center',
    marginBottom: isShortDevice ? SPACING[4] : SPACING[6],
    paddingHorizontal: SPACING[4],
  },
  missionText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: isShortDevice ? SPACING[4] : SPACING[6],
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING[6],
  },
  brandingContainer: {
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: SPACING[4],
    marginBottom: SPACING[3],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '600',
  },
  footerText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SplashScreen;