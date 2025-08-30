import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private morganMiddleware = morgan(
    ':date[iso] :remote-addr :protocol :req[Host] :method :url :status :res[content-length] - :response-time[0] ms',
    {
      skip: function shouldLoggerSkip(req: Request): boolean {
        if (req.originalUrl.startsWith('/assets')) return true;
        else if (req.originalUrl.startsWith('/api/health')) return true;
        else return false;
      },
    },
  );

  constructor(private configService: ConfigService) {
    morgan.token('protocol', (req: Request) => req.protocol);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.configService.get('DISABLE_REQUEST_LOGGING') === 'true') {
      return next();
    }

    this.morganMiddleware(req, res, next);
  }
}
