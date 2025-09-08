import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/caregiver/DashboardScreen';
import PatientsScreen from '../screens/caregiver/PatientsScreen';
import AddPatientScreen from '../screens/caregiver/AddPatientScreen';
import PatientDetailsScreen from '../screens/caregiver/PatientDetailsScreen';
import AddMedicationScreen from '../screens/caregiver/AddMedicationScreen';
import BarcodeGeneratorScreen from '../screens/caregiver/BarcodeGeneratorScreen';
import ProfileScreen from '../screens/caregiver/ProfileScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import HelpSupportScreen from '@/screens/shared/HelpSupportScreen';
import AboutScreen from '@/screens/shared/AboutScree';
import PrivacyPolicyScreen from '@/screens/shared/PrivacyPolicyScree';

// Types
import { CaregiverTabParamList, CaregiverStackParamList } from '../types/navigation.types';
import { COLORS, TYPOGRAPHY } from '../constants/themes/theme';
import { Pressable } from 'react-native';

const Tab = createBottomTabNavigator<CaregiverTabParamList>();
const Stack = createStackNavigator<CaregiverStackParamList>();

// Dashboard Stack
const DashboardStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="AddPatient" component={AddPatientScreen} />
    <Stack.Screen name="BarcodeGenerator" component={BarcodeGeneratorScreen} />
    <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
  </Stack.Navigator>
);

// Patients Stack
const PatientsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Patients" component={PatientsScreen} />
    <Stack.Screen name="AddPatient" component={AddPatientScreen} />
    <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
    <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
    <Stack.Screen name="BarcodeGenerator" component={BarcodeGeneratorScreen} />
  </Stack.Navigator>
);

// Barcodes Stack
const BarcodesStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BarcodeGenerator" component={BarcodeGeneratorScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
  </Stack.Navigator>
);

const CaregiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: { name: keyof CaregiverTabParamList };
      }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Barcodes') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
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
        tabBarActiveTintColor: COLORS.secondary[500],
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[200],
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Patients" 
        component={PatientsStack}
        options={{ tabBarLabel: 'Patients' }}
      />
      <Tab.Screen 
        name="Barcodes" 
        component={BarcodesStack}
        options={{ tabBarLabel: 'Barcodes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default CaregiverNavigator;