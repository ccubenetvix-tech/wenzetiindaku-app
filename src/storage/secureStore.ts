/**
 * Secure Storage Abstraction
 * Wraps expo-secure-store for sensitive data (tokens).
 * Falls back gracefully on web where SecureStore is unavailable.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb) return sessionStorage.getItem(key);
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) { sessionStorage.setItem(key, value); return; }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('[SecureStore] setItem failed', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb) { sessionStorage.removeItem(key); return; }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('[SecureStore] removeItem failed', e);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map(k => this.removeItem(k)));
  },
};

export default secureStorage;
