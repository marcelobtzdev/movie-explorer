export const movieDetailKeys = {
  all: ['movie-detail'] as const,
  detail: (movieId: number) => [...movieDetailKeys.all, movieId] as const,
};
