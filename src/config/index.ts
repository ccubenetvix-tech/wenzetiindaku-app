/**
 * Application Configuration
 * Centralizes all environment-dependent configuration
 * Uses Expo's process.env with EXPO_PUBLIC_ prefix for client-side access
 */

// Environment detection
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.EXPO_PUBLIC_APP_ENV;
  if (env === 'staging') return 'staging';
  if (env === 'production') return 'production';
  return 'development';
};

// API Configuration
export const ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.wenzetiindaku.com/v1',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
  retryAttempts: 3,
} as const;

// Feature Flags
export const FeatureFlags = {
  enableMockData: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
  enableDebugLogs: process.env.EXPO_PUBLIC_ENABLE_DEBUG_LOGS === 'true',
} as const;

// App Configuration
export const AppConfig = {
  environment: getEnvironment(),
  isProduction: getEnvironment() === 'production',
  isDevelopment: getEnvironment() === 'development',
  appName: 'Wenze Tii Ndaku',
  version: '1.0.0',
} as const;

// Storage Keys (not sensitive, just identifiers)
export const StorageKeys = {
  authToken: '@wenzetiindaku:auth_token',
  refreshToken: '@wenzetiindaku:refresh_token',
  user: '@wenzetiindaku:user',
  cart: '@wenzetiindaku:cart',
  checkout: '@wenzetiindaku:checkout',
} as const;

// Checkout Configuration
export const CheckoutConfig = {
  vatRate: 0.16, // 16% VAT
  freeShippingThreshold: 50,
  shippingCost: 10,
  currency: 'USD',
} as const;

// Logging utility that respects environment
export const logger = {
  log: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs || AppConfig.isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs || AppConfig.isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but could be replaced with error tracking service
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs) {
      console.debug(...args);
    }
  },
};

export default {
  api: ApiConfig,
  features: FeatureFlags,
  app: AppConfig,
  storage: StorageKeys,
  checkout: CheckoutConfig,
  logger,
};
