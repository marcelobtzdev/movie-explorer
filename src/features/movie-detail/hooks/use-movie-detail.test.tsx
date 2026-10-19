import { AppError } from '@/src/utils/app-error';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { movieDetailService } from '../api/movie-detail.service';
import { useMovieDetail } from './use-movie-detail';

jest.mock('../api/movie-detail.service', () => ({
  movieDetailService: { getDetail: jest.fn() },
}));

const mockGetDetail = movieDetailService.getDetail as jest.Mock;

const DETAIL = {
  backdropPath: '/backdrop.jpg',
  genres: [],
  movieId: 550,
  overview: 'Overview',
  releaseDate: '1999-10-15',
  title: 'Fight Club',
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('Hook: useMovieDetail', () => {
  afterEach(() => {
    mockGetDetail.mockReset();
  });

  test('should load the detail for the given movie id', async () => {
    // Arrange
    mockGetDetail.mockResolvedValue(DETAIL);

    // Act
    const { result } = await renderHook(() => useMovieDetail(550), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(mockGetDetail).toHaveBeenCalledWith(expect.objectContaining({ movieId: 550 }));
    expect(result.current.data).toEqual(DETAIL);
  });

  test('should expose a 404 as an AppError with statusCode 404', async () => {
    // Arrange
    mockGetDetail.mockRejectedValue(new AppError({ code: 'ERR_BAD_REQUEST', message: 'not found', statusCode: 404 }));

    // Act
    const { result } = await renderHook(() => useMovieDetail(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBeInstanceOf(AppError);
    expect((result.current.error as AppError).statusCode).toBe(404);
  });
});
