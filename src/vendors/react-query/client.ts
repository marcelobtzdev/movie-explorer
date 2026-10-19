import { QUERY_CACHE } from '@/src/constants/query';
import { useNetworkErrorStore, useServerErrorStore } from '@/src/stores/error-overlay-store';
import { AppError } from '@/src/utils/app-error';
import { isNetworkError, isServerError } from '@/src/utils/network-error';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

interface QueryMeta extends Record<string, unknown> {
  skipNetworkError?: boolean;
  skipNotify?: boolean;
  skipServerError?: boolean;
}

const asAppError = (error: unknown): AppError => (error instanceof AppError ? error : new AppError({ code: 'UNKNOWN_ERROR', message: String(error) }));

const shouldSkip = (meta: QueryMeta | undefined, flag: keyof QueryMeta) => meta?.[flag] === true;

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      gcTime: QUERY_CACHE.defaultGcTime,
      retry: false,
      staleTime: QUERY_CACHE.listStaleTime,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const appError = asAppError(error);
      const meta = mutation.options.meta as QueryMeta | undefined;

      if (isNetworkError(appError) && !shouldSkip(meta, 'skipNetworkError')) {
        useNetworkErrorStore.getState().show(() => useNetworkErrorStore.getState().hide());
      } else if (isServerError(appError) && !shouldSkip(meta, 'skipServerError')) {
        useServerErrorStore.getState().show(() => useServerErrorStore.getState().hide());
      }
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      const appError = asAppError(error);
      const meta = query.meta as QueryMeta | undefined;

      if (isNetworkError(appError) && !shouldSkip(meta, 'skipNetworkError')) {
        useNetworkErrorStore.getState().show(() => query.fetch());
      } else if (isServerError(appError) && !shouldSkip(meta, 'skipServerError')) {
        useServerErrorStore.getState().show(() => query.fetch());
      }
    },
    onSuccess: () => {
      if (useNetworkErrorStore.getState().isVisible) {
        useNetworkErrorStore.getState().hide();
      }

      if (useServerErrorStore.getState().isRetrying) {
        useServerErrorStore.getState().hide();
      }
    },
  }),
});
