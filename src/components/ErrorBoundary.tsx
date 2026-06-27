/**
 * Global Error Boundary
 * Catches unhandled render errors and shows a friendly recovery screen.
 */

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Replace with Sentry.captureException(error, { extra: info }) when Sentry is wired
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.white, padding: Spacing['2xl'],
  },
  emoji: { fontSize: 48, marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.text.primary, marginBottom: Spacing.md, textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md, color: Colors.text.secondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing['2xl'],
  },
  btn: {
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['3xl'], borderRadius: BorderRadius.lg,
  },
  btnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
