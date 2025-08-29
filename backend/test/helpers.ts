import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { exec } from 'child_process';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function applyMigrations() {
  try {
    await execAsync('npx prisma migrate deploy');
  } catch (err) {
    console.error('❌ Migration failed', err);
  }
}

export async function createDatabase() {
  // we don't need to do anything for now, db is automatically created
  await applyMigrations();
}

export async function dropDatabase() {
  await execAsync('rm ./test.db');
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

export async function createUser({
  email = 'test@test.test',
  password = '123',
}): Promise<string> {
  const userAccessToken: string = await pactum
    .spec()
    .post('/auth/signup')
    .withBody({
      email,
      password,
    })
    .expectStatus(201)
    .returns('access_token');

  return userAccessToken;
}
