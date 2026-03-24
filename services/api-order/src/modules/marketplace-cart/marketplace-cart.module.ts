import { Module } from '@nestjs/common';
import { MarketplaceCartService } from './marketplace-cart.service';
import { MarketplaceCartController } from './marketplace-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '@/model/cart.entity';
import { CartItem } from '@/model/cart-item.entity';
import { RequestContextModule } from '@/modules/request-context/request-context.module';
import { ProductTranslation } from '@/model/product-translation.entity';
import { Product } from '@/model/product.entity';
import { ProductItem } from '@/model/product-item.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,
      ProductItem,
      ProductTranslation,
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
  controllers: [MarketplaceCartController],
  providers: [MarketplaceCartService],
})
export class MarketplaceCartModule {}
