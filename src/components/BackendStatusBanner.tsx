/**
 * Backend Status Banner
 * Shows a friendly message when backend is cold-starting or rate limited
 */

import { Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface BackendStatusBannerProps {
  status: 'warming' | 'rate-limited' | 'error' | null;
  message?: string;
}

export function BackendStatusBanner({ status, message }: BackendStatusBannerProps) {
  if (!status) return null;

  const getConfig = () => {
    switch (status) {
      case 'warming':
        return {
          color: Colors.warning || '#FFA500',
          icon: <ActivityIndicator color="#FFF" size="small" />,
          text: message || 'Waking up the server... This may take 10-15 seconds.',
        };
      case 'rate-limited':
        return {
          color: Colors.error || '#FF4444',
          icon: <Text style={styles.icon}>⏱</Text>,
          text: message || 'Too many requests. Please wait a moment...',
        };
      case 'error':
        return {
          color: Colors.error || '#FF4444',
          icon: <Text style={styles.icon}>⚠️</Text>,
          text: message || 'Connection error. Pull to refresh.',
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <View style={[styles.banner, { backgroundColor: config.color }]}>
      <View style={styles.content}>
        {config.icon}
        <Text style={styles.text}>{config.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.normal,
    color: '#FFF',
    flex: 1,
  },
});
