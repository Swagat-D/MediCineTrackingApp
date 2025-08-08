import { apiClient } from './apiClient';
import { 
  LoginCredentials, 
  SignupData, 
  OTPVerification, 
  AuthResponse,
  User,
  ForgotPasswordData,
  ResetPasswordData
} from '../../types/auth.types';

class AuthAPI {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Signup user
  async signup(userData: SignupData): Promise<{ user: User; otpSent: boolean }> {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return {
        user: response.data.user,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  // Verify OTP
async verifyOTP(otpData: OTPVerification & { type?: string }): Promise<AuthResponse | { success: boolean; message: string }> {
  try {
    const response = await apiClient.post('/auth/verify-otp', otpData);
    
    if (response.data.token) {
      return {
        user: response.data.user,
        token: response.data.token
      };
    } else {
      return {
        success: response.data.success,
        message: response.data.message
      };
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'OTP verification failed');
  }
}

  // Resend OTP
  async resendOTP(email: string): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return {
        message: response.data.message,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', data);
      return {
        message: response.data.message,
        otpSent: response.data.otpSent
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset OTP');
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return {
        message: response.data.message,
        success: response.data.success
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Logout user
  async logout(): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post('/auth/logout');
      return {
        message: response.data.message,
        success: response.data.success
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch('/auth/profile', userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post('/auth/change-password', data);
      return {
        message: response.data.message,
        success: response.data.success
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.delete('/auth/account', {
        data: { password }
      });
      return {
        message: response.data.message,
        success: response.data.success
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Account deletion failed');
    }
  }
}

export const authAPI = new AuthAPI();