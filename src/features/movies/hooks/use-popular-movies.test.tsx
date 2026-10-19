import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { moviesService } from '../api/movies.service';
import { usePopularMovies } from './use-popular-movies';

jest.mock('../api/movies.service', () => ({
  moviesService: { getPopular: jest.fn() },
}));

const mockGetPopular = moviesService.getPopular as jest.Mock;

const MOVIE = (id: number) => ({
  backdropPath: null,
  genreIds: [],
  movieId: id,
  posterPath: null,
  releaseYear: 2023,
  title: `Movie ${id}`,
  voteAverage: 7,
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('Hook: usePopularMovies', () => {
  afterEach(() => {
    mockGetPopular.mockReset();
  });

  test('should not fetch while enabled is false', async () => {
    // Act
    const { result } = await renderHook(() => usePopularMovies({ enabled: false }), { wrapper: createWrapper() });

    // Assert
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetPopular).not.toHaveBeenCalled();
  });

  test('should flatten the first page once enabled', async () => {
    // Arrange
    mockGetPopular.mockResolvedValue({ movies: [MOVIE(1), MOVIE(2)], page: 1, totalPages: 500 });

    // Act
    const { result } = await renderHook(() => usePopularMovies({ enabled: true }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual([MOVIE(1), MOVIE(2)]);
  });

  test('getNextPageParam should return undefined once the capped last page is reached', async () => {
    // Arrange
    mockGetPopular.mockResolvedValue({ movies: [MOVIE(1)], page: 500, totalPages: 900 });

    // Act
    const { result } = await renderHook(() => usePopularMovies({ enabled: true }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert — TMDB caps real pagination at 500 even when total_pages reports more
    expect(result.current.hasNextPage).toBe(false);
  });

  test('should de-duplicate movies that appear on more than one page', async () => {
    // Arrange
    mockGetPopular
      .mockResolvedValueOnce({ movies: [MOVIE(1), MOVIE(2)], page: 1, totalPages: 2 })
      .mockResolvedValueOnce({ movies: [MOVIE(2), MOVIE(3)], page: 2, totalPages: 2 });

    // Act
    const { result } = await renderHook(() => usePopularMovies({ enabled: true }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    result.current.fetchNextPage().catch(() => {});
    await waitFor(() => expect(result.current.data).toHaveLength(3), { timeout: 5000 });

    // Assert
    expect(result.current.data?.map((movie) => movie.movieId)).toEqual([1, 2, 3]);
  });
});
