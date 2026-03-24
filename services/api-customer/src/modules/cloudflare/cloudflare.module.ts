import { CloudflareController } from './cloudflare.controller';
import { CloudflareService } from './cloudflare.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
