import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { moviesService } from '../api/movies.service';
import { useSearchMovies } from './use-search-movies';

jest.mock('../api/movies.service', () => ({
  moviesService: { searchMovies: jest.fn() },
}));

const mockSearchMovies = moviesService.searchMovies as jest.Mock;

const MOVIE = (id: number) => ({
  backdropPath: null,
  genreIds: [],
  movieId: id,
  posterPath: null,
  releaseYear: 1999,
  title: `Movie ${id}`,
  voteAverage: 7,
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('Hook: useSearchMovies', () => {
  afterEach(() => {
    mockSearchMovies.mockReset();
  });

  test('should not send a request for an empty term', async () => {
    // Act
    const { result } = await renderHook(() => useSearchMovies({ enabled: true, term: '' }), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockSearchMovies).not.toHaveBeenCalled();
  });

  test('should not send a request while disabled (genres not loaded yet)', async () => {
    // Act
    const { result } = await renderHook(() => useSearchMovies({ enabled: false, term: 'dune' }), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockSearchMovies).not.toHaveBeenCalled();
  });

  test('should return the movies of the single search page', async () => {
    // Arrange
    mockSearchMovies.mockResolvedValue({ movies: [MOVIE(1), MOVIE(2)], page: 1, totalPages: 2 });

    // Act
    const { result } = await renderHook(() => useSearchMovies({ enabled: true, term: 'fight club' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(mockSearchMovies).toHaveBeenCalledWith(expect.objectContaining({ query: 'fight club' }));
    expect(result.current.data).toEqual([MOVIE(1), MOVIE(2)]);
  });

  test('should not expose pagination for search results', async () => {
    // Arrange
    mockSearchMovies.mockResolvedValue({ movies: [MOVIE(1)], page: 1, totalPages: 2 });

    // Act
    const { result } = await renderHook(() => useSearchMovies({ enabled: true, term: 'dune' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect('hasNextPage' in result.current).toBe(false);
  });
});
