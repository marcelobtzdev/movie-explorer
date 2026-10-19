import { QUERY_CACHE } from '@/src/constants/query';
import { useQuery } from '@tanstack/react-query';
import { genresKeys } from '../api/genres.keys';
import { genresService } from '../api/genres.service';

export const useMovieGenres = () =>
  useQuery({
    gcTime: QUERY_CACHE.genresGcTime,
    meta: { skipNetworkError: true, skipServerError: true },
    queryFn: ({ signal }) => genresService.getMovieGenres({ signal }),
    queryKey: genresKeys.movie(),
    staleTime: QUERY_CACHE.genresStaleTime,
  });
