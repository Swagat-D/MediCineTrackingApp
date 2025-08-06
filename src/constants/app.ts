import { UserRole } from '../types/auth.types';
import { DosageUnit, TimingRelation } from '../types/medication.types';

// User Roles
export const USER_ROLES: Record<string, UserRole> = {
  CAREGIVER: 'caregiver',
  PATIENT: 'patient',
} as const;

// API Configuration
export interface APIConfig {
  BASE_URL: string;
  TIMEOUT: number;
  HEADERS: Record<string, string>;
}

export const API_CONFIG: APIConfig = {
  BASE_URL: __DEV__ ? 'http://192.168.250.210:3000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@meditracker_user_token',
  USER_ROLE: '@meditracker_user_role',  
  USER_DATA: '@meditracker_user_data',
  SETTINGS: '@meditracker_settings',
  MEAL_TIMES: '@meditracker_meal_times',
  OFFLINE_DATA: '@meditracker_offline_data',
} as const;

// Screen Names for Navigation
export const SCREEN_NAMES = {
  // Auth Screens
  SPLASH: 'Splash',
  ROLE_SELECTION: 'RoleSelection',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  OTP_VERIFICATION: 'OTPVerification',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Caregiver Screens
  CAREGIVER_DASHBOARD: 'Dashboard',
  CAREGIVER_PATIENTS: 'Patients',
  ADD_PATIENT: 'AddPatient',
  PATIENT_DETAILS: 'PatientDetails',
  ADD_MEDICATION: 'AddMedication',
  MEDICATION_DETAILS: 'MedicationDetails',
  BARCODE_GENERATOR: 'BarcodeGenerator',
  CAREGIVER_PROFILE: 'Profile',
  
  // Patient Screens
  PATIENT_HOME: 'Home',
  MEDICATION_LIST: 'MedicationList',
  BARCODE_SCANNER: 'BarcodeScanner',
  MEAL_SETTINGS: 'MealSettings',
  PATIENT_PROFILE: 'Profile',
  SOS_ALERT: 'SOS',
  
  // Shared Screens
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
} as const;

// Medication Constants
export interface MedicationOption {
  label: string;
  value: string | number;
}

export const MEDICATION_CONSTANTS = {
  TIMING_RELATIONS: [
    { label: 'Before Food', value: 'before_food' as TimingRelation },
    { label: 'After Food', value: 'after_food' as TimingRelation },
    { label: 'With Food', value: 'with_food' as TimingRelation },
    { label: 'Empty Stomach', value: 'empty_stomach' as TimingRelation },
    { label: 'Anytime', value: 'anytime' as TimingRelation },
  ],
  
  FREQUENCIES: [
    { label: 'Once Daily', value: 1 },
    { label: 'Twice Daily', value: 2 },
    { label: 'Three Times Daily', value: 3 },
    { label: 'Four Times Daily', value: 4 },
    { label: 'As Needed', value: 0 },
  ],
  
  DOSAGE_UNITS: [
    'mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'puffs', 'units'
  ] as DosageUnit[],
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MEDICATION_REMINDER: 'medication_reminder',
  REFILL_REMINDER: 'refill_reminder',
  SOS_ALERT: 'sos_alert',
  MISSED_DOSE: 'missed_dose',
  LOW_STOCK: 'low_stock',
} as const;

// Alert Messages
export const ALERT_MESSAGES = {
  SUCCESS: {
    MEDICATION_ADDED: 'Medication added successfully',
    DOSE_LOGGED: 'Dose logged successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  
  ERROR: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTHENTICATION_FAILED: 'Authentication failed. Please login again.',
    INVALID_CREDENTIALS: 'Invalid email or password',
    MEDICATION_EXISTS: 'This medication already exists for the patient',
    BARCODE_SCAN_FAILED: 'Failed to scan barcode. Please try again.',
  },
  
  WARNING: {
    DOUBLE_DOSE: 'You have already taken this dose today',
    LOW_STOCK: 'Medication stock is running low',
    EXPIRED_MEDICATION: 'This medication has expired',
    MISSED_DOSE: 'You missed your scheduled dose',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  AGE_MIN: 1,
  AGE_MAX: 120,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'MediTracker',
  VERSION: '1.0.0',
  SPLASH_DURATION: 6000,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  BARCODE_PREFIX: 'MEDI_',
} as const;