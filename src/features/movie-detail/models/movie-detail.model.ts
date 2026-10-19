import type { Genre } from '@/src/features/genres';

export interface MovieDetail {
  readonly backdropPath: string | null;
  readonly genres: readonly Genre[];
  readonly movieId: number;
  readonly overview: string;
  readonly releaseDate: string | null;
  readonly title: string;
}
