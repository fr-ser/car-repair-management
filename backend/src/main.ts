import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';

import { AppModule } from './app.module';
import { blockScannersMiddleware } from './common/middleware/block-scanners.middleware';
import { requestLogger } from './common/middleware/request-logger';
import { GLOBAL_API_PREFIX } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // we create a manual express server and register the request logger
  // as otherwise the static file server logs are not present
  const server = express();
  server.use(requestLogger);
  server.use(blockScannersMiddleware);

  // Hashed asset files (e.g. /assets/index-abc123.js) are safe to cache indefinitely
  // because Vite changes the hash whenever the content changes.
  // All other non-API paths (including index.html) must be revalidated on every request
  // so the browser always picks up the latest entry point with updated asset references.
  server.use((req, res, next) => {
    if (req.path.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (!req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
    next();
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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
  await app.listen(configService.getOrThrow<number>('PORT'));
  logger.log(`Server is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
