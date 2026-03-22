import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export const ENV_FILE_PATH = process.env.CONFIG_PATH || '.env';
export const GLOBAL_API_PREFIX = 'api';
export const AUTH_JWT_COOKIE_KEY = 'car_app_jwt';
export const JWT_LIFETIME = '12h';
export const JWT_RENEW_THRESHOLD_S = 60 * 60 * 6; // 6 hours in seconds

class EnvironmentVariables {
  @IsNumber()
  @Min(1000)
  PORT: number;

  @IsNotEmpty()
  @IsString()
  STATIC_FILE_ROOT: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  // Document company info
  @IsNotEmpty() @IsString() DOC_COMPANY_TITLE: string;
  @IsNotEmpty() @IsString() DOC_COMPANY_SUB_TITLE: string;
  @IsNotEmpty() @IsString() DOC_STREET_AND_NUMBER: string;
  @IsNotEmpty() @IsString() DOC_ZIP_AND_CITY: string;
  @IsNotEmpty() @IsString() DOC_PHONE_NUMBER: string;
  @IsNotEmpty() @IsString() DOC_EMAIL: string;
  @IsNotEmpty() @IsString() DOC_OWNER: string;
  @IsNotEmpty() @IsString() DOC_BANK: string;
  @IsNotEmpty() @IsString() DOC_BIC: string;
  @IsNotEmpty() @IsString() DOC_IBAN: string;
  @IsNotEmpty() @IsString() DOC_VAT_ID: string;
  @IsNotEmpty() @IsString() DOC_TAX_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
