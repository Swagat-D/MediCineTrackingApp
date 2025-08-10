import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
 dashboardStats: null,
 todaysMedications: [],
 upcomingReminders: [],
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
 isConnected: false,
};

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
   
   // Dashboard
   setDashboardData: (state, action: PayloadAction<{
     stats: any;
     todaysMedications: any[];
     upcomingReminders: any[];
   }>) => {
     state.dashboardStats = action.payload.stats;
     state.todaysMedications = action.payload.todaysMedications;
     state.upcomingReminders = action.payload.upcomingReminders;
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
   
   // Notifications
   setNotifications: (state, action: PayloadAction<{
     notifications: any[];
     unreadCount: number;
   }>) => {
     state.notifications = action.payload.notifications;
     state.unreadNotificationCount = action.payload.unreadCount;
   },
   updateNotificationCount: (state, action: PayloadAction<number>) => {
     state.unreadNotificationCount = action.payload;
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
 setNotifications,
 updateNotificationCount,
 setScannedBarcodeData,
 clearBarcodeData,
 setConnectionStatus,
 resetPatientData,
} = patientSlice.actions;

export default patientSlice.reducer;