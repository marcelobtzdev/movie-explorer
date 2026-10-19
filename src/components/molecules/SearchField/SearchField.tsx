import { Text } from '@/src/components/atoms/Text';
import { designSystem } from '@/src/theme';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import React from 'react';

export const SEARCH_FIELD_MAX_LENGTH = 100;

export interface SearchFieldProps {
  readonly accessibilityLabel: string;
  readonly clearAccessibilityLabel: string;
  readonly onChangeText: (text: string) => void;
  readonly onClear: () => void;
  readonly placeholder: string;
  readonly value: string;
}

export function SearchField({
  accessibilityLabel,
  clearAccessibilityLabel,
  onChangeText,
  onClear,
  placeholder,
  value,
}: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Text color="secondary" size="md">
        🔍
      </Text>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={SEARCH_FIELD_MAX_LENGTH}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={designSystem.colors.text.secondary}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel={clearAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={designSystem.spacing.xs}
          onPress={onClear}
          style={styles.clear}
        >
          <Text color="secondary" size="md">
            ✕
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clear: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  container: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.elevated,
    borderRadius: designSystem.spacing.xl,
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    minHeight: 44,
    paddingHorizontal: designSystem.spacing.md,
  },
  input: {
    color: designSystem.colors.text.primary,
    flex: 1,
    fontSize: designSystem.typography.size.md.fontSize,
    minHeight: 44,
    paddingVertical: 0,
  },
});
