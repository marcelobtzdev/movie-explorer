import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface AvatarProps {
  readonly initial: string;
}

export function Avatar({ initial }: AvatarProps) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.container}>
      <Text weight="bold">{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.elevated,
    borderColor: designSystem.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
