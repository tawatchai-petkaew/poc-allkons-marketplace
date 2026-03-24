import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class OrderPaymentDto {
  constructor(partials: Partial<OrderPaymentDto>) {
    Object.assign(this, partials);
  }

  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  subOrderIds: number[];

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
