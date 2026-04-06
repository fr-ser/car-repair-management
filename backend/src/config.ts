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
  declare PORT: number;

  @IsNotEmpty()
  @IsString()
  declare STATIC_FILE_ROOT: string;

  @IsNotEmpty()
  @IsString()
  declare JWT_SECRET: string;

  // Document company info
  @IsNotEmpty() @IsString() declare DOC_COMPANY_TITLE: string;
  @IsNotEmpty() @IsString() declare DOC_COMPANY_SUB_TITLE: string;
  @IsNotEmpty() @IsString() declare DOC_STREET_AND_NUMBER: string;
  @IsNotEmpty() @IsString() declare DOC_ZIP_AND_CITY: string;
  @IsNotEmpty() @IsString() declare DOC_PHONE_NUMBER: string;
  @IsNotEmpty() @IsString() declare DOC_EMAIL: string;
  @IsNotEmpty() @IsString() declare DOC_OWNER: string;
  @IsNotEmpty() @IsString() declare DOC_BANK: string;
  @IsNotEmpty() @IsString() declare DOC_BIC: string;
  @IsNotEmpty() @IsString() declare DOC_IBAN: string;
  @IsNotEmpty() @IsString() declare DOC_VAT_ID: string;
  @IsNotEmpty() @IsString() declare DOC_TAX_ID: string;
}

let _config: AppConfig | undefined;

export type AppConfig = {
  PORT: number;
  STATIC_FILE_ROOT: string;
  JWT_SECRET: string;
  DOC_COMPANY_TITLE: string;
  DOC_COMPANY_SUB_TITLE: string;
  DOC_STREET_AND_NUMBER: string;
  DOC_ZIP_AND_CITY: string;
  DOC_PHONE_NUMBER: string;
  DOC_EMAIL: string;
  DOC_OWNER: string;
  DOC_BANK: string;
  DOC_BIC: string;
  DOC_IBAN: string;
  DOC_VAT_ID: string;
  DOC_TAX_ID: string;
};

export function getConfig(): AppConfig {
  if (!_config) {
    _config = {
      PORT: Number(process.env.PORT),
      STATIC_FILE_ROOT: process.env.STATIC_FILE_ROOT!,
      JWT_SECRET: process.env.JWT_SECRET!,
      DOC_COMPANY_TITLE: process.env.DOC_COMPANY_TITLE!,
      DOC_COMPANY_SUB_TITLE: process.env.DOC_COMPANY_SUB_TITLE!,
      DOC_STREET_AND_NUMBER: process.env.DOC_STREET_AND_NUMBER!,
      DOC_ZIP_AND_CITY: process.env.DOC_ZIP_AND_CITY!,
      DOC_PHONE_NUMBER: process.env.DOC_PHONE_NUMBER!,
      DOC_EMAIL: process.env.DOC_EMAIL!,
      DOC_OWNER: process.env.DOC_OWNER!,
      DOC_BANK: process.env.DOC_BANK!,
      DOC_BIC: process.env.DOC_BIC!,
      DOC_IBAN: process.env.DOC_IBAN!,
      DOC_VAT_ID: process.env.DOC_VAT_ID!,
      DOC_TAX_ID: process.env.DOC_TAX_ID!,
    };
  }
  return _config;
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
