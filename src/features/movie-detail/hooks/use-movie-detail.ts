import { QUERY_CACHE } from '@/src/constants/query';
import { useQuery } from '@tanstack/react-query';
import { movieDetailKeys } from '../api/movie-detail.keys';
import { movieDetailService } from '../api/movie-detail.service';

export const useMovieDetail = (movieId: number) =>
  useQuery({
    // The screen owns its loading, error and not-found states, so no overlay is shown.
    meta: { skipNetworkError: true, skipServerError: true },
    queryFn: ({ signal }) => movieDetailService.getDetail({ movieId, signal }),
    queryKey: movieDetailKeys.detail(movieId),
    staleTime: QUERY_CACHE.detailStaleTime,
  });
