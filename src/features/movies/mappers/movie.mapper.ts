import type { MoviePageResponseDto } from '../dtos/movie-page-response.dto';
import type { MovieResponseDto } from '../dtos/movie-response.dto';
import type { MoviePage } from '../models/movie-page.model';
import type { Movie } from '../models/movie.model';

const parseReleaseYear = (releaseDate: string): number | null => {
  if (!releaseDate) {
    return null;
  }

  const year = Number(releaseDate.slice(0, 4));

  return Number.isNaN(year) ? null : year;
};

export const mapMovie = (dto: MovieResponseDto): Movie => ({
  backdropPath: dto.backdrop_path,
  genreIds: dto.genre_ids,
  movieId: dto.id,
  // `?? null` covers results where TMDB returns a misspelled key (e.g. `posterh`) and the field is absent.
  posterPath: dto.poster_path ?? null,
  releaseYear: parseReleaseYear(dto.release_date),
  title: dto.title,
  voteAverage: dto.vote_average > 0 ? dto.vote_average : null,
});

export const mapMoviePage = (dto: MoviePageResponseDto): MoviePage => ({
  movies: dto.results.map(mapMovie),
  page: dto.page,
  totalPages: dto.total_pages,
});
