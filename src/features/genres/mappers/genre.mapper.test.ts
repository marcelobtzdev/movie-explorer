import { mapGenre, mapGenres } from './genre.mapper';

describe('Mapper: mapGenre', () => {
  test('should rename id to genreId and copy name unchanged', () => {
    // Arrange
    const dto = { id: 28, name: 'Acción' };

    // Act
    const result = mapGenre(dto);

    // Assert
    expect(result).toEqual({ genreId: 28, name: 'Acción' });
  });
});

describe('Mapper: mapGenres', () => {
  test('should map every entry in the response', () => {
    // Arrange
    const dto = { genres: [{ id: 28, name: 'Acción' }, { id: 12, name: 'Aventura' }] };

    // Act
    const result = mapGenres(dto);

    // Assert
    expect(result).toEqual([
      { genreId: 28, name: 'Acción' },
      { genreId: 12, name: 'Aventura' },
    ]);
  });
});
