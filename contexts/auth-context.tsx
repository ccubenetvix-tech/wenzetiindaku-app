import { logger, StorageKeys } from '@/src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Types
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  });

  // Check for stored user on app load
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setError('Google sign in failed. Please try again.');
    }
  }, [response]);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(StorageKeys.user);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      logger.error('Failed to load user from storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoogleUserInfo = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await response.json();
      
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with your actual API endpoint
      // Example API call:
      // const response = await fetch('YOUR_API_URL/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // For now, simulate a login (REMOVE THIS IN PRODUCTION)
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      // Simulated user data - Replace with actual API response
      const userData: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
      };

      await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(userData));
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
      await AsyncStorage.removeItem(StorageKeys.authToken);
      setUser(null);
    } catch (e) {
      logger.error('Failed to sign out:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
