describe('Constants: env', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('Validation', () => {
    test('should expose env values when TMDB_BASE_URL and TMDB_ACCESS_TOKEN are valid', () => {
      // Arrange
      jest.doMock('react-native-config', () => ({
        TMDB_ACCESS_TOKEN: 'valid-token',
        TMDB_BASE_URL: 'https://api.themoviedb.org/3',
      }));

      // Act
      const { env } = require('./env');

      // Assert
      expect(env).toEqual({
        TMDB_ACCESS_TOKEN: 'valid-token',
        TMDB_BASE_URL: 'https://api.themoviedb.org/3',
      });
    });

    test('should throw a clear error when TMDB_BASE_URL is not a valid URL', () => {
      // Arrange
      jest.doMock('react-native-config', () => ({
        TMDB_ACCESS_TOKEN: 'valid-token',
        TMDB_BASE_URL: 'not-a-url',
      }));

      // Act
      const load = () => {
        require('./env');
      };

      // Assert
      expect(load).toThrow(/TMDB_BASE_URL/);
    });

    test('should throw a clear error when TMDB_ACCESS_TOKEN is missing', () => {
      // Arrange
      jest.doMock('react-native-config', () => ({
        TMDB_BASE_URL: 'https://api.themoviedb.org/3',
      }));

      // Act
      const load = () => {
        require('./env');
      };

      // Assert
      expect(load).toThrow(/TMDB_ACCESS_TOKEN/);
    });
  });
});
