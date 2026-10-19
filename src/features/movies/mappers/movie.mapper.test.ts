import type { MovieResponseDto } from '../dtos/movie-response.dto';
import { mapMovie, mapMoviePage } from './movie.mapper';

const BASE_DTO: MovieResponseDto = {
  backdrop_path: '/backdrop.jpg',
  genre_ids: [28, 12],
  id: 640146,
  poster_path: '/poster.jpg',
  release_date: '2023-02-15',
  title: 'Ant-Man and the Wasp: Quantumania',
  vote_average: 6.5,
};

describe('Mapper: mapMovie', () => {
  test('should map every field 1:1 for a normal result', () => {
    // Act
    const result = mapMovie(BASE_DTO);

    // Assert
    expect(result).toEqual({
      backdropPath: '/backdrop.jpg',
      genreIds: [28, 12],
      movieId: 640146,
      posterPath: '/poster.jpg',
      releaseYear: 2023,
      title: 'Ant-Man and the Wasp: Quantumania',
      voteAverage: 6.5,
    });
  });

  test('should map a missing release_date to releaseYear null', () => {
    // Act
    const result = mapMovie({ ...BASE_DTO, release_date: '' });

    // Assert
    expect(result.releaseYear).toBeNull();
  });

  test('should map vote_average 0 to voteAverage null', () => {
    // Act
    const result = mapMovie({ ...BASE_DTO, vote_average: 0 });

    // Assert
    expect(result.voteAverage).toBeNull();
  });
});

describe('Mapper: mapMoviePage', () => {
  test('should map the page metadata and every result', () => {
    // Arrange
    const dto = { page: 1, results: [BASE_DTO], total_pages: 41253, total_results: 825050 };

    // Act
    const result = mapMoviePage(dto);

    // Assert
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(41253);
    expect(result.movies).toHaveLength(1);
    expect(result.movies[0]?.movieId).toBe(640146);
  });
});
