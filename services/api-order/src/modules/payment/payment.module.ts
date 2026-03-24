import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderPayment } from '@/model/order-payment.entity';
import { SubOrderPayment } from '@/model/sub-order-payment.entity';
import { OrderPaymentSlip } from '@/model/order-payment-slip.entity';
import { Order } from '@/model/order.entity';
import { SubOrder } from '@/model/sub-order.entity';
import { OrderModule } from '@/modules/order/order.module';
import { FileUploadModule } from '@/modules-share/file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      SubOrder,
      OrderPayment,
      SubOrderPayment,
      OrderPaymentSlip,
    ]),
    OrderModule,
    FileUploadModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
