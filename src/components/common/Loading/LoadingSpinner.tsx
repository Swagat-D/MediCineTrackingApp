/* eslint-disable @typescript-eslint/no-unused-vars */
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

// Premium Medical Loading Spinner with Natural Medical Animations
export const MedicalLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary[500],
  style,
}) => {
  // Core medical animation values
  const heartbeatAnim = useRef(new Animated.Value(1)).current;
  const capsuleDissolveAnim = useRef(new Animated.Value(0)).current;
  const liquidFlowAnim = useRef(new Animated.Value(0)).current;
  const syringeInjectAnim = useRef(new Animated.Value(0)).current;
  const pulseWaveAnim = useRef(new Animated.Value(0)).current;
  
  // Sophisticated morphing system
  const morphStateAnim = useRef(new Animated.Value(0)).current;
  const capsuleOpacityAnim = useRef(new Animated.Value(1)).current;
  const liquidOpacityAnim = useRef(new Animated.Value(0)).current;
  const clockOpacityAnim = useRef(new Animated.Value(0)).current;
  const heartOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Breathing and organic movement
  const organicBreathingAnim = useRef(new Animated.Value(1)).current;
  const medicalAuraAnim = useRef(new Animated.Value(0.4)).current;
  
  // Advanced timing elements
  const clockHandsAnim = useRef(new Animated.Value(0)).current;
  const digitalDisplayAnim = useRef(new Animated.Value(0)).current;
  
  // Liquid simulation
  const liquidBubble1 = useRef(new Animated.Value(0)).current;
  const liquidBubble2 = useRef(new Animated.Value(0)).current;
  const liquidBubble3 = useRef(new Animated.Value(0)).current;
  
  // EKG line simulation
  const ekgLineAnim = useRef(new Animated.Value(0)).current;
  const ekgSpike1 = useRef(new Animated.Value(0)).current;
  const ekgSpike2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Realistic heartbeat pattern (lub-dub rhythm)
    const createHeartbeat = () => {
      return Animated.loop(
        Animated.sequence([
          // First beat (lub) - stronger
          Animated.timing(heartbeatAnim, {
            toValue: 1.35,
            duration: 120,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(heartbeatAnim, {
            toValue: 1,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          // Brief pause
          Animated.delay(100),
          // Second beat (dub) - gentler
          Animated.timing(heartbeatAnim, {
            toValue: 1.15,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(heartbeatAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          // Rest period
          Animated.delay(800),
        ])
      );
    };

    // Capsule dissolving animation (realistic medicine dissolution)
    const createCapsuleDissolve = () => {
      return Animated.loop(
        Animated.sequence([
          // Capsule intact
          Animated.delay(2000),
          // Start dissolving
          Animated.timing(capsuleDissolveAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          // Fully dissolved
          Animated.delay(1000),
          // Reform
          Animated.timing(capsuleDissolveAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
    };

    // Liquid flow simulation (IV drip style)
    const createLiquidFlow = () => {
      return Animated.loop(
        Animated.timing(liquidFlowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    };

    // Syringe injection motion
    const createSyringeInject = () => {
      return Animated.loop(
        Animated.sequence([
          // Pull back (drawing medication)
          Animated.timing(syringeInjectAnim, {
            toValue: -0.8,
            duration: 800,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.delay(200),
          // Push forward (injecting)
          Animated.timing(syringeInjectAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          // Return to neutral
          Animated.timing(syringeInjectAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(1500),
        ])
      );
    };

    // Medical pulse wave (like ECG)
    const createPulseWave = () => {
      return Animated.loop(
        Animated.timing(pulseWaveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    };

    // Sophisticated morphing sequence
    const createMorphSequence = () => {
      return Animated.loop(
        Animated.sequence([
          // Phase 1: Capsule (0-2s)
          Animated.timing(capsuleOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(1700),
          Animated.timing(capsuleOpacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          
          // Phase 2: Liquid/IV (2-4s)
          Animated.timing(liquidOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.delay(1600),
          Animated.timing(liquidOpacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          
          // Phase 3: Clock/Timing (4-6s)
          Animated.timing(clockOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.delay(1600),
          Animated.timing(clockOpacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          
          // Phase 4: Heart/Health (6-8s)
          Animated.timing(heartOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.delay(1600),
          Animated.timing(heartOpacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
    };

    // Organic breathing effect
    const createOrganicBreathing = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(organicBreathingAnim, {
            toValue: 1.03,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(organicBreathingAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Medical aura/glow effect
    const createMedicalAura = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(medicalAuraAnim, {
            toValue: 0.8,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(medicalAuraAnim, {
            toValue: 0.4,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Clock hands realistic movement
    const createClockHands = () => {
      return Animated.loop(
        Animated.timing(clockHandsAnim, {
          toValue: 1,
          duration: 12000, // 12 seconds for full rotation
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    };

    // Digital display flickering
    const createDigitalDisplay = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(digitalDisplayAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.delay(2000),
          Animated.timing(digitalDisplayAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
          Animated.timing(digitalDisplayAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(1000),
        ])
      );
    };

    // Liquid bubbles simulation
    const createLiquidBubbles = () => {
      const bubble1Anim = Animated.loop(
        Animated.sequence([
          Animated.timing(liquidBubble1, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(liquidBubble1, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.delay(2000),
        ])
      );

      const bubble2Anim = Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(liquidBubble2, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(liquidBubble2, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.delay(1900),
        ])
      );

      const bubble3Anim = Animated.loop(
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(liquidBubble3, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(liquidBubble3, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.delay(2500),
        ])
      );

      return [bubble1Anim, bubble2Anim, bubble3Anim];
    };

    // EKG line simulation
    const createEKGLine = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(ekgLineAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
          // Sharp spike for heartbeat
          Animated.timing(ekgSpike1, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(ekgSpike1, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.delay(150),
          Animated.timing(ekgSpike2, { toValue: 1, duration: 30, useNativeDriver: true }),
          Animated.timing(ekgSpike2, { toValue: 0, duration: 30, useNativeDriver: true }),
          Animated.delay(1000),
        ])
      );
    };

    // Start all animations
    const heartbeatAnimation = createHeartbeat();
    const capsuleDissolveAnimation = createCapsuleDissolve();
    const liquidFlowAnimation = createLiquidFlow();
    const syringeInjectAnimation = createSyringeInject();
    const pulseWaveAnimation = createPulseWave();
    const morphSequenceAnimation = createMorphSequence();
    const organicBreathingAnimation = createOrganicBreathing();
    const medicalAuraAnimation = createMedicalAura();
    const clockHandsAnimation = createClockHands();
    const digitalDisplayAnimation = createDigitalDisplay();
    const bubbleAnimations = createLiquidBubbles();
    const ekgLineAnimation = createEKGLine();

    heartbeatAnimation.start();
    capsuleDissolveAnimation.start();
    liquidFlowAnimation.start();
    syringeInjectAnimation.start();
    pulseWaveAnimation.start();
    morphSequenceAnimation.start();
    organicBreathingAnimation.start();
    medicalAuraAnimation.start();
    clockHandsAnimation.start();
    digitalDisplayAnimation.start();
    bubbleAnimations.forEach(anim => anim.start());
    ekgLineAnimation.start();

    return () => {
      heartbeatAnimation.stop();
      capsuleDissolveAnimation.stop();
      liquidFlowAnimation.stop();
      syringeInjectAnimation.stop();
      pulseWaveAnimation.stop();
      morphSequenceAnimation.stop();
      organicBreathingAnimation.stop();
      medicalAuraAnimation.stop();
      clockHandsAnimation.stop();
      digitalDisplayAnimation.stop();
      bubbleAnimations.forEach(anim => anim.stop());
      ekgLineAnimation.stop();
    };
  }, []);

  const spinnerSize = size === 'large' ? 160 : 100;
  const centerSize = size === 'large' ? 80 : 50;

  // Complex interpolations for realistic effects
  const capsuleDissolveProgress = capsuleDissolveAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [1, 0.8, 0.4, 0],
  });

  const capsuleSeparation = capsuleDissolveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const liquidFlowTranslation = liquidFlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const syringeTranslation = syringeInjectAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 12],
  });

  const pulseWaveTranslation = pulseWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  const clockMinuteRotation = clockHandsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const clockHourRotation = clockHandsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '30deg'], // Hour hand moves slower
  });

  const bubble1Translation = liquidBubble1.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -30],
  });

  const bubble2Translation = liquidBubble2.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -25],
  });

  const bubble3Translation = liquidBubble3.interpolate({
    inputRange: [0, 1],
    outputRange: [25, -35],
  });

  const ekgLineTranslation = ekgLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <View style={[styles.premiumSpinnerContainer, style]}>
      <Animated.View 
        style={[
          styles.medicalSpinnerPremium, 
          { 
            width: spinnerSize, 
            height: spinnerSize,
            transform: [{ scale: organicBreathingAnim }]
          }
        ]}
      >
        {/* Medical aura/glow effect */}
        <Animated.View
          style={[
            styles.medicalAura,
            {
              width: spinnerSize + 40,
              height: spinnerSize + 40,
              opacity: medicalAuraAnim,
              borderColor: color + '15',
            },
          ]}
        />

        {/* Capsule morphing animation */}
        <Animated.View
          style={[
            styles.morphingContainer,
            {
              width: centerSize,
              height: centerSize,
              opacity: capsuleOpacityAnim,
              transform: [{ scale: heartbeatAnim }],
            },
          ]}
        >
          {/* Capsule shell */}
          <View style={[styles.capsuleShell, { backgroundColor: color + '20' }]}>
            {/* Left half of capsule */}
            <Animated.View
              style={[
                styles.capsuleHalf,
                styles.capsuleLeft,
                {
                  backgroundColor: color,
                  opacity: capsuleDissolveProgress,
                  transform: [{ translateX: capsuleSeparation }],
                },
              ]}
            />
            {/* Right half of capsule */}
            <Animated.View
              style={[
                styles.capsuleHalf,
                styles.capsuleRight,
                {
                  backgroundColor: COLORS.secondary[500],
                  opacity: capsuleDissolveProgress,
                  transform: [{ translateX: -capsuleSeparation }],
                },
              ]}
            />
            {/* Dissolved particles */}
            <View style={styles.dissolvedParticles}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: i % 2 === 0 ? color : COLORS.secondary[500],
                      opacity: capsuleDissolveAnim,
                      transform: [
                        { 
                          translateX: capsuleDissolveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (i - 3) * 20],
                          })
                        },
                        { 
                          translateY: capsuleDissolveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -i * 8],
                          })
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Liquid/IV drip animation */}
        <Animated.View
          style={[
            styles.morphingContainer,
            {
              width: centerSize,
              height: centerSize,
              opacity: liquidOpacityAnim,
            },
          ]}
        >
          <View style={[styles.ivBag, { backgroundColor: color + '10', borderColor: color + '40' }]}>
            {/* Liquid inside */}
            <Animated.View
              style={[
                styles.liquidInside,
                {
                  backgroundColor: color + '30',
                  transform: [{ translateY: liquidFlowTranslation }],
                },
              ]}
            />
            {/* Bubbles */}
            <Animated.View
              style={[
                styles.bubble,
                styles.bubble1,
                {
                  opacity: liquidBubble1,
                  transform: [{ translateY: bubble1Translation }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bubble,
                styles.bubble2,
                {
                  opacity: liquidBubble2,
                  transform: [{ translateY: bubble2Translation }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bubble,
                styles.bubble3,
                {
                  opacity: liquidBubble3,
                  transform: [{ translateY: bubble3Translation }],
                },
              ]}
            />
            {/* Drip tube */}
            <View style={[styles.dripTube, { backgroundColor: color + '60' }]} />
          </View>
        </Animated.View>

        {/* Clock/timing animation */}
        <Animated.View
          style={[
            styles.morphingContainer,
            {
              width: centerSize,
              height: centerSize,
              opacity: clockOpacityAnim,
            },
          ]}
        >
          <View style={[styles.medicalClock, { borderColor: color + '40' }]}>
            {/* Clock face */}
            <View style={styles.clockFace}>
              {/* Hour markers */}
              {[0, 1, 2, 3].map((hour) => (
                <View
                  key={hour}
                  style={[
                    styles.hourMarker,
                    {
                      backgroundColor: color,
                      transform: [{ rotate: `${hour * 90}deg` }],
                    },
                  ]}
                />
              ))}
              {/* Clock hands */}
              <Animated.View
                style={[
                  styles.clockHand,
                  styles.minuteHand,
                  {
                    backgroundColor: color,
                    transform: [{ rotate: clockMinuteRotation }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.clockHand,
                  styles.hourHand,
                  {
                    backgroundColor: COLORS.secondary[600],
                    transform: [{ rotate: clockHourRotation }],
                  },
                ]}
              />
              {/* Center dot */}
              <View style={[styles.clockCenter, { backgroundColor: color }]} />
            </View>
            {/* Digital display */}
            <Animated.View
              style={[
                styles.digitalDisplay,
                {
                  backgroundColor: COLORS.gray[900],
                  opacity: digitalDisplayAnim,
                },
              ]}
            >
              <Text style={styles.digitalTime}>12:00</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Heart/health monitoring animation */}
        <Animated.View
          style={[
            styles.morphingContainer,
            {
              width: centerSize,
              height: centerSize,
              opacity: heartOpacityAnim,
              transform: [{ scale: heartbeatAnim }],
            },
          ]}
        >
          <View style={styles.heartContainer}>
            {/* Heart shape */}
            <View style={styles.heartShape}>
              <View style={[styles.heartLeft, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.heartRight, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.heartBottom, { backgroundColor: '#FF6B6B' }]} />
            </View>
            {/* EKG line */}
            <View style={styles.ekgContainer}>
              <Animated.View
                style={[
                  styles.ekgLine,
                  {
                    backgroundColor: '#4ECDC4',
                    transform: [{ translateX: ekgLineTranslation }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ekgSpike,
                  {
                    backgroundColor: '#4ECDC4',
                    opacity: ekgSpike1,
                    transform: [{ scaleY: ekgSpike1 }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ekgSpike,
                  styles.ekgSpike2,
                  {
                    backgroundColor: '#4ECDC4',
                    opacity: ekgSpike2,
                    transform: [{ scaleY: ekgSpike2 }],
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Syringe floating element */}
        <Animated.View
          style={[
            styles.floatingElement,
            styles.syringeElement,
            {
              transform: [
                { translateY: syringeTranslation },
                { rotate: '45deg' }
              ],
            },
          ]}
        >
          <View style={[styles.syringe, { borderColor: color + '60' }]}>
            <View style={[styles.syringeBarrel, { backgroundColor: color + '10' }]} />
            <Animated.View
              style={[
                styles.syringePlunger,
                {
                  backgroundColor: color,
                  transform: [{ translateY: syringeInjectAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [8, -8],
                  })}],
                },
              ]}
            />
            <View style={[styles.syringeNeedle, { backgroundColor: COLORS.gray[400] }]} />
          </View>
        </Animated.View>

        {/* Pulse wave indicator */}
        <Animated.View
          style={[
            styles.pulseWave,
            {
              transform: [{ translateX: pulseWaveTranslation }],
              opacity: pulseWaveAnim,
            },
          ]}
        >
          <View style={[styles.pulseWaveLine, { backgroundColor: '#4ECDC4' }]} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Keep the same LoadingSpinner, LoadingOverlay, and InlineLoading components as before
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  return <MedicalLoadingSpinner {...props} />;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Preparing your medication data...',
  transparent = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(messageAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
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
      <Animated.View style={[styles.premiumOverlayContainer, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.premiumOverlayContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <MedicalLoadingSpinner size="large" color={COLORS.primary[500]} />
          
          <Animated.View
            style={[
              styles.premiumMessageContainer,
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
            <Text style={styles.premiumOverlayTitle}>MediTracker</Text>
            <Text style={styles.premiumOverlayMessage}>{message}</Text>
            <View style={styles.premiumBrandingContainer}>
              <Text style={styles.premiumBrandingText}>
                Powered by advanced healthcare technology
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Processing...',
  size = 'small',
  color = COLORS.primary[500],
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.premiumInlineContainer, style, { opacity: fadeAnim }]}>
      <MedicalLoadingSpinner size={size} color={color} />
      {message && <Text style={styles.premiumInlineMessage}>{message}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  premiumSpinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[6],
  },
  medicalSpinnerPremium: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  medicalAura: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 1000,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  morphingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1000,
  },
  
  // Capsule styles
  capsuleShell: {
    width: 60,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  capsuleHalf: {
    flex: 1,
    height: '100%',
    borderRadius: 16,
  },
  capsuleLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  capsuleRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dissolvedParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  
  // IV/Liquid styles
  ivBag: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  liquidInside: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderRadius: 6,
  },
  bubble: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  bubble1: {
    left: 15,
    bottom: 20,
  },
  bubble2: {
    left: 25,
    bottom: 15,
  },
  bubble3: {
    left: 35,
    bottom: 25,
  },
  dripTube: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 8,
  },
  
  // Clock styles
  medicalClock: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  clockFace: {
    width: 50,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourMarker: {
    position: 'absolute',
    width: 2,
    height: 8,
    top: 2,
  },
  clockHand: {
    position: 'absolute',
    borderRadius: 1,
    transformOrigin: 'bottom center',
  },
  minuteHand: {
    width: 1.5,
    height: 18,
    bottom: 25,
  },
  hourHand: {
    width: 2,
    height: 12,
    bottom: 25,
  },
  clockCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    zIndex: 10,
  },
  digitalDisplay: {
    position: 'absolute',
    bottom: -20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  digitalTime: {
    color: '#4ECDC4',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  
  // Heart styles
  heartContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heartShape: {
    width: 40,
    height: 36,
    position: 'relative',
  },
  heartLeft: {
    position: 'absolute',
    top: 0,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    transform: [{ rotate: '-45deg' }],
  },
  heartRight: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    transform: [{ rotate: '-45deg' }],
  },
  heartBottom: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 16,
    height: 16,
    transform: [{ rotate: '45deg' }],
  },
  ekgContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 12,
    overflow: 'hidden',
  },
  ekgLine: {
    position: 'absolute',
    top: 6,
    width: 80,
    height: 1,
  },
  ekgSpike: {
    position: 'absolute',
    left: 35,
    bottom: 0,
    width: 1,
    height: 12,
  },
  ekgSpike2: {
    left: 45,
    height: 8,
  },
  
  // Floating elements
  floatingElement: {
    position: 'absolute',
  },
  syringeElement: {
    top: -25,
    right: -25,
  },
  syringe: {
    width: 35,
    height: 8,
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syringeBarrel: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  syringePlunger: {
    width: 8,
    height: 4,
    borderRadius: 2,
  },
  syringeNeedle: {
    width: 12,
    height: 1,
    marginLeft: 2,
  },
  
  // Pulse wave
  pulseWave: {
    position: 'absolute',
    bottom: -40,
    width: 2,
    height: 20,
  },
  pulseWaveLine: {
    width: '100%',
    height: '100%',
    borderRadius: 1,
  },
  
  // Overlay styles
  premiumOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  premiumOverlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: SPACING[10],
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 24,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
  },
  premiumMessageContainer: {
    alignItems: 'center',
    marginTop: SPACING[8],
  },
  premiumOverlayTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[3],
    letterSpacing: -0.8,
  },
  premiumOverlayMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: SPACING[4],
  },
  premiumBrandingContainer: {
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  premiumBrandingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.hint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Inline styles
  premiumInlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[5],
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.gray[50],
  },
  premiumInlineMessage: {
    marginLeft: SPACING[4],
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});

export default LoadingSpinner;