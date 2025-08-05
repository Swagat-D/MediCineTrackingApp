import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MedicationState {
  medications: any[];
  currentMedication: any | null;
  schedules: any[];
  logs: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MedicationState = {
  medications: [],
  currentMedication: null,
  schedules: [],
  logs: [],
  isLoading: false,
  error: null,
};

const medicationSlice = createSlice({
  name: 'medication', 
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMedications: (state, action: PayloadAction<any[]>) => {
      state.medications = action.payload;
    },
    addMedication: (state, action: PayloadAction<any>) => {
      state.medications.push(action.payload);
    },
    updateMedication: (state, action: PayloadAction<any>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = action.payload;
      }
    },
    removeMedication: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter(med => med.id !== action.payload);
    },
    setCurrentMedication: (state, action: PayloadAction<any | null>) => {
      state.currentMedication = action.payload;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  clearError, 
  setMedications, 
  addMedication, 
  updateMedication, 
  removeMedication,
  setCurrentMedication 
} = medicationSlice.actions;
export default medicationSlice.reducer;