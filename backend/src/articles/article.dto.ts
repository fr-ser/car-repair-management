import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  declare id: string;

  @IsString()
  declare description: string;

  @IsNotEmpty()
  @IsNumberString()
  declare price: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
