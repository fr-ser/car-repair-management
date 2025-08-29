import dotenv from 'dotenv';
import path from 'path';

export const ENV_FILE_PATH = process.env.CONFIG_PATH || '.env';
console.log(`Loading env from: ${ENV_FILE_PATH}`);
dotenv.config({ path: path.resolve(ENV_FILE_PATH) });

export const STATIC_FILE_ROOT = process.env.STATIC_FILE_ROOT || 'dist/static';
