import { AppError } from './app-error';

// Short technical label for development builds: tells a network failure from an HTTP status.
export const describeErrorForDev = (error: unknown): string => {
  if (!(error instanceof AppError)) {
    return 'error desconocido';
  }

  if (error.statusCode === undefined) {
    return 'sin conexión';
  }

  return `HTTP ${error.statusCode}`;
};
