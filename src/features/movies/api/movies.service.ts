import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import type { MoviePageResponseDto } from '../dtos/movie-page-response.dto';
import type { MoviePage } from '../models/movie-page.model';
import { mapMoviePage } from '../mappers/movie.mapper';

export const moviesService = {
  getPopular: async ({ page, signal }: { page: number; signal?: AbortSignal }): Promise<MoviePage> => {
    const { data } = await tmdbClient.get<MoviePageResponseDto>('/movie/popular', { params: { page }, signal });
    return mapMoviePage(data);
  },
  searchMovies: async ({ query, signal }: { query: string; signal?: AbortSignal }): Promise<MoviePage> => {
    // Only `query` is sent; `language` comes from tmdbClient defaults and `include_adult` keeps TMDB's default (false).
    const { data } = await tmdbClient.get<MoviePageResponseDto>('/search/movie', { params: { query }, signal });
    return mapMoviePage(data);
  },
};
