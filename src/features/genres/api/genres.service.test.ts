import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import { genresService } from './genres.service';

jest.mock('@/src/vendors/axios/tmdb-client', () => ({
  tmdbClient: { get: jest.fn() },
}));

const mockGet = tmdbClient.get as jest.Mock;

describe('Service: genresService.getMovieGenres', () => {
  afterEach(() => {
    mockGet.mockReset();
  });

  test('should call GET /genre/movie/list and forward the AbortSignal', async () => {
    // Arrange
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({ data: { genres: [{ id: 28, name: 'Acción' }] } });

    // Act
    const result = await genresService.getMovieGenres({ signal });

    // Assert
    expect(mockGet).toHaveBeenCalledWith('/genre/movie/list', { signal });
    expect(result).toEqual([{ genreId: 28, name: 'Acción' }]);
  });
});
