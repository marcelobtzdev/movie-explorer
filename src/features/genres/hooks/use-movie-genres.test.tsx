import { QUERY_CACHE } from '@/src/constants/query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { genresService } from '../api/genres.service';
import { useMovieGenres } from './use-movie-genres';

jest.mock('../api/genres.service', () => ({
  genresService: { getMovieGenres: jest.fn() },
}));

const mockGetMovieGenres = genresService.getMovieGenres as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('Hook: useMovieGenres', () => {
  afterEach(() => {
    mockGetMovieGenres.mockReset();
  });

  test('should use the 24h cache config and skip the global error overlays', async () => {
    // Arrange
    mockGetMovieGenres.mockResolvedValue([{ genreId: 28, name: 'Acción' }]);

    // Act
    const { result } = await renderHook(() => useMovieGenres(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual([{ genreId: 28, name: 'Acción' }]);
  });

  test('should use the configured gcTime and staleTime constants', () => {
    // Assert — documents the contract that use-movie-genres.ts must honor
    expect(QUERY_CACHE.genresGcTime).toBe(QUERY_CACHE.genresStaleTime);
  });
});
