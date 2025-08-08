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
      console.log('❌ LOGIN ERROR:', error.message);
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
      console.log('❌ SIGNUP ERROR:', error.message);
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const verifyOTP = createAsyncThunk<
  AuthResponse | { success: boolean; message: string },
  OTPVerification & { type?: string },
  { rejectValue: string }
>(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(otpData);
      
      // Only store auth data if it's a signup flow (has token)
      if ('token' in response && response.token) {
        await storageService.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
        await storageService.setItem(STORAGE_KEYS.USER_ROLE, response.user.role);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error: any) {
      console.log('❌ OTP ERROR:', error.message);
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const resendOTP = createAsyncThunk<
  { message: string; otpSent: boolean },
  string,
  { rejectValue: string }
>(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendOTP(email);
      return response;
    } catch (error: any) {
      console.log('❌ RESEND OTP ERROR:', error.message);
      return rejectWithValue(error.message || 'Failed to resend OTP');
    }
  }
);

export const forgotPassword = createAsyncThunk<
  { message: string; otpSent: boolean },
  { email: string },
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword({ email });
      return response;
    } catch (error: any) {
      console.log('❌ FORGOT PASSWORD ERROR:', error.message);
      return rejectWithValue(error.message || 'Failed to send reset OTP');
    }
  }
);

export const resetPassword = createAsyncThunk<
  { message: string; success: boolean },
  { email: string; otp: string; newPassword: string; confirmPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(data);
      return response;
    } catch (error: any) {
      console.log('❌ RESET PASSWORD ERROR:', error.message);
      return rejectWithValue(error.message || 'Password reset failed');
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
      
      console.log('✅ LOGOUT SUCCESS');
      return true;
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await storageService.removeItem(STORAGE_KEYS.USER_TOKEN);
      await storageService.removeItem(STORAGE_KEYS.USER_ROLE);
      await storageService.removeItem(STORAGE_KEYS.USER_DATA);
      
      console.log('⚠️ LOGOUT ERROR (but cleared locally):', error.message);
      return true; // Return true anyway since we cleared locally
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
        console.log('✅ AUTH STATUS: Authenticated as', role);
        return {
          token,
          user: {
            ...JSON.parse(userData),
            role,
          },
        };
      }
      
      console.log('❌ AUTH STATUS: Not authenticated');
      throw new Error('No valid session found');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUser();
      
      // Update stored user data
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      console.log('❌ GET USER ERROR:', error.message);
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

export const updateProfile = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const user = await authAPI.updateProfile(userData);
      
      // Update stored user data
      await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      console.log('❌ UPDATE PROFILE ERROR:', error.message);
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const changePassword = createAsyncThunk<
  { message: string; success: boolean },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response;
    } catch (error: any) {
      console.log('❌ CHANGE PASSWORD ERROR:', error.message);
      return rejectWithValue(error.message || 'Password change failed');
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
    clearOTPState: (state) => {
      state.otpSent = false;
      state.emailVerified = false;
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
        if ('token' in action.payload && action.payload.token) {
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
      
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = action.payload.otpSent;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to resend OTP';
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = action.payload.otpSent;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send reset OTP';
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, () => initialState)
      
      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthStatus.rejected, () => initialState)
      
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password change failed';
      });
  },
});

export const { 
  clearError, 
  setLoading, 
  resetAuthState, 
  updateUser, 
  clearOTPState 
} = authSlice.actions;

export default authSlice.reducer;