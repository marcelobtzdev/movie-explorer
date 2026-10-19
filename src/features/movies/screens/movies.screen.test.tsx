import type { Genre } from '@/src/features/genres';
import { useMovieGenres } from '@/src/features/genres';
import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { usePopularMovies } from '../hooks/use-popular-movies';
import { MoviesScreen } from './movies.screen';

jest.mock('@/src/features/genres', () => ({
  getGenreNames: jest.requireActual('@/src/features/genres/utils/get-genre-names.utils').getGenreNames,
  useMovieGenres: jest.fn(),
}));

jest.mock('../hooks/use-popular-movies', () => ({
  usePopularMovies: jest.fn(),
}));

const mockUseMovieGenres = useMovieGenres as jest.Mock;
const mockUsePopularMovies = usePopularMovies as jest.Mock;

// MOCK DATA
const GENRES: readonly Genre[] = [
  { genreId: 28, name: 'Acción' },
  { genreId: 12, name: 'Aventura' },
];

const MOVIE = (id: number) => ({
  backdropPath: null,
  genreIds: [28],
  movieId: id,
  posterPath: null,
  releaseYear: 2023,
  title: `Movie ${id}`,
  voteAverage: 7,
});

// MOCK RETURN VALUES
const GENRES_SUCCESS = {
  data: GENRES,
  isError: false,
  isLoading: false,
  isSuccess: true,
  refetch: jest.fn().mockResolvedValue({ isSuccess: true }),
};
const GENRES_LOADING = { data: undefined, isError: false, isLoading: true, isSuccess: false, refetch: jest.fn() };
const GENRES_ERROR = {
  data: undefined,
  isError: true,
  isLoading: false,
  isSuccess: false,
  refetch: jest.fn().mockResolvedValue({ isSuccess: true }),
};

const moviesResult = (overrides: Partial<ReturnType<typeof usePopularMovies>>) => ({
  data: undefined,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isError: false,
  isFetchingNextPage: false,
  isLoading: false,
  isSuccess: true,
  refetch: jest.fn(),
  ...overrides,
});

describe('Screen: MoviesScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    test('should show the skeleton while genres are loading, with Header and BottomMenu visible', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_LOADING);
      mockUsePopularMovies.mockReturnValue(moviesResult({ isLoading: true, isSuccess: false }));

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.getByLabelText('Cargando películas')).toBeTruthy();
      expect(screen.getByText('MovieExplorer')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Populares' })).toBeTruthy();
    });

    test('should show the skeleton while the first movie batch is loading', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(moviesResult({ isLoading: true, isSuccess: false }));

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.getByLabelText('Cargando películas')).toBeTruthy();
    });
  });

  describe('Initial error state', () => {
    test('should show the initial error state when genres fail, and retry genres then movies', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_ERROR);
      mockUsePopularMovies.mockReturnValue(moviesResult({ isSuccess: false }));

      // Act
      await render(<MoviesScreen />);

      // Assert — header, category tabs and bottom menu stay visible during the error state (FR-016)
      expect(screen.getByText('No pudimos cargar las películas')).toBeTruthy();
      expect(screen.getByText('MovieExplorer')).toBeTruthy();
      expect(screen.getByRole('tab', { name: '🔥 Populares' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Populares' })).toBeTruthy();

      // Act — retry
      await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert
      expect(GENRES_ERROR.refetch).toHaveBeenCalledTimes(1);
    });

    test('should show the initial error state when the first movie batch fails', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      const moviesRefetch = jest.fn();
      mockUsePopularMovies.mockReturnValue(moviesResult({ isError: true, isSuccess: false, refetch: moviesRefetch }));

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.getByText('No pudimos cargar las películas')).toBeTruthy();

      // Act
      await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert — genres already succeeded, so retrying re-requests the movies query directly
      expect(GENRES_SUCCESS.refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty state', () => {
    test('should show a friendly empty message when the service returns zero movies', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(moviesResult({ data: [] }));

      // Act
      await render(<MoviesScreen />);

      // Assert — header, category tabs and bottom menu all stay visible (FR-018)
      expect(screen.getByText('No hay películas para mostrar')).toBeTruthy();
      expect(screen.getByText('MovieExplorer')).toBeTruthy();
      expect(screen.getByRole('tab', { name: '🔥 Populares' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Populares' })).toBeTruthy();
    });
  });

  describe('Success state', () => {
    test('should render the featured card from the first movie and exclude it from the grid', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(moviesResult({ data: [MOVIE(1), MOVIE(2), MOVIE(3)] }));

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.queryByText('#1 TENDENCIA')).toBeNull();
      expect(screen.getAllByText('Movie 1')).toHaveLength(1);
      expect(screen.getByText('Movie 2')).toBeTruthy();
      expect(screen.getByText('Movie 3')).toBeTruthy();
      expect(screen.getByText('Películas Populares')).toBeTruthy();
    });

    test('should render only the featured card when there is exactly one movie', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(moviesResult({ data: [MOVIE(1)] }));

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.getByText('Movie 1')).toBeTruthy();
      expect(screen.queryByText('No hay películas para mostrar')).toBeNull();
    });
  });

  describe('Pagination (footer)', () => {
    test('should show a footer loading indicator while fetching the next page', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(
        moviesResult({ data: [MOVIE(1), MOVIE(2)], isFetchingNextPage: true }),
      );

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.getByLabelText('Películas Populares')).toBeTruthy();
    });

    test('should show a footer error with retry when loading the next page fails, keeping loaded movies', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      const fetchNextPage = jest.fn();
      mockUsePopularMovies.mockReturnValue(
        moviesResult({ data: [MOVIE(1), MOVIE(2)], fetchNextPage, isError: true }),
      );

      // Act
      await render(<MoviesScreen />);

      // Assert — loaded movies stay visible, this is the footer retry, not the initial error state
      expect(screen.getByText('Movie 2')).toBeTruthy();
      expect(screen.getByText('No se pudieron cargar más películas')).toBeTruthy();
      expect(screen.queryByText('No pudimos cargar las películas')).toBeNull();

      // Act
      await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    test('should show neither a footer indicator nor an error once the end of the list is reached', async () => {
      // Arrange
      mockUseMovieGenres.mockReturnValue(GENRES_SUCCESS);
      mockUsePopularMovies.mockReturnValue(
        moviesResult({ data: [MOVIE(1), MOVIE(2)], hasNextPage: false }),
      );

      // Act
      await render(<MoviesScreen />);

      // Assert
      expect(screen.queryByText('No se pudieron cargar más películas')).toBeNull();
      expect(screen.queryByLabelText('Películas Populares')).toBeNull();
    });
  });
});
