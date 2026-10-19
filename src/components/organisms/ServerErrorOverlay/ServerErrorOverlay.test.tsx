import { APP_STRINGS } from '@/src/constants/strings';
import { useServerErrorStore } from '@/src/stores/error-overlay-store';
import { fireEvent, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { ServerErrorOverlay } from './ServerErrorOverlay';

describe('Component: ServerErrorOverlay', () => {
  afterEach(() => {
    useServerErrorStore.getState().hide();
  });

  test('should not be visible when the store is hidden', async () => {
    // Act
    await render(<ServerErrorOverlay />);

    // Assert
    expect(screen.queryByText(APP_STRINGS.serverErrorTitle)).toBeNull();
  });

  test('should show the title and a Reintentar action when visible and not exhausted', async () => {
    // Arrange
    useServerErrorStore.getState().show(jest.fn());

    // Act
    await render(<ServerErrorOverlay />);

    // Assert
    expect(screen.getByText(APP_STRINGS.serverErrorTitle)).toBeTruthy();
    expect(screen.getByRole('button', { name: APP_STRINGS.networkErrorAction })).toBeTruthy();
  });

  test('should call retry when Reintentar is pressed', async () => {
    // Arrange
    const refetch = jest.fn();
    useServerErrorStore.getState().show(refetch);
    await render(<ServerErrorOverlay />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: APP_STRINGS.networkErrorAction }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('should show Entendido and call hide when exhausted', async () => {
    // Arrange
    useServerErrorStore.getState().show(jest.fn());
    useServerErrorStore.getState().retry();
    useServerErrorStore.getState().retry();
    useServerErrorStore.getState().retry();
    await render(<ServerErrorOverlay />);

    // Act
    await fireEvent.press(screen.getByRole('button', { name: APP_STRINGS.networkErrorAcknowledge }));

    // Assert
    expect(useServerErrorStore.getState().isVisible).toBe(false);
  });
});
