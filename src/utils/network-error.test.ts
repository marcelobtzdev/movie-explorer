import { AppError } from './app-error';
import { isNetworkError, isServerError } from './network-error';

describe('Util: isNetworkError', () => {
  test('should return true when statusCode is undefined', () => {
    // Arrange
    const error = new AppError({ code: 'ERR_NETWORK', message: 'Network Error' });

    // Act
    const result = isNetworkError(error);

    // Assert
    expect(result).toBe(true);
  });

  test('should return false when statusCode is defined', () => {
    // Arrange
    const error = new AppError({ code: 'ERR_BAD_RESPONSE', message: 'fail', statusCode: 404 });

    // Act
    const result = isNetworkError(error);

    // Assert
    expect(result).toBe(false);
  });
});

describe('Util: isServerError', () => {
  test('should return true when statusCode is 500', () => {
    // Arrange
    const error = new AppError({ code: 'ERR_BAD_RESPONSE', message: 'fail', statusCode: 500 });

    // Act
    const result = isServerError(error);

    // Assert
    expect(result).toBe(true);
  });

  test('should return false when statusCode is not 500', () => {
    // Arrange
    const error = new AppError({ code: 'ERR_BAD_RESPONSE', message: 'fail', statusCode: 404 });

    // Act
    const result = isServerError(error);

    // Assert
    expect(result).toBe(false);
  });
});
