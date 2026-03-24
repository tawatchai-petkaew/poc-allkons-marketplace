import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserSchema {
  userId: number;
}

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSchema => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
