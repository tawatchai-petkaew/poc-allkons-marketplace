import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthCenterService } from './auth-center.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  providers: [
    AuthCenterService,
    {
      provide: 'AUTH_CENTER_URL',
      useFactory: (configService: ConfigService) => configService.get('AUTH_CENTER_URL'),
      inject: [ConfigService],
    },
    {
      provide: 'AUTH_CLIENT_ID',
      useFactory: (configService: ConfigService) => configService.get('AUTH_CLIENT_ID'),
      inject: [ConfigService],
    },
    {
      provide: 'AUTH_CLIENT_SECRET',
      useFactory: (configService: ConfigService) => configService.get('AUTH_CLIENT_SECRET'),
      inject: [ConfigService],
    }
  ],
  exports: [AuthCenterService]
})
export class AuthCenterModule {}
