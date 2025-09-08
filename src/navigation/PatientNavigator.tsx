// src/navigation/PatientNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import HomeScreen from '../screens/patient/HomeScreen';
import MedicationListScreen from '../screens/patient/MedicationListScreen';
import BarcodeScannerScreen from '../screens/patient/BarcodeScannerScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

// Stack Screens
import MealSettingsScreen from '../screens/patient/MealSettingsScreen';
import SOSScreen from '../screens/patient/SOSScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

// Types
import { PatientTabParamList, PatientStackParamList } from '../types/navigation.types';
import { TYPOGRAPHY } from '../constants/themes/theme';
import PatientAboutScreen from '@/screens/shared/PatientAboutScreen';
import HelpSupportScreen from '@/screens/shared/HelpSupportScreen';
import PrivacyPolicyScreen from '@/screens/shared/PrivacyPolicyScree';
import { Pressable } from 'react-native';

const Tab = createBottomTabNavigator<PatientTabParamList>();
const Stack = createStackNavigator<PatientStackParamList>();

// Home Stack
const HomeStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="MealSettings" component={MealSettingsScreen} />
    <Stack.Screen name="SOS" component={SOSScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

// Medications Stack
const MedicationsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MedicationList" component={MedicationListScreen} />
    <Stack.Screen name="MealSettings" component={MealSettingsScreen} />
    <Stack.Screen name="SOS" component={SOSScreen} />
  </Stack.Navigator>
);

// Scanner Stack
const ScannerStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="SOS" component={SOSScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="About" component={PatientAboutScreen} />
    <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);

const PatientNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: { name: keyof PatientTabParamList };
      }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Medications') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarButton: (props: React.ComponentProps<typeof Pressable> & { children: React.ReactNode }) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            style={props.style}
          >
            {props.children}
          </Pressable>
        ),
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 65 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarSafeAreaInset: { bottom: 'always' },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Medications" 
        component={MedicationsStack}
        options={{ tabBarLabel: 'Medications' }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerStack}
        options={{ tabBarLabel: 'Scanner' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default PatientNavigator;