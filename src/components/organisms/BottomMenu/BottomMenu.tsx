import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

export interface BottomMenuItem {
  readonly active: boolean;
  readonly icon: string;
  readonly label: string;
}

export interface BottomMenuProps {
  readonly items: readonly BottomMenuItem[];
}

export function BottomMenu({ items }: BottomMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {items.map((item) => (
        <Pressable
          accessibilityLabel={item.label}
          accessibilityRole="tab"
          accessibilityState={item.active ? { selected: true } : { disabled: true, selected: false }}
          disabled={!item.active}
          key={item.label}
          onPress={() => {}}
          style={styles.item}
        >
          <Text size="lg">{item.icon}</Text>
          <Text
            align="center"
            color={item.active ? 'accent' : 'secondary'}
            numberOfLines={1}
            size="xs"
            weight={item.active ? 'bold' : 'regular'}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background.surface,
    borderTopColor: designSystem.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: designSystem.spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: designSystem.spacing.sm,
  },
});
