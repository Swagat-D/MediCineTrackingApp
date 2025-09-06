import { STORAGE_KEYS } from '@/constants/app';
import { cacheService } from '../cache/cacheService';
import { apiClient } from './apiClient';

export interface DashboardStats {
  totalPatients: number;
  activeMedications: number;
  todayReminders: number;
  criticalAlerts: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  patientName: string;
  message: string;
  timestamp: string;
  priority: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phoneNumber: string;
  medicationsCount: number;
  adherenceRate: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'critical';
  alerts: number;
}

export interface PatientDetails {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    age: number;
    gender: string;
    lastActivity: string;
    status: string;
    adherenceRate: number;
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
    medicalHistory?: string[];
    allergies?: string[];
  };
  medications: {
    id: string;
    name: string;
    dosage: string;
    dosageUnit: string;
    frequency: number;
    timingRelation: string;
    remainingQuantity: number;
    totalQuantity: number;
    status: string;
    adherenceRate: number;
    lastTaken?: string;
    daysLeft: number;
    expiryDate: string;
  }[];
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: number;
  timingRelation: string;
  quantity: number;
  expiryDate: string;
  instructions?: string;
}

export interface Barcode {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timingRelation: string;
  barcodeData: string;
  createdAt: string;
  downloadCount: number;
}

// Add CaregiverNotification interface
export interface CaregiverNotification {
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'sos_alert' | 'low_stock' | 'medication_added';
  message: string;
  patientId?: string;
  patientName?: string;
  medicationId?: string;
  medicationName?: string;
  timestamp: string;
  read: boolean;
  priority?: string;
}

class CaregiverAPI {
  // Dashboard
  async getDashboardStats(): Promise<{ stats: DashboardStats; recentActivities: RecentActivity[] }> {
    const response = await apiClient.get('/caregiver/dashboard/stats');
    return response.data.data;
  }

  // Patients
  async getPatients(params?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Patient[]> {
    const response = await apiClient.get('/caregiver/patients', { params });
    return response.data.data;
  }

  async getPatientDetails(patientId: string): Promise<PatientDetails> {
    const response = await apiClient.get(`/caregiver/patients/${patientId}`);
    return response.data.data;
  }

  async sendPatientOTP(patientId: string): Promise<{ message: string; patientEmail: string }> {
  const response = await apiClient.post('/caregiver/patients/send-otp', { patientId });
  return response.data;
}

async getNotifications(params?: {
  type?: 'dose_taken' | 'dose_missed' | 'sos_alert' | 'low_stock' | 'medication_added';
  read?: boolean;
}): Promise<{
  notifications: CaregiverNotification[];
  unreadCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}> {
  const response = await apiClient.get('/caregiver/notifications', { params });
  return response.data.data;
}

// Mark notification as read
async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  const response = await apiClient.patch(`/caregiver/notifications/${notificationId}/read`);
  return response.data;
}

// Mark all notifications as read
async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.patch('/caregiver/notifications/read-all');
  return response.data;
}

// Get dashboard notifications (for navbar count)
async getDashboardNotifications(): Promise<{ unreadCount: number }> {
  const response = await apiClient.get('/caregiver/notifications/count');
  return response.data.data;
}

async verifyPatientOTP(patientId: string, otp: string): Promise<Patient> {
  const response = await apiClient.post('/caregiver/patients/verify-otp', { 
    patientId, 
    otp 
  });
  return response.data.data;
}

  async addPatient(patientData: {
    name: string;
    email: string;
    age: number;
    gender: string;
    phoneNumber: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
    medicalHistory?: string[];
    allergies?: string[];
  }): Promise<Patient> {
    const response = await apiClient.post('/caregiver/patients', patientData);
    return response.data.data;
  }

  async removePatient(patientId: string): Promise<void> {
    await apiClient.delete(`/caregiver/patients/${patientId}`);
  }

  async searchExistingPatients(search: string): Promise<{
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    age?: number; // Make age optional
    gender?: string; // Make gender optional
    lastSeen: string;
  }[]> {
    const response = await apiClient.get('/caregiver/patients/search', {
      params: { search }
    });
    return response.data.data;
  }

  // Medications
  async addMedication(patientId: string, medicationData: MedicationFormData): Promise<{
    medicationId: string;
    barcodeData: string;
  }> {
    const response = await apiClient.post(
      `/caregiver/patients/${patientId}/medications`,
      medicationData
    );
    return response.data.data;
  }

  async deleteMedication(medicationId: string): Promise<void> {
  await apiClient.delete(`/caregiver/medications/${medicationId}`);
}

async getPatientEmergencyContact(patientId: string): Promise<{
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
} | null> {
  const response = await apiClient.get(`/caregiver/patients/${patientId}/emergency-contacts`);
  return response.data.data;
}

async getPatientMedicationHistory(patientId: string): Promise<{
  days: { date: string; displayDate: string }[];
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: number;
    timingRelation: string;
    dailyStatus: {
      date: string;
      displayDate: string;
      doses: { taken: boolean; time?: string }[];
      adherenceRate: number;
    }[];
  }[];
}> {
  const response = await apiClient.get(`/caregiver/patients/${patientId}/medication-history`);
  return response.data.data;
}

  // Barcodes
  async getBarcodes(): Promise<Barcode[]> {
    const response = await apiClient.get('/caregiver/barcodes');
    return response.data.data;
  }

  // Add to caregiverAPI.ts class
async getDashboardStatsWithCache(): Promise<{ stats: DashboardStats; recentActivities: RecentActivity[] }> {
  const cachedData = await cacheService.getAppData(STORAGE_KEYS.DASHBOARD_DATA);
  if (
    cachedData &&
    typeof cachedData === 'object' &&
    'stats' in cachedData &&
    'recentActivities' in cachedData
  ) {
    this.refreshDashboardInBackground();
    return cachedData as { stats: DashboardStats; recentActivities: RecentActivity[] };
  }
  
  const response = await apiClient.get('/caregiver/dashboard/stats');
  const data = response.data.data;
  await cacheService.setAppData(STORAGE_KEYS.DASHBOARD_DATA, data);
  return data;
}

private async refreshDashboardInBackground() {
  try {
    const response = await apiClient.get('/caregiver/dashboard/stats');
    await cacheService.setAppData(STORAGE_KEYS.DASHBOARD_DATA, response.data.data);
  } catch (error) {
    console.error(error)
    console.log('Background refresh failed');
  }
}

async getPatientsWithCache(): Promise<Patient[]> {
  const cachedPatients = await cacheService.getAppData(STORAGE_KEYS.PATIENTS_DATA);
  if (cachedPatients) {
    this.refreshPatientsInBackground();
    return Array.isArray(cachedPatients) ? cachedPatients : [];
  }
  
  const response = await apiClient.get('/caregiver/patients');
  const data = response.data.data;
  await cacheService.setAppData(STORAGE_KEYS.PATIENTS_DATA, data);
  return data;
}

private async refreshPatientsInBackground() {
  try {
    const response = await apiClient.get('/caregiver/patients');
    await cacheService.setAppData(STORAGE_KEYS.PATIENTS_DATA, response.data.data);
  } catch (error) {
    console.error(error)
    console.log('Background refresh failed');
  }
}
}

export const caregiverAPI = new CaregiverAPI();