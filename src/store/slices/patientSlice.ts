import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { patientAPI } from '../../services/api/patientAPI';

interface PatientState {
  // Dashboard data
  dashboardStats: any | null;
  todaysMedications: any[];
  upcomingReminders: any[];
  
  // Medications
  medications: any[];
  currentMedication: any | null;
  
  // Meal times
  mealTimes: any[];
  
  // Notifications
  notifications: any[];
  unreadNotificationCount: number;
  
  // Recent activities
  recentActivities: any[];
  
  // Barcode scanning
  scannedBarcodeData: any | null;
  
  // Loading states
  isLoading: boolean;
  isDashboardLoading: boolean;
  isMedicationsLoading: boolean;
  isScanningBarcode: boolean;
  
  // Error state
  error: string | null;
  
  // Connection status
  isConnected: boolean;
}

const initialState: PatientState = {
  dashboardStats: {         
    totalMedications: 0,
    activeMedications: 0,
    adherenceRate: 0,
    todayReminders: 0,
    upcomingDoses: 0,
    missedDoses: 0,
  },
  todaysMedications: [],
  upcomingReminders: [],
  medications: [],
  currentMedication: null,
  mealTimes: [],
  notifications: [],
  unreadNotificationCount: 0,
  recentActivities: [],
  scannedBarcodeData: null,
  isLoading: false,
  isDashboardLoading: false,
  isMedicationsLoading: false,
  isScanningBarcode: false,
  error: null,
  isConnected: false,
};

// Async thunks for cached data loading
export const loadDashboardWithCache = createAsyncThunk(
  'patient/loadDashboardWithCache',
  async (_, { rejectWithValue }) => {
    try {
      const [dashboardData, activitiesData] = await Promise.all([
        patientAPI.getDashboardDataWithCache(),
        patientAPI.getRecentActivitiesWithCache() // Use the cached version
      ]);
      
      return {
        ...dashboardData,
        activities: activitiesData
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load dashboard');
    }
  }
);

export const loadMedicationsWithCache = createAsyncThunk(
  'patient/loadMedicationsWithCache', 
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientAPI.getMedicationsWithCache();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load medications');
    }
  }
);


// Fresh data thunks (for pull-to-refresh)
export const refreshDashboard = createAsyncThunk(
  'patient/refreshDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [dashboardData, activitiesData, notificationsData] = await Promise.all([
        patientAPI.getDashboardData(),
        patientAPI.getRecentActivities(),
        patientAPI.getNotifications()
      ]);
      
      return {
        dashboard: dashboardData,
        activities: activitiesData,
        notifications: notificationsData
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh dashboard');
    }
  }
);

export const refreshMedications = createAsyncThunk(
  'patient/refreshMedications',
  async (params: { search?: string; status?: 'active' | 'paused' | 'completed' } = {}, { rejectWithValue }) => {
    try {
      const data = await patientAPI.getMedications(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh medications');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.isDashboardLoading = action.payload;
    },
    setMedicationsLoading: (state, action: PayloadAction<boolean>) => {
      state.isMedicationsLoading = action.payload;
    },
    setScanningBarcode: (state, action: PayloadAction<boolean>) => {
      state.isScanningBarcode = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Dashboard - kept for backward compatibility
    setDashboardData: (state, action: PayloadAction<{
      stats: any;
      todaysMedications?: any[];
      upcomingReminders?: any[];
    }>) => {
      state.dashboardStats = action.payload.stats;
      if (action.payload.todaysMedications) {
        state.todaysMedications = action.payload.todaysMedications;
      }
      if (action.payload.upcomingReminders) {
        state.upcomingReminders = action.payload.upcomingReminders;
      }
    },
    
    // Medications
    setMedications: (state, action: PayloadAction<any[]>) => {
      state.medications = action.payload;
    },
    setCurrentMedication: (state, action: PayloadAction<any | null>) => {
      state.currentMedication = action.payload;
    },
    updateMedication: (state, action: PayloadAction<any>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = action.payload;
      }
    },
    
    // Meal times
    setMealTimes: (state, action: PayloadAction<any[]>) => {
      state.mealTimes = action.payload;
    },
    updateMealTime: (state, action: PayloadAction<{ id: string; updates: Partial<any> }>) => {
      const { id, updates } = action.payload;
      const index = state.mealTimes.findIndex(meal => meal.id === id);
      if (index !== -1) {
        state.mealTimes[index] = { ...state.mealTimes[index], ...updates };
      }
    },
    
    // Notifications
    setNotifications: (state, action: PayloadAction<any>) => {
      if (Array.isArray(action.payload)) {
        state.notifications = action.payload;
        state.unreadNotificationCount = action.payload.filter((n: any) => !n.isRead).length;
      } else {
        state.notifications = action.payload.notifications || action.payload;
        state.unreadNotificationCount = action.payload.unreadCount || 0;
      }
    },
    updateNotificationCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationCount = action.payload;
    },
    
    // Recent activities
    setRecentActivities: (state, action: PayloadAction<any[]>) => {
      state.recentActivities = action.payload;
    },
    
    // Barcode scanning
    setScannedBarcodeData: (state, action: PayloadAction<any | null>) => {
      state.scannedBarcodeData = action.payload;
    },
    clearBarcodeData: (state) => {
      state.scannedBarcodeData = null;
    },
    
    // Connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    
    // Reset all data
    resetPatientData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Dashboard with Cache
      .addCase(loadDashboardWithCache.pending, (state) => {
        state.isDashboardLoading = true;
        state.error = null;
      })
      .addCase(loadDashboardWithCache.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardStats = action.payload.stats;
        state.todaysMedications = action.payload.todaysMedications || [];
        state.upcomingReminders = action.payload.upcomingReminders || [];
         state.recentActivities = action.payload.activities || [];
        state.isConnected = true;
        state.error = null;
      })
      .addCase(loadDashboardWithCache.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.error = action.payload as string;
        state.isConnected = false;
      })
      
      // Load Medications with Cache
      .addCase(loadMedicationsWithCache.pending, (state) => {
        state.isMedicationsLoading = true;
        state.error = null;
      })
      .addCase(loadMedicationsWithCache.fulfilled, (state, action) => {
        state.isMedicationsLoading = false;
        state.medications = action.payload;
        state.error = null;
      })
      .addCase(loadMedicationsWithCache.rejected, (state, action) => {
        state.isMedicationsLoading = false;
        state.error = action.payload as string;
      })
      
      // Refresh Dashboard (fresh data)
      .addCase(refreshDashboard.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.dashboardStats = action.payload.dashboard.stats;
        state.todaysMedications = action.payload.dashboard.todaysMedications || [];
        state.upcomingReminders = action.payload.dashboard.upcomingReminders || [];
        state.recentActivities = action.payload.activities || [];
        
        // Handle notifications
        const notifications = action.payload.notifications;
        if (Array.isArray(notifications)) {
          state.notifications = notifications;
          state.unreadNotificationCount = notifications.filter((n: any) => !n.isRead).length;
        } else {
          if (
            notifications &&
            typeof notifications === 'object' &&
            'notifications' in notifications &&
            'unreadCount' in notifications
          ) {
            state.notifications = (notifications as any).notifications || [];
            state.unreadNotificationCount = (notifications as any).unreadCount || 0;
          } else {
            state.notifications = notifications || [];
            state.unreadNotificationCount = Array.isArray(notifications)
              ? (notifications as any[]).filter((n: any) => !n.isRead).length
              : 0;
          }
        }
        
        state.isConnected = true;
        state.error = null;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isConnected = false;
      })
      
      // Refresh Medications (fresh data)
      .addCase(refreshMedications.fulfilled, (state, action) => {
        state.medications = action.payload;
      });
  },
});

export const {
  setLoading,
  setDashboardLoading,
  setMedicationsLoading,
  setScanningBarcode,
  setError,
  clearError,
  setDashboardData,
  setMedications,
  setCurrentMedication,
  updateMedication,
  setMealTimes,
  updateMealTime,
  setNotifications,
  updateNotificationCount,
  setRecentActivities,
  setScannedBarcodeData,
  clearBarcodeData,
  setConnectionStatus,
  resetPatientData,
} = patientSlice.actions;

export default patientSlice.reducer;