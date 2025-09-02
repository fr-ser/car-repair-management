import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'tireFormat', async: false })
export class TireFormat implements ValidatorConstraintInterface {
  validate(text: string) {
    if (text.length < 14) return false;

    const positionsToCheck = [0, 1, 2, 4, 5, 8, 9];
    for (const pos of positionsToCheck) {
      if (!RegExp('\\d').test(text.charAt(pos))) {
        return false;
      }
    }

    return true;
  }
  defaultMessage() {
    return 'Must be at least 14 characters long and positions 0, 1, 2, 4, 5, 8, and 9 must be digits';
  }
}

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
  @Validate(TireFormat)
  tires?: string;

  @MaxLength(10) // a date time string with a length of 10 is a date
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

export class UpdateCarDto extends PartialType(CreateCarDto) {}
