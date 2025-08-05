import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  AuthState, 
  LoginCredentials, 
  SignupData, 
  OTPVerification, 
  AuthResponse,
  User 
} from '../../types/auth.types';
import { authAPI } from '../../services/api/authAPI';
import { storageService } from '../../services/storage/storageService';
import { STORAGE_KEYS } from '../../constants/app';

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens and user data
      await storageService.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
      await storageService.setItem(STORAGE_KEYS.USER_ROLE, response.user.role);
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk<
  { user: User; otpSent: boolean },
  SignupData,
  { rejectValue: string }
>(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const verifyOTP = createAsyncThunk<
  AuthResponse,
  OTPVerification,
  { rejectValue: string }
>(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      
      if (response.token) {
        await storageService.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
        await storageService.setItem(STORAGE_KEYS.USER_ROLE, response.user.role);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      
      // Clear stored data
      await storageService.removeItem(STORAGE_KEYS.USER_TOKEN);
      await storageService.removeItem(STORAGE_KEYS.USER_ROLE);
      await storageService.removeItem(STORAGE_KEYS.USER_DATA);
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await storageService.getItem(STORAGE_KEYS.USER_TOKEN);
      const role = await storageService.getItem(STORAGE_KEYS.USER_ROLE);
      const userData = await storageService.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && role && userData) {
        return {
          token,
          user: {
            ...JSON.parse(userData),
            role,
          },
        };
      }
      
      throw new Error('No valid session found');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  emailVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetAuthState: () => initialState,
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = action.payload.otpSent;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Signup failed';
      })
      
      // OTP Verification
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailVerified = true;
        
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'OTP verification failed';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, () => initialState)
      
      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthStatus.rejected, () => initialState);
  },
});

export const { clearError, setLoading, resetAuthState, updateUser } = authSlice.actions;
export default authSlice.reducer;