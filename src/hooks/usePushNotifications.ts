/**
 * Push Notifications Hook
 * Registers for Expo push notifications and stores the token.
 * Call once from the root layout after authentication.
 */

import { ApiConfig } from '@/src/config';
import { secureStorage } from '@/src/storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications(isAuthenticated: boolean) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then(token => {
      if (token) {
        setExpoPushToken(token);
        sendTokenToServer(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Notification received while app is foregrounded
      console.log('[Push] Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // User tapped the notification
      console.log('[Push] Tapped:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  return { expoPushToken };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Must use a physical device for push notifications');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F2A4A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('[Push] EAS projectId not found in app config');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (e) {
    console.error('[Push] Failed to get push token', e);
    return null;
  }
}

async function sendTokenToServer(token: string): Promise<void> {
  try {
    const authToken = await secureStorage.getItem('@wenzetiindaku:auth_token');
    if (!authToken) return;
    await fetch(`${ApiConfig.baseUrl}/customer/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (e) {
    console.warn('[Push] Failed to register token with server', e);
  }
}
