import { Module } from '@nestjs/common';
import { SubdomainCronService } from './subdomain-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '@/model';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { SubdomainConsumer } from './subdomain.consumer';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { IngressModule } from '../ingress/ingress.module';
import { ConfigModule } from '@nestjs/config';
import { SubdomainCronController } from './subdomain-cron.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    BullModule.registerQueue({
      name: 'subdomain-consumer',
    }),
    BullBoardModule.forFeature({
      name: 'subdomain-consumer',
      adapter: BullAdapter,
    }),
    CloudflareModule,
    IngressModule,
    ConfigModule,
  ],
  providers: [SubdomainCronService, SubdomainConsumer],
  exports: [SubdomainCronService],
  controllers: [SubdomainCronController],
})
export class SubdomainCronModule {}
