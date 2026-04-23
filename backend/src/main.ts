import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';

import { AppModule } from './app.module';
import {
  blockNonBrowserMiddleware,
  blockScannersMiddleware,
} from './common/middleware/block-scanners.middleware';
import {
  initRequestLogger,
  requestLogger,
} from './common/middleware/request-logger';
import { GLOBAL_API_PREFIX } from './config';

class TimezoneLogger extends ConsoleLogger {
  protected getTimestamp(): string {
    // All this to get a iso like timestamp with explicit timezone info in the format "2024-06-30T14:23:45.678+02:00"
    const now = new Date();
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false,
        timeZoneName: 'longOffset',
      })
        .formatToParts(now)
        .map(({ type, value }) => [type, value]),
    );
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}.${p.fractionalSecond}${p.timeZoneName.replace('GMT', '')}`;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // we create a manual express server and register the request logger
  // as otherwise the static file server logs are not present
  const server = express();
  server.use(requestLogger);
  server.use(blockNonBrowserMiddleware);
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
    // Only set a type if the crawler middlewares haven't already claimed this request.
    if (!res.locals['requestType']) {
      if (req.path.startsWith('/assets/')) res.locals['requestType'] = 'static';
      else if (req.path.startsWith('/api/')) res.locals['requestType'] = 'api';
      else res.locals['requestType'] = 'spa';
    }
    next();
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: new TimezoneLogger(),
  });

  initRequestLogger(new Logger('HTTP'));

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
