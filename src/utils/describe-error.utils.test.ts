import { AppError } from './app-error';
import { describeErrorForDev } from './describe-error.utils';

describe('Util: describeErrorForDev', () => {
  test('should label an error without status as a connection failure', () => {
    // Act / Assert
    expect(describeErrorForDev(new AppError({ code: 'ERR_NETWORK', message: 'offline' }))).toBe('sin conexión');
  });

  test('should label an HTTP error with its status code', () => {
    // Act / Assert
    expect(describeErrorForDev(new AppError({ code: 'X', message: 'm', statusCode: 500 }))).toBe('HTTP 500');
    expect(describeErrorForDev(new AppError({ code: 'X', message: 'm', statusCode: 401 }))).toBe('HTTP 401');
  });

  test('should label anything that is not an AppError as unknown', () => {
    // Act / Assert
    expect(describeErrorForDev(new Error('boom'))).toBe('error desconocido');
    expect(describeErrorForDev(undefined)).toBe('error desconocido');
  });
});
