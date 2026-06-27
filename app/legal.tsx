/**
 * Legal Screen
 * Static WebView for privacy policy, terms of service, cookie policy, vendor terms.
 * Accepts `type` query param: 'privacy' | 'terms' | 'cookies' | 'vendor'
 */

import { Header } from '@/src/components';
import { Colors } from '@/src/theme';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const LEGAL_URLS: Record<string, { title: string; url: string }> = {
  privacy: {
    title: 'Privacy Policy',
    url: 'https://wenzetiindaku.com/privacy-policy',
  },
  terms: {
    title: 'Terms of Service',
    url: 'https://wenzetiindaku.com/terms-of-service',
  },
  cookies: {
    title: 'Cookie Policy',
    url: 'https://wenzetiindaku.com/cookie-policy',
  },
  vendor: {
    title: 'Vendor Terms',
    url: 'https://wenzetiindaku.com/vendor-terms',
  },
  help: {
    title: 'Help Center',
    url: 'https://wenzetiindaku.com/help',
  },
  faq: {
    title: 'FAQs',
    url: 'https://wenzetiindaku.com/faq',
  },
  shipping: {
    title: 'Shipping Info',
    url: 'https://wenzetiindaku.com/shipping',
  },
  returns: {
    title: 'Returns & Refunds',
    url: 'https://wenzetiindaku.com/returns',
  },
};

export default function LegalScreen() {
  const { type = 'privacy' } = useLocalSearchParams<{ type: string }>();
  const { title, url } = LEGAL_URLS[type] || LEGAL_URLS.privacy;
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={title} showSearch={false} showBack />
      <View style={styles.webContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        <WebView
          source={{ uri: url }}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  webContainer: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, zIndex: 1 },
  webview: { flex: 1 },
});
