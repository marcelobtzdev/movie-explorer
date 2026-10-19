import axios from 'axios';
import { tmdbClient } from './tmdb-client';

interface InternalInterceptorManager {
  handlers: ({ rejected: (error: unknown) => Promise<never> } | null)[];
}

const getResponseErrorHandler = () => {
  const manager = tmdbClient.interceptors.response as unknown as InternalInterceptorManager;
  const handler = manager.handlers[0];

  if (!handler) {
    throw new Error('No response interceptor registered on tmdbClient');
  }

  return handler.rejected;
};

describe('Vendor: tmdbClient', () => {
  describe('Configuration', () => {
    test('should set the Authorization header from env.TMDB_ACCESS_TOKEN', () => {
      // Assert
      expect(tmdbClient.defaults.headers.Authorization).toBe('Bearer test-token');
    });

    test('should send Accept application/json on every request', () => {
      // Assert
      expect(tmdbClient.defaults.headers.Accept).toBe('application/json');
    });

    test('should set the baseURL from env.TMDB_BASE_URL', () => {
      // Assert
      expect(tmdbClient.defaults.baseURL).toBe('https://api.themoviedb.org/3');
    });

    test('should set the language param on every request', () => {
      // Assert
      expect(tmdbClient.defaults.params).toEqual({ language: 'es-PY' });
    });
  });

  describe('Error interceptor', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should map an Axios error response to an AppError', async () => {
      // Arrange
      const errorHandler = getResponseErrorHandler();
      const axiosError = Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: { data: {}, status: 500 },
      });

      // Act / Assert
      await expect(errorHandler(axiosError)).rejects.toMatchObject({ statusCode: 500 });
    });

    test('should not convert a cancelled request into an AppError', async () => {
      // Arrange
      const errorHandler = getResponseErrorHandler();
      const cancelError = new axios.Cancel('cancelled');
      jest.spyOn(axios, 'isCancel').mockReturnValue(true);

      // Act / Assert
      await expect(errorHandler(cancelError)).rejects.toBe(cancelError);
    });
  });
});
