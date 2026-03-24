import { forwardRef, Module } from '@nestjs/common';

import { RequestContextService } from './request-context.service';

import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}
