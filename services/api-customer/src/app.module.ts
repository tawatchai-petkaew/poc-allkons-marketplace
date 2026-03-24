import {
  Module,
  CacheModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import {
  AcceptLanguageResolver,
  I18nModule,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import * as redisStore from 'cache-manager-redis-store';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard } from '@nestjs/throttler';

import { configService } from './config/config.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageConsumer } from './message.consumer';
import { MailModule } from './mail/mail.module';
import { AppV0Module } from './app-v0.module';
import { MerchantMiddleware } from './middlewares/merchant.middleware';
import { Merchant } from './model';
import { AppV1Module } from './app-v1.module';

import { Injectable } from '@nestjs/common';
import { bullBoardAuth } from './middlewares/bullboard-auth.middleware';
import { TracingModule } from 'allkons-api-helper';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private generateRandomChar(length: number) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    const tracker = req.header('Authorization') || this.generateRandomChar(24);
    return tracker;
  }
}

@Module({
  imports: [
    TerminusModule,
    TracingModule,
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 1000 * 60, // 1 min // default
    //     limit: 100
    //   },
    //   // {
    //   //   name: 'short',
    //   //   ttl: 1000, // 1 sec
    //   //   limit: 3
    //   // },
    //   // {
    //   //   name: 'middle',
    //   //   ttl: 1000 * 10, // 10 sec
    //   //   limit: 10
    //   // },
    //   {
    //     name: 'long',
    //     ttl: 1000 * 60 * 5, // 5 min
    //     limit: 350
    //   }
    // ]),
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
        // username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({
      name: 'message-queue',
    }),
    BullModule.registerQueue({
      name: 'organization-queue',
    }),
    BullModule.registerQueue({
      name: 'subdomain-queue',
    }),
    BullModule.registerQueue({
      name: 'invite-member-queue',
    }),
    BullModule.registerQueue({
      name: 'approve-member-queue',
    }),
    BullModule.registerQueue({
      name: 'user-queue',
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    }),
    MailModule,
    TypeOrmModule.forFeature([Merchant]),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'message-queue',
      adapter: BullAdapter,
    }),
    AppV0Module,
    AppV1Module,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MessageConsumer,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerBehindProxyGuard
    // }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // console.log(process.env.REDIS_HOST);
    consumer.apply(MerchantMiddleware).forRoutes('*');
    // Protect BullBoard dashboard with Basic Auth
    consumer
      .apply(bullBoardAuth)
      .forRoutes({ path: 'queues', method: RequestMethod.ALL });
  }
}
