import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface ChipProps {
  readonly active?: boolean;
  readonly label: string;
}

export function Chip({ active = false, label }: ChipProps) {
  return (
    <View style={[styles.container, active ? styles.active : styles.inactive]}>
      <Text color={active ? 'onPrimary' : 'primary'} size="xs" weight={active ? 'bold' : 'regular'}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: designSystem.colors.primary.main,
  },
  container: {
    borderRadius: designSystem.spacing.xl,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: designSystem.spacing.xs,
  },
  inactive: {
    backgroundColor: designSystem.colors.background.elevated,
  },
});
