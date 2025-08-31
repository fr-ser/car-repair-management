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

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumberString()
  price: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;
}
