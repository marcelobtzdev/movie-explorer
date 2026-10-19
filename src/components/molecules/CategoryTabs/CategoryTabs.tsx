import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import React from 'react';

// The visible pill is compact; the hit slop keeps the touch target at 44pt.
const TAB_HIT_SLOP = 4;

export interface CategoryTabItem {
  readonly active: boolean;
  readonly label: string;
}

export interface CategoryTabsProps {
  readonly items: readonly CategoryTabItem[];
}

export function CategoryTabs({ items }: CategoryTabsProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {items.map((item) => (
        <Pressable
          accessibilityLabel={item.label}
          accessibilityRole="tab"
          accessibilityState={item.active ? { selected: true } : { disabled: true, selected: false }}
          disabled={!item.active}
          hitSlop={TAB_HIT_SLOP}
          key={item.label}
          onPress={() => {}}
          style={[styles.tab, item.active ? styles.tabActive : styles.tabInactive]}
        >
          <Text color={item.active ? 'onPrimary' : 'primary'} size="sm" weight={item.active ? 'bold' : 'regular'}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Inside a vertical list or column the horizontal ScrollView would otherwise grow to fill the
  // remaining height and stretch every pill vertically.
  content: {
    alignItems: 'center',
    gap: designSystem.spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  tab: {
    alignItems: 'center',
    borderRadius: designSystem.spacing.xl,
    justifyContent: 'center',
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.sm,
  },
  tabActive: {
    backgroundColor: designSystem.colors.primary.main,
  },
  tabInactive: {
    backgroundColor: designSystem.colors.background.elevated,
  },
});
