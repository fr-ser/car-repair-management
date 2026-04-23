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

morgan.token('req-warn', (_req: Request, res: Response) => {
  return res.locals['nonBrowser'] ? WARN_SENTINEL : '';
});

morgan.token('req-non-browser', (_req: Request, res: Response) => {
  return res.locals['nonBrowser'] ? '[non-browser] ' : '';
});

morgan.token('req-type', (_req: Request, res: Response) => {
  const type = res.locals['requestType'] as string | undefined;
  if (type === 'static') return '[static] ';
  if (type === 'spa') return '[spa] ';
  return '';
});

morgan.token('res-size', (_req: Request, res: Response) => {
  const bytes = parseInt(res.getHeader('content-length') as string, 10);
  if (isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
});

// Example log line with all tokens:
// [Nest] 19607  - 2026-04-23T07:10:27.158+02:00    WARN [HTTP] [non-browser] [spa] ::1 localhost:8080 GET / - status:401 size:- time:0ms
export const requestLogger = morgan(
  ':req-warn:req-non-browser:req-type:remote-addr :req[Host] :method :url - status::status size::res-size time::response-time[0]ms',
  {
    stream,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    skip: function shouldLoggerSkip(req: Request, _: Response): boolean {
      if (getConfig().DISABLE_REQUEST_LOGGING) return true;
      else if (req.originalUrl.startsWith('/assets')) return true;
      else if (req.originalUrl.startsWith('/api/health')) return true;
      else return false;
    },
  },
);
