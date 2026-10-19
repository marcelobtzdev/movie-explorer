import type { Movie } from '@/src/features/movies/models/movie.model';
import { Poster } from '@/src/components/atoms/Poster';
import { Rating } from '@/src/components/atoms/Rating';
import { Text } from '@/src/components/atoms/Text';
import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { MOVIES_STRINGS } from '@/src/features/movies/constants/strings';
import { formatCardFooter } from '@/src/features/movies/utils/format-card-footer.utils';
import { formatRating } from '@/src/features/movies/utils/format-rating.utils';
import { designSystem } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';

const MAX_GRID_GENRES = 2;

export interface MovieCardProps {
  readonly genreNames: readonly string[];
  readonly movie: Movie;
  readonly onPress: (movie: Movie) => void;
}

function MovieCardComponent({ genreNames, movie, onPress }: MovieCardProps) {
  const footer = formatCardFooter(movie.releaseYear, genreNames.slice(0, MAX_GRID_GENRES));
  const ratingLabel = formatRating(movie.voteAverage);
  const yearLabel = movie.releaseYear === null ? 'año desconocido' : String(movie.releaseYear);
  const ratingAccessibilityLabel = movie.voteAverage === null ? 'sin valoración' : `valoración ${ratingLabel}`;

  return (
    <Pressable
      accessibilityLabel={`${movie.title}, ${yearLabel}, ${ratingAccessibilityLabel}`}
      accessibilityRole="button"
      onPress={() => onPress(movie)}
      style={styles.card}
    >
      <View style={styles.posterWrapper}>
        <Poster
          borderRadius={8}
          height="100%"
          path={movie.posterPath}
          placeholderLabel={MOVIES_STRINGS.placeholderLabel}
          size={TMDB_IMAGE_SIZES.poster}
          width="100%"
        />
        <View style={styles.ratingBadge}>
          <Rating size="xs" value={ratingLabel} />
        </View>
      </View>
      {/* Reserved line heights keep every card the same height, even when the footer is empty. */}
      <View style={styles.titleLine}>
        <Text numberOfLines={1} size="md" weight="bold">
          {movie.title}
        </Text>
      </View>
      <View style={styles.footerLine}>
        <Text color="secondary" numberOfLines={1} size="sm">
          {footer}
        </Text>
      </View>
    </Pressable>
  );
}

export const MovieCard = React.memo(MovieCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: designSystem.colors.background.surface,
    borderRadius: designSystem.spacing.md,
    gap: designSystem.spacing.xs,
    overflow: 'hidden',
    padding: designSystem.spacing.sm,
  },
  footerLine: {
    minHeight: designSystem.typography.size.sm.lineHeight,
  },
  posterWrapper: {
    aspectRatio: 2 / 3,
    marginBottom: designSystem.spacing.xs,
    position: 'relative',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.rating.background,
    borderRadius: designSystem.spacing.sm,
    flexDirection: 'row',
    gap: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.xs,
    paddingVertical: 2,
    position: 'absolute',
    right: designSystem.spacing.xs,
    top: designSystem.spacing.xs,
  },
  titleLine: {
    minHeight: designSystem.typography.size.md.lineHeight,
  },
});
