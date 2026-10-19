import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { Pressable, StyleSheet } from 'react-native';
import React from 'react';

export interface ButtonProps {
  readonly label: string;
  readonly onPress: () => void;
}

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.container}>
      <Text color="onPrimary" weight="bold">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.primary.main,
    borderRadius: designSystem.spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.sm,
  },
});
