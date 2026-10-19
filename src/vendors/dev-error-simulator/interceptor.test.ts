import { AppError, handleError } from '@/src/utils/app-error';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { simulateErrorsInterceptor } from './interceptor';
import { setErrorSimulationMode } from './simulator';

const buildConfig = () => ({ headers: {}, url: '/movie/popular' }) as InternalAxiosRequestConfig;

const runAdapter = async (config: InternalAxiosRequestConfig) => {
  const adapter = config.adapter as AxiosAdapter;
  try {
    await adapter(config);
  } catch (error) {
    return handleError(error);
  }
  throw new Error('expected the simulated adapter to reject');
};

describe('Dev tool: simulateErrorsInterceptor', () => {
  afterEach(() => {
    setErrorSimulationMode('off');
  });

  test('should leave the request untouched in the off mode', () => {
    // Arrange
    const config = buildConfig();
    const originalAdapter = config.adapter;

    // Act
    const result = simulateErrorsInterceptor(config);

    // Assert
    expect(result.adapter).toBe(originalAdapter);
  });

  test('should produce a network AppError without a status code in the network mode', async () => {
    // Arrange
    setErrorSimulationMode('network');
    const config = simulateErrorsInterceptor(buildConfig());

    // Act
    const error = await runAdapter(config);

    // Assert
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBeUndefined();
  });

  test('should produce an AppError with status 500 in the server mode', async () => {
    // Arrange
    setErrorSimulationMode('server');
    const config = simulateErrorsInterceptor(buildConfig());

    // Act
    const error = await runAdapter(config);

    // Assert
    expect(error.statusCode).toBe(500);
  });

  test('should produce an AppError with status 401 in the unauthorized mode', async () => {
    // Arrange
    setErrorSimulationMode('unauthorized');
    const config = simulateErrorsInterceptor(buildConfig());

    // Act
    const error = await runAdapter(config);

    // Assert
    expect(error.statusCode).toBe(401);
  });
});
