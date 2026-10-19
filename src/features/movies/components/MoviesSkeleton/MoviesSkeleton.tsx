import { Skeleton } from '@/src/components/atoms/Skeleton';
import { MOVIES_STRINGS } from '@/src/features/movies/constants/strings';
import { designSystem } from '@/src/theme';
import { StyleSheet, View } from 'react-native';
import React from 'react';

const GRID_ROWS = 2;
const GRID_COLUMNS = 2;
const TAB_COUNT = 3;
const FEATURED_HEIGHT = 220;

function GridCardSkeleton() {
  return (
    <View style={styles.cardColumn}>
      <Skeleton height={180} radius={8} width="100%" />
      <Skeleton height={16} radius={4} width="80%" />
      <Skeleton height={14} radius={4} width="60%" />
    </View>
  );
}

export function MoviesSkeleton() {
  return (
    <View accessibilityLabel={MOVIES_STRINGS.skeletonRegionLabel} accessibilityRole="progressbar" style={styles.root}>
      <Skeleton.Group show>
        <View style={styles.tabsRow}>
          {Array.from({ length: TAB_COUNT }, (_, index) => (
            <Skeleton height={36} key={index} radius="round" width={100} />
          ))}
        </View>
        <View style={styles.featured}>
          <Skeleton height={FEATURED_HEIGHT} radius={12} width="100%" />
        </View>
        <View style={styles.sectionTitle}>
          <Skeleton height={28} radius={4} width="60%" />
        </View>
        {Array.from({ length: GRID_ROWS }, (_rowValue, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array.from({ length: GRID_COLUMNS }, (_columnValue, columnIndex) => (
              <GridCardSkeleton key={columnIndex} />
            ))}
          </View>
        ))}
      </Skeleton.Group>
    </View>
  );
}

const styles = StyleSheet.create({
  cardColumn: {
    flex: 1,
    gap: designSystem.spacing.xs,
  },
  featured: {
    marginBottom: designSystem.spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
  },
  root: {
    paddingHorizontal: designSystem.spacing.lg,
    paddingTop: designSystem.spacing.md,
  },
  sectionTitle: {
    marginBottom: designSystem.spacing.md,
    marginTop: designSystem.spacing.lg,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.lg,
  },
});
