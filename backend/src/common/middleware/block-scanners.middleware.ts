import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const BLOCKED_PATTERNS = [
  /\.php(\?.*)?$/i,
  /\.asp(x)?(\?.*)?$/i,
  /\.db(\?.*)?$/i,
  /wp-admin/i,
  /wp-login/i,
  /\.env(\b|$)/i,
  /xmlrpc\.xml/i, // cspell:disable-line
  /phpmyadmin/i, // cspell:disable-line
];

export function blockScannersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (BLOCKED_PATTERNS.some((p) => p.test(req.path))) {
    res.status(404).end();
    return;
  }
  next();
}

@Injectable()
export class BlockScannersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    blockScannersMiddleware(req, res, next);
  }
}
