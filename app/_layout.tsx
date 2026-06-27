/**
 * Root Layout
 * - React Query with AsyncStorage persistence (survives app restarts)
 * - Global ErrorBoundary
 * - Push notification registration
 * - All screens registered
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
        // Don't retry on 4xx client errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
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
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="category/[id]" />
                <Stack.Screen name="store/[id]" />
                <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
                <Stack.Screen name="search" options={{ presentation: 'modal' }} />
                <Stack.Screen name="products" />
                <Stack.Screen name="orders" />
                <Stack.Screen name="order/[id]" />
                <Stack.Screen name="wishlist" />
                <Stack.Screen name="addresses" />
                <Stack.Screen name="profile/index" />
                <Stack.Screen name="profile/edit" />
                <Stack.Screen name="verify-otp" />
                <Stack.Screen name="legal" />
                <Stack.Screen name="login" />
                <Stack.Screen name="checkout/index" />
                <Stack.Screen name="checkout/shipping" />
                <Stack.Screen name="checkout/payment" />
                <Stack.Screen name="checkout/review" />
                <Stack.Screen name="checkout/confirmation" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
