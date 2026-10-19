import { Button } from '@/src/components/atoms/Button';
import { Text } from '@/src/components/atoms/Text';
import { APP_STRINGS } from '@/src/constants/strings';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface ErrorStateProps {
  // Shown only in development builds, to tell the kind of failure apart while testing.
  readonly debugDetail?: string;
  readonly message: string;
  readonly onRetry: () => void;
  readonly title: string;
}

export function ErrorState({ debugDetail, message, onRetry, title }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text align="center" size="lg" weight="bold">
        {title}
      </Text>
      <Text align="center" color="secondary" size="sm">
        {message}
      </Text>
      {__DEV__ && debugDetail ? (
        <Text align="center" color="secondary" size="xs">
          {`[dev] ${debugDetail}`}
        </Text>
      ) : null}
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
