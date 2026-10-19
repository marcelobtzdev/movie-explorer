import type { TMDB_IMAGE_SIZES } from '@/src/constants/tmdb';
import { TMDB_IMAGE_BASE_URL } from '@/src/constants/tmdb';
import { Image } from 'react-native';

export const buildTmdbImageUrl = (
  path: string | null,
  size: (typeof TMDB_IMAGE_SIZES)[keyof typeof TMDB_IMAGE_SIZES],
): string | null => {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
};

// Fire and forget: a failed prefetch only means the image loads normally later.
export const prefetchTmdbImage = (url: string | null): void => {
  if (!url) {
    return;
  }

  Image.prefetch(url).catch(() => undefined);
};
