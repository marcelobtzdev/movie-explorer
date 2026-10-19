import { useNetworkErrorStore } from '@/src/stores/error-overlay-store';
import { useNotificationStore } from '@/src/stores/notification-store';
import { queryClient } from '@/src/vendors/react-query/client';
import { act, renderHook } from '@testing-library/react-native';
import { useNetworkStatus } from './use-network-status';

// MOCK STATE
let connectivityListener: ((isConnected: boolean) => void) | null = null;

jest.mock('@/src/vendors/netinfo', () => ({
  subscribeToConnectivity: (listener: (isConnected: boolean) => void) => {
    connectivityListener = listener;
    return jest.fn();
  },
}));

describe('Hook: useNetworkStatus', () => {
  beforeEach(() => {
    connectivityListener = null;
    useNetworkErrorStore.getState().hide();
    useNotificationStore.getState().hide();
    jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should do nothing while connectivity stays online, hide the overlay/invalidate/notify only after going offline then online, and not invalidate again without a new offline transition', async () => {
    // Arrange
    renderHook(() => useNetworkStatus());
    await act(async () => {});

    // Act: staying online does nothing
    act(() => connectivityListener?.(true));

    // Assert
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();

    // Arrange: simulate a prior overlay being shown
    useNetworkErrorStore.getState().show(jest.fn());

    // Act: offline then online
    act(() => connectivityListener?.(false));
    act(() => connectivityListener?.(true));

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(useNotificationStore.getState().message).toBe('Conexión restablecida, actualizando datos...');

    // Act: a further online call without going offline again must not re-invalidate
    act(() => connectivityListener?.(true));

    // Assert
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
  });
});
