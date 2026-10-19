import { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { Image } from 'react-native';
import { buildTmdbImageUrl, prefetchTmdbImage } from './tmdb-image.utils';

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

describe('Util: prefetchTmdbImage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should prefetch the given URL', () => {
    // Arrange
    const prefetchSpy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

    // Act
    prefetchTmdbImage('https://image.tmdb.org/t/p/w1280/backdrop.jpg');

    // Assert
    expect(prefetchSpy).toHaveBeenCalledWith('https://image.tmdb.org/t/p/w1280/backdrop.jpg');
  });

  test('should do nothing when the URL is null', () => {
    // Arrange
    const prefetchSpy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

    // Act
    prefetchTmdbImage(null);

    // Assert
    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  test('should not throw when the prefetch fails', async () => {
    // Arrange
    jest.spyOn(Image, 'prefetch').mockRejectedValue(new Error('network'));

    // Act / Assert
    expect(() => prefetchTmdbImage('https://image.tmdb.org/t/p/w1280/backdrop.jpg')).not.toThrow();
    await new Promise((resolve) => setImmediate(resolve));
  });
});
