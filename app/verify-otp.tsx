/**
 * OTP Verification Screen
 * POST /api/auth/customer/verify-otp
 * POST /api/auth/customer/resend-otp
 * Shown after sign-up before allowing login.
 */

import { ApiConfig } from '@/src/config';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email, role = 'customer' } = useLocalSearchParams<{ email: string; role?: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', `Please enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }
    setLoading(true);
    try {
      const endpoint = role === 'vendor'
        ? `${ApiConfig.baseUrl}/auth/vendor/verify-otp`
        : `${ApiConfig.baseUrl}/auth/customer/verify-otp`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Verification failed.');
      }

      Alert.alert('Verified!', 'Your account has been verified. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const endpoint = role === 'vendor'
        ? `${ApiConfig.baseUrl}/auth/vendor/resend-otp`
        : `${ApiConfig.baseUrl}/auth/customer/resend-otp`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to resend OTP.');
      setCountdown(RESEND_COUNTDOWN);
      setOtp('');
      Alert.alert('Sent!', 'A new verification code has been sent to your email.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setResending(false);
    }
  };

  const displayOtp = otp.padEnd(OTP_LENGTH, ' ').split('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a {OTP_LENGTH}-digit code to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP boxes (visual) */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.otpRow}
            onPress={() => inputRef.current?.focus()}
          >
            {displayOtp.map((char, i) => (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  otp.length === i && styles.otpBoxActive,
                  otp.length > i && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpChar}>{char.trim()}</Text>
              </View>
            ))}
          </TouchableOpacity>

          {/* Hidden real input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={val => setOtp(val.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.verifyBtn, (loading || otp.length < OTP_LENGTH) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={loading || otp.length < OTP_LENGTH}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.verifyBtnText}>Verify Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.countdown}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.resendLink}>Resend</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Back to login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  title: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, textAlign: 'center', marginBottom: Spacing['3xl'], lineHeight: 22 },
  emailHighlight: { color: Colors.primary, fontWeight: FontWeight.semibold },
  otpRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  otpBox: {
    width: 46, height: 56, borderRadius: BorderRadius.md,
    borderWidth: 2, borderColor: Colors.border.medium,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
    ...Shadow.sm,
  },
  otpBoxActive: { borderColor: Colors.primary },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  otpChar: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text.primary },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  verifyBtn: {
    width: '100%', backgroundColor: Colors.primary,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  resendLabel: { fontSize: FontSize.md, color: Colors.text.secondary },
  resendLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  countdown: { fontSize: FontSize.md, color: Colors.text.tertiary },
  backLink: { marginTop: Spacing.md },
  backLinkText: { fontSize: FontSize.md, color: Colors.text.secondary },
});
