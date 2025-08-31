import { Body, Controller, Post } from '@nestjs/common';

import { Public } from './auth.decorator';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
