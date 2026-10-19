import { Button } from '@/src/components/atoms/Button';
import { Text } from '@/src/components/atoms/Text';
import { APP_STRINGS } from '@/src/constants/strings';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface ErrorStateProps {
  readonly message: string;
  readonly onRetry: () => void;
  readonly title: string;
}

export function ErrorState({ message, onRetry, title }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text align="center" size="lg" weight="bold">
        {title}
      </Text>
      <Text align="center" color="secondary" size="sm">
        {message}
      </Text>
      <Button label={APP_STRINGS.retryAction} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: designSystem.spacing.md,
    justifyContent: 'center',
    padding: designSystem.spacing.xl,
  },
});
