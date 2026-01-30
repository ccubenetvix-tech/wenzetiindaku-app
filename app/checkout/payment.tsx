/**
 * Checkout Payment Screen
 * Step 2: Select payment method and enter payment details
 */

import { useCreatePaymentIntent, usePaymentMethods } from '@/src/api/checkoutApi';
import { MOBILE_MONEY_PROVIDERS, PaymentMethod } from '@/src/api/checkoutTypes';
import { useCheckoutStore } from '@/src/api/useCheckout';
import { CheckoutStepper } from '@/src/components/CheckoutStepper';
import { OrderSummaryCard } from '@/src/components/OrderSummaryCard';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WenzeLogo = require('@/assets/images/splash-icon.png');

// Payment method icons mapping
const PAYMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  card: 'card',
  mobile_money: 'phone-portrait',
  bank_transfer: 'business',
  cash_on_delivery: 'cash',
  cod: 'cash',
  paypal: 'logo-paypal',
  stripe: 'card',
  flutterwave: 'card',
};

interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function PaymentScreen() {
  const router = useRouter();
  const {
    orderSummary,
    shippingAddress,
    selectedPaymentMethod,
    paymentMethods,
    setPaymentMethods,
    setSelectedPaymentMethod,
    setPaymentIntent,
    setStep,
    setLoading,
    isLoading,
    cartItems,
  } = useCheckoutStore();

  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [selectedMobileProvider, setSelectedMobileProvider] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardErrors, setCardErrors] = useState<Partial<CardFormData>>({});

  // Fetch payment methods
  const { data: fetchedMethods, isLoading: methodsLoading } = usePaymentMethods();
  const createPaymentIntentMutation = useCreatePaymentIntent();

  useEffect(() => {
    if (fetchedMethods) {
      setPaymentMethods(fetchedMethods);
    }
  }, [fetchedMethods]);

  useEffect(() => {
    setStep('payment');
  }, []);

  // Redirect if missing prerequisites
  if (!orderSummary || cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  if (!shippingAddress) {
    router.replace('/checkout/shipping');
    return null;
  }

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setCardErrors({});
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const validateCardForm = (): boolean => {
    const errors: Partial<CardFormData> = {};

    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 16) {
      errors.cardNumber = 'Enter a valid card number';
    }

    if (!cardForm.expiryDate || !/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
      errors.expiryDate = 'Enter MM/YY';
    } else {
      const [month, year] = cardForm.expiryDate.split('/');
      const expMonth = parseInt(month, 10);
      const expYear = parseInt(`20${year}`, 10);
      const now = new Date();
      if (expMonth < 1 || expMonth > 12 || expYear < now.getFullYear()) {
        errors.expiryDate = 'Card has expired';
      }
    }

    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      errors.cvv = 'Enter CVV';
    }

    if (!cardForm.cardholderName || cardForm.cardholderName.length < 3) {
      errors.cardholderName = 'Enter cardholder name';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToReview = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue.');
      return;
    }

    // Validate card form if card selected
    if (selectedPaymentMethod.type === 'card' && !validateCardForm()) {
      return;
    }

    // Validate mobile money
    if (selectedPaymentMethod.type === 'mobile_money') {
      if (!selectedMobileProvider) {
        Alert.alert('Select Provider', 'Please select your mobile money provider.');
        return;
      }
      if (!mobileNumber || mobileNumber.length < 9) {
        Alert.alert('Enter Number', 'Please enter a valid mobile number.');
        return;
      }
    }

    setLoading(true);

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        sessionId: 'checkout-session',
        paymentMethod: selectedPaymentMethod.type,
      });

      setPaymentIntent(paymentIntent);

      // Navigate to review
      router.push('/checkout/review');
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodDetails = () => {
    if (!selectedPaymentMethod) return null;

    switch (selectedPaymentMethod.type) {
      case 'card':
        return (
          <View style={styles.cardForm}>
            <Text style={styles.formSectionTitle}>Card Details</Text>
            <View style={styles.secureNotice}>
              <Ionicons name="lock-closed" size={14} color={Colors.secondary} />
              <Text style={styles.secureNoticeText}>
                Your card details are encrypted and secure
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Card Number</Text>
              <View style={[styles.cardInputWrapper, cardErrors.cardNumber && styles.inputError]}>
                <Ionicons name="card" size={20} color={Colors.gray[400]} />
                <TextInput
                  style={styles.cardInput}
                  value={cardForm.cardNumber}
                  onChangeText={(text) =>
                    setCardForm({ ...cardForm, cardNumber: formatCardNumber(text) })
                  }
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              {cardErrors.cardNumber && (
                <Text style={styles.errorText}>{cardErrors.cardNumber}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, cardErrors.expiryDate && styles.inputError]}
                  value={cardForm.expiryDate}
                  onChangeText={(text) =>
                    setCardForm({ ...cardForm, expiryDate: formatExpiryDate(text) })
                  }
                  placeholder="MM/YY"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {cardErrors.expiryDate && (
                  <Text style={styles.errorText}>{cardErrors.expiryDate}</Text>
                )}
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  style={[styles.input, cardErrors.cvv && styles.inputError]}
                  value={cardForm.cvv}
                  onChangeText={(text) =>
                    setCardForm({ ...cardForm, cvv: text.replace(/\D/g, '') })
                  }
                  placeholder="123"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {cardErrors.cvv && <Text style={styles.errorText}>{cardErrors.cvv}</Text>}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Cardholder Name</Text>
              <TextInput
                style={[styles.input, cardErrors.cardholderName && styles.inputError]}
                value={cardForm.cardholderName}
                onChangeText={(text) => setCardForm({ ...cardForm, cardholderName: text })}
                placeholder="John Doe"
                placeholderTextColor={Colors.gray[400]}
                autoCapitalize="words"
              />
              {cardErrors.cardholderName && (
                <Text style={styles.errorText}>{cardErrors.cardholderName}</Text>
              )}
            </View>
          </View>
        );

      case 'mobile_money':
        return (
          <View style={styles.mobileMoneyForm}>
            <Text style={styles.formSectionTitle}>Mobile Money</Text>
            <Text style={styles.formDescription}>
              Select your provider and enter your mobile number
            </Text>

            <View style={styles.providersGrid}>
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedMobileProvider === provider.id && styles.providerSelected,
                  ]}
                  onPress={() => setSelectedMobileProvider(provider.id)}
                >
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {selectedMobileProvider === provider.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="+243 XXX XXX XXX"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                You will receive a prompt on your phone to authorize the payment.
              </Text>
            </View>
          </View>
        );

      case 'bank_transfer':
        return (
          <View style={styles.bankTransferForm}>
            <Text style={styles.formSectionTitle}>Bank Transfer</Text>
            <Text style={styles.formDescription}>
              Transfer the exact amount to our bank account
            </Text>

            <View style={styles.bankDetails}>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Bank Name</Text>
                <Text style={styles.bankDetailValue}>Equity Bank DRC</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account Name</Text>
                <Text style={styles.bankDetailValue}>Wenze Tii Ndaku Ltd</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account Number</Text>
                <Text style={styles.bankDetailValue}>1234567890</Text>
              </View>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Amount</Text>
                <Text style={styles.bankDetailValueHighlight}>
                  ${orderSummary.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.warningText}>
                Your order will be processed after we confirm receipt of payment.
              </Text>
            </View>
          </View>
        );

      case 'cod':
        return (
          <View style={styles.codForm}>
            <Text style={styles.formSectionTitle}>Cash on Delivery</Text>
            <Text style={styles.formDescription}>
              Pay with cash when your order is delivered
            </Text>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                Please have the exact amount (${orderSummary.total.toFixed(2)}) ready 
                when the delivery arrives. Our driver may not have change.
              </Text>
            </View>

            <View style={styles.codBenefits}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                <Text style={styles.benefitText}>No online payment required</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                <Text style={styles.benefitText}>Inspect before you pay</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                <Text style={styles.benefitText}>Free delivery tracking</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <Image source={WenzeLogo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Stepper */}
      <CheckoutStepper currentStep="payment" />

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
            <Ionicons name="card" size={24} color={Colors.primary} />
            <View style={styles.stepHeaderText}>
              <Text style={styles.stepTitle}>Payment Method</Text>
              <Text style={styles.stepSubtitle}>Choose how you'd like to pay</Text>
            </View>
          </View>

          {/* Payment Methods List */}
          <View style={styles.methodsSection}>
            {methodsLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedPaymentMethod?.id === method.id && styles.methodSelected,
                    !method.enabled && styles.methodDisabled,
                  ]}
                  onPress={() => method.enabled && handleSelectPaymentMethod(method)}
                  disabled={!method.enabled}
                >
                  <View style={styles.methodIconWrapper}>
                    <Ionicons
                      name={PAYMENT_ICONS[method.type] || 'card'}
                      size={24}
                      color={
                        selectedPaymentMethod?.id === method.id
                          ? Colors.primary
                          : Colors.gray[500]
                      }
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text
                      style={[
                        styles.methodName,
                        !method.enabled && styles.textDisabled,
                      ]}
                    >
                      {method.name}
                    </Text>
                    {method.description && (
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    )}
                  </View>
                  <View style={styles.radioOuter}>
                    {selectedPaymentMethod?.id === method.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Payment Method Details */}
          {renderPaymentMethodDetails()}

          {/* Order Summary */}
          <View style={styles.summarySection}>
            <OrderSummaryCard summary={orderSummary} collapsible />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${orderSummary.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPaymentMethod || isLoading) && styles.buttonDisabled,
          ]}
          onPress={handleContinueToReview}
          disabled={!selectedPaymentMethod || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Review Order</Text>
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
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  stepSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  methodsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.sm,
  },
  methodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  methodDisabled: {
    opacity: 0.5,
  },
  methodIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  methodName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  methodDescription: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  textDisabled: {
    color: Colors.gray[400],
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
  cardForm: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  formSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  formDescription: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  secureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryFaded,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  secureNoticeText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    marginLeft: Spacing.xs,
  },
  formField: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
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
    height: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  cardInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  cardInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  mobileMoneyForm: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.gray[50],
    minWidth: '48%',
    flex: 1,
  },
  providerSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryFaded,
  },
  providerName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  bankTransferForm: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bankDetails: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  bankDetailLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  bankDetailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  bankDetailValueHighlight: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  codForm: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  codBenefits: {
    marginTop: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.infoFaded,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.info,
    marginLeft: Spacing.sm,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningFaded,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.warningDark,
    marginLeft: Spacing.sm,
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
    ...Shadow.lg,
  },
  totalSection: {
    marginRight: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  totalAmount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
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
    fontWeight: FontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
