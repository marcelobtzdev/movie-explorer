import type { MovieDetailResponseDto } from '../dtos/movie-detail-response.dto';
import { mapMovieDetail } from './movie-detail.mapper';

const BASE_DTO: MovieDetailResponseDto = {
  backdrop_path: '/backdrop.jpg',
  genres: [
    { id: 878, name: 'Ciencia ficción' },
    { id: 12, name: 'Aventura' },
  ],
  id: 693134,
  overview: 'Paul Atreides se une a los Fremen.',
  release_date: '2024-03-01',
  title: 'Dune: Parte Dos',
};

describe('Mapper: mapMovieDetail', () => {
  test('should map every field for a complete response', () => {
    // Act
    const result = mapMovieDetail(BASE_DTO);

    // Assert
    expect(result).toEqual({
      backdropPath: '/backdrop.jpg',
      genres: [
        { genreId: 878, name: 'Ciencia ficción' },
        { genreId: 12, name: 'Aventura' },
      ],
      movieId: 693134,
      overview: 'Paul Atreides se une a los Fremen.',
      releaseDate: '2024-03-01',
      title: 'Dune: Parte Dos',
    });
  });

  test('should map an empty release_date to releaseDate null', () => {
    // Act
    const result = mapMovieDetail({ ...BASE_DTO, release_date: '' });

    // Assert
    expect(result.releaseDate).toBeNull();
  });

  test('should map a null backdrop_path to backdropPath null', () => {
    // Act
    const result = mapMovieDetail({ ...BASE_DTO, backdrop_path: null });

    // Assert
    expect(result.backdropPath).toBeNull();
  });

  test('should keep an empty overview as an empty string', () => {
    // Act
    const result = mapMovieDetail({ ...BASE_DTO, overview: '' });

    // Assert
    expect(result.overview).toBe('');
  });

  test('should map an empty genres array to an empty array', () => {
    // Act
    const result = mapMovieDetail({ ...BASE_DTO, genres: [] });

    // Assert
    expect(result.genres).toEqual([]);
  });
});
