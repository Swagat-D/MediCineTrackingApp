// src/services/api/patientAPI.ts
import { apiClient } from './apiClient';

export interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: number;
  timingRelation: 'before_food' | 'after_food' | 'with_food' | 'empty_stomach' | 'anytime';
  remainingQuantity: number;
  totalQuantity: number;
  expiryDate: string;
  instructions?: string;
  status: 'active' | 'paused' | 'completed';
  adherenceRate: number;
  lastTaken?: string;
  nextDose: string;
  barcodeData: string;
  caregiver: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientDashboardStats {
  totalMedications: number;
  activeMedications: number;
  todayReminders: number;
  adherenceRate: number;
  missedDoses: number;
  upcomingDoses: number;
}

export interface TodayMedication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  taken: boolean[];
  nextDoseTime: string;
  instructions: string;
  color: string;
  timingRelation: string;
  adherenceRate: number;
}

export interface UpcomingReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  dosage: string;
  instructions: string;
  isUrgent: boolean;
  timingRelation: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  takenAt: string;
  scheduledTime: string;
  status: 'taken' | 'missed' | 'late';
  notes?: string;
}

export interface BarcodeData {
  barcode: {
    data: string;
    scannedAt: string;
    isValid: boolean;
  };
  medication: {
    id: string;
    name: string;
    dosage: string;
    dosageUnit: string;
    frequency: number;
    timingRelation: string;
    totalQuantity: number;
    remainingQuantity: number;
    expiryDate: string;
    instructions: string;
    status: string;
    adherenceRate: number;
    lastTaken?: string;
    daysLeft: number;
    createdAt: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phoneNumber: string;
  };
  caregiver: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export interface MealTime {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
}

export interface SOSAlert {
  id: string;
  type: 'sos_alert';
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  emergencyContacts: {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }[];
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

class PatientAPI {
  // Dashboard & Overview
  async getDashboardData(): Promise<{
    stats: PatientDashboardStats;
    todaysMedications: TodayMedication[];
    upcomingReminders: UpcomingReminder[];
    recentLogs: MedicationLog[];
  }> {
    const response = await apiClient.get('/patient/dashboard');
    return response.data.data;
  }

  // Medications
  async getMedications(params?: {
    search?: string;
    status?: 'all' | 'active' | 'paused' | 'completed';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PatientMedication[]> {
    const response = await apiClient.get('/patient/medications', { params });
    return response.data.data;
  }

  async getMedicationDetails(medicationId: string): Promise<PatientMedication> {
    const response = await apiClient.get(`/patient/medications/${medicationId}`);
    return response.data.data;
  }

  async logMedicationTaken(medicationId: string, data: {
    takenAt: string;
    notes?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.post(`/patient/medications/${medicationId}/log`, data);
    return response.data;
  }

  async updateMedicationStatus(medicationId: string, status: 'active' | 'paused'): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.patch(`/patient/medications/${medicationId}/status`, { status });
    return response.data;
  }

  // Barcode Scanning
  async scanMedicationBarcode(barcodeData: string): Promise<BarcodeData> {
    const response = await apiClient.get(`/barcode/scan/${encodeURIComponent(barcodeData)}`);
    return response.data.data;
  }

  async verifyBarcodeAccess(barcodeData: string): Promise<{ hasAccess: boolean; message: string }> {
    const response = await apiClient.get(`/barcode/verify/${encodeURIComponent(barcodeData)}`);
    return response.data;
  }

  // Medication Logs & History
  async getMedicationLogs(params?: {
    medicationId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'taken' | 'missed' | 'late';
    limit?: number;
    page?: number;
  }): Promise<{
    logs: MedicationLog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const response = await apiClient.get('/patient/medication-logs', { params });
    return response.data.data;
  }

  // Reminders & Notifications
  async getUpcomingReminders(hours?: number): Promise<UpcomingReminder[]> {
    const response = await apiClient.get('/patient/reminders', {
      params: { hours: hours || 24 }
    });
    return response.data.data;
  }

  async markReminderAsRead(reminderId: string): Promise<{ success: boolean }> {
    const response = await apiClient.patch(`/patient/reminders/${reminderId}/read`);
    return response.data;
  }

  async snoozeReminder(reminderId: string, minutes: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`/patient/reminders/${reminderId}/snooze`, { minutes });
    return response.data;
  }

  // Meal Times
  async getMealTimes(): Promise<MealTime[]> {
    const response = await apiClient.get('/patient/meal-times');
    return response.data.data;
  }

  async updateMealTimes(mealTimes: {
    breakfast?: { time: string; enabled: boolean };
    lunch?: { time: string; enabled: boolean };
    dinner?: { time: string; enabled: boolean };
    snack?: { time: string; enabled: boolean };
  }): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.put('/patient/meal-times', mealTimes);
    return response.data;
  }

  // SOS & Emergency
  async sendSOSAlert(data: {
    message: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<SOSAlert> {
    const response = await apiClient.post('/patient/sos', data);
    return response.data.data;
  }

  async cancelSOSAlert(alertId: string): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.patch(`/patient/sos/${alertId}/cancel`);
    return response.data;
  }

  async getEmergencyContacts(): Promise<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }[]> {
    const response = await apiClient.get('/patient/emergency-contacts');
    return response.data.data;
  }

  // Adherence & Statistics
  async getAdherenceStats(params?: {
    period: 'week' | 'month' | 'quarter' | 'year';
    medicationId?: string;
  }): Promise<{
    overallAdherence: number;
    medicationAdherence: { medicationId: string; medicationName: string; adherence: number }[];
    dailyAdherence: { date: string; adherence: number }[];
    trends: {
      improving: boolean;
      changePercent: number;
    };
  }> {
    const response = await apiClient.get('/patient/adherence-stats', { params });
    return response.data.data;
  }

  // Notifications
  async getNotifications(params?: {
    type?: 'reminder' | 'alert' | 'system';
    read?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{
    notifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      isRead: boolean;
      priority: 'low' | 'medium' | 'high' | 'critical';
      createdAt: string;
      data?: any;
    }[];
    unreadCount: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
    };
  }> {
    const response = await apiClient.get('/patient/notifications', { params });
    return response.data.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    const response = await apiClient.patch(`/patient/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch('/patient/notifications/read-all');
    return response.data;
  }

  // Profile & Settings
  async updateNotificationSettings(settings: {
    medicationReminders: boolean;
    refillReminders: boolean;
    adherenceAlerts: boolean;
    sosAlerts: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  }): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.put('/patient/notification-settings', settings);
    return response.data;
  }

  async getNotificationSettings(): Promise<{
    medicationReminders: boolean;
    refillReminders: boolean;
    adherenceAlerts: boolean;
    sosAlerts: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  }> {
    const response = await apiClient.get('/patient/notification-settings');
    return response.data.data;
  }

  // Health Data Export
  async exportHealthData(format: 'pdf' | 'csv' | 'json', params?: {
    startDate?: string;
    endDate?: string;
    includePersonalInfo: boolean;
    includeMedications: boolean;
    includeLogs: boolean;
    includeAdherence: boolean;
  }): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await apiClient.post('/patient/export-data', { format, ...params });
    return response.data.data;
  }

  // Caregiver Connection
  async getCaregivers(): Promise<{
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    specialization?: string;
    isActive: boolean;
    connectedAt: string;
  }[]> {
    const response = await apiClient.get('/patient/caregivers');
    return response.data.data;
  }

  async requestCaregiverConnection(caregiverEmail: string, message?: string): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.post('/patient/caregiver-request', {
      caregiverEmail,
      message
    });
    return response.data;
  }

  async removeCaregiverConnection(caregiverId: string): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.delete(`/patient/caregivers/${caregiverId}`);
    return response.data;
  }
}

export const patientAPI = new PatientAPI();

// Real-time event handlers for patient data
export class PatientRealtimeService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(patientId: string, onUpdate: (data: any) => void) {
    try {
      const token = await apiClient.getAuthToken();
      if (!token) throw new Error('No auth token available');

      const url = `${process.env.EXPO_PUBLIC_API_URL}/patient/realtime?token=${token}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ Patient realtime connection established');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing realtime data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Patient realtime connection error:', error);
        this.handleReconnect(patientId, onUpdate);
      };

    } catch (error) {
      console.error('Failed to establish realtime connection:', error);
    }
  }

  private handleReconnect(patientId: string, onUpdate: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(patientId, onUpdate);
      }, delay);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 Patient realtime connection closed');
    }
  }
}

export const patientRealtimeService = new PatientRealtimeService();