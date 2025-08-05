import { User, Gender } from './auth.types';
import { Medication, MedicationStats, MedicationReminder, MedicationLog } from './medication.types';

export interface Patient extends User {
  caregiverIds: string[];
  medications: Medication[];
  mealTimes: MealTimes;
  emergencyContacts: EmergencyContact[];
  medicalHistory?: string[];
  allergies?: string[];
  stats: MedicationStats;
}

export interface PatientFormData {
  name: string;
  email: string;
  age: number;
  gender: Gender;
  phoneNumber: string;
  emergencyContacts?: EmergencyContact[];
  medicalHistory?: string[];
  allergies?: string[];
}

export interface MealTimes {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface PatientState {
  currentPatient: Patient | null;
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  mealTimes: MealTimes | null;
}

export interface SOSAlert {
  id: string;
  patientId: string;
  patientName: string;
  caregiverIds: string[];
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: SOSStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type SOSStatus = 'active' | 'acknowledged' | 'resolved' | 'cancelled';

export interface PatientDashboardData {
  todaysMedications: Medication[];
  upcomingReminders: MedicationReminder[];
  recentLogs: MedicationLog[];
  stats: MedicationStats;
  alerts: PatientAlert[];
}

export interface PatientAlert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  medicationId?: string;
  createdAt: string;
  isRead: boolean;
}

export type AlertType = 'missed_dose' | 'low_stock' | 'expired' | 'refill_reminder' | 'double_dose_warning';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
