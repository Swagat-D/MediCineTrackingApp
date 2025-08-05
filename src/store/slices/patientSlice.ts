import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PatientState {
  medications: any[];
  mealTimes: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  medications: [],
  mealTimes: null,
  isLoading: false,
  error: null,
};

const patientSlice = createSlice({
  name: 'patient',
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
    setMealTimes: (state, action: PayloadAction<any>) => {
      state.mealTimes = action.payload;
    },
  },
});

export const { setLoading, setError, clearError, setMedications, setMealTimes } = patientSlice.actions;
export default patientSlice.reducer;