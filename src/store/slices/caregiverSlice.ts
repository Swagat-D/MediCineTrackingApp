import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CaregiverState {
  patients: any[];
  currentPatient: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CaregiverState = {
  patients: [],
  currentPatient: null,
  isLoading: false,
  error: null,
};

const caregiverSlice = createSlice({
  name: 'caregiver',
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
  },
});

export const { setLoading, setError, clearError } = caregiverSlice.actions;
export default caregiverSlice.reducer;