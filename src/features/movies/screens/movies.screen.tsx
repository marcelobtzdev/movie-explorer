import type { Movie } from '@/src/features/movies/models/movie.model';
import { Button } from '@/src/components/atoms/Button';
import { Text } from '@/src/components/atoms/Text';
import { BottomMenu } from '@/src/components/organisms/BottomMenu';
import { CategoryTabs } from '@/src/components/molecules/CategoryTabs';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { ErrorState } from '@/src/components/molecules/ErrorState';
import { Header } from '@/src/components/organisms/Header';
import { LoadingIndicator } from '@/src/components/molecules/LoadingIndicator';
import { ScreenContainer } from '@/src/components/templates/ScreenContainer';
import { LIST_TUNING } from '@/src/constants/list';
import { getGenreNames, useMovieGenres } from '@/src/features/genres';
import { designSystem } from '@/src/theme';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { MOVIES_STRINGS } from '../constants/strings';
import { FeaturedMovieCard } from '../components/FeaturedMovieCard';
import { MovieCard } from '../components/MovieCard';
import { MoviesSkeleton } from '../components/MoviesSkeleton';
import { usePopularMovies } from '../hooks/use-popular-movies';

const CATEGORY_TABS = [
  { active: true, label: '🔥 Populares' },
  { active: false, label: '⭐ Mejor Valoradas' },
  { active: false, label: '🎬 En Cartelera' },
] as const;

// Screen gutter is spacing.lg. The grid gap is spacing.md, split in half and applied as padding on
// each card so two neighbouring cards are separated by exactly spacing.md.
const SCREEN_GUTTER = designSystem.spacing.lg;
const GRID_GUTTER = designSystem.spacing.md / 2;

const BOTTOM_MENU_ITEMS = [
  { active: true, icon: '🔥', label: 'Populares' },
  { active: false, icon: '🎞️', label: 'Cartelera' },
  { active: false, icon: '⭐', label: 'Mejor Valoradas' },
  { active: false, icon: '🔖', label: 'Favoritos' },
] as const;

export function MoviesScreen() {
  const genresQuery = useMovieGenres();
  const moviesQuery = usePopularMovies({ enabled: genresQuery.isSuccess });

  const genreLookup = useMemo(
    () => new Map((genresQuery.data ?? []).map((genre) => [genre.genreId, genre.name])),
    [genresQuery.data],
  );

  const movies = moviesQuery.data ?? [];
  const featured = movies[0];
  const gridMovies = movies.slice(1);

  const handleRetryInitial = useCallback(() => {
    genresQuery.refetch().then((genresResult) => {
      if (genresResult.isSuccess) {
        moviesQuery.refetch();
      }
    });
  }, [genresQuery, moviesQuery]);

  const handleRetryNextPage = useCallback(() => {
    moviesQuery.fetchNextPage();
  }, [moviesQuery]);

  const handleEndReached = useCallback(() => {
    if (moviesQuery.hasNextPage && !moviesQuery.isFetchingNextPage && !moviesQuery.isError) {
      moviesQuery.fetchNextPage();
    }
  }, [moviesQuery]);

  const renderItem = useCallback(
    ({ item }: { readonly item: Movie }) => (
      <View style={styles.gridItem}>
        <MovieCard genreNames={getGenreNames(item.genreIds, genreLookup, 2)} movie={item} />
      </View>
    ),
    [genreLookup],
  );

  const keyExtractor = useCallback((item: Movie) => String(item.movieId), []);

  const isInitialLoading = genresQuery.isLoading || moviesQuery.isLoading;
  // moviesQuery.isError stays true for a failed fetchNextPage even once the first page has
  // already succeeded (its data is preserved), so "initial" failure must also check that no
  // page has ever loaded yet — otherwise a footer-only failure would wrongly blank the whole list.
  const isInitialError = genresQuery.isError || (moviesQuery.isError && moviesQuery.data === undefined);

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.tabs}>
          <CategoryTabs items={CATEGORY_TABS} />
        </View>
        {featured ? (
          <View style={styles.featuredWrapper}>
            <FeaturedMovieCard genreNames={getGenreNames(featured.genreIds, genreLookup, 3)} movie={featured} />
          </View>
        ) : null}
        <Text size="lg" weight="bold">
          {MOVIES_STRINGS.sectionTitle}
        </Text>
      </View>
    ),
    [featured, genreLookup],
  );

  const listFooter = useMemo(() => {
    if (moviesQuery.isFetchingNextPage) {
      return <LoadingIndicator accessibilityLabel={MOVIES_STRINGS.sectionTitle} />;
    }

    if (moviesQuery.isError && !isInitialError) {
      return (
        <View style={styles.footerError}>
          <Text align="center" color="secondary" size="sm">
            {MOVIES_STRINGS.footerErrorMessage}
          </Text>
          <Button label="Reintentar" onPress={handleRetryNextPage} />
        </View>
      );
    }

    return null;
  }, [handleRetryNextPage, isInitialError, moviesQuery.isError, moviesQuery.isFetchingNextPage]);

  return (
    <ScreenContainer>
      <Header subtitle={MOVIES_STRINGS.subtitle} />

      {isInitialLoading ? (
        <MoviesSkeleton />
      ) : (
        <>
          {isInitialError || movies.length === 0 ? (
            <View style={styles.standaloneTabs}>
              <CategoryTabs items={CATEGORY_TABS} />
            </View>
          ) : null}
          {isInitialError ? (
            <View style={styles.centeredArea}>
              <ErrorState
                message={MOVIES_STRINGS.initialErrorMessage}
                onRetry={handleRetryInitial}
                title={MOVIES_STRINGS.initialErrorTitle}
              />
            </View>
          ) : movies.length === 0 ? (
            <View style={styles.centeredArea}>
              <EmptyState message={MOVIES_STRINGS.emptyMessage} />
            </View>
          ) : (
            <FlashList
              contentContainerStyle={styles.listContent}
              data={gridMovies}
              drawDistance={LIST_TUNING.drawDistance}
              keyExtractor={keyExtractor}
              ListFooterComponent={listFooter}
              ListHeaderComponent={listHeader}
              numColumns={LIST_TUNING.numColumns}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              renderItem={renderItem}
            />
          )}
        </>
      )}

      <BottomMenu items={BOTTOM_MENU_ITEMS} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centeredArea: {
    flex: 1,
    justifyContent: 'center',
  },
  featuredWrapper: {
    marginBottom: designSystem.spacing.lg,
  },
  footerError: {
    alignItems: 'center',
    gap: designSystem.spacing.sm,
    padding: designSystem.spacing.lg,
  },
  gridItem: {
    flex: 1,
    padding: GRID_GUTTER,
  },
  listContent: {
    // The list's own padding is reduced by GRID_GUTTER because each card adds it back.
    paddingHorizontal: SCREEN_GUTTER - GRID_GUTTER,
  },
  listHeader: {
    paddingBottom: designSystem.spacing.md,
    paddingHorizontal: GRID_GUTTER,
  },
  standaloneTabs: {
    marginBottom: designSystem.spacing.lg,
    paddingHorizontal: SCREEN_GUTTER,
  },
  tabs: {
    marginBottom: designSystem.spacing.lg,
  },
});
