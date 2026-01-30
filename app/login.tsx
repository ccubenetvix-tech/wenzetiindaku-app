import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/src/config';
import { Colors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');
const WenzeLogo = require('@/assets/images/splash-icon.png');

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      await signInWithEmail(email, password);
      // Navigate to tabs after successful login
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Please try again');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation will happen after successful auth in useEffect
    } catch (err: any) {
      Alert.alert('Google Sign In Failed', err.message || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    logger.log('Forgot password pressed');
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign up screen
    logger.log('Sign up pressed');
  };

  const handleBecomeVendor = () => {
    // TODO: Navigate to vendor registration
    logger.log('Become a vendor pressed');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>WENZE</Text>
              <Text style={styles.logoTextGreen}>TII NDAKU</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to your customer account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
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

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: Colors.gray[300], true: Colors.primaryLight }}
                thumbColor={rememberMe ? Colors.primary : Colors.gray[100]}
                style={styles.switch}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} color={Colors.google} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign up here</Text>
            </TouchableOpacity>
          </View>

          {/* Vendor Link */}
          <TouchableOpacity style={styles.vendorContainer} onPress={handleBecomeVendor}>
            <Ionicons name="briefcase-outline" size={18} color={Colors.secondary} />
            <Text style={styles.vendorText}>Want to sell? </Text>
            <Text style={styles.vendorLink}>Become a vendor</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Support?</Text>
          
          <View style={styles.supportItem}>
            <Ionicons name="mail" size={16} color={Colors.primary} />
            <Text style={styles.supportText}>tech-wenzetiindaku@outlook.com</Text>
          </View>
          
          <View style={styles.supportItem}>
            <Ionicons name="call" size={16} color={Colors.primary} />
            <Text style={styles.supportText}>+32 495 84 68 66</Text>
          </View>
          
          <View style={styles.supportItem}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.supportText}>Kinshasa, R.D. CONGO</Text>
          </View>
          
          <View style={styles.supportItem}>
            <Ionicons name="time" size={16} color={Colors.primary} />
            <Text style={styles.supportText}>Mon-Fri 9AM-6PM WAT</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 2,
  },
  logoTextGreen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
    letterSpacing: 2,
    marginTop: -4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 24,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  vendorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginBottom: 32,
  },
  vendorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  vendorLink: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  supportSection: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 20,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
});
