/**
 * Root Layout
 * - Animated brand splash overlay (replaces the old app/index.tsx splash route,
 *   which conflicted with app/(tabs)/index.tsx at "/")
 * - Inter font loading (website typography)
 * - React Query with AsyncStorage persistence (survives app restarts)
 * - Global ErrorBoundary
 * - Push notification registration
 */

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { Colors, FontFamily } from '@/src/theme';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hr garbage collection
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
          return Math.min(5000 + attemptIndex * 3000, 15000); // 5s, 8s, 11s
        }
        // Standard exponential backoff for other errors: 1s, 2s, 4s
        return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
      },
      // Dedupe window: if same request made within 2s, reuse cache
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

// Navigation theme matching the website brand
const WenzeLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background.primary,
    card: Colors.background.primary,
    border: Colors.border.light,
    text: Colors.text.primary,
  },
};

const SPLASH_DURATION = 2200;

/**
 * Animated brand splash overlay shown on launch, then faded out.
 * Replaces the previous splash screen route.
 */
function SplashOverlay({ onDone }: { onDone: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onDone());
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, exitAnim, onDone]);

  return (
    <Animated.View style={[styles.splashContainer, { opacity: exitAnim }]}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>WENZE</Text>
        <Text style={styles.appNameAccent}>TII NDAKU</Text>
        <Text style={styles.tagline}>Your Marketplace</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Connecting Buyers &amp; Sellers</Text>
      </Animated.View>
    </Animated.View>
  );
}

// Inner component so it can use hooks that depend on AuthProvider
function AppPushRegistrar() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);
  return null;
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    // Native splash (configured in app.json) stays visible until fonts are ready
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <AuthProvider>
            <AppPushRegistrar />
            {/* App ships light-mode only, matching the website default */}
            <ThemeProvider value={WenzeLightTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                {/* Let Expo Router auto-discover routes from file system */}
                {/* Only declare screens that need special options */}
                <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
                <Stack.Screen name="search" options={{ presentation: 'modal' }} />
                <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
                <Stack.Screen
                  name="checkout/maishapay"
                  options={{ presentation: 'fullScreenModal' }}
                />
              </Stack>
              <StatusBar style="auto" />
              {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
            </ThemeProvider>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontFamily: FontFamily.bold,
    color: Colors.white,
    letterSpacing: 2,
  },
  appNameAccent: {
    fontSize: 36,
    fontFamily: FontFamily.bold,
    color: Colors.secondary,
    letterSpacing: 2,
    marginTop: -5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: FontFamily.normal,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: FontFamily.normal,
  },
});
