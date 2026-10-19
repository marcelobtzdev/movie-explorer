import Config from 'react-native-config';
import { z } from 'zod';

const envSchema = z.object({
  TMDB_ACCESS_TOKEN: z.string().min(1, 'TMDB_ACCESS_TOKEN is required'),
  TMDB_BASE_URL: z.string().url('TMDB_BASE_URL must be a valid URL'),
});

const parseEnv = (source: typeof Config) => {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration. Check your .env file. ${issues}`);
  }

  return result.data;
};

export const env = parseEnv(Config);
