import type { GenreResponseDto } from '../dtos/genre-response.dto';
import type { Genre } from '../models/genre.model';

export const mapGenre = (dto: GenreResponseDto['genres'][number]): Genre => ({
  genreId: dto.id,
  name: dto.name,
});

export const mapGenres = (dto: GenreResponseDto): readonly Genre[] => dto.genres.map(mapGenre);
