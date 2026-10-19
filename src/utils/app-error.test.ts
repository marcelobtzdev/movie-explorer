import { AppError, handleError } from './app-error';

// EXPECTED VALUES
const EXPECTED_VALUES = {
  NETWORK_MESSAGE: 'Network Error',
  SERVER_MESSAGE: 'Internal server error',
};

describe('Util: handleError', () => {
  describe('Axios errors', () => {
    test('should map a network error (no response) to an AppError with statusCode undefined', () => {
      // Arrange
      const axiosError = {
        code: 'ERR_NETWORK',
        isAxiosError: true,
        message: EXPECTED_VALUES.NETWORK_MESSAGE,
        response: undefined,
      };

      // Act
      const result = handleError(axiosError);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBeUndefined();
      expect(result.message).toBe(EXPECTED_VALUES.NETWORK_MESSAGE);
    });

    test('should map a response error to an AppError carrying the response statusCode and status_message', () => {
      // Arrange
      const axiosError = {
        code: 'ERR_BAD_RESPONSE',
        isAxiosError: true,
        message: 'Request failed with status code 500',
        response: {
          data: { status_message: EXPECTED_VALUES.SERVER_MESSAGE },
          status: 500,
        },
      };

      // Act
      const result = handleError(axiosError);

      // Assert
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe(EXPECTED_VALUES.SERVER_MESSAGE);
    });
  });

  describe('Non-Axios errors', () => {
    test('should map a plain Error to an AppError with code UNKNOWN_ERROR', () => {
      // Arrange
      const error = new Error('Something broke');

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Something broke');
    });
  });
});
