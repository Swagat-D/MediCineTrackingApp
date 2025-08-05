import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authSlice from './slices/authSlice';
import caregiverSlice from './slices/caregiverSlice';
import patientSlice from './slices/patientSlice';
import medicationSlice from './slices/medicationSlice';
import notificationSlice from './slices/notificationSlice';
import { authMiddleware } from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    caregiver: caregiverSlice,
    patient: patientSlice,
    medication: medicationSlice,
    notification: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authMiddleware),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;