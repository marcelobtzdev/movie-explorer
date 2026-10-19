import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import type { GenreResponseDto } from '../dtos/genre-response.dto';
import type { Genre } from '../models/genre.model';
import { mapGenres } from '../mappers/genre.mapper';

export const genresService = {
  getMovieGenres: async ({ signal }: { signal?: AbortSignal }): Promise<readonly Genre[]> => {
    const { data } = await tmdbClient.get<GenreResponseDto>('/genre/movie/list', { signal });
    return mapGenres(data);
  },
};
