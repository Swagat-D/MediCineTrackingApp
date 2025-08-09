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

  // Barcodes
  async getBarcodes(): Promise<Barcode[]> {
    const response = await apiClient.get('/caregiver/barcodes');
    return response.data.data;
  }
}

export const caregiverAPI = new CaregiverAPI();