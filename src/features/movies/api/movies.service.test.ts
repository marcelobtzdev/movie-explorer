import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import { moviesService } from './movies.service';

jest.mock('@/src/vendors/axios/tmdb-client', () => ({
  tmdbClient: { get: jest.fn() },
}));

const mockGet = tmdbClient.get as jest.Mock;

describe('Service: moviesService.getPopular', () => {
  afterEach(() => {
    mockGet.mockReset();
  });

  test('should call GET /movie/popular with the given page and forward the AbortSignal', async () => {
    // Arrange
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({
      data: { page: 1, results: [], total_pages: 500, total_results: 10000 },
    });

    // Act
    const result = await moviesService.getPopular({ page: 1, signal });

    // Assert
    expect(mockGet).toHaveBeenCalledWith('/movie/popular', { params: { page: 1 }, signal });
    expect(result).toEqual({ movies: [], page: 1, totalPages: 500 });
  });
});

describe('Service: moviesService.searchMovies', () => {
  afterEach(() => {
    mockGet.mockReset();
  });

  test('should call GET /search/movie sending only the query and forward the AbortSignal', async () => {
    // Arrange
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({
      data: { page: 1, results: [], total_pages: 2, total_results: 39 },
    });

    // Act
    const result = await moviesService.searchMovies({ query: 'fight club', signal });

    // Assert
    expect(mockGet).toHaveBeenCalledWith('/search/movie', { params: { query: 'fight club' }, signal });
    expect(result).toEqual({ movies: [], page: 1, totalPages: 2 });
  });
});
