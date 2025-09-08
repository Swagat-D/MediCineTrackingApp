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
  // Simplified animation refs
  const logoFadeAnim = React.useRef(new Animated.Value(0)).current;
  const logoScaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const titleFadeAnim = React.useRef(new Animated.Value(0)).current;
  const titleSlideAnim = React.useRef(new Animated.Value(30)).current;
  const contentFadeAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fast, smooth animation sequence (2.5s total)
    Animated.sequence([
      // 1. Logo appears quickly (0-800ms)
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Title slides in (800-1400ms)
      Animated.parallel([
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Content fades in (1400-2000ms)
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    
    // Start pulse after initial animations
    setTimeout(() => {
      pulseAnimation.start();
    }, 1000);

    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Simplified Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />
      </View>

      <View style={styles.content}>
        {/* Logo Section with Pulse */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim,
              transform: [
                { scale: Animated.multiply(logoScaleAnim, pulseAnim) }
              ],
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

        {/* App Title */}
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
          <Text style={styles.subtitle}>Your Medicine Companion</Text>
        </Animated.View>

        {/* Simplified Care Connection */}
        <Animated.View
          style={[
            styles.connectionSection,
            { opacity: contentFadeAnim }
          ]}
        >
          <View style={styles.connectionContainer}>
            <View style={styles.caregiverIcon}>
              <Ionicons name="people" size={24} color="#059669" />
            </View>
            
            <View style={styles.connectionLine}>
              <View style={styles.connectionDot}>
                <Ionicons name="heart" size={16} color="#EF4444" />
              </View>
            </View>
            
            <View style={styles.patientIcon}>
              <Ionicons name="person" size={24} color="#2196F3" />
            </View>
          </View>
          <Text style={styles.connectionText}>Connecting Care & Health</Text>
        </Animated.View>

        {/* Key Features */}
        <Animated.View
          style={[
            styles.featuresContainer,
            { opacity: contentFadeAnim }
          ]}
        >
          <View style={styles.feature}>
            <Ionicons name="notifications" size={20} color="#F59E0B" />
            <Text style={styles.featureText}>Smart Reminders</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="qr-code" size={20} color="#8B5CF6" />
            <Text style={styles.featureText}>Easy Scanning</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={20} color="#10B981" />
            <Text style={styles.featureText}>Track Progress</Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: contentFadeAnim }
        ]}
      >
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={styles.securityText}>HIPAA Secure</Text>
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
    width: 120,
    height: 120,
    bottom: 150,
    left: -40,
    backgroundColor: COLORS.secondary[500] + '05',
  },
  bgCircle3: {
    width: 80,
    height: 80,
    top: '35%',
    right: -20,
    backgroundColor: '#10B981' + '06',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: isShortDevice ? SPACING[6] : SPACING[8],
  },
  logoBackground: {
    width: isSmallDevice ? 110 : 130,
    height: isSmallDevice ? 110 : 130,
    borderRadius: isSmallDevice ? 55 : 65,
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
    width: isSmallDevice ? 75 : 90,
    height: isSmallDevice ? 75 : 90,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: isShortDevice ? SPACING[8] : SPACING[10],
  },
  title: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize['3xl'] : TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING[2],
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  connectionSection: {
    alignItems: 'center',
    marginBottom: isShortDevice ? SPACING[8] : SPACING[10],
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[3],
    paddingHorizontal: SPACING[4],
  },
  caregiverIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  patientIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  connectionLine: {
    width: 80,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: SPACING[2],
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEF2F2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  connectionText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING[4],
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: SPACING[2],
    lineHeight: isSmallDevice ? 14 : 16,
  },
  footer: {
    position: 'absolute',
    bottom: isShortDevice ? SPACING[6] : SPACING[8],
    alignItems: 'center',
    width: '100%',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: SPACING[4],
    gap: SPACING[2],
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityText: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    color: '#059669',
    fontWeight: '600',
  },
});

export default SplashScreen;