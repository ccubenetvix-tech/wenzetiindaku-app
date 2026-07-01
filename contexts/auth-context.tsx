/**
 * Auth Context
 * Handles email/password + Google OAuth.
 * Email login is wired to the real backend /api/auth/login.
 * Tokens stored in expo-secure-store (production-safe).
 */

import { ApiConfig, logger, StorageKeys } from '@/src/config';
import { secureStorage } from '@/src/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  });

  useEffect(() => { loadStoredUser(); }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) handleGoogleAccessToken(authentication.accessToken);
    } else if (response?.type === 'error') {
      setError('Google sign in failed. Please try again.');
    }
  }, [response]);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(StorageKeys.user);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      logger.error('Failed to load user from storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccessToken = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${ApiConfig.baseUrl}/auth/google/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (res.ok) {
        const json = await res.json();
        // Backend: { success: true, data: { user, token, refreshToken } }
        const payload = json.data ?? json;
        const userData: User = {
          id: payload.user.id,
          email: payload.user.email,
          name: payload.user.name || `${payload.user.first_name ?? ''} ${payload.user.last_name ?? ''}`.trim(),
          picture: payload.user.picture,
          role: payload.user.role,
        };
        await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
        await secureStorage.setItem(StorageKeys.authToken, payload.token);
        if (payload.refreshToken) await secureStorage.setItem(StorageKeys.refreshToken, payload.refreshToken);
        setUser(userData);
        setError(null);
        return;
      }
    } catch (e) {
      logger.warn('Backend Google exchange failed, falling back to Google userinfo');
    }

    try {
      const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await googleRes.json();
      const userData: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };
      await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
      await secureStorage.setItem(StorageKeys.authToken, accessToken);
      setUser(userData);
      setError(null);
    } catch (e) {
      logger.error('Failed to fetch Google user info:', e);
      setError('Failed to get user information from Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!email || !password) throw new Error('Please enter email and password');

      const res = await fetch(`${ApiConfig.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Backend error shape: { success: false, error: { message: '...' } } or { message: '...' }
        const msg = json?.error?.message ?? json?.message ?? 'Sign in failed. Please try again.';
        throw new Error(msg);
      }

      // Backend success shape: { success: true, data: { user, token, refreshToken } }
      const payload = json.data ?? json;
      const userData: User = {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name || `${payload.user.first_name ?? ''} ${payload.user.last_name ?? ''}`.trim(),
        picture: payload.user.picture,
        role: payload.user.role,
      };

      await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
      await secureStorage.setItem(StorageKeys.authToken, payload.token);
      if (payload.refreshToken) await secureStorage.setItem(StorageKeys.refreshToken, payload.refreshToken);
      setUser(userData);
    } catch (e: any) {
      setError(e.message || 'Sign in failed. Please try again.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch (e: any) {
      setError('Google sign in failed. Please try again.');
      throw e;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(StorageKeys.user);
      await AsyncStorage.removeItem(StorageKeys.cart);
      await secureStorage.multiRemove([StorageKeys.authToken, StorageKeys.refreshToken]);
      setUser(null);
    } catch (e) {
      logger.error('Failed to sign out:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
