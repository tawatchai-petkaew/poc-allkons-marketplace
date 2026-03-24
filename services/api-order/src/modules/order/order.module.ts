import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '@/model/order.entity';
import { SubOrder } from '@/model/sub-order.entity';
import { OrderItem } from '@/model/order-item.entity';
import { SubOrderDocument } from '@/model/sub-order-document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '@/model/cart-item.entity';
import { Merchant } from '@/model';
import { Cart } from '@/model/cart.entity';
import { OrderPayment } from '@/model/order-payment.entity';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      SubOrder,
      OrderItem,
      SubOrderDocument,
      Cart,
      CartItem,
      Merchant,
      OrderPayment,
    ]),
    RequestContextModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
