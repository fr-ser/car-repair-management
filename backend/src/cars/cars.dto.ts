import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  engineCapacity?: string;

  @MaxLength(10)
  @IsDateString()
  @IsOptional()
  firstRegistration?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsString()
  @IsOptional()
  enginePower?: string;

  @MaxLength(10)
  @IsDateString()
  @IsOptional()
  oilChangeDate?: string;

  @IsNumber()
  @IsOptional()
  oilChangeKm?: number;

  @IsString()
  @IsOptional()
  tires?: string;

  @MaxLength(10)
  @IsDateString()
  @IsOptional()
  inspectionDate?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsNumber()
  @IsOptional()
  timingBeltKm?: number;

  @MaxLength(10)
  @IsDateString()
  @IsOptional()
  timingBeltDate?: string;

  @IsString()
  @IsOptional()
  documentField2?: string;

  @IsString()
  @IsOptional()
  documentField3?: string;
}

export class UpdateCarDto extends CreateCarDto {}
