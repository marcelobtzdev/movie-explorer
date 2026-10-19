import type { Movie } from '@/src/features/movies/models/movie.model';
import { Button } from '@/src/components/atoms/Button';
import { Text } from '@/src/components/atoms/Text';
import { BottomMenu } from '@/src/components/organisms/BottomMenu';
import { CategoryTabs } from '@/src/components/molecules/CategoryTabs';
import { EmptyState } from '@/src/components/molecules/EmptyState';
import { ErrorState } from '@/src/components/molecules/ErrorState';
import { Header } from '@/src/components/organisms/Header';
import { LoadingIndicator } from '@/src/components/molecules/LoadingIndicator';
import { SearchField } from '@/src/components/molecules/SearchField';
import { ScreenContainer } from '@/src/components/templates/ScreenContainer';
import { BOTTOM_MENU_ITEMS } from '@/src/constants/bottom-menu';
import { LIST_TUNING } from '@/src/constants/list';
import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { getGenreNames, useMovieGenres } from '@/src/features/genres';
import { ROUTES } from '@/src/navigation/routes';
import type { MoviesScreenProps } from '@/src/navigation/navigation.types';
import { designSystem } from '@/src/theme';
import { describeErrorForDev } from '@/src/utils/describe-error.utils';
import { buildTmdbImageUrl, prefetchTmdbImage } from '@/src/utils/tmdb-image.utils';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { MOVIES_STRINGS } from '../constants/strings';
import { FeaturedMovieCard } from '../components/FeaturedMovieCard';
import { MovieCard } from '../components/MovieCard';
import { MoviesSkeleton } from '../components/MoviesSkeleton';
import { useMovieSearch } from '../hooks/use-movie-search';
import { usePopularMovies } from '../hooks/use-popular-movies';
import { useSearchMovies } from '../hooks/use-search-movies';
import { useMoviesStore } from '../stores/movies-store';

const CATEGORY_TABS = [
  { active: true, label: '🔥 Populares' },
  { active: false, label: '⭐ Mejor Valoradas' },
  { active: false, label: '🎬 En Cartelera' },
] as const;

// Screen gutter is spacing.lg. The grid gap is spacing.md, split in half and applied as padding on
// each card so two neighbouring cards are separated by exactly spacing.md.
const SCREEN_GUTTER = designSystem.spacing.lg;
const GRID_GUTTER = designSystem.spacing.md / 2;

export function MoviesScreen() {
  const navigation = useNavigation<MoviesScreenProps['navigation']>();
  const genresQuery = useMovieGenres();
  const searchTerm = useMoviesStore((state) => state.searchTerm);
  const { clear, control } = useMovieSearch();

  const isSearching = searchTerm.length > 0;
  const popularQuery = usePopularMovies({ enabled: genresQuery.isSuccess && !isSearching });
  const searchQuery = useSearchMovies({ enabled: genresQuery.isSuccess, term: searchTerm });
  // Only the active source drives loading and error states. The popular query keeps its cache while
  // a search is shown, so clearing the search does not refetch it.
  const activeQuery = isSearching ? searchQuery : popularQuery;

  const genreLookup = useMemo(
    () => new Map((genresQuery.data ?? []).map((genre) => [genre.genreId, genre.name])),
    [genresQuery.data],
  );

  const movies = activeQuery.data ?? [];
  const featured = movies[0];
  const gridMovies = movies.slice(1);

  const handleRetryInitial = useCallback(() => {
    if (isSearching) {
      searchQuery.refetch();
      return;
    }

    genresQuery.refetch().then((genresResult) => {
      if (genresResult.isSuccess) {
        popularQuery.refetch();
      }
    });
  }, [genresQuery, isSearching, popularQuery, searchQuery]);

  const handleRetryNextPage = useCallback(() => {
    popularQuery.fetchNextPage();
  }, [popularQuery]);

  const handleEndReached = useCallback(() => {
    // Search results are a single page, so there is never a next page to load while searching.
    if (!isSearching && popularQuery.hasNextPage && !popularQuery.isFetchingNextPage && !popularQuery.isError) {
      popularQuery.fetchNextPage();
    }
  }, [isSearching, popularQuery]);

  // Prefetches the detail image so it is already cached when the detail screen mounts.
  const handleMoviePress = useCallback(
    (movie: Movie) => {
      prefetchTmdbImage(buildTmdbImageUrl(movie.backdropPath, TMDB_IMAGE_SIZES.detailBackdrop));
      navigation.navigate(ROUTES.MOVIE_DETAIL, { movieId: movie.movieId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { readonly item: Movie }) => (
      <View style={styles.gridItem}>
        <MovieCard genreNames={getGenreNames(item.genreIds, genreLookup, 2)} movie={item} onPress={handleMoviePress} />
      </View>
    ),
    [genreLookup, handleMoviePress],
  );

  const keyExtractor = useCallback((item: Movie) => String(item.movieId), []);

  const isInitialLoading = genresQuery.isLoading || activeQuery.isLoading;
  // A failed fetchNextPage keeps isError true while the loaded pages stay in data, so "initial"
  // failure must also require that no data has ever loaded — otherwise a footer-only failure would
  // wrongly blank the whole list.
  const isInitialError = genresQuery.isError || (activeQuery.isError && activeQuery.data === undefined);
  const showList = !isInitialLoading && !isInitialError && movies.length > 0;

  const sectionTitle = isSearching
    ? MOVIES_STRINGS.searchResultsTitle(searchTerm)
    : MOVIES_STRINGS.sectionTitle;

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.tabs}>
          <CategoryTabs items={CATEGORY_TABS} />
        </View>
        {featured ? (
          <View style={styles.featuredWrapper}>
            <FeaturedMovieCard
              genreNames={getGenreNames(featured.genreIds, genreLookup, 3)}
              movie={featured}
              onPress={handleMoviePress}
            />
          </View>
        ) : null}
        <Text size="lg" weight="bold">
          {sectionTitle}
        </Text>
      </View>
    ),
    [featured, genreLookup, handleMoviePress, sectionTitle],
  );

  const listFooter = useMemo(() => {
    if (!isSearching && popularQuery.isFetchingNextPage) {
      return <LoadingIndicator accessibilityLabel={MOVIES_STRINGS.sectionTitle} />;
    }

    if (!isSearching && popularQuery.isError && !isInitialError) {
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
  }, [handleRetryNextPage, isInitialError, isSearching, popularQuery.isError, popularQuery.isFetchingNextPage]);

  return (
    <ScreenContainer>
      <Header subtitle={MOVIES_STRINGS.subtitle} />

      {/* Kept at the same position in every state so the field (and the keyboard) is not remounted. */}
      <View style={styles.search}>
        <Controller
          control={control}
          name="query"
          render={({ field: { onChange, value } }) => (
            <SearchField
              accessibilityLabel={MOVIES_STRINGS.searchAccessibilityLabel}
              clearAccessibilityLabel={MOVIES_STRINGS.clearSearchLabel}
              onChangeText={onChange}
              onClear={clear}
              placeholder={MOVIES_STRINGS.searchPlaceholder}
              value={value}
            />
          )}
        />
      </View>

      {showList ? (
        <FlashList
          contentContainerStyle={styles.listContent}
          data={gridMovies}
          drawDistance={LIST_TUNING.drawDistance}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          ListFooterComponent={listFooter}
          ListHeaderComponent={listHeader}
          numColumns={LIST_TUNING.numColumns}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
        />
      ) : isInitialLoading ? (
        <MoviesSkeleton />
      ) : (
        <>
          <View style={styles.standaloneTabs}>
            <CategoryTabs items={CATEGORY_TABS} />
          </View>
          <View style={styles.centeredArea}>
            {isInitialError ? (
              <ErrorState
                debugDetail={describeErrorForDev(genresQuery.isError ? genresQuery.error : activeQuery.error)}
                message={MOVIES_STRINGS.initialErrorMessage}
                onRetry={handleRetryInitial}
                title={MOVIES_STRINGS.initialErrorTitle}
              />
            ) : (
              <EmptyState message={isSearching ? MOVIES_STRINGS.searchEmptyMessage(searchTerm) : MOVIES_STRINGS.emptyMessage} />
            )}
          </View>
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
  search: {
    marginBottom: designSystem.spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
  },
  standaloneTabs: {
    marginBottom: designSystem.spacing.lg,
    paddingHorizontal: SCREEN_GUTTER,
  },
  tabs: {
    marginBottom: designSystem.spacing.lg,
  },
});
