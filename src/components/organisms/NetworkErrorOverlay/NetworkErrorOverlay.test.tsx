import { APP_STRINGS } from '@/src/constants/strings';
import { useNetworkErrorStore } from '@/src/stores/error-overlay-store';
import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { NetworkErrorOverlay } from './NetworkErrorOverlay';

describe('Component: NetworkErrorOverlay', () => {
  afterEach(() => {
    useNetworkErrorStore.getState().hide();
  });

  test('should not be visible when the store is hidden', async () => {
    // Act
    await render(<NetworkErrorOverlay />);

    // Assert
    expect(screen.queryByText(APP_STRINGS.networkErrorTitle)).toBeNull();
  });

  test('should show the title and a Reintentar action when visible and not exhausted', async () => {
    // Arrange
    useNetworkErrorStore.getState().show(jest.fn());

    // Act
    await render(<NetworkErrorOverlay />);

    // Assert
    expect(screen.getByText(APP_STRINGS.networkErrorTitle)).toBeTruthy();
    expect(screen.getByRole('button', { name: APP_STRINGS.networkErrorAction })).toBeTruthy();
  });

  test('should call retry when Reintentar is pressed', async () => {
    // Arrange
    const refetch = jest.fn();
    useNetworkErrorStore.getState().show(refetch);
    await render(<NetworkErrorOverlay />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: APP_STRINGS.networkErrorAction }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('should show Entendido and call hide when exhausted', async () => {
    // Arrange
    useNetworkErrorStore.getState().show(jest.fn());
    useNetworkErrorStore.getState().retry();
    useNetworkErrorStore.getState().retry();
    useNetworkErrorStore.getState().retry();
    await render(<NetworkErrorOverlay />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: APP_STRINGS.networkErrorAcknowledge }));

    // Assert
    expect(useNetworkErrorStore.getState().isVisible).toBe(false);
  });
});
