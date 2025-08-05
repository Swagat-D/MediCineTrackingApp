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
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Signup user
  async signup(userData: SignupData): Promise<{ user: User; otpSent: boolean }> {
    try {
      const response = await apiClient.post<{ user: User; otpSent: boolean }>('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(otpData: OTPVerification): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/verify-otp', otpData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; otpSent: boolean }>('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; otpSent: boolean }>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; success: boolean }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; success: boolean }>('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh-token', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<User>('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.post<{ message: string; success: boolean }>('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiClient.delete<{ message: string; success: boolean }>('/auth/account', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const authAPI = new AuthAPI();