import { Module, MiddlewareConsumer } from '@nestjs/common';
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
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard } from '@nestjs/throttler';

import { configService } from './config/config.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageConsumer } from './message.consumer';
import { Merchant } from './model';

import { Injectable } from '@nestjs/common';
import { MerchantMiddleware } from './middlewares/merchant.middleware';
import { RequestContextModule } from './modules/request-context/request-context.module';
import { OrderModule } from './modules/order/order.module';
import { FileUploadModule } from './modules-share/file-upload/file-upload.module';
import { CartPublicModule } from './modules/cart-public/cart-public.module';
import { MarketplaceCartModule } from './modules/marketplace-cart/marketplace-cart.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
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
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(
                `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
              ),
            }),
          ],
        };
      },
    }),
    TypeOrmModule.forFeature([Merchant]),

    // API Modules
    AuthModule,
    RequestContextModule,
    OrderModule,
    FileUploadModule,
    CartPublicModule,
    MarketplaceCartModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, MessageConsumer],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // console.log(process.env.REDIS_HOST);
    consumer.apply(MerchantMiddleware).forRoutes('*');
  }
}
