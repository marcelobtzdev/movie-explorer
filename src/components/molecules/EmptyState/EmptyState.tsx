import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface EmptyStateProps {
  readonly message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View accessibilityRole="text" style={styles.container}>
      <Text color="secondary" size="md">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: designSystem.spacing.sm,
    justifyContent: 'center',
    padding: designSystem.spacing.xl,
  },
});
