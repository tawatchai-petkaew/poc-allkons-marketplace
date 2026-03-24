import { Organization } from '@/model/organization.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrganizationDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Organization => {
    const request = ctx.switchToHttp().getRequest();
    return request.organization;
  },
);
