/**
 * API Client Configuration
 * Centralized API client with interceptors for auth, logging, and error handling.
 * Tokens are stored in expo-secure-store (not AsyncStorage).
 */

import { ApiConfig, logger, StorageKeys } from '@/src/config';
import { secureStorage } from '@/src/storage';

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

// Token management — backed by expo-secure-store
export const tokenManager = {
  async getToken(): Promise<string | null> {
    return secureStorage.getItem(StorageKeys.authToken);
  },

  async setToken(token: string): Promise<void> {
    await secureStorage.setItem(StorageKeys.authToken, token);
  },

  async removeToken(): Promise<void> {
    await secureStorage.removeItem(StorageKeys.authToken);
    await secureStorage.removeItem(StorageKeys.refreshToken);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(StorageKeys.refreshToken);
  },

  async setRefreshToken(token: string): Promise<void> {
    await secureStorage.setItem(StorageKeys.refreshToken, token);
  },
};

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = ApiConfig.baseUrl.endsWith('/') ? ApiConfig.baseUrl.slice(0, -1) : ApiConfig.baseUrl;
  const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = new URL(base + path);
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
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, timeout = ApiConfig.timeout, ...fetchConfig } = config;
    const url = buildUrl(endpoint, params);
    const token = await tokenManager.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchConfig.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      logger.log(`🌐 ${fetchConfig.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      logger.log(`✅ ${response.status} ${url}`);

      // 401 → clear token so auth context forces re-login
      if (response.status === 401) {
        await tokenManager.removeToken();
      }

      if (!response.ok) {
        let errorData: any;
        try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
        throw createApiError(
          errorData?.error?.message || errorData?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw createApiError('Request timeout', 408);
      logger.error(`❌ API Error: ${url}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined, ...config });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
