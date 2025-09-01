import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';

import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { userName: dto.userName },
    });

    if (!user) {
      this.logger.debug(`No user found for userName: ${dto.userName}`);
      throw new ForbiddenException('Credentials incorrect');
    }

    const pwMatches = await this.checkPassword(user.hash, dto.password);

    if (!pwMatches) {
      this.logger.debug(`Password mismatch`);
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.getSignedToken(user.id, user.userName);
  }

  async checkPassword(hash: string, password: string) {
    return argon.verify(hash, password);
  }

  async hashPassword(password: string) {
    return argon.hash(password);
  }

  async getSignedToken(userId: number, userName: string): Promise<string> {
    const payload = {
      sub: userId,
      userName,
    };
    const secret: string | undefined = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
  }
}
