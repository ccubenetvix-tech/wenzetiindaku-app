/**
 * Checkout Shipping Screen
 * Step 1: Enter/select shipping address
 */

import { useAuth } from '@/contexts/auth-context';
import { useSavedAddresses, useSaveShippingAddress } from '@/src/api/checkoutApi';
import { COUNTRY_LIST, ShippingAddress } from '@/src/api/checkoutTypes';
import { useCheckoutStore } from '@/src/api/useCheckout';
import { CheckoutStepper } from '@/src/components/CheckoutStepper';
import { OrderSummaryCard } from '@/src/components/OrderSummaryCard';
import { BorderRadius, Colors, FontFamily, FontSize, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
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

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  required?: boolean;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  required = false,
}: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

export default function ShippingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    shippingAddress,
    shippingErrors,
    orderSummary,
    savedAddresses,
    setShippingAddress,
    validateShippingAddress,
    setSavedAddresses,
    selectSavedAddress,
    setStep,
    setLoading,
    isLoading,
    cartItems,
  } = useCheckoutStore();

  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Fetch saved addresses
  const { data: fetchedAddresses } = useSavedAddresses();
  const saveAddressMutation = useSaveShippingAddress();

  useEffect(() => {
    if (fetchedAddresses) {
      setSavedAddresses(fetchedAddresses);
    }
  }, [fetchedAddresses, setSavedAddresses]);

  useEffect(() => {
    setStep('shipping');
  }, [setStep]);

  // Prefill contact details from the signed-in user (once)
  useEffect(() => {
    if (user && shippingAddress && !shippingAddress.email) {
      setShippingAddress({
        email: user.email ?? '',
        fullName: shippingAddress.fullName || user.name || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Redirect if no items
  if (!orderSummary || cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  const handleFieldChange = (field: keyof ShippingAddress, value: string | boolean) => {
    setShippingAddress({ [field]: value });
  };

  const handleSelectSavedAddress = (addressId: string) => {
    selectSavedAddress(addressId);
    setShowSavedAddresses(false);
  };

  const handleContinueToPayment = async () => {
    if (!validateShippingAddress()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Save address to backend if needed
      if (shippingAddress?.saveToProfile) {
        await saveAddressMutation.mutateAsync(shippingAddress);
      }

      // Navigate to payment
      router.push('/checkout/payment');
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyCart = () => {
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Stepper */}
      <CheckoutStepper currentStep="shipping" />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <Ionicons name="location" size={24} color={Colors.primary} />
            <View style={styles.stepHeaderText}>
              <Text style={styles.stepTitle}>Shipping Address</Text>
              <Text style={styles.stepSubtitle}>Confirm your shipping details</Text>
            </View>
          </View>

          {/* Saved Addresses */}
          {savedAddresses.length > 0 && showSavedAddresses && (
            <View style={styles.savedAddressesSection}>
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.savedAddressCard,
                    shippingAddress?.id === addr.id && styles.savedAddressSelected,
                  ]}
                  onPress={() => handleSelectSavedAddress(addr.id!)}
                >
                  <View style={styles.savedAddressContent}>
                    <View style={styles.savedAddressHeader}>
                      <Text style={styles.savedAddressName}>
                        {addr.fullName}
                        {addr.label ? ` · ${addr.label}` : ''}
                      </Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.savedAddressText}>
                      {addr.street1}
                      {addr.street2 ? `, ${addr.street2}` : ''}
                    </Text>
                    <Text style={styles.savedAddressText}>
                      {addr.city}, {addr.state} {addr.postalCode}
                    </Text>
                    <Text style={styles.savedAddressText}>{addr.phone}</Text>
                  </View>
                  <View style={styles.radioOuter}>
                    {shippingAddress?.id === addr.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => setShowSavedAddresses(false)}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addNewButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Address Form */}
          {(!savedAddresses.length || !showSavedAddresses) && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Shipping Details</Text>

              {/* Address label chips */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Address Type</Text>
                <View style={styles.labelChipsRow}>
                  {ADDRESS_LABELS.map((label) => {
                    const active = (shippingAddress?.label || 'Home') === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.labelChip, active && styles.labelChipActive]}
                        onPress={() => handleFieldChange('label', label)}
                      >
                        <Text
                          style={[
                            styles.labelChipText,
                            active && styles.labelChipTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <FormField
                label="Full Name"
                value={shippingAddress?.fullName || ''}
                onChangeText={(v) => handleFieldChange('fullName', v)}
                placeholder="John Doe"
                error={shippingErrors.fullName}
                autoCapitalize="words"
                required
              />

              <FormField
                label="Email Address"
                value={shippingAddress?.email || ''}
                onChangeText={(v) => handleFieldChange('email', v)}
                placeholder="john@example.com"
                error={shippingErrors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <FormField
                label="Phone Number"
                value={shippingAddress?.phone || ''}
                onChangeText={(v) => handleFieldChange('phone', v)}
                placeholder="+243 XXX XXX XXX"
                error={shippingErrors.phone}
                keyboardType="phone-pad"
                required
              />

              <FormField
                label="House No / Street Address"
                value={shippingAddress?.street1 || ''}
                onChangeText={(v) => handleFieldChange('street1', v)}
                placeholder="123 Main Street"
                error={shippingErrors.street1}
                required
              />

              <FormField
                label="Apartment / Area (Optional)"
                value={shippingAddress?.street2 || ''}
                onChangeText={(v) => handleFieldChange('street2', v)}
                placeholder="Apt 4B, Downtown"
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <FormField
                    label="City"
                    value={shippingAddress?.city || ''}
                    onChangeText={(v) => handleFieldChange('city', v)}
                    placeholder="Kinshasa"
                    error={shippingErrors.city}
                    required
                  />
                </View>
                <View style={styles.halfField}>
                  <FormField
                    label="State / Province"
                    value={shippingAddress?.state || ''}
                    onChangeText={(v) => handleFieldChange('state', v)}
                    placeholder="Kinshasa"
                    error={shippingErrors.state}
                    required
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <FormField
                    label="Postal Code"
                    value={shippingAddress?.postalCode || ''}
                    onChangeText={(v) => handleFieldChange('postalCode', v)}
                    placeholder="12345"
                    error={shippingErrors.postalCode}
                    keyboardType="numeric"
                    required
                  />
                </View>
                <View style={styles.halfField}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>
                      Country<Text style={styles.required}> *</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.countrySelector}
                      onPress={() => setCountryModalVisible(true)}
                    >
                      <Text style={styles.countrySelectorText} numberOfLines={1}>
                        {shippingAddress?.country || 'Select Country'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.gray[400]} />
                    </TouchableOpacity>
                    {shippingErrors.country && (
                      <Text style={styles.errorText}>{shippingErrors.country}</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Save to profile switch */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Save this address to my profile</Text>
                <Switch
                  value={shippingAddress?.saveToProfile || false}
                  onValueChange={(v) => handleFieldChange('saveToProfile', v)}
                  trackColor={{ false: Colors.gray[300], true: Colors.primaryLight }}
                  thumbColor={shippingAddress?.saveToProfile ? Colors.primary : Colors.gray[100]}
                />
              </View>

              {savedAddresses.length > 0 && (
                <TouchableOpacity
                  style={styles.useSavedButton}
                  onPress={() => setShowSavedAddresses(true)}
                >
                  <Text style={styles.useSavedButtonText}>Use a saved address</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.summarySection}>
            <OrderSummaryCard summary={orderSummary} collapsible showItems />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={COUNTRY_LIST}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const active = shippingAddress?.country === item.name;
              return (
                <TouchableOpacity
                  style={[styles.countryRow, active && styles.countryRowActive]}
                  onPress={() => {
                    handleFieldChange('country', item.name);
                    setCountryModalVisible(false);
                  }}
                >
                  <Text style={styles.countryRowText}>{item.name}</Text>
                  {active && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.modifyCartButton} onPress={handleModifyCart}>
          <Ionicons name="cart-outline" size={18} color={Colors.primary} />
          <Text style={styles.modifyCartText}>Modify cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, isLoading && styles.buttonDisabled]}
          onPress={handleContinueToPayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepHeaderText: {
    marginLeft: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  stepSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  savedAddressesSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.sm,
  },
  savedAddressSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  savedAddressContent: {
    flex: 1,
  },
  savedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  savedAddressName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  defaultBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontFamily: FontFamily.medium,
  },
  savedAddressText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  addNewButtonText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontFamily: FontFamily.medium,
    marginLeft: Spacing.sm,
  },
  formSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 48,
  },
  countrySelectorText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  labelChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labelChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.white,
  },
  labelChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  labelChipText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.text.secondary,
  },
  labelChipTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.semibold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.text.primary,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  countryRowActive: {
    backgroundColor: Colors.primaryFaded,
  },
  countryRowText: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  switchLabel: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  useSavedButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  useSavedButtonText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontFamily: FontFamily.medium,
  },
  summarySection: {
    padding: Spacing.lg,
  },
  bottomSpacing: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.md,
    ...Shadow.lg,
  },
  modifyCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  modifyCartText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontFamily: FontFamily.medium,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  continueButtonText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.semibold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
