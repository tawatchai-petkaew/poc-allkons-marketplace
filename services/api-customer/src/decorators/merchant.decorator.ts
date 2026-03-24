import { Merchant } from '@/model';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MerchantDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Merchant => {
    const request = ctx.switchToHttp().getRequest();
    return request.merchant;
  }
);
