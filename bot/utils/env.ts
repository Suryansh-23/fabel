import 'dotenv/config';
import logger from './logger';

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  NEYNAR_API_KEY: string;
  SIGNER_UUID: string;
  GOOGLE_VERTEX_PROJECT: string;
  GOOGLE_VERTEX_LOCATION: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  BLOB_READ_WRITE_TOKEN: string;
}

const REQUIRED_VARS = [
  'NEYNAR_API_KEY',
  'SIGNER_UUID',
  'GOOGLE_VERTEX_PROJECT',
  // LOCATION can default, keep optional
  'BLOB_READ_WRITE_TOKEN',
  // GOOGLE_APPLICATION_CREDENTIALS is typically required off-GCP; we treat as required for safety
  'GOOGLE_APPLICATION_CREDENTIALS',
] as const;

export function loadEnv(): EnvConfig {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key] || String(process.env[key]).trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    logger.error(
      'Please set these in bot/.env (or your environment) before starting the server.'
    );
    process.exit(1);
  }

  const PORT = Number(process.env.PORT || 3000);
  if (!Number.isFinite(PORT) || PORT <= 0) {
    logger.error('Invalid PORT value. Must be a positive integer.', { value: process.env.PORT });
    process.exit(1);
  }

  const cfg: EnvConfig = {
    PORT,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY!,
    SIGNER_UUID: process.env.SIGNER_UUID!,
    GOOGLE_VERTEX_PROJECT: process.env.GOOGLE_VERTEX_PROJECT!,
    GOOGLE_VERTEX_LOCATION: process.env.GOOGLE_VERTEX_LOCATION || 'us-central1',
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN!,
  };

  logger.info('Environment validated', {
    PORT: cfg.PORT,
    NODE_ENV: cfg.NODE_ENV,
    GOOGLE_VERTEX_LOCATION: cfg.GOOGLE_VERTEX_LOCATION,
  });

  return cfg;
}

