import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { Public } from './auth.decorator';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.signIn(dto);
    this.authService.setAuthCookie(response, token);
  }
}
