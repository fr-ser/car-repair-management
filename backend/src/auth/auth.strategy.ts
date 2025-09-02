import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_JWT_COOKIE_KEY } from '@/src/config';

import { AuthDto } from './auth.dto';

export interface UserWithoutHash {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.[AUTH_JWT_COOKIE_KEY] as string | null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: AuthDto) {
    return payload;
  }
}
