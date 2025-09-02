import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { RequireOneOf } from 'src/common/class-validators';

export class CreateClientDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @RequireOneOf(['firstName', 'lastName', 'company'])
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @RequireOneOf(['firstName', 'lastName', 'company'])
  lastName: string;

  @IsOptional()
  @IsEmail()
  @RequireOneOf(['email', 'landline', 'phoneNumber'])
  email: string;

  @IsOptional()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  @RequireOneOf(['email', 'landline', 'phoneNumber'])
  landline: string;

  @IsOptional()
  @IsString()
  @RequireOneOf(['firstName', 'lastName', 'company'])
  company: string;

  @IsOptional()
  @MaxLength(10) // a date time string with a length of 10 is a date
  @IsDateString()
  birthday: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  @RequireOneOf(['email', 'landline', 'phoneNumber'])
  phoneNumber: string;
}
export class UpdateClientDto extends PartialType(CreateClientDto) {}
