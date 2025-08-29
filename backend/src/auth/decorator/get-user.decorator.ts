import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';

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
