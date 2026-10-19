import type { MovieDetail } from '@/src/features/movie-detail/models/movie-detail.model';
import { Button } from '@/src/components/atoms/Button';
import { Chip } from '@/src/components/atoms/Chip';
import { Poster } from '@/src/components/atoms/Poster';
import { Text } from '@/src/components/atoms/Text';
import { BOTTOM_MENU_ITEMS } from '@/src/constants/bottom-menu';
import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { BottomMenu } from '@/src/components/organisms/BottomMenu';
import { ErrorState } from '@/src/components/molecules/ErrorState';
import { Header } from '@/src/components/organisms/Header';
import { ScreenContainer } from '@/src/components/templates/ScreenContainer';
import { designSystem } from '@/src/theme';
import { AppError } from '@/src/utils/app-error';
import { describeErrorForDev } from '@/src/utils/describe-error.utils';
import { LinearGradient } from '@/src/vendors/linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';
import type { MovieDetailScreenProps } from '@/src/navigation/navigation.types';
import { MOVIE_DETAIL_STRINGS } from '../constants/strings';
import { MovieDetailSkeleton } from '../components/MovieDetailSkeleton';
import { useMovieDetail } from '../hooks/use-movie-detail';
import { formatReleaseDate } from '../utils/format-release-date.utils';

const HERO_HEIGHT = 240;
const BACK_BUTTON_SIZE = 44;

export function MovieDetailScreen() {
  const navigation = useNavigation<MovieDetailScreenProps['navigation']>();
  const { params } = useRoute<MovieDetailScreenProps['route']>();
  const detailQuery = useMovieDetail(params.movieId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRetry = useCallback(() => {
    detailQuery.refetch();
  }, [detailQuery]);

  const isNotFound = detailQuery.error instanceof AppError && detailQuery.error.statusCode === 404;

  let content: React.ReactNode = null;
  if (detailQuery.isLoading) {
    content = <MovieDetailSkeleton />;
  } else if (isNotFound) {
    content = (
      <View style={styles.centered}>
        <Text align="center" size="lg" weight="bold">
          {MOVIE_DETAIL_STRINGS.notFoundMessage}
        </Text>
        <Button label={MOVIE_DETAIL_STRINGS.backAction} onPress={handleBack} />
      </View>
    );
  } else if (detailQuery.isError) {
    content = (
      <View style={styles.centered}>
        <ErrorState
          debugDetail={describeErrorForDev(detailQuery.error)}
          message={MOVIE_DETAIL_STRINGS.errorMessage}
          onRetry={handleRetry}
          title={MOVIE_DETAIL_STRINGS.errorTitle}
        />
      </View>
    );
  } else if (detailQuery.data) {
    content = <MovieDetailContent movie={detailQuery.data} />;
  }

  return (
    <ScreenContainer>
      <Header subtitle={MOVIE_DETAIL_STRINGS.subtitle} />

      <View style={styles.body}>
        {content}
        <Pressable
          accessibilityLabel={MOVIE_DETAIL_STRINGS.backAction}
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text size="lg">←</Text>
        </Pressable>
      </View>

      <BottomMenu items={BOTTOM_MENU_ITEMS} />
    </ScreenContainer>
  );
}

function MovieDetailContent({ movie }: { readonly movie: MovieDetail }) {
  const releaseDate = formatReleaseDate(movie.releaseDate) ?? MOVIE_DETAIL_STRINGS.releaseDateUnknown;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Poster
          height={HERO_HEIGHT}
          path={movie.backdropPath}
          placeholderLabel={MOVIE_DETAIL_STRINGS.backdropPlaceholder}
          size={TMDB_IMAGE_SIZES.detailBackdrop}
          width="100%"
        />
        <LinearGradient
          colors={['transparent', designSystem.colors.background.base]}
          end={{ x: 0, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradient}
        />
      </View>

      <View style={styles.details}>
        <Text size="xxl" weight="bold">
          {movie.title}
        </Text>
        <Text color="secondary" size="sm">
          {`📅 ${releaseDate}`}
        </Text>

        {movie.genres.length > 0 ? (
          <View style={styles.genres}>
            {movie.genres.map((genre) => (
              <Chip key={genre.genreId} label={genre.name} />
            ))}
          </View>
        ) : null}

        <Text size="lg" weight="bold">
          {MOVIE_DETAIL_STRINGS.sectionSynopsis}
        </Text>
        <Text size="md">{movie.overview || MOVIE_DETAIL_STRINGS.emptySynopsis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: designSystem.colors.rating.background,
    borderRadius: BACK_BUTTON_SIZE / 2,
    height: BACK_BUTTON_SIZE,
    justifyContent: 'center',
    left: designSystem.spacing.lg,
    position: 'absolute',
    top: designSystem.spacing.md,
    width: BACK_BUTTON_SIZE,
    zIndex: 1,
  },
  body: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: designSystem.spacing.lg,
    justifyContent: 'center',
    padding: designSystem.spacing.lg,
  },
  content: {
    paddingBottom: designSystem.spacing.lg,
  },
  details: {
    gap: designSystem.spacing.md,
    padding: designSystem.spacing.lg,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm,
  },
  gradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hero: {
    height: HERO_HEIGHT,
  },
});
