import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_JWT_COOKIE_KEY, JWT_RENEW_THRESHOLD_S } from '@/src/config';

import { TokenDto } from './auth.dto';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.[AUTH_JWT_COOKIE_KEY] as string | null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenDto) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - currentTime;

    if (timeUntilExpiry > JWT_RENEW_THRESHOLD_S) return payload;

    const newToken = await this.authService.getSignedToken(
      payload.sub,
      payload.userName,
    );

    this.authService.setAuthCookie(req.res as Response, newToken);

    return payload;
  }
}
