import dotenv from 'dotenv';
import path from 'path';

// needs to be loaded at the top level for prisma
export const ENV_FILE_PATH = process.env.CONFIG_PATH || '.env';
dotenv.config({ path: path.resolve(ENV_FILE_PATH) });

// needs to be loaded at the top level for the nest static file server to initiate
export const STATIC_FILE_ROOT = process.env.STATIC_FILE_ROOT as string;

export const DISABLE_REQUEST_LOGGING =
  process.env.DISABLE_REQUEST_LOGGING === 'true';

export const GLOBAL_API_PREFIX = 'api';
