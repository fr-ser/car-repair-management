import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import morgan from 'morgan';

// Lazily set after NestJS initializes so request logs share the same
// format (timestamp, level, context) as all other Nest log lines.
let logger: Logger | null = null;

export function initRequestLogger(nestLogger: Logger) {
  logger = nestLogger;
}

const stream = {
  write: (message: string) => {
    if (logger) {
      logger.log(message.trimEnd());
    } else {
      process.stdout.write(message);
    }
  },
};

morgan.token('res-size', (_req: Request, res: Response) => {
  const bytes = parseInt(res.getHeader('content-length') as string, 10);
  if (isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
});

export const requestLogger = morgan(
  ':remote-addr :req[Host] :method :url - status::status size::res-size time::response-time[0]ms',
  {
    stream,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    skip: function shouldLoggerSkip(req: Request, _: Response): boolean {
      if (process.env.DISABLE_REQUEST_LOGGING) return true;
      else if (req.originalUrl.startsWith('/assets')) return true;
      else if (req.originalUrl.startsWith('/api/health')) return true;
      else return false;
    },
  },
);
