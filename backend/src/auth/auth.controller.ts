import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AUTH_JWT_COOKIE_KEY } from 'src/config';

import { Public } from './auth.decorator';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.signIn(dto);
    response.cookie(AUTH_JWT_COOKIE_KEY, token, { httpOnly: true });
  }
}
