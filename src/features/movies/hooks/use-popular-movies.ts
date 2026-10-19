import type { Movie } from '@/src/features/movies/models/movie.model';
import { MAX_TMDB_PAGE } from '@/src/constants/list';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { moviesKeys } from '../api/movies.keys';
import { moviesService } from '../api/movies.service';
import type { MoviePage } from '../models/movie-page.model';

const flattenAndDeduplicate = (data: InfiniteData<MoviePage>): readonly Movie[] => {
  const seen = new Set<number>();
  const movies: Movie[] = [];

  for (const page of data.pages) {
    for (const movie of page.movies) {
      if (!seen.has(movie.movieId)) {
        seen.add(movie.movieId);
        movies.push(movie);
      }
    }
  }

  return movies;
};

export const usePopularMovies = ({ enabled }: { enabled: boolean }) =>
  useInfiniteQuery({
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.page < Math.min(lastPage.totalPages, MAX_TMDB_PAGE) ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    meta: { skipNetworkError: true, skipServerError: true },
    queryFn: ({ pageParam, signal }) => moviesService.getPopular({ page: pageParam, signal }),
    queryKey: moviesKeys.popular(),
    select: flattenAndDeduplicate,
  });
