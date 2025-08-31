import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { GLOBAL_API_PREFIX } from 'src/config';

import { IS_PUBLIC_KEY } from './auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Check if it's a static file request
    // Assuming static files don't start with /api
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.path.startsWith(`/${GLOBAL_API_PREFIX}`)) return true;

    // For all other routes, apply JWT authentication
    return super.canActivate(context);
  }
}
