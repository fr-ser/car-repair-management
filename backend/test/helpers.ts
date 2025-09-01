import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
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
  const configService = app.get(ConfigService);
  await app.init();
  await app.listen(configService.getOrThrow<number>('PORT'));

  return [moduleRef, app];
}
