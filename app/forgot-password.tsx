/**
 * Forgot Password Screen
 * Step 1: POST /api/auth/customer/forgot-password  → sends OTP
 * Step 2: POST /api/auth/customer/reset-password   → OTP + new password
 * Mirrors the website's /forgot-password page.
 */

import { useAuth } from '@/contexts/auth-context';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const isStrongPassword = (password: string): boolean =>
  password.length >= 8 && /[^A-Za-z0-9]/.test(password);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset, resetPassword, isLoading } = useAuth();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      Alert.alert('Code Sent', 'We sent a 6-digit reset code to your email.');
      setStep('reset');
      setCountdown(RESEND_COUNTDOWN);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Please try again');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setCountdown(RESEND_COUNTDOWN);
      setOtp('');
      Alert.alert('Sent!', 'A new reset code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Please try again');
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Invalid Code', `Please enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }
    if (!isStrongPassword(newPassword)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters and include a special character.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      Alert.alert(
        'Password Reset!',
        'Your password has been updated. Please sign in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 'reset' ? setStep('request') : router.back())}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.title}>
              {step === 'request' ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'request'
                ? 'Enter your account email and we will send you a reset code'
                : `Enter the 6-digit code sent to ${email}`}
            </Text>
          </View>

          {step === 'request' ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleRequestReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reset Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={`${OTP_LENGTH}-digit code`}
                    placeholderTextColor={Colors.gray[400]}
                    value={otp}
                    onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={Colors.gray[400]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={Colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your new password"
                    placeholderTextColor={Colors.gray[400]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text style={styles.hintTextError}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Didn&apos;t receive the code? </Text>
                {countdown > 0 ? (
                  <Text style={styles.countdown}>Resend in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remembered your password? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign in here</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: FontFamily.normal,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  hintTextError: {
    fontSize: 12,
    fontFamily: FontFamily.normal,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  resendLabel: {
    fontSize: 14,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: Colors.primary,
  },
  countdown: {
    fontSize: 14,
    fontFamily: FontFamily.normal,
    color: Colors.text.tertiary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: 14,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: Colors.primary,
  },
});
