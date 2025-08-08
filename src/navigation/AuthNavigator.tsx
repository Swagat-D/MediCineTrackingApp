import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated } from 'react-native';

import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';

import { AuthStackParamList } from '../types/navigation.types';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({
          current,
          layouts,
        }: {
          current: { progress: Animated.AnimatedInterpolation<number> };
          layouts: { screen: { width: number; height: number } };
        }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;