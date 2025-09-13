import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TokenDto {
  sub: number; // userId
  userName: string;
  iat: number; // issued at
  exp: number; // expires at
}
