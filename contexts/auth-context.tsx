/**
 * Auth Context
 * Handles email/password + Google OAuth.
 * Email login is wired to the real backend /api/auth/login.
 * Tokens stored in AsyncStorage (upgrade to expo-secure-store before production).
 */

import { ApiConfig, logger, StorageKeys } from '@/src/config';
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

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  });

  useEffect(() => { loadStoredUser(); }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAccessToken(authentication.accessToken);
      }
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

  /**
   * Called after Google OAuth succeeds.
   * Sends the Google access token to our backend to create/login the user
   * and receive a JWT. Falls back to storing the Google token directly.
   */
  const handleGoogleAccessToken = async (accessToken: string) => {
    try {
      setIsLoading(true);
      // Exchange Google token for our backend JWT
      const res = await fetch(`${ApiConfig.baseUrl}/auth/google/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.first_name + ' ' + data.user.last_name,
          picture: data.user.picture,
          role: data.user.role,
        };
        await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
        await AsyncStorage.setItem(StorageKeys.authToken, data.token);
        if (data.refreshToken) {
          await AsyncStorage.setItem(StorageKeys.refreshToken, data.refreshToken);
        }
        setUser(userData);
        setError(null);
        return;
      }
    } catch (e) {
      logger.warn('Backend Google exchange failed, falling back to direct Google user info');
    }

    // Fallback: fetch user info directly from Google
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
      await AsyncStorage.setItem(StorageKeys.authToken, accessToken);
      setUser(userData);
      setError(null);
    } catch (e) {
      logger.error('Failed to fetch Google user info:', e);
      setError('Failed to get user information from Google.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Email/password login - wired to real backend /api/auth/login
   */
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Sign in failed. Please try again.');
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || `${data.user.first_name} ${data.user.last_name}`.trim(),
        picture: data.user.picture,
        role: data.user.role,
      };

      await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
      await AsyncStorage.setItem(StorageKeys.authToken, data.token);
      if (data.refreshToken) {
        await AsyncStorage.setItem(StorageKeys.refreshToken, data.refreshToken);
      }
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
      await AsyncStorage.multiRemove([
        StorageKeys.user,
        StorageKeys.authToken,
        StorageKeys.refreshToken,
      ]);
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
