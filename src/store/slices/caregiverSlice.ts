import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { caregiverAPI } from '../../services/api/caregiverAPI';

interface CaregiverState {
  patients: any[];
  currentPatient: any | null;
  dashboardStats: any | null;
  recentActivities: any[];
  isLoading: boolean;
  isDashboardLoading: boolean;
  isPatientsLoading: boolean;
  error: string | null;
}

const initialState: CaregiverState = {
  patients: [],
  currentPatient: null,
  dashboardStats: {       
    totalPatients: 0,
    activeMedications: 0,
    todayReminders: 0,
    criticalAlerts: 0,      
  },
  recentActivities: [],
  isLoading: false,
  isDashboardLoading: false,
  isPatientsLoading: false,
  error: null,
};

// Async thunks for cached data loading
export const loadDashboardWithCache = createAsyncThunk(
  'caregiver/loadDashboardWithCache',
  async (_, { rejectWithValue }) => {
    try {
      const data = await caregiverAPI.getDashboardStatsWithCache();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load dashboard');
    }
  }
);

export const loadPatientsWithCache = createAsyncThunk(
  'caregiver/loadPatientsWithCache',
  async (_, { rejectWithValue }) => {
    try {
      const data = await caregiverAPI.getPatientsWithCache();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load patients');
    }
  }
);

// Fresh data thunks (for pull-to-refresh, etc.)
export const refreshDashboard = createAsyncThunk(
  'caregiver/refreshDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await caregiverAPI.getDashboardStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh dashboard');
    }
  }
);

export const refreshPatients = createAsyncThunk(
  'caregiver/refreshPatients',
  async (params: { search?: string; status?: string; sortBy?: string; sortOrder?: string } = {}, { rejectWithValue }) => {
    try {
      const data = await caregiverAPI.getPatients(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh patients');
    }
  }
);

const caregiverSlice = createSlice({
  name: 'caregiver',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.isDashboardLoading = action.payload;
    },
    setPatientsLoading: (state, action: PayloadAction<boolean>) => {
      state.isPatientsLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPatient: (state, action: PayloadAction<any | null>) => {
      state.currentPatient = action.payload;
    },
    updatePatient: (state, action: PayloadAction<any>) => {
      const index = state.patients.findIndex(patient => patient.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    addPatient: (state, action: PayloadAction<any>) => {
      state.patients.push(action.payload);
    },
    removePatient: (state, action: PayloadAction<string>) => {
      state.patients = state.patients.filter(patient => patient.id !== action.payload);
    },
    resetCaregiverData: () => initialState,
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
        state.recentActivities = action.payload.recentActivities || [];
        state.error = null;
      })
      .addCase(loadDashboardWithCache.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.error = action.payload as string;
      })
      
      // Load Patients with Cache
      .addCase(loadPatientsWithCache.pending, (state) => {
        state.isPatientsLoading = true;
        state.error = null;
      })
      .addCase(loadPatientsWithCache.fulfilled, (state, action) => {
        state.isPatientsLoading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(loadPatientsWithCache.rejected, (state, action) => {
        state.isPatientsLoading = false;
        state.error = action.payload as string;
      })
      
      // Refresh Dashboard (fresh data)
      .addCase(refreshDashboard.pending, (state) => {
        // Don't show loading for refresh
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.dashboardStats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities || [];
        state.error = null;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Refresh Patients (fresh data)
      .addCase(refreshPatients.pending, (state) => {
        // Don't show loading for refresh
        state.error = null;
      })
      .addCase(refreshPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(refreshPatients.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  setLoading, 
  setDashboardLoading,
  setPatientsLoading,
  setError, 
  clearError,
  setCurrentPatient,
  updatePatient,
  addPatient,
  removePatient,
  resetCaregiverData
} = caregiverSlice.actions;

export default caregiverSlice.reducer;