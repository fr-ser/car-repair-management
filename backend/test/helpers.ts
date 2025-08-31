import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon from 'argon2';

import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

export async function resetDatabase(prisma: PrismaService) {
  return prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.article.deleteMany(),
  ]);
}

export async function createTestClientApp(): Promise<
  [TestingModule, INestApplication]
> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const configService = moduleRef.get(ConfigService);
  const port = parseInt(configService.get('PORT') || '1111');

  const app: INestApplication = moduleRef.createNestApplication();
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
  await app.init();
  await app.listen(port);

  return [moduleRef, app];
}

export async function createUser(
  app: INestApplication,
  { email = 'test@test.test', password = '123' },
): Promise<string> {
  const prisma = app.get(PrismaService);
  const user = await prisma.user.create({
    data: {
      email,
      hash: await argon.hash(password),
    },
  });

  const auth = app.get(AuthService);
  return (await auth.signToken(user.id, user.email)).access_token;
}
