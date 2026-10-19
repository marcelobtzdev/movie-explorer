import { Text } from '@/src/components/atoms/Text';
import { useNotificationStore } from '@/src/stores/notification-store';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import React from 'react';

const AUTO_HIDE_MS = 3000;

export function Toast() {
  const isVisible = useNotificationStore((state) => state.isVisible);
  const message = useNotificationStore((state) => state.message);
  const hide = useNotificationStore((state) => state.hide);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeout = setTimeout(hide, AUTO_HIDE_MS);

    return () => clearTimeout(timeout);
  }, [hide, isVisible]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text color="primary" size="sm">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background.elevated,
    borderRadius: designSystem.spacing.sm,
    bottom: designSystem.spacing.xl,
    left: designSystem.spacing.lg,
    padding: designSystem.spacing.md,
    position: 'absolute',
    right: designSystem.spacing.lg,
  },
});
