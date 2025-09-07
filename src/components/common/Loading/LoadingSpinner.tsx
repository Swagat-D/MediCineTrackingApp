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

// Elegant Medical Loading Spinner
export const MedicalLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary[500],
  style,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Smooth rotation animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Gentle pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing opacity effect
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Scale animation for entrance
    const scaleAnimation = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });

    scaleAnimation.start();
    spinAnimation.start();
    pulseAnimation.start();
    fadeAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      fadeAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const spinnerSize = size === 'large' ? 60 : 40;
  const innerSize = size === 'large' ? 45 : 30;
  const strokeWidth = size === 'large' ? 4 : 3;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.spinnerContainer, style]}>
      <Animated.View
        style={[
          styles.spinnerWrapper,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderColor: color,
              borderWidth: strokeWidth,
              transform: [{ rotate: spin }, { scale: pulseAnim }],
            },
          ]}
        />

        {/* Inner breathing circle */}
        <Animated.View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              backgroundColor: color,
              opacity: fadeAnim,
            },
          ]}
        />

        {/* Medical cross icon (optional) */}
        <View style={styles.crossIcon}>
          <View style={[styles.crossVertical, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.crossHorizontal, { backgroundColor: '#FFFFFF' }]} />
        </View>
      </Animated.View>
    </View>
  );
};

// Alternative Dot Loading Spinner
export const DotLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary[500],
  style,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const dot1Animation = createDotAnimation(dot1Anim, 0);
    const dot2Animation = createDotAnimation(dot2Anim, 200);
    const dot3Animation = createDotAnimation(dot3Anim, 400);

    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();

    return () => {
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
    };
  }, []);

  const dotSize = size === 'large' ? 12 : 8;
  const containerWidth = size === 'large' ? 80 : 60;

  const getDotScale = (animValue: Animated.Value) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });
  };

  const getDotOpacity = (animValue: Animated.Value) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
  };

  return (
    <View style={[styles.dotContainer, { width: containerWidth }, style]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            transform: [{ scale: getDotScale(dot1Anim) }],
            opacity: getDotOpacity(dot1Anim),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            transform: [{ scale: getDotScale(dot2Anim) }],
            opacity: getDotOpacity(dot2Anim),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            transform: [{ scale: getDotScale(dot3Anim) }],
            opacity: getDotOpacity(dot3Anim),
          },
        ]}
      />
    </View>
  );
};

// Main LoadingSpinner component (keeping your original export)
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  return <MedicalLoadingSpinner {...props} />;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
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
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(messageAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
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
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(messageAnim, {
          toValue: 0,
          duration: 150,
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
        <Animated.View
          style={[
            styles.overlayContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
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
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.overlayTitle}>MediTracker</Text>
            <Text style={styles.overlayMessage}>{message}</Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Loading...',
  size = 'small',
  color = COLORS.primary[500],
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.inlineContainer, style, { opacity: fadeAnim }]}>
      <MedicalLoadingSpinner size={size} color={color} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Main Spinner Styles
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[4],
  },
  spinnerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  innerCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  crossIcon: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossVertical: {
    position: 'absolute',
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 10,
    height: 2,
    borderRadius: 1,
  },

  // Dot Spinner Styles
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
  },
  dot: {
    borderRadius: 1000,
  },

  // Overlay Styles
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING[8],
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: SPACING[6],
  },
  overlayTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  overlayMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Inline Styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[4],
  },
  inlineMessage: {
    marginLeft: SPACING[3],
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default LoadingSpinner;