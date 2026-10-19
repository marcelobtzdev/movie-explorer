import { designSystem } from '@/src/theme';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';

export interface LoadingIndicatorProps {
  readonly accessibilityLabel?: string;
}

export function LoadingIndicator({ accessibilityLabel = 'Cargando' }: LoadingIndicatorProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={designSystem.colors.primary.main} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: designSystem.spacing.lg,
  },
});
