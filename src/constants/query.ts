const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export const QUERY_CACHE = {
  defaultGcTime: 30 * MINUTE_MS,
  detailStaleTime: 10 * MINUTE_MS,
  genresGcTime: 24 * HOUR_MS,
  genresStaleTime: 24 * HOUR_MS,
  listStaleTime: 5 * MINUTE_MS,
} as const;
