import { useNetworkErrorStore, useServerErrorStore } from '@/src/stores/error-overlay-store';
import { AppError } from '@/src/utils/app-error';
import { queryClient } from './client';

const networkError = () => new AppError({ code: 'ERR_NETWORK', message: 'offline' });
const serverError = () => new AppError({ code: 'ERR_BAD_RESPONSE', message: 'boom', statusCode: 500 });
const notFoundError = () => new AppError({ code: 'ERR_BAD_REQUEST', message: 'not found', statusCode: 404 });

describe('Client: queryClient global error routing', () => {
  afterEach(() => {
    queryClient.clear();
    useNetworkErrorStore.getState().hide();
    useServerErrorStore.getState().hide();
  });

  test('should show the network overlay for a network error without any query flag', async () => {
    // Act
    await queryClient
      .fetchQuery({ queryFn: () => Promise.reject(networkError()), queryKey: ['test', 'network-default'] })
      .catch(() => undefined);

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(true);
    expect(useServerErrorStore.getState().isVisible).toBe(false);
  });

  test('should show the server overlay for a 500 error without any query flag', async () => {
    // Act
    await queryClient
      .fetchQuery({ queryFn: () => Promise.reject(serverError()), queryKey: ['test', 'server-default'] })
      .catch(() => undefined);

    // Assert
    expect(useServerErrorStore.getState().isVisible).toBe(true);
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
  });

  test('should not show any overlay for a 404 error', async () => {
    // Act
    await queryClient
      .fetchQuery({ queryFn: () => Promise.reject(notFoundError()), queryKey: ['test', 'not-found'] })
      .catch(() => undefined);

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
    expect(useServerErrorStore.getState().isVisible).toBe(false);
  });

  test('should respect an explicit skipNetworkError flag', async () => {
    // Act
    await queryClient
      .fetchQuery({
        meta: { skipNetworkError: true },
        queryFn: () => Promise.reject(networkError()),
        queryKey: ['test', 'network-skipped'],
      })
      .catch(() => undefined);

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
  });

  test('should hide the network overlay when a query succeeds afterwards', async () => {
    // Arrange
    await queryClient
      .fetchQuery({ queryFn: () => Promise.reject(networkError()), queryKey: ['test', 'network-then-ok'] })
      .catch(() => undefined);
    expect(useNetworkErrorStore.getState().isVisible).toBe(true);

    // Act
    await queryClient.fetchQuery({ queryFn: () => Promise.resolve('ok'), queryKey: ['test', 'ok-after'] });

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
  });
});
