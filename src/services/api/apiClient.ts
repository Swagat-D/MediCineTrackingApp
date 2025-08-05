import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../../constants/app';
import { storageService } from '../storage/storageService';

export interface APIError {
  message: string;
  status: number;
  data: any;
}

export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getItem(STORAGE_KEYS.USER_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.log('Error getting token from storage:', error);
        }
        
        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('Request data:', config.data);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
          console.log('Response data:', response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (__DEV__) {
          console.log(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
          console.log('Error:', error.response?.data || error.message);
        }

        // Handle 401 unauthorized - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Clear stored auth data
            await storageService.removeItem(STORAGE_KEYS.USER_TOKEN);
            await storageService.removeItem(STORAGE_KEYS.USER_ROLE);
            await storageService.removeItem(STORAGE_KEYS.USER_DATA);
            
            // You can emit an event or use navigation service here
            
          } catch (clearError) {
            console.log('Error clearing auth data:', clearError);
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: any): APIError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<APIResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.post<APIResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<APIResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.patch<APIResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response = await this.client.delete<APIResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // File upload
  async uploadFile<T = any>(
    url: string, 
    file: any, 
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<APIResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      };

      const response = await this.client.post<APIResponse<T>>(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();