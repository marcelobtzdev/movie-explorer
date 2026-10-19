import { QUERY_CACHE } from '@/src/constants/query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { moviesKeys } from '../api/movies.keys';
import { moviesService } from '../api/movies.service';

// Single page only: the search never requests `page`, so no infinite pagination (spec, FR-007).
export const useSearchMovies = ({ enabled, term }: { enabled: boolean; term: string }) =>
  useQuery({
    enabled: enabled && term.length > 0,
    meta: { skipNetworkError: true, skipServerError: true },
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => moviesService.searchMovies({ query: term, signal }),
    queryKey: moviesKeys.search(term),
    select: (page) => page.movies,
    staleTime: QUERY_CACHE.listStaleTime,
  });
