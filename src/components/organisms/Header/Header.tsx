import { Avatar } from '@/src/components/atoms/Avatar';
import { Text } from '@/src/components/atoms/Text';
import { APP_STRINGS } from '@/src/constants/strings';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export interface HeaderProps {
  readonly subtitle: string;
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <Text size="lg" weight="bold">
          {APP_STRINGS.appName}
        </Text>
        <Text color="secondary" size="sm">
          {subtitle}
        </Text>
      </View>
      <Avatar initial="M" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.md,
  },
  titles: {
    gap: designSystem.spacing.xs,
  },
});
