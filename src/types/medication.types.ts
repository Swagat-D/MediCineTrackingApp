export interface Medication {
  id: string;
  name: string;
  dosage: string;
  dosageUnit: DosageUnit;
  frequency: number;
  timingRelation: TimingRelation;
  expiryDate: string;
  quantity: number;
  remainingQuantity: number;
  instructions?: string;
  barcode: string;
  patientId: string;
  caregiverId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  dosageUnit: DosageUnit;
  frequency: number;
  timingRelation: TimingRelation;
  expiryDate: string;
  quantity: number;
  instructions?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  takenAt: string;
  scheduledTime: string;
  status: MedicationStatus;
  notes?: string;
  createdAt: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: string;
  isCompleted: boolean;
  completedAt?: string;
  date: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  patientId: string;
  reminderTime: string;
  message: string;
  isActive: boolean;
  notificationId?: string;
}

export type DosageUnit = 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'puffs' | 'units';

export type TimingRelation = 'before_food' | 'after_food' | 'with_food' | 'empty_stomach' | 'anytime';

export type MedicationStatus = 'taken' | 'missed' | 'skipped' | 'late';

export interface MedicationStats {
  totalMedications: number;
  activeMedications: number;
  completedToday: number;
  missedToday: number;
  adherenceRate: number;
  lowStockCount: number;
  expiringSoon: number;
}