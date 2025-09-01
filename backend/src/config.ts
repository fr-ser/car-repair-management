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
