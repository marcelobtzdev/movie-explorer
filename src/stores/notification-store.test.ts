import { useNotificationStore } from './notification-store';

describe('Store: notification-store', () => {
  afterEach(() => {
    useNotificationStore.getState().hide();
  });

  test('notify should set the message and make the toast visible', () => {
    // Act
    useNotificationStore.getState().notify('Conexión restablecida, actualizando datos...');

    // Assert
    expect(useNotificationStore.getState().isVisible).toBe(true);
    expect(useNotificationStore.getState().message).toBe('Conexión restablecida, actualizando datos...');
  });

  test('hide should clear the message and hide the toast', () => {
    // Arrange
    useNotificationStore.getState().notify('some message');

    // Act
    useNotificationStore.getState().hide();

    // Assert
    expect(useNotificationStore.getState().isVisible).toBe(false);
    expect(useNotificationStore.getState().message).toBeNull();
  });
});
