import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  declare userName: string;

  @IsString()
  @IsNotEmpty()
  declare password: string;
}

export class TokenDto {
  declare sub: number; // userId
  declare userName: string;
  declare iat: number; // issued at
  declare exp: number; // expires at
}
