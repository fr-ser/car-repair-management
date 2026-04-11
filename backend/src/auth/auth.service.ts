import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { Response } from 'express';

import { AUTH_JWT_COOKIE_KEY, JWT_LIFETIME } from '@/src/config';

import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(dto: LoginDto) {
    const validUserName = this.config.getOrThrow<string>('USERNAME');
    const validPassword = this.config.getOrThrow<string>('PASSWORD');

    const userNameMatches = safeCompare(dto.userName, validUserName);
    const passwordMatches = safeCompare(dto.password, validPassword);

    if (!userNameMatches || !passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.getSignedToken(validUserName);
  }

  async getSignedToken(userName: string): Promise<string> {
    const payload = {
      sub: 0,
      userName,
    };
    const secret: string | undefined = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: JWT_LIFETIME,
      secret: secret,
    });
  }

  setAuthCookie(response: Response, token: string) {
    response.cookie(AUTH_JWT_COOKIE_KEY, token, { httpOnly: true });
  }
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
