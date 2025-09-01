import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumberString()
  price: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;
}

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['id'] as const),
) {}
