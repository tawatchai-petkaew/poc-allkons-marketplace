import { PaymentMethod, PaymentStatus } from '@/model/order-payment.entity';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';

export class UpdateOrderPaymentDto {
  constructor(partials: Partial<UpdateOrderPaymentDto>) {
    Object.assign(this, partials);
  }

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  payTime?: Date;
}
