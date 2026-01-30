/**
 * Wenzetiindaku App Theme
 * Colors, typography, and spacing constants
 * Brand Colors: Navy Blue (#0F2A4A) + Green (#22C55E)
 */

export const Colors = {
  // Primary brand colors (Navy Blue from Wenze logo)
  primary: '#0F2A4A',
  primaryDark: '#0A1F38',
  primaryLight: '#1E3A5F',
  primaryFaded: '#E8EEF4',

  // Secondary colors (Green from Wenze logo)
  secondary: '#22C55E',
  secondaryDark: '#16A34A',
  secondaryLight: '#4ADE80',
  secondaryFaded: 'rgba(34, 197, 94, 0.1)',

  // Accent colors (Green highlight)
  accent: '#22C55E',
  accentDark: '#16A34A',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningFaded: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  info: '#3B82F6',
  infoFaded: 'rgba(59, 130, 246, 0.1)',

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Rating star color
  star: '#FBBF24',
  starEmpty: '#E5E7EB',

  // Social media colors
  google: '#DB4437',
  facebook: '#4267B2',
  apple: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
};
