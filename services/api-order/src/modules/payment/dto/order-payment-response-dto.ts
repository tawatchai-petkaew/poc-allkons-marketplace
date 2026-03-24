import { OmitType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SubOrderPaymentResponseDto {
  @Expose()
  orderPaymentId: number;

  @Expose()
  subOrderId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  deletedAt: Date;

  @Expose()
  id: number;
}

@Exclude()
export class OrderPaymentResponseDto {
  constructor(partials: Partial<OrderPaymentResponseDto>) {
    Object.assign(this, partials);
  }

  @Expose()
  payAmount: number;

  @Expose()
  status: string;

  @Expose()
  orderId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  paymentMethod: string;

  @Expose()
  payTime: Date;

  @Expose()
  transactionCode: string;

  @Expose()
  processingFeeNet: number;

  deletedAt: Date;

  @Expose()
  id: number;

  @Expose()
  subOrderPayments: SubOrderPaymentResponseDto[];
}

@Exclude()
export class UpdateOrderPaymentResponseDto extends OmitType(
  OrderPaymentResponseDto,
  ['subOrderPayments'],
) {
  constructor(partials: Partial<UpdateOrderPaymentResponseDto>) {
    super();
    Object.assign(this, partials);
  }
}

@Exclude()
export class OrderPaymentSlipResponseDto {
  constructor(partials: Partial<OrderPaymentSlipResponseDto>) {
    Object.assign(this, partials);
  }

  @Expose()
  orderPaymentId: number;

  @Expose()
  fileUploadId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  deletedAt: Date;

  @Expose()
  id: number;
}
