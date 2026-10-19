import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { nextSimulatedFailure } from './simulator';

// Replaces the request adapter for a simulated failure, so the failure travels through the same
// response interceptor and `handleError` as a real one.
export const simulateErrorsInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const failure = nextSimulatedFailure();

  if (!failure) {
    return config;
  }

  config.adapter = async (requestConfig) => {
    if (failure.statusCode === undefined) {
      throw new AxiosError('Simulated network error', AxiosError.ERR_NETWORK, requestConfig);
    }

    throw new AxiosError('Simulated HTTP error', AxiosError.ERR_BAD_RESPONSE, requestConfig, undefined, {
      config: requestConfig,
      data: { status_message: 'Simulated HTTP error' },
      headers: {},
      status: failure.statusCode,
      statusText: '',
    });
  };

  return config;
};
