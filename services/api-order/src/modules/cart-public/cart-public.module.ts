import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartPublicService } from './cart-public.service';
import { CartPublicController } from './cart-public.controller';

import { Cart } from '../../model/cart.entity';
import { CartItem } from '../../model/cart-item.entity';
import { Product } from '../../model/product.entity';
import { ProductItem } from '../../model/product-item.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { FlashSale } from '../../model/flash-sale.entity';

import { BullModule } from '@nestjs/bull';
import { CartPublicConsumer } from './cart-public.consumer';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,
      ProductItem,
      ProductTranslation,
      FlashSale,
    ]),
    RequestContextModule,
    BullModule.registerQueue({
      name: 'cart-queue',
      defaultJobOptions: {
        removeOnComplete: {
          age: 24 * 3600 * 7,
        },
        removeOnFail: {
          age: 24 * 3600 * 30,
        },
        priority: 1,
      },
    }),
  ],
  providers: [CartPublicService, CartPublicConsumer],
  controllers: [CartPublicController],
})
export class CartPublicModule {}
