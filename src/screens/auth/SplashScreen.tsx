import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/themes/theme';
import { APP_CONFIG } from '../../constants/app';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[700]} />
      
      <LinearGradient
        colors={[COLORS.primary[600], COLORS.primary[800], COLORS.secondary[600]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo Animation */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoBackground}>
              <Ionicons name="medical" size={80} color={COLORS.primary[500]} />
            </View>
          </Animated.View>

          {/* App Title Animation */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>{APP_CONFIG.NAME}</Text>
            <Text style={styles.subtitle}>Your Medicine Companion</Text>
            <Text style={styles.tagline}>
              Helping you stay healthy, one dose at a time
            </Text>
          </Animated.View>

          {/* Features Animation */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.feature}>
              <Ionicons name="notifications" size={24} color={COLORS.background} />
              <Text style={styles.featureText}>Smart Reminders</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="qr-code" size={24} color={COLORS.background} />
              <Text style={styles.featureText}>Barcode Scanning</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="people" size={24} color={COLORS.background} />
              <Text style={styles.featureText}>Caregiver Support</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Branding */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.footerText}>
            Version {APP_CONFIG.VERSION}
          </Text>
          <Text style={styles.footerSubtext}>
            Powered by Healthcare Innovation
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
  },
  logoContainer: {
    marginBottom: SPACING[8],
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gray[900],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING[2],
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '500',
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING[3],
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING[8],
    paddingHorizontal: SPACING[4],
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.background,
    opacity: 0.9,
    marginTop: SPACING[2],
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING[8],
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    opacity: 0.8,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.background,
    opacity: 0.6,
    marginTop: SPACING[1],
  },
});

export default SplashScreen;