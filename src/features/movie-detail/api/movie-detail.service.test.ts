import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import { movieDetailService } from './movie-detail.service';

jest.mock('@/src/vendors/axios/tmdb-client', () => ({
  tmdbClient: { get: jest.fn() },
}));

const mockGet = tmdbClient.get as jest.Mock;

describe('Service: movieDetailService.getDetail', () => {
  afterEach(() => {
    mockGet.mockReset();
  });

  test('should call GET /movie/{movieId} and forward the AbortSignal', async () => {
    // Arrange
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({
      data: {
        backdrop_path: null,
        genres: [],
        id: 693134,
        overview: '',
        release_date: '',
        title: 'Dune: Parte Dos',
      },
    });

    // Act
    const result = await movieDetailService.getDetail({ movieId: 693134, signal });

    // Assert
    expect(mockGet).toHaveBeenCalledWith('/movie/693134', { signal });
    expect(result.title).toBe('Dune: Parte Dos');
    expect(result.releaseDate).toBeNull();
  });
});
