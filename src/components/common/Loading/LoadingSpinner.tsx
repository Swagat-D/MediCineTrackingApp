/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/themes/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

interface InlineLoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

// Creative Medical Loading Spinner with animations
export const MedicalLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary[500],
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Medicine pill animations
  const pill1Anim = useRef(new Animated.Value(0)).current;
  const pill2Anim = useRef(new Animated.Value(0)).current;
  const pill3Anim = useRef(new Animated.Value(0)).current;
  
  // Syringe animation
  const syringeAnim = useRef(new Animated.Value(0)).current;
  
  // Watch/clock animation
  const clockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Scale pulse animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for center
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Medicine pills orbital animation
    const pillsAnimation = Animated.loop(
      Animated.timing(pill1Anim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pill2Animation = Animated.loop(
      Animated.timing(pill2Anim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pill3Animation = Animated.loop(
      Animated.timing(pill3Anim, {
        toValue: 1,
        duration: 4500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Syringe animation
    const syringeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(syringeAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(syringeAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Clock animation
    const clockAnimation = Animated.loop(
      Animated.timing(clockAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Start all animations
    rotateAnimation.start();
    scaleAnimation.start();
    pulseAnimation.start();
    pillsAnimation.start();
    pill2Animation.start();
    pill3Animation.start();
    syringeAnimation.start();
    clockAnimation.start();

    return () => {
      rotateAnimation.stop();
      scaleAnimation.stop();
      pulseAnimation.stop();
      pillsAnimation.stop();
      pill2Animation.stop();
      pill3Animation.stop();
      syringeAnimation.stop();
      clockAnimation.stop();
    };
  }, []);

  const spinnerSize = size === 'large' ? 120 : 80;
  const iconSize = size === 'large' ? 24 : 18;
  const centerIconSize = size === 'large' ? 32 : 24;

  // Animation interpolations
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pill1Rotate = pill1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pill2Rotate = pill2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const pill3Rotate = pill3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const syringeTranslate = syringeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const clockRotate = clockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.spinnerContainer, style]}>
      <View style={[styles.medicalSpinner, { width: spinnerSize, height: spinnerSize }]}>
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderColor: color + '40',
              transform: [{ rotate }, { scale: scaleAnim }],
            },
          ]}
        />

        {/* Medicine Pills - Orbital */}
        <Animated.View
          style={[
            styles.pillOrbit,
            {
              width: spinnerSize - 20,
              height: spinnerSize - 20,
              transform: [{ rotate: pill1Rotate }],
            },
          ]}
        >
          <View style={[styles.pillContainer, { backgroundColor: COLORS.medical.pill }]}>
            <Ionicons name="medical" size={iconSize} color={COLORS.primary[600]} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.pillOrbit2,
            {
              width: spinnerSize - 30,
              height: spinnerSize - 30,
              transform: [{ rotate: pill2Rotate }],
            },
          ]}
        >
          <View style={[styles.pillContainer, { backgroundColor: COLORS.secondary[100] }]}>
            <Ionicons name="fitness" size={iconSize} color={COLORS.secondary[600]} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.pillOrbit3,
            {
              width: spinnerSize - 40,
              height: spinnerSize - 40,
              transform: [{ rotate: pill3Rotate }],
            },
          ]}
        >
          <View style={[styles.pillContainer, { backgroundColor: COLORS.warning + '30' }]}>
            <Ionicons name="flask" size={iconSize} color={COLORS.warning} />
          </View>
        </Animated.View>

        {/* Syringe */}
        <Animated.View
          style={[
            styles.syringeContainer,
            {
              transform: [{ translateY: syringeTranslate }, { rotate: '45deg' }],
            },
          ]}
        >
          <View style={[styles.syringeIcon, { backgroundColor: COLORS.medical.reminder }]}>
            <Ionicons name="bandage" size={iconSize} color={COLORS.error} />
          </View>
        </Animated.View>

        {/* Clock/Watch */}
        <Animated.View
          style={[
            styles.clockContainer,
            {
              transform: [{ rotate: clockRotate }],
            },
          ]}
        >
          <View style={[styles.clockIcon, { backgroundColor: COLORS.info + '20' }]}>
            <Ionicons name="time" size={iconSize} color={COLORS.info} />
          </View>
        </Animated.View>

        {/* Center medical cross */}
        <Animated.View
          style={[
            styles.centerIcon,
            {
              backgroundColor: color + '20',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="medical" size={centerIconSize} color={color} />
        </Animated.View>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: color,
                  opacity: pulseAnim,
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0.8, 1.2],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// Simple Loading Spinner (fallback)
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  return <MedicalLoadingSpinner {...props} />;
};

// Full Screen Loading Overlay with Medical Animation
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(messageAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(messageAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlayContainer, { opacity: fadeAnim }]}>
        <View style={styles.overlayContent}>
          <MedicalLoadingSpinner size="large" color={COLORS.primary[500]} />
          
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: messageAnim,
                transform: [
                  {
                    translateY: messageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.overlayMessage}>{message}</Text>
            <View style={styles.loadingDots}>
              <Text style={styles.overlaySubMessage}>
                Please wait while we process your request
              </Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Inline Loading with Medical Theme
export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Loading...',
  size = 'small',
  color = COLORS.primary[500],
  style,
}) => {
  return (
    <View style={[styles.inlineContainer, style]}>
      <MedicalLoadingSpinner size={size} color={color} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[4],
  },
  medicalSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderRadius: 1000,
  },
  pillOrbit: {
    position: 'absolute',
    borderRadius: 1000,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pillOrbit2: {
    position: 'absolute',
    borderRadius: 1000,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pillOrbit3: {
    position: 'absolute',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pillContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syringeContainer: {
    position: 'absolute',
    top: -20,
    right: 10,
  },
  syringeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockContainer: {
    position: 'absolute',
    bottom: -15,
    left: 15,
  },
  clockIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: -40,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING[8],
    alignItems: 'center',
    minWidth: 200,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: SPACING[6],
  },
  overlayMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  overlaySubMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingDots: {
    marginTop: SPACING[2],
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[3],
  },
  inlineMessage: {
    marginLeft: SPACING[3],
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default LoadingSpinner;