import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import type { MovieDetailResponseDto } from '../dtos/movie-detail-response.dto';
import type { MovieDetail } from '../models/movie-detail.model';
import { mapMovieDetail } from '../mappers/movie-detail.mapper';

export const movieDetailService = {
  getDetail: async ({ movieId, signal }: { movieId: number; signal?: AbortSignal }): Promise<MovieDetail> => {
    const { data } = await tmdbClient.get<MovieDetailResponseDto>(`/movie/${movieId}`, { signal });
    return mapMovieDetail(data);
  },
};
