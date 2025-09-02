import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';
import { GLOBAL_API_PREFIX } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

export async function resetDatabase(prisma: PrismaService) {
  return prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.article.deleteMany(),
    prisma.car.deleteMany(),
    prisma.client.deleteMany(),
  ]);
}

export async function createTestClientApp(): Promise<
  [TestingModule, INestApplication]
> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in DTO
      forbidNonWhitelisted: true, // throws error for unknown props
      transform: true, // auto-transforms payloads to DTO class
      transformOptions: {
        enableImplicitConversion: true, // allows type coercion
      },
    }),
  );

  app.setGlobalPrefix(GLOBAL_API_PREFIX);

  const configService = app.get(ConfigService);
  await app.init();
  await app.listen(configService.getOrThrow<number>('PORT'));

  return [moduleRef, app];
}

export async function getValidJwt(app: INestApplication) {
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);
  return jwtService.signAsync(
    { sub: 1 },
    {
      expiresIn: '150y',
      secret: configService.getOrThrow<string>('JWT_SECRET'),
    },
  );
}
