import type { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { TMDB_IMAGE_BASE_URL } from '@/src/constants/tmdb';

export const buildTmdbImageUrl = (
  path: string | null,
  size: (typeof TMDB_IMAGE_SIZES)[keyof typeof TMDB_IMAGE_SIZES],
): string | null => {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
};
