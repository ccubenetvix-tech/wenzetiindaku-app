/**
 * Application Configuration
 * Centralizes all environment-dependent configuration.
 * Uses Expo's process.env with EXPO_PUBLIC_ prefix for client-side access.
 */

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.EXPO_PUBLIC_APP_ENV;
  if (env === 'staging') return 'staging';
  if (env === 'production') return 'production';
  return 'development';
};

export const ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.wenzetiindaku.com/v1',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
  retryAttempts: 3,
} as const;

export const FeatureFlags = {
  enableMockData: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
  enableDebugLogs: process.env.EXPO_PUBLIC_ENABLE_DEBUG_LOGS === 'true',
} as const;

export const AppConfig = {
  environment: getEnvironment(),
  isProduction: getEnvironment() === 'production',
  isDevelopment: getEnvironment() === 'development',
  appName: 'Wenze Tii Ndaku',
  version: '1.0.0',
  buildNumber: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
} as const;

export const StorageKeys = {
  // Non-sensitive (AsyncStorage)
  user: '@wenzetiindaku:user',
  cart: '@wenzetiindaku:cart',
  checkout: '@wenzetiindaku:checkout',
  // Sensitive (expo-secure-store)
  authToken: '@wenzetiindaku:auth_token',
  refreshToken: '@wenzetiindaku:refresh_token',
} as const;

export const CheckoutConfig = {
  vatRate: 0.16,
  freeShippingThreshold: 50,
  shippingCost: 10,
  currency: 'USD',
} as const;

export const logger = {
  log: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs || AppConfig.isDevelopment) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs || AppConfig.isDevelopment) console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (FeatureFlags.enableDebugLogs) console.debug(...args);
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
