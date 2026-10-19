import { env } from '@/src/constants/env';
import { TMDB_LANGUAGE } from '@/src/constants/tmdb';
import { handleError } from '@/src/utils/app-error';
import axios from 'axios';

export const tmdbClient = axios.create({
  baseURL: env.TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
  },
  params: {
    language: TMDB_LANGUAGE,
  },
});

tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    return Promise.reject(handleError(error));
  },
);
