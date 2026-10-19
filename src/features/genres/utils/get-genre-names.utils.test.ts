import { getGenreNames } from './get-genre-names.utils';

const LOOKUP = new Map([
  [28, 'Acción'],
  [12, 'Aventura'],
  [878, 'Ciencia ficción'],
]);

describe('Util: getGenreNames', () => {
  test('should preserve the order of genreIds', () => {
    // Act
    const result = getGenreNames([878, 28, 12], LOOKUP);

    // Assert
    expect(result).toEqual(['Ciencia ficción', 'Acción', 'Aventura']);
  });

  test('should respect a limit', () => {
    // Act
    const result = getGenreNames([28, 12, 878], LOOKUP, 2);

    // Assert
    expect(result).toEqual(['Acción', 'Aventura']);
  });

  test('should silently skip an id with no match in the lookup', () => {
    // Act
    const result = getGenreNames([28, 9999, 12], LOOKUP);

    // Assert
    expect(result).toEqual(['Acción', 'Aventura']);
  });
});
