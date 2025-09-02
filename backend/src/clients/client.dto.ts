import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
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
  landline: string;

  @IsOptional()
  @IsString()
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
  phoneNumber: string;
}
export class UpdateClientDto extends PartialType(CreateClientDto) {}
