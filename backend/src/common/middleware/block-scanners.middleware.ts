import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

function isBrowserRequest(req: Request): boolean {
  // Sec-Fetch-Dest is the most reliable signal, but some networks/routers strip Sec-* headers
  if (req.headers['sec-fetch-dest']) return true;
  // Fallback: real browsers always send Accept-Language; automated scanners typically don't
  if (req.headers['accept-language']) return true;
  return false;
}

export function blockNonBrowserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isBrowserRequest(req)) {
    res.locals['nonBrowser'] = true;
    res.status(401).end();
    return;
  }

  next();
}

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
