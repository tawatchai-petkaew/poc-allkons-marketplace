import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentSlipDto {
  constructor(partials: Partial<CreatePaymentSlipDto>) {
    Object.assign(this, partials);
  }

  @IsNotEmpty()
  @IsNumber()
  orderPaymentId: number;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  fileIds: number[];
}
