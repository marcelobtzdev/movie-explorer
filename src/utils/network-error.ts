import type { AppError } from './app-error';

export const isNetworkError = (error: AppError): boolean => error.statusCode === undefined;

export const isServerError = (error: AppError): boolean => error.statusCode === 500;
