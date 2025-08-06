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
      // MOCK FOR DEVELOPMENT - REMOVE FOR PRODUCTION
      if (__DEV__) {
        console.log('🔥 DEV MODE: Mock login for', credentials.role);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: credentials.role + '-mock-1',
          email: credentials.email,
          name: credentials.role === 'caregiver' ? 'Dr. Sarah Johnson' : 'John Smith',
          role: credentials.role,
          age: credentials.role === 'caregiver' ? 35 : 65,
          gender: credentials.role === 'caregiver' ? 'female' : 'male',
          phoneNumber: '+1-555-0101',
          isEmailVerified: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-08-05T10:00:00Z',
        } as User;
        
        const mockResponse: AuthResponse = {
          user: mockUser,
          token: 'mock-jwt-token-' + credentials.role + '-' + Date.now(),
        };
        
        // Store mock data
        await storageService.setItem(STORAGE_KEYS.USER_TOKEN, mockResponse.token);
        await storageService.setItem(STORAGE_KEYS.USER_ROLE, mockResponse.user.role);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockResponse.user));
        
        console.log('✅ DEV LOGIN SUCCESS:', mockResponse.user.name);
        return mockResponse;
      }
      
      // PRODUCTION CODE
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
      // MOCK FOR DEVELOPMENT
      if (__DEV__) {
        console.log('🔥 DEV MODE: Mock signup for', userData.role);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'new-' + userData.role + '-' + Date.now(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          age: userData.age,
          gender: userData.gender,
          phoneNumber: userData.phoneNumber,
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as User;
        
        console.log('✅ DEV SIGNUP SUCCESS:', mockUser.name);
        return { user: mockUser, otpSent: true };
      }
      
      // PRODUCTION CODE
      const response = await authAPI.signup(userData);
      return response;
    } catch (error: any) {
      console.log('❌ SIGNUP ERROR:', error.message);
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
      // MOCK FOR DEVELOPMENT
      if (__DEV__) {
        console.log('🔥 DEV MODE: Mock OTP verification');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Accept any 6-digit OTP
        if (otp.length !== 6) {
          throw new Error('OTP must be 6 digits');
        }
        
        const role = email.includes('caregiver') ? 'caregiver' : 'patient';
        const mockUser = {
          id: role + '-verified-1',
          email: email,
          name: role === 'caregiver' ? 'Dr. Sarah Johnson' : 'John Smith',
          role: role,
          age: role === 'caregiver' ? 35 : 65,
          gender: role === 'caregiver' ? 'female' : 'male',
          phoneNumber: '+1-555-0101',
          isEmailVerified: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-08-05T10:00:00Z',
        } as User;
        
        const mockResponse: AuthResponse = {
          user: mockUser,
          token: 'mock-verified-token-' + role + '-' + Date.now(),
        };
        
        await storageService.setItem(STORAGE_KEYS.USER_TOKEN, mockResponse.token);
        await storageService.setItem(STORAGE_KEYS.USER_ROLE, mockResponse.user.role);
        await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockResponse.user));
        
        console.log('✅ DEV OTP SUCCESS');
        return mockResponse;
      }
      
      // PRODUCTION CODE
      const response = await authAPI.verifyOTP({ email, otp });
      
      if (response.token) {
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

export const logoutUser = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // MOCK FOR DEVELOPMENT
      if (__DEV__) {
        console.log('🔥 DEV MODE: Mock logout');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // PRODUCTION CODE
        await authAPI.logout();
      }
      
      // Clear stored data (both dev and production)
      await storageService.removeItem(STORAGE_KEYS.USER_TOKEN);
      await storageService.removeItem(STORAGE_KEYS.USER_ROLE);
      await storageService.removeItem(STORAGE_KEYS.USER_DATA);
      
      console.log('✅ LOGOUT SUCCESS');
      return true;
    } catch (error: any) {
      console.log('❌ LOGOUT ERROR:', error.message);
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
    // DEV ONLY - Quick Mock Login
    mockLogin: (state, action: PayloadAction<'caregiver' | 'patient'>) => {
      if (__DEV__) {
        const role = action.payload;
        const mockUser = {
          id: role + '-quick-mock',
          email: role + '@test.com',
          name: role === 'caregiver' ? 'Dr. Sarah Johnson' : 'John Smith',
          role: role,
          age: role === 'caregiver' ? 35 : 65,
          gender: role === 'caregiver' ? 'female' : 'male',
          phoneNumber: '+1-555-0101',
          isEmailVerified: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-08-05T10:00:00Z',
        } as User;
        
        state.isAuthenticated = true;
        state.user = mockUser;
        state.token = 'quick-mock-token-' + role;
        state.error = null;
        state.isLoading = false;
        
        console.log('🚀 QUICK MOCK LOGIN:', role);
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

export const { clearError, setLoading, resetAuthState, updateUser, mockLogin } = authSlice.actions;
export default authSlice.reducer;