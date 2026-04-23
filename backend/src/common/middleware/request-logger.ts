import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import morgan from 'morgan';

import { getConfig } from '@/src/config';

// Lazily set after NestJS initializes so request logs share the same
// format (timestamp, level, context) as all other Nest log lines.
let logger: Logger | null = null;

export function initRequestLogger(nestLogger: Logger) {
  logger = nestLogger;
}

// Non-printable sentinel embedded by the :req-warn token so the stream
// can route those lines to logger.warn without a separate log statement.
const WARN_SENTINEL = '\x01';

const stream = {
  write: (message: string) => {
    const isWarn = message.startsWith(WARN_SENTINEL);
    const text = (isWarn ? message.slice(1) : message).trimEnd();
    if (logger) {
      if (isWarn) logger.warn(text);
      else logger.log(text);
    } else {
      process.stdout.write(text + '\n');
    }
  },
};

// Every request gets exactly one tag. Crawler requests are blocked before the type
// middleware runs, so the two are mutually exclusive. Max width: '[crawler] ' = 10 chars.
// The WARN_SENTINEL is embedded here so the stream can route crawler lines to logger.warn
// without a separate token (a separate token returning '' would render as '-' in morgan).
morgan.token('req-tags', (_req: Request, res: Response) => {
  const type = res.locals['requestType'] as string | undefined;
  if (type === 'crawler') return WARN_SENTINEL + '[crawler] ';
  if (type === 'static') return '[static]  ';
  if (type === 'spa') return '[spa]     ';
  if (type === 'api') return '[api]     ';
  return '          ';
});

morgan.token('res-size', (_req: Request, res: Response) => {
  const bytes = parseInt(res.getHeader('content-length') as string, 10);
  if (isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
});

// Example log lines (tags padded to 10 chars; asset requests skipped unless LOG_ASSET_REQUESTS=true):
// [Nest] 19607  - …    WARN [HTTP] [crawler]  ::1 localhost GET /.env - status:404 …
// [Nest] 19607  - …     LOG [HTTP] [api]      ::1 localhost GET /api/orders - status:200 …
// [Nest] 19607  - …     LOG [HTTP] [spa]      ::1 localhost GET / - status:200 …
// [Nest] 19607  - …     LOG [HTTP] [static]   ::1 localhost GET /assets/index-abc.js - status:200 …
export const requestLogger = morgan(
  ':req-tags:remote-addr :req[Host] :method :url - status::status size::res-size time::response-time[0]ms',
  {
    stream,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    skip: function shouldLoggerSkip(req: Request, _: Response): boolean {
      if (getConfig().DISABLE_REQUEST_LOGGING) return true;
      else if (req.originalUrl.startsWith('/api/health')) return true;
      else if (req.originalUrl.startsWith('/assets') && !getConfig().LOG_ASSET_REQUESTS) return true;
      else return false;
    },
  },
);
