import { env } from '@/src/constants/env';
import { TMDB_LANGUAGE } from '@/src/constants/tmdb';
import { handleError } from '@/src/utils/app-error';
import { simulateErrorsInterceptor } from '@/src/vendors/dev-error-simulator/interceptor';
import axios from 'axios';

export const tmdbClient = axios.create({
  baseURL: env.TMDB_BASE_URL,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
  },
  params: {
    language: TMDB_LANGUAGE,
  },
});

// Development only: simulates TMDB failures from the developer menu. Never attached in production.
if (__DEV__) {
  tmdbClient.interceptors.request.use(simulateErrorsInterceptor);
}

tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    return Promise.reject(handleError(error));
  },
);
