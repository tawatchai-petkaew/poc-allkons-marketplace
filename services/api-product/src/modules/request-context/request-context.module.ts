import { Module } from '@nestjs/common';

import { RequestContextService } from './request-context.service';

import { UserModule } from '@/modules/user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserOrganizationModule } from '../user-organization/user-organization.module';

@Module({
  imports: [
    UserModule,
    UserOrganizationModule,
    OrganizationModule
  ],
  providers: [RequestContextService],
  exports: [RequestContextService]
})
export class RequestContextModule {}
