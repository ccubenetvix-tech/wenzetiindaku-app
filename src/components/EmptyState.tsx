import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Try adjusting your filters or check back later.',
}: EmptyStateProps) {
  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{title}</Text>
      <Text style={{ marginTop: 8, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}