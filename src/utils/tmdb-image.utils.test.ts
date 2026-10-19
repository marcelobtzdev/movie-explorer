import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { buildTmdbImageUrl } from './tmdb-image.utils';

describe('Util: buildTmdbImageUrl', () => {
  test('should build a full image URL from a relative path and a size', () => {
    // Arrange
    const path = '/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg';

    // Act
    const result = buildTmdbImageUrl(path, TMDB_IMAGE_SIZES.poster);

    // Assert
    expect(result).toBe('https://image.tmdb.org/t/p/w342/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg');
  });

  test('should return null when the path is null', () => {
    // Act
    const result = buildTmdbImageUrl(null, TMDB_IMAGE_SIZES.backdrop);

    // Assert
    expect(result).toBeNull();
  });
});
