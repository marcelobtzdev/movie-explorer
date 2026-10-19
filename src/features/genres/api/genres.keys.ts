export const genresKeys = {
  all: ['genres'] as const,
  movie: () => [...genresKeys.all, 'movie'] as const,
};
