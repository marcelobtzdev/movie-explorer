import type { ReactNode } from 'react';
import { designSystem } from '@/src/theme';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

export interface ScreenContainerProps {
  readonly children: ReactNode;
}

// The bottom safe area is intentionally not applied here: a bottom bar (BottomMenu) owns that inset,
// so its background reaches the screen edge and the inset is not added twice.
export function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background.base,
    flex: 1,
  },
});
