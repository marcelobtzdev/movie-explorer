import type { TextProps } from '@/src/components/atoms/Text';
import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface RatingProps {
  readonly size?: TextProps['size'];
  readonly value: string;
}

export function Rating({ size = 'sm', value }: RatingProps) {
  return (
    <View style={styles.container}>
      <Text color="accent" size={size}>
        ★
      </Text>
      <Text size={size} weight="bold">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: designSystem.spacing.xs,
  },
});
