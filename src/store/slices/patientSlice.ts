// src/store/slices/patientSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  patientAPI, 
  PatientMedication, 
  PatientDashboardStats, 
  TodayMedication, 
  UpcomingReminder, 
  MedicationLog,
  MealTime,
  BarcodeData
} from '../../services/api/patientAPI';

interface PatientState {
  // Dashboard Data
  dashboardStats: PatientDashboardStats | null;
  todaysMedications: TodayMedication[];
  upcomingReminders: UpcomingReminder[];
  recentLogs: MedicationLog[];
  
  // Medications
  medications: PatientMedication[];
  currentMedication: PatientMedication | null;
  
  // Meal Times
  mealTimes: MealTime[];
  
  // Notifications
  notifications: any[];
  unreadNotificationCount: number;
  
  // Barcode
  scannedBarcodeData: BarcodeData | null;
  
  // Loading States
  isLoading: boolean;
  isDashboardLoading: boolean;
  isMedicationsLoading: boolean;
  isScanningBarcode: boolean;
  
  // Error States
  error: string | null;
  dashboardError: string | null;
  medicationsError: string | null;
  barcodeError: string | null;
  
  // Realtime Connection
  isConnected: boolean;
  lastUpdated: string | null;
}

const initialState: PatientState = {
  dashboardStats: null,
  todaysMedications: [],
  upcomingReminders: [],
  recentLogs: [],
  medications: [],
  currentMedication: null,
  mealTimes: [],
  notifications: [],
  unreadNotificationCount: 0,
  scannedBarcodeData: null,
  isLoading: false,
  isDashboardLoading: false,
  isMedicationsLoading: false,
  isScanningBarcode: false,
  error: null,
  dashboardError: null,
  medicationsError: null,
  barcodeError: null,
  isConnected: false,
  lastUpdated: null,
};

// Async Thunks
export const fetchDashboardData = createAsyncThunk(
  'patient/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientAPI.getDashboardData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

type FetchMedicationsParams = {
  search?: string;
  status?: 'all' | 'active' | 'paused' | 'completed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const fetchMedications = createAsyncThunk<
  PatientMedication[],
  FetchMedicationsParams | undefined,
  { rejectValue: string }
>(
  'patient/fetchMedications',
  async (params, { rejectWithValue }) => {
    try {
      const medications = await patientAPI.getMedications(params);
      return medications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch medications');
    }
  }
);

export const fetchMedicationDetails = createAsyncThunk(
  'patient/fetchMedicationDetails',
  async (medicationId: string, { rejectWithValue }) => {
    try {
      const medication = await patientAPI.getMedicationDetails(medicationId);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch medication details');
    }
  }
);

export const logMedicationTaken = createAsyncThunk(
  'patient/logMedicationTaken',
  async ({ medicationId, data }: { 
    medicationId: string; 
    data: { takenAt: string; notes?: string; location?: { latitude: number; longitude: number } } 
  }, { rejectWithValue, dispatch }) => {
    try {
      const result = await patientAPI.logMedicationTaken(medicationId, data);
      // Refresh dashboard and medications after logging
      dispatch(fetchDashboardData());
      dispatch(fetchMedications());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to log medication');
    }
  }
);

export const scanMedicationBarcode = createAsyncThunk(
  'patient/scanMedicationBarcode',
  async (barcodeData: string, { rejectWithValue }) => {
    try {
      const data = await patientAPI.scanMedicationBarcode(barcodeData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to scan barcode');
    }
  }
);

export const fetchMealTimes = createAsyncThunk(
  'patient/fetchMealTimes',
  async (_, { rejectWithValue }) => {
    try {
      const mealTimes = await patientAPI.getMealTimes();
      return mealTimes;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch meal times');
    }
  }
);

export const updateMealTimes = createAsyncThunk(
  'patient/updateMealTimes',
  async (mealTimes: any, { rejectWithValue, dispatch }) => {
    try {
      const result = await patientAPI.updateMealTimes(mealTimes);
      // Refresh meal times after update
      dispatch(fetchMealTimes());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update meal times');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'patient/fetchNotifications',
  async (
    params: { type?: 'reminder' | 'alert' | 'system'; read?: boolean; limit?: number; page?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await patientAPI.getNotifications(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'patient/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue, dispatch }) => {
    try {
      await patientAPI.markNotificationAsRead(notificationId);
      // Refresh notifications after marking as read
      dispatch(fetchNotifications({}));
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const sendSOSAlert = createAsyncThunk(
  'patient/sendSOSAlert',
  async (data: { 
    message: string; 
    location?: { latitude: number; longitude: number; address?: string }; 
    severity: 'low' | 'medium' | 'high' | 'critical' 
  }, { rejectWithValue }) => {
    try {
      const result = await patientAPI.sendSOSAlert(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send SOS alert');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    // Realtime updates
    updateDashboardData: (state, action: PayloadAction<Partial<PatientState>>) => {
      Object.assign(state, action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    updateMedication: (state, action: PayloadAction<PatientMedication>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = action.payload;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    addMedication: (state, action: PayloadAction<PatientMedication>) => {
      state.medications.unshift(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    removeMedication: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter(med => med.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    
    // Clear states
    clearError: (state) => {
      state.error = null;
      state.dashboardError = null;
      state.medicationsError = null;
      state.barcodeError = null;
    },
    
    clearBarcodeData: (state) => {
      state.scannedBarcodeData = null;
      state.barcodeError = null;
    },
    
    // Manual refresh
    refreshData: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
    
    // Update notification count
    updateNotificationCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isDashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardStats = action.payload.stats;
        state.todaysMedications = action.payload.todaysMedications;
        state.upcomingReminders = action.payload.upcomingReminders;
        state.recentLogs = action.payload.recentLogs;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardError = action.payload as string;
      });

    // Medications
    builder
      .addCase(fetchMedications.pending, (state) => {
        state.isMedicationsLoading = true;
        state.medicationsError = null;
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.isMedicationsLoading = false;
        state.medications = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMedications.rejected, (state, action) => {
        state.isMedicationsLoading = false;
        state.medicationsError = action.payload as string;
      });

    // Medication Details
    builder
      .addCase(fetchMedicationDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicationDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMedication = action.payload;
      })
      .addCase(fetchMedicationDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Log Medication
    builder
      .addCase(logMedicationTaken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logMedicationTaken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logMedicationTaken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Barcode Scanning
    builder
      .addCase(scanMedicationBarcode.pending, (state) => {
        state.isScanningBarcode = true;
        state.barcodeError = null;
        state.scannedBarcodeData = null;
      })
      .addCase(scanMedicationBarcode.fulfilled, (state, action) => {
        state.isScanningBarcode = false;
        state.scannedBarcodeData = action.payload;
      })
      .addCase(scanMedicationBarcode.rejected, (state, action) => {
        state.isScanningBarcode = false;
        state.barcodeError = action.payload as string;
      });

    // Meal Times
    builder
      .addCase(fetchMealTimes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealTimes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealTimes = action.payload;
      })
      .addCase(fetchMealTimes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Meal Times
    builder
      .addCase(updateMealTimes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMealTimes.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateMealTimes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadNotificationCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // SOS Alert
    builder
      .addCase(sendSOSAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendSOSAlert.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendSOSAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateDashboardData,
  updateMedication,
  addMedication,
  removeMedication,
  setConnectionStatus,
  clearError,
  clearBarcodeData,
  refreshData,
  updateNotificationCount,
} = patientSlice.actions;

export default patientSlice.reducer;