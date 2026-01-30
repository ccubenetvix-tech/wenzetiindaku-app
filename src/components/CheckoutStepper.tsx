/**
 * Checkout Stepper Component
 * Shows the current step in the checkout flow
 */

import { CheckoutStep } from '@/src/api/checkoutTypes';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const STEPS: { key: CheckoutStep; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'shipping', label: 'Shipping', icon: 'location-outline' },
  { key: 'payment', label: 'Payment', icon: 'card-outline' },
  { key: 'review', label: 'Review', icon: 'checkmark-circle-outline' },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={step.key}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                  isUpcoming && styles.stepCircleUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={isCurrent ? Colors.white : Colors.gray[400]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isCurrent && styles.stepLabelCurrent,
                  isUpcoming && styles.stepLabelUpcoming,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  index < currentIndex && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.secondary,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.primary,
  },
  stepCircleUpcoming: {
    backgroundColor: Colors.gray[200],
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  stepLabelCompleted: {
    color: Colors.secondary,
  },
  stepLabelCurrent: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  stepLabelUpcoming: {
    color: Colors.gray[400],
  },
  connector: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  connectorCompleted: {
    backgroundColor: Colors.secondary,
  },
});

export default CheckoutStepper;
