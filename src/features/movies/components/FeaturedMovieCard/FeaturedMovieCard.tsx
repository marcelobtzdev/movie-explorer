import type { Movie } from '@/src/features/movies/models/movie.model';
import { Chip } from '@/src/components/atoms/Chip';
import { Poster } from '@/src/components/atoms/Poster';
import { Rating } from '@/src/components/atoms/Rating';
import { Text } from '@/src/components/atoms/Text';
import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { MOVIES_STRINGS } from '@/src/features/movies/constants/strings';
import { formatRating } from '@/src/features/movies/utils/format-rating.utils';
import { designSystem } from '@/src/theme';
import { LinearGradient } from '@/src/vendors/linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';

const MAX_FEATURED_GENRES = 3;

export interface FeaturedMovieCardProps {
  readonly genreNames: readonly string[];
  readonly movie: Movie;
  readonly onPress: (movie: Movie) => void;
}

export function FeaturedMovieCard({ genreNames, movie, onPress }: FeaturedMovieCardProps) {
  const year = movie.releaseYear === null ? '–' : String(movie.releaseYear);

  return (
    <Pressable accessibilityLabel={movie.title} accessibilityRole="button" onPress={() => onPress(movie)} style={styles.card}>
      <Poster
        height="100%"
        path={movie.backdropPath}
        placeholderLabel={MOVIES_STRINGS.placeholderLabel}
        size={TMDB_IMAGE_SIZES.backdrop}
        width="100%"
      />
      <LinearGradient colors={['transparent', '#0F1219']} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.gradient} />
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.ratingPill}>
            <Rating size="sm" value={formatRating(movie.voteAverage)} />
            <Text color="secondary" size="xs">
              {MOVIES_STRINGS.ratingSuffix}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} size="xxl" weight="bold">
          {movie.title}
        </Text>
        <View style={styles.genreRow}>
          {genreNames.slice(0, MAX_FEATURED_GENRES).map((name) => (
            <Chip key={name} label={name} />
          ))}
          <Text color="secondary" size="sm">
            {year}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.sm,
  },
  card: {
    aspectRatio: 1.2,
    borderRadius: designSystem.spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    bottom: 0,
    left: 0,
    padding: designSystem.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  genreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.xs,
    marginTop: designSystem.spacing.sm,
  },
  gradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ratingPill: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.rating.background,
    borderRadius: designSystem.spacing.xl,
    flexDirection: 'row',
    gap: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs,
  },
});
