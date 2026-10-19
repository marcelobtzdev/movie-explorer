import { useNotificationStore } from '@/src/stores/notification-store';
import { act, render, screen } from '@/src/utils/test-utils';
import React from 'react';
import { Toast } from './Toast';

describe('Component: Toast', () => {
  afterEach(() => {
    useNotificationStore.getState().hide();
  });

  test('should render nothing when there is no message', async () => {
    // Act
    const { toJSON } = await render(<Toast />);

    // Assert
    expect(toJSON()?.children ?? []).toHaveLength(0);
  });

  test('should render the message when notified', async () => {
    // Arrange
    await render(<Toast />);

    // Act
    useNotificationStore.getState().notify('Conexión restablecida, actualizando datos...');
    await act(async () => {});

    // Assert
    expect(screen.getByText('Conexión restablecida, actualizando datos...')).toBeTruthy();
  });

  test('should schedule an auto-hide and clear it if the message changes before it fires', async () => {
    // Arrange
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    await render(<Toast />);

    // Act
    useNotificationStore.getState().notify('some message');
    await act(async () => {});

    // Assert: an auto-hide timer was scheduled for the documented delay
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);

    // Act: unmounting (or the message changing) must clear the pending timer, not leak it
    useNotificationStore.getState().hide();
    await act(async () => {});

    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalled();

    // Cleanup
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });
});
