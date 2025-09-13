import dotenv from 'dotenv';

export const ENV_FILE_PATH = process.env.CONFIG_PATH || './backend/.env.test';

dotenv.config({ path: ENV_FILE_PATH, quiet: true });

export const USER_NAME = process.env.USERNAME as string;
export const PASS_WORD = process.env.PASSWORD as string;
