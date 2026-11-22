/**
 * MaishaPay Checkout Screen
 * Full-screen WebView that auto-submits the payment form (POST { url, fields }
 * returned by the backend) to the MaishaPay hosted gateway.
 *
 * When payment completes, MaishaPay redirects to the backend callback
 * (/api/payment/maishapay/callback), which 302s to <FRONTEND_URL>/checkout/success|failure
 * with query params. We intercept that navigation, hand the params to the
 * payment-return screen, and verify the payment server-side there.
 */

import { useCheckoutStore } from '@/src/api/useCheckout';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';

/** Build the auto-submitting HTML form for the MaishaPay merchant checkout */
function buildPaymentHtml(url: string, fields: Record<string, string | number>) {
  const esc = (v: string | number) =>
    String(v)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const inputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${esc(name)}" value="${esc(value)}" />`,
    )
    .join('\n');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: -apple-system, Roboto, sans-serif; background: #fff;
             display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      p { color: #6b7280; font-size: 14px; }
    </style>
  </head>
  <body>
    <p>Redirecting to secure payment…</p>
    <form method="POST" action="${esc(url)}">
      ${inputs}
    </form>
    <script>document.forms[0].submit();</script>
  </body>
</html>`;
}

export default function MaishaPayScreen() {
  const router = useRouter();
  const { maishapayCheckout, resetCheckout } = useCheckoutStore();
  const webViewRef = useRef<WebView>(null);
  const [handling, setHandling] = useState(false);

  const html = useMemo(
    () =>
      maishapayCheckout
        ? buildPaymentHtml(maishapayCheckout.url, maishapayCheckout.fields)
        : '',
    [maishapayCheckout],
  );

  if (!maishapayCheckout || !maishapayCheckout.url) {
    // Deep-linked or restored without a checkout payload
    router.replace('/checkout/review');
    return null;
  }

  const handleNavigation = (nav: WebViewNavigation) => {
    if (handling) return;
    const { url } = nav;
    // The backend callback redirects to <FRONTEND_URL>/checkout/success|failure
    if (url.includes('/checkout/success') || url.includes('/checkout/failure')) {
      setHandling(true);
      const params = new URLSearchParams(url.split('?')[1] ?? '');
      const sessionId = params.get('session_id') ?? '';
      const status = params.get('status') ?? '';
      const transactionRefId = params.get('transactionRefId') ?? '';

      resetCheckout();
      router.replace({
        pathname: '/payment-return',
        params: { sessionId, status, transactionRefId },
      });
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Your order is saved but unpaid. You can retry payment from your orders later.',
      [
        { text: 'Keep Paying', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: () => {
            resetCheckout();
            router.replace({
              pathname: '/payment-return',
              params: { status: 'cancelled' },
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.badge}>
          <Ionicons name="lock-closed" size={12} color={Colors.success} />
          <Text style={styles.badgeText}>MaishaPay</Text>
        </View>
      </View>

      {handling ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>Verifying your payment…</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(request) => {
            // Block navigation to the callback result pages — we take over there
            const isCallback =
              request.url.includes('/checkout/success') ||
              request.url.includes('/checkout/failure');
            if (isCallback) {
              handleNavigation(request);
              return false;
            }
            return true;
          }}
          onNavigationStateChange={handleNavigation}
          onError={() => {
            Alert.alert(
              'Payment Error',
              'Failed to load the payment page. Please check your connection and try again.',
              [
                {
                  text: 'OK',
                  onPress: () =>
                    router.replace({
                      pathname: '/payment-return',
                      params: { status: 'failed' },
                    }),
                },
              ],
            );
          }}
          style={styles.webview}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By paying you agree to our Terms of Service.{' '}
          <Text
            style={styles.footerLink}
            onPress={() => Linking.openURL('https://www.wenzetiindaku.com/terms')}
          >
            Learn more
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semibold,
    color: Colors.success,
  },
  webview: {
    flex: 1,
  },
  processing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  processingText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
    color: Colors.text.secondary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  footerText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.normal,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.primary,
    fontFamily: FontFamily.semibold,
  },
});
