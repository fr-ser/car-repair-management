import { Request, Response } from 'express';
import morgan from 'morgan';

import { DISABLE_REQUEST_LOGGING } from 'src/config';

morgan.token('protocol', (req: Request) => req.protocol);

export const requestLogger = morgan(
  ':date[iso] :remote-addr :protocol :req[Host] :method :url :status :res[content-length] - :response-time[0] ms',
  {
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    skip: function shouldLoggerSkip(req: Request, _: Response): boolean {
      if (DISABLE_REQUEST_LOGGING) return true;
      else if (req.originalUrl.startsWith('/assets')) return true;
      else if (req.originalUrl.startsWith('/api/health')) return true;
      else return false;
    },
  },
);
