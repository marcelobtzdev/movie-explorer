import type { Theme } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { colors } from '@/src/theme';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

const movieExplorerDarkTheme: Theme = {
  colors: {
    background: colors.background.base,
    border: colors.border,
    card: colors.background.surface,
    notification: colors.status.error,
    primary: colors.primary.main,
    text: colors.text.primary,
  },
  dark: true,
  fonts: {
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '700' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    regular: { fontFamily: 'System', fontWeight: '400' },
  },
};

export function ReactNavigationProvider({ children }: { readonly children: ReactNode }) {
  return (
    <NavigationContainer documentTitle={{ enabled: false }} theme={movieExplorerDarkTheme}>
      {children}
    </NavigationContainer>
  );
}
