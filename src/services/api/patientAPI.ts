import { apiClient } from './apiClient';
import { cacheService } from '../cache/cacheService';
import { STORAGE_KEYS } from '@/constants/app';

export interface PatientDashboardStats {
  totalMedications: number;
  activeMedications: number;
  todayReminders: number;
  adherenceRate: number;
  upcomingDoses: number;
  missedDoses: number;
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
}

export interface UpcomingReminder {
  id: string;
  medicationName: string;
  time: string;
  dosage: string;
  isUrgent: boolean;
}

export interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: number;
  remainingQuantity: number;
  totalQuantity: number;
  status: 'active' | 'paused' | 'completed';
  adherenceRate: number;
  nextDose: string;
  expiryDate: string;
  instructions?: string;
}

export interface BarcodeData {
  medication: {
    id: string;
    name: string;
    dosage: string;
    dosageUnit: string;
    instructions: string;
    lastTaken?: string;
    daysLeft: number;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
  caregiver: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MealTime {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

class PatientAPI {
  // Dashboard
  async getDashboardData(): Promise<{
    stats: PatientDashboardStats;
    todaysMedications: TodayMedication[];
    upcomingReminders: UpcomingReminder[];
  }> {
    const response = await apiClient.get('/patient/dashboard');
    return response.data.data;
  }

  // Medications
  async getMedications(params?: {
    search?: string;
    status?: 'active' | 'paused' | 'completed';
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
  }): Promise<{ message: string; success: boolean }> {
    const response = await apiClient.post(`/patient/medications/${medicationId}/log`, data);
    return response.data;
  }


  async scanMedicationBarcode(barcodeData: string) {
  try {
    console.log('API: Scanning barcode:', barcodeData);
    const response = await apiClient.get(`/barcode/scan/${barcodeData}`);
    console.log('API: Scan successful:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('API: Scan error:', error);
    console.error('API: Error response:', error.response?.data);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to scan barcode. Please try again.');
  }
}

async recordMedicationTaken(medicationId: string, data: { notes?: string, override?: boolean, takenAt?: string }): Promise<{ message: string; success: boolean; data?: {remainingQuantity?: number; remainingDays?: number} }> {
  try {
    const response = await apiClient.post(`/patient/medications/${medicationId}/log`, data);
    return response.data;
  } catch (error: any) {
    if(error.response?.status === 400){
      throw error;
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }else if (error.message){
      throw new Error(error.message)
    }else{
      throw new Error('Failed to record medication dose');
    }
  }
}

async checkMedicationTiming(medicationId: string): Promise<{message: string;  success: boolean }> {
  try{
    const response = await apiClient.get(`/patient/medications/${medicationId}/timing-check`);
    return response.data;
  }catch(error:any){
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to check medication timing');
      }
  }
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

async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.patch('/patient/notifications/read-all');
  return response.data;
}

async getRecentActivities(): Promise<{
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'reminder_sent' | 'medication_added';
  medicationName: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}[]> {
  const response = await apiClient.get('/patient/activities');
  return response.data.data;
}

  // Notifications
  async getNotifications(params?: {
  type?: 'reminder' | 'alert' | 'system';
  read?: boolean;
}): Promise<Notification[]> {
  const response = await apiClient.get('/patient/notifications', { params });
  return response.data.data.notifications; // Return just the notifications array
}

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    const response = await apiClient.patch(`/patient/notifications/${notificationId}/read`);
    return response.data;
  }

  // SOS
  async sendSOSAlert(data: {
    message: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    severity: 'critical';
  }): Promise<{ id: string; message: string }> {
    const response = await apiClient.post('/patient/sos', data);
    return response.data.data;
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

  // Settings
  async getNotificationSettings(): Promise<{
    medicationReminders: boolean;
    refillReminders: boolean;
    adherenceAlerts: boolean;
    sosAlerts: boolean;
  }> {
    const response = await apiClient.get('/patient/notification-settings');
    return response.data.data;
  }

  // Caregivers
  async getCaregivers(): Promise<{
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  connectedDate: string;
  status: 'active' | 'pending';
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

  // Data Export
  async exportHealthData(format: 'pdf' | 'csv', params?: {
    includePersonalInfo: boolean;
    includeMedications: boolean;
    includeLogs: boolean;
    includeAdherence: boolean;
  }): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await apiClient.post('/patient/export-data', { format, ...params });
    return response.data.data;
  }

  async getCurrentUser(): Promise<{
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: string;
}> {
  const response = await apiClient.get('/patient/profile');
  return response.data.data;
}

async updateProfile(data: {
  name: string;
  phoneNumber: string;
}): Promise<{ message: string; success: boolean }> {
  const response = await apiClient.put('/patient/profile', data);
  return response.data;
}

async getDashboardDataWithCache(): Promise<{
  stats: PatientDashboardStats;
  todaysMedications: TodayMedication[];
  upcomingReminders: UpcomingReminder[];
}> {
  // Try cache first
  const cachedData = await cacheService.getAppData(STORAGE_KEYS.DASHBOARD_DATA);
  if (
    cachedData &&
    typeof cachedData === 'object' &&
    'stats' in cachedData &&
    'todaysMedications' in cachedData &&
    'upcomingReminders' in cachedData
  ) {
    console.log('📱 Loading dashboard from cache');
    // Background refresh
    this.refreshDashboardInBackground();
    return cachedData as {
      stats: PatientDashboardStats;
      todaysMedications: TodayMedication[];
      upcomingReminders: UpcomingReminder[];
    };
  }
  
  // No cache, fetch fresh
  return this.fetchAndCacheDashboard();
}

private async fetchAndCacheDashboard() {
  const response = await apiClient.get('/patient/dashboard');
  const data = response.data.data;
  // Cache it
  await cacheService.setAppData(STORAGE_KEYS.DASHBOARD_DATA, data);
  return data;
}

private async refreshDashboardInBackground() {
  try {
    await this.fetchAndCacheDashboard();
  } catch (error) {
    console.error(error);
    console.log('Background refresh failed');
  }
}

async getMedicationsWithCache(): Promise<PatientMedication[]> {
  const cachedMeds = await cacheService.getAppData(STORAGE_KEYS.MEDICATIONS_DATA);
  if (Array.isArray(cachedMeds)) {
    this.refreshMedicationsInBackground();
    return cachedMeds as PatientMedication[];
  }
  
  const response = await apiClient.get('/patient/medications');
  const data = response.data.data;
  await cacheService.setAppData(STORAGE_KEYS.MEDICATIONS_DATA, data);
  return data;
}

private async refreshMedicationsInBackground() {
  try {
    const response = await apiClient.get('/patient/medications');
    await cacheService.setAppData(STORAGE_KEYS.MEDICATIONS_DATA, response.data.data);
  } catch (error) {
    console.error(error);
    console.log('Background refresh failed');
  }
}

async getRecentActivitiesWithCache(): Promise<{
  id: string;
  type: 'dose_taken' | 'dose_missed' | 'reminder_sent' | 'medication_added';
  medicationName: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}[]> {
  // Try cache first
  const cachedActivities = await cacheService.getAppData(STORAGE_KEYS.ACTIVITIES_DATA);
  if (Array.isArray(cachedActivities)) {
    console.log('📱 Loading activities from cache');
    // Background refresh
    this.refreshActivitiesInBackground();
    return cachedActivities;
  }
  
  // No cache, fetch fresh
  return this.fetchAndCacheActivities();
}

private async fetchAndCacheActivities() {
  const response = await apiClient.get('/patient/activities');
  const data = response.data.data;
  // Cache it
  await cacheService.setAppData(STORAGE_KEYS.ACTIVITIES_DATA, data);
  return data;
}

private async refreshActivitiesInBackground() {
  try {
    await this.fetchAndCacheActivities();
  } catch (error) {
    console.error('Background activities refresh failed:', error);
  }
}

async addEmergencyContact(contactData: {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  };
}> {
  const response = await apiClient.post('/patient/emergency-contacts', contactData);
  return response.data;
}

async removeEmergencyContact(contactId: string): Promise<{ message: string; success: boolean }> {
  const response = await apiClient.delete(`/patient/emergency-contacts/${contactId}`);
  return response.data;
}

  // Add to your PatientAPI class
async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete(`/patient/notifications/${notificationId}`);
  return response.data;
}

async deleteMultipleNotifications(notificationIds: string[]): Promise<{
  success: boolean;
  message: string;
  data: { deletedCount: number; requestedCount: number };
}> {
  const response = await apiClient.delete('/patient/notifications/delete-multiple', {
    data: { notificationIds }
  });
  return response.data;
}

async deleteAllNotifications(): Promise<{
  success: boolean;
  message: string;
  data: { deletedCount: number };
}> {
  const response = await apiClient.delete('/patient/notifications/delete-all');
  return response.data;
}
}

export const patientAPI = new PatientAPI();

// Simple WebSocket service for realtime updates
export class PatientRealtimeService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(patientId: string, onUpdate: (data: any) => void) {
    try {
      const token = await apiClient.getAuthToken();
      if (!token) throw new Error('No auth token available');

      const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:5000'}/patient/realtime?token=${token}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('✅ Patient realtime connection established');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing realtime data:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('❌ Patient realtime connection error:', error);
      };

      this.websocket.onclose = () => {
        this.handleReconnect(patientId, onUpdate);
      };

    } catch (error) {
      console.error('Failed to establish realtime connection:', error);
    }
  }

  private handleReconnect(patientId: string, onUpdate: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(patientId, onUpdate);
      }, delay);
    }
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      console.log('🔌 Patient realtime connection closed');
    }
  }
}

export const patientRealtimeService = new PatientRealtimeService();