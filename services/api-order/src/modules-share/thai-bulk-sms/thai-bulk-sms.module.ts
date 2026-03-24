import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ThaiBulkSmsService } from './thai-bulk-sms.service';
import { ThaiBulkSmsController } from './thai-bulk-sms.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
  ],
  controllers: [ThaiBulkSmsController],
  providers: [ThaiBulkSmsService],
  exports: [ThaiBulkSmsService],
})
export class ThaiBulkSmsModule {}
