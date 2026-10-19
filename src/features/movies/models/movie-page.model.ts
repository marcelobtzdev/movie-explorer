import type { Movie } from './movie.model';

export interface MoviePage {
  readonly movies: readonly Movie[];
  readonly page: number;
  readonly totalPages: number;
}
