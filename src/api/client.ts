/**
 * API Client Configuration
 * Centralized API client with interceptors for auth, logging, and error handling
 */

import { ApiConfig, logger, StorageKeys } from '@/src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

// Token management
export const tokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(StorageKeys.authToken);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.authToken, token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.authToken);
    await AsyncStorage.removeItem(StorageKeys.refreshToken);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(StorageKeys.refreshToken);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.refreshToken, token);
  },
};

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(endpoint, ApiConfig.baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Create API error
function createApiError(message: string, status?: number, data?: any): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
}

// Main API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, timeout = ApiConfig.timeout, ...fetchConfig } = config;
    
    const url = buildUrl(endpoint, params);
    const token = await tokenManager.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...fetchConfig.headers,
    };
    
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Log request in development
      logger.log(`🌐 API Request: ${fetchConfig.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Log response in development
      logger.log(`✅ API Response: ${response.status} ${url}`);
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw createApiError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }
      
      // Parse response
      const data = await response.json();
      return data;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw createApiError('Request timeout', 408);
      }
      
      logger.error(`❌ API Error: ${url}`, error);
      
      throw error;
    }
  }
  
  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }
  
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
