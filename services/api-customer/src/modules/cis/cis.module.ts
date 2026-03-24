import { Module } from '@nestjs/common';
import { CisController } from './cis.controller';
import { CisService } from './cis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ConfigModule.forRoot(), CommonModule],
  controllers: [CisController],
  providers: [
    CisService,
    {
      provide: 'CIS_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('CIS_API_KEY'),
      inject: [ConfigService],
    },
    {
      provide: 'CIS_PLATFORM_SELLER_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('CIS_PLATFORM_SELLER_KEY'),
      inject: [ConfigService],
    },
    {
      provide: 'CIS_PLATFORM_BUYER_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('CIS_PLATFORM_BUYER_KEY'),
      inject: [ConfigService],
    },
    {
      provide: 'CIS_URL',
      useFactory: (configService: ConfigService) =>
        configService.get('CIS_URL'),
      inject: [ConfigService],
    },
    {
      provide: 'APP_ID_SELLER',
      useFactory: (configService: ConfigService) =>
        configService.get('APP_ID_SELLER'),
      inject: [ConfigService],
    },
    {
      provide: 'APP_ID_BUYER',
      useFactory: (configService: ConfigService) =>
        configService.get('APP_ID_BUYER'),
      inject: [ConfigService],
    },
    {
      provide: 'APP_ID_MARKETPLACE',
      useFactory: (configService: ConfigService) =>
        configService.get('APP_ID_MARKETPLACE'),
      inject: [ConfigService],
    },
  ],
  exports: [CisService],
})
export class CisModule {}
