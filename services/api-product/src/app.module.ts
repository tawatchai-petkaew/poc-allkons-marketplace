import { Module, MiddlewareConsumer } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  AcceptLanguageResolver,
  I18nModule,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { TerminusModule } from '@nestjs/terminus';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

import { configService } from './config/config.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppV0Module } from './app-v0.module';
import { Merchant } from './model';
import { AppV1Module } from './app-v1.module';
import { TracingModule } from 'allkons-api-helper';
import { MerchantMiddleware } from './middlewares/merchant.middleware';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

@Module({
  imports: [
    TerminusModule,
    TracingModule,
    TypeOrmModule.forRoot({
      ...configService.getTypeOrmConfig(),
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'th',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    BullModule.forRoot({
      redis: {
        password: process.env.REDIS_PASSWORD || undefined,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUrl = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
        return {
          stores: [new Keyv({ store: new KeyvRedis(redisUrl) })],
        };
      },
    }),
    TypeOrmModule.forFeature([Merchant]),
    AppV0Module,
    AppV1Module,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MerchantMiddleware).forRoutes('*');
  }
}
