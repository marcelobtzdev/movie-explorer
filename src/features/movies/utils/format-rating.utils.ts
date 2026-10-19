export const formatRating = (voteAverage: number | null): string =>
  voteAverage === null ? '–' : voteAverage.toFixed(1);
