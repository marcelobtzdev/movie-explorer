import type { ReactNode } from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { designSystem } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';

type TextColor = 'accent' | 'onPrimary' | 'primary' | 'secondary';
type TextSize = 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl';
type TextWeight = 'bold' | 'medium' | 'regular';

export interface TextProps extends Omit<RNTextProps, 'children' | 'style'> {
  readonly align?: 'center' | 'left';
  readonly children: ReactNode;
  readonly color?: TextColor;
  readonly size?: TextSize;
  readonly weight?: TextWeight;
}

export function Text({
  align = 'left',
  children,
  color = 'primary',
  size = 'md',
  weight = 'regular',
  ...rest
}: TextProps) {
  return (
    <RNText style={[styles[size], styles[weight], styles[color], align === 'center' && styles.center]} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  accent: {
    color: designSystem.colors.accent,
  },
  bold: {
    fontWeight: designSystem.typography.weight.bold,
  },
  center: {
    textAlign: 'center',
  },
  lg: designSystem.typography.size.lg,
  md: designSystem.typography.size.md,
  medium: {
    fontWeight: designSystem.typography.weight.medium,
  },
  onPrimary: {
    color: designSystem.colors.text.onPrimary,
  },
  primary: {
    color: designSystem.colors.text.primary,
  },
  regular: {
    fontWeight: designSystem.typography.weight.regular,
  },
  secondary: {
    color: designSystem.colors.text.secondary,
  },
  sm: designSystem.typography.size.sm,
  xl: designSystem.typography.size.xl,
  xs: designSystem.typography.size.xs,
  xxl: designSystem.typography.size.xxl,
});
