export interface Movie {
  readonly backdropPath: string | null;
  readonly genreIds: readonly number[];
  readonly movieId: number;
  readonly posterPath: string | null;
  readonly releaseYear: number | null;
  readonly title: string;
  readonly voteAverage: number | null;
}
