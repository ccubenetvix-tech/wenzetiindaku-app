/**
 * Customer Sign Up Screen
 * POST /api/auth/customer/signup → routes to verify-otp for email confirmation.
 * Mirrors the website's /customer/signup page.
 */

import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/src/config';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

const isStrongPassword = (password: string): boolean =>
  password.length >= 8 && /[^A-Za-z0-9]/.test(password);

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpCustomer, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const goToVerifyOtp = (emailAddress: string) => {
    router.replace({
      pathname: '/verify-otp',
      params: { email: emailAddress, role: 'customer' },
    });
  };

  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    if (!isValidEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!isStrongPassword(password)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters and include a special character.',
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert(
        'Terms Required',
        'Please agree to the Terms of Service and Privacy Policy to continue.',
      );
      return;
    }

    try {
      await signUpCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        agreeToTerms,
      });
      Alert.alert(
        'Account Created!',
        'We sent a verification code to your email. Please verify to activate your account.',
      );
      goToVerifyOtp(email.trim().toLowerCase());
    } catch (err: any) {
      // Email exists but was never verified: jump to OTP verification
      if (err?.unverifiedAccount) {
        Alert.alert(
          'Account Exists',
          'This email is registered but not verified. We will resend your verification code.',
        );
        goToVerifyOtp(email.trim().toLowerCase());
        return;
      }
      Alert.alert('Sign Up Failed', err.message || 'Please try again');
    }
  };

  const handleGoogleSignUp = () => {
    // Google sign-in creates/links the account in one step
    logger.log('Google sign up pressed — use Continue with Google on login');
    router.push('/login');
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
              <View style={styles.logoTextContainer}>
                <Text style={styles.logoText}>WENZE</Text>
                <Text style={styles.logoTextAccent}>TII NDAKU</Text>
              </View>
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join the marketplace — shop from trusted local stores
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, styles.nameField]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor={Colors.gray[400]}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.nameField]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="transparent"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor={Colors.gray[400]}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.gray[400]}
                  value={password}
                  onChangeText={setPassword}
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
              {password.length > 0 && !isStrongPassword(password) && (
                <Text style={styles.hintTextError}>
                  At least 8 characters with a special character
                </Text>
              )}
              {isStrongPassword(password) && (
                <Text style={styles.hintTextOk}>Password looks good</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.gray[400]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                {passwordsMatch && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                    style={styles.eyeIcon}
                  />
                )}
              </View>
              {passwordsMismatch && (
                <Text style={styles.hintTextError}>Passwords do not match</Text>
              )}
            </View>

            {/* Terms agreement */}
            <View style={styles.termsRow}>
              <Switch
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                trackColor={{ false: Colors.gray[300], true: Colors.primaryLight }}
                thumbColor={agreeToTerms ? Colors.primary : Colors.gray[100]}
                style={styles.switch}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/legal?type=terms')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => router.push('/legal?type=privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.divider} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
              <Ionicons name="logo-google" size={20} color={Colors.google} />
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign in here</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
  },
  logoTextAccent: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
    color: Colors.secondary,
    letterSpacing: 2,
    marginTop: -4,
  },
  welcomeText: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nameField: {
    flex: 1,
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
  hintTextOk: {
    fontSize: 12,
    fontFamily: FontFamily.normal,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: FontFamily.semibold,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: FontFamily.semibold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: FontFamily.normal,
    color: Colors.text.secondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: Spacing.lg,
  },
  googleButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    marginLeft: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
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
