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
