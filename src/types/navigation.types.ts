import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { UserRole } from './auth.types';

// Helper type for nested navigators
export type NavigatorScreenParams<ParamList = Record<string, object | undefined>> = {
  screen?: never;
  params?: never;
  initial?: never;
  path?: never;
} & {
  [K in keyof ParamList]: undefined extends ParamList[K]
    ? { screen: K; params?: ParamList[K] }
    : { screen: K; params: ParamList[K] };
}[keyof ParamList];

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CaregiverStack: NavigatorScreenParams<CaregiverStackParamList>;
  PatientStack: NavigatorScreenParams<PatientStackParamList>;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Splash: undefined;
  RoleSelection: undefined;
  Login: { role?: UserRole };
  Signup: { role: UserRole };
  OTPVerification: { email: string; type: 'signup' | 'forgot_password' };
  ForgotPassword: undefined;
  ResetPassword: { email: string; otp: string };
};

// Main Tab Navigator (for role-based navigation)
export type MainTabParamList = {
  CaregiverTab: NavigatorScreenParams<CaregiverTabParamList>;
  PatientTab: NavigatorScreenParams<PatientTabParamList>;
};

// Caregiver Stack Navigator
export type CaregiverStackParamList = {
  Dashboard: undefined;
  Patients: undefined;
  AddPatient: undefined;
  PatientDetails: { patientId: string };
  AddMedication: { patientId: string };
  EditMedication: { medicationId: string; patientId: string };
  MedicationDetails: { medicationId: string; patientId: string };
  BarcodeGenerator: { medicationId: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

// Caregiver Tab Navigator
export type CaregiverTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Barcodes: undefined;
  Profile: undefined;
};

// Patient Stack Navigator
export type PatientStackParamList = {
  Home: undefined;
  MedicationList: undefined;
  MedicationDetails: { medicationId: string };
  BarcodeScanner: undefined;
  MealSettings: undefined;
  Profile: undefined;
  Settings: undefined;
  SOS: undefined;
  Notifications: undefined;
};

// Patient Tab Navigator
export type PatientTabParamList = {
  Home: undefined;
  Medications: undefined;
  Scanner: undefined;
  Profile: undefined;
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type CaregiverStackScreenProps<T extends keyof CaregiverStackParamList> = StackScreenProps<
  CaregiverStackParamList,
  T
>;

export type PatientStackScreenProps<T extends keyof PatientStackParamList> = StackScreenProps<
  PatientStackParamList,
  T
>;

export type CaregiverTabScreenProps<T extends keyof CaregiverTabParamList> = BottomTabScreenProps<
  CaregiverTabParamList,
  T
>;

export type PatientTabScreenProps<T extends keyof PatientTabParamList> = BottomTabScreenProps<
  PatientTabParamList,
  T
>;

// Generic Navigation Props
export interface NavigationProps {
  navigation: any;
  route: any;
}

// Common Screen Props
export interface BaseScreenProps {
  navigation: any;
  route?: any;
}

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}