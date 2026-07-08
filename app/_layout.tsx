/**
 * Root Layout
 * - React Query with AsyncStorage persistence (survives app restarts)
 * - Global ErrorBoundary
 * - Push notification registration
 * - Routes registered (relying on file-based routing for most)
 */

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min fresh
      gcTime: 1000 * 60 * 60 * 24,    // 24 hr garbage collection
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx client errors (includes 429 rate limits)
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry 503 (cold start) up to 3 times with longer delays
        if (error?.status === 503) return failureCount < 3;
        // Other 5xx errors: max 2 retries
        return failureCount < 2;
      },
      retryDelay: (attemptIndex, error: any) => {
        // 503 = backend cold-starting, needs 5-10+ seconds to wake
        if (error?.status === 503) {
          return Math.min(5000 + (attemptIndex * 3000), 15000); // 5s, 8s, 11s
        }
        // Standard exponential backoff for other errors: 1s, 2s, 4s
        return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
      },
      // Dedupe window: if same request made within 2s, reuse cache
      dedupeInterval: 2000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
  key: 'WENZE_QUERY_CACHE',
});

// Inner component so it can use hooks that depend on AuthProvider
function AppPushRegistrar() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <AuthProvider>
            <AppPushRegistrar />
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                {/* Let Expo Router auto-discover routes from file system */}
                {/* Only declare screens that need special options */}
                <Stack.Screen 
                  name="cart" 
                  options={{ presentation: 'modal' }} 
                />
                <Stack.Screen 
                  name="search" 
                  options={{ presentation: 'modal' }} 
                />
                <Stack.Screen 
                  name="checkout" 
                  options={{ presentation: 'modal' }} 
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
