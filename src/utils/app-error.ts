import type { AxiosError } from 'axios';

export class AppError extends Error {
  code: string;
  details: Record<string, unknown> | null;
  errors: string[] | undefined;
  statusCode: number | undefined;
  type: string | undefined;

  constructor(options: {
    code: string;
    details?: Record<string, unknown> | null;
    errors?: string[];
    message: string;
    statusCode?: number;
    type?: string;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details ?? null;
    this.type = options.type;
    this.errors = options.errors;
  }
}

export const handleError = (error: unknown): AppError => {
  const axiosError = error as AxiosError<{ status_message?: string }>;

  if (axiosError.isAxiosError) {
    return new AppError({
      code: axiosError.code ?? 'UNKNOWN_ERROR',
      details: (axiosError.response?.data as Record<string, unknown>) ?? null,
      message: axiosError.response?.data?.status_message ?? axiosError.message,
      statusCode: axiosError.response?.status,
    });
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  return new AppError({ code: 'UNKNOWN_ERROR', message });
};
