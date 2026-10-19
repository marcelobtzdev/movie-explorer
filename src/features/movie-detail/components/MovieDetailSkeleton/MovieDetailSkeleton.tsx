import { Skeleton } from '@/src/components/atoms/Skeleton';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';
import { MOVIE_DETAIL_STRINGS } from '../../constants/strings';

const HERO_HEIGHT = 240;

export function MovieDetailSkeleton() {
  return (
    <View
      accessibilityLabel={MOVIE_DETAIL_STRINGS.skeletonRegionLabel}
      accessibilityRole="progressbar"
      style={styles.root}
    >
      <Skeleton.Group show>
        <Skeleton height={HERO_HEIGHT} radius={0} width="100%" />
        <View style={styles.details}>
          <Skeleton height={28} radius={4} width="70%" />
          <Skeleton height={16} radius={4} width="40%" />
          <View style={styles.chips}>
            <Skeleton height={28} radius="round" width={96} />
            <Skeleton height={28} radius="round" width={80} />
            <Skeleton height={28} radius="round" width={72} />
          </View>
          <Skeleton height={20} radius={4} width="35%" />
          <Skeleton height={14} radius={4} width="100%" />
          <Skeleton height={14} radius={4} width="92%" />
          <Skeleton height={14} radius={4} width="60%" />
        </View>
      </Skeleton.Group>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm,
  },
  details: {
    gap: designSystem.spacing.md,
    padding: designSystem.spacing.lg,
  },
  root: {
    flex: 1,
  },
});
