import { mapGenre } from '@/src/features/genres/mappers/genre.mapper';
import type { MovieDetailResponseDto } from '../dtos/movie-detail-response.dto';
import type { MovieDetail } from '../models/movie-detail.model';

export const mapMovieDetail = (dto: MovieDetailResponseDto): MovieDetail => ({
  backdropPath: dto.backdrop_path ?? null,
  genres: dto.genres.map(mapGenre),
  movieId: dto.id,
  overview: dto.overview ?? '',
  releaseDate: dto.release_date ? dto.release_date : null,
  title: dto.title,
});
