import { Button } from '@/src/components/atoms/Button';
import { Text } from '@/src/components/atoms/Text';
import { APP_STRINGS } from '@/src/constants/strings';
import { useNetworkErrorStore } from '@/src/stores/error-overlay-store';
import { designSystem } from '@/src/theme';
import { Modal, StyleSheet, View } from 'react-native';
import React from 'react';

export function NetworkErrorOverlay() {
  const isExhausted = useNetworkErrorStore((state) => state.isExhausted);
  const isVisible = useNetworkErrorStore((state) => state.isVisible);
  const hide = useNetworkErrorStore((state) => state.hide);
  const retry = useNetworkErrorStore((state) => state.retry);

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text size="lg" weight="bold">
            {APP_STRINGS.networkErrorTitle}
          </Text>
          <View style={styles.actions}>
            {isExhausted ? (
              <Button label={APP_STRINGS.networkErrorAcknowledge} onPress={hide} />
            ) : (
              <Button label={APP_STRINGS.networkErrorAction} onPress={retry} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
  },
  card: {
    backgroundColor: designSystem.colors.background.surface,
    borderRadius: designSystem.spacing.md,
    gap: designSystem.spacing.md,
    padding: designSystem.spacing.lg,
    width: '85%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.overlay.scrim,
    flex: 1,
    justifyContent: 'center',
  },
});
