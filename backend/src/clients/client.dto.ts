import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPostalCode,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  // optional properties

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsPostalCode('DE', { message: 'Invalid DE postal code' })
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
  @IsDate()
  birthday: Date;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be valid E.164 format',
  })
  phoneNumber: string;
}
