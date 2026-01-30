/**
 * Section Header Component
 * Reusable section header with title and "View All" action
 */

import { Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  viewAllText?: string;
}

export function SectionHeader({
  title,
  subtitle,
  showViewAll = true,
  onViewAll,
  viewAllText = 'View All',
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showViewAll && onViewAll && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>{viewAllText}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  viewAllText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});

export default SectionHeader;
