import { createErrorOverlayStore, useNetworkErrorStore, useServerErrorStore } from './error-overlay-store';

describe('Store: error-overlay-store', () => {
  describe('show', () => {
    test('should become visible with retryCount reset to 0', () => {
      // Arrange
      const store = createErrorOverlayStore();
      const refetch = jest.fn();

      // Act
      store.getState().show(refetch);

      // Assert
      expect(store.getState().isVisible).toBe(true);
      expect(store.getState().retryCount).toBe(0);
      expect(store.getState().refetch).toBe(refetch);
    });

    test('should be idempotent and reset isRetrying to false when called again while already visible', () => {
      // Arrange
      const store = createErrorOverlayStore();
      store.getState().show(jest.fn());
      store.setState({ isRetrying: true });

      // Act
      store.getState().show(jest.fn());

      // Assert
      expect(store.getState().isVisible).toBe(true);
      expect(store.getState().isRetrying).toBe(false);
    });
  });

  describe('retry', () => {
    test('should increment retryCount, set isRetrying, and call refetch', () => {
      // Arrange
      const store = createErrorOverlayStore();
      const refetch = jest.fn();
      store.getState().show(refetch);

      // Act
      store.getState().retry();

      // Assert
      expect(store.getState().retryCount).toBe(1);
      expect(store.getState().isRetrying).toBe(true);
      expect(store.getState().isExhausted).toBe(false);
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    test('should set isExhausted to true after the 3rd retry', () => {
      // Arrange
      const store = createErrorOverlayStore();
      store.getState().show(jest.fn());

      // Act
      store.getState().retry();
      store.getState().retry();
      store.getState().retry();

      // Assert
      expect(store.getState().retryCount).toBe(3);
      expect(store.getState().isExhausted).toBe(true);
    });
  });

  describe('hide', () => {
    test('should reset all fields to their initial state', () => {
      // Arrange
      const store = createErrorOverlayStore();
      store.getState().show(jest.fn());
      store.getState().retry();

      // Act
      store.getState().hide();

      // Assert
      expect(store.getState().isVisible).toBe(false);
      expect(store.getState().isRetrying).toBe(false);
      expect(store.getState().isExhausted).toBe(false);
      expect(store.getState().retryCount).toBe(0);
      expect(store.getState().refetch).toBeNull();
    });
  });

  describe('Store independence', () => {
    test('useNetworkErrorStore and useServerErrorStore should be independent instances', () => {
      // Act
      useNetworkErrorStore.getState().show(jest.fn());

      // Assert
      expect(useNetworkErrorStore.getState().isVisible).toBe(true);
      expect(useServerErrorStore.getState().isVisible).toBe(false);

      // Cleanup
      useNetworkErrorStore.getState().hide();
    });
  });
});
