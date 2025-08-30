import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: User }>();
    if (data) {
      return request.user && data in request.user
        ? (request.user[data] as unknown)
        : undefined;
    }
    return request.user;
  },
);
