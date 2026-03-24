import { IsNotEmpty, IsOptional } from 'class-validator';

import { ProductFlashSale } from '../../../model/product-flash-sale.entity';
import { Merchant } from '../../../model/merchant.entity';
import { FlashSale, FlashSaleStatus } from '../../../model/flash-sale.entity';

export class FlashSaleDto implements Readonly<FlashSaleDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  status: FlashSaleStatus;

  @IsOptional()
  productFlashSales: ProductFlashSale[];

  @IsNotEmpty()
  merchant: Merchant;

  public static from(dto: Partial<FlashSaleDto>) {
    const it = new FlashSale();
    it.id = dto.id;
    it.name = dto.name;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;
    it.status = dto.status;
    it.productFlashSales = dto.productFlashSales;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: any) {
    return this.from({
      id: entity.id,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      productFlashSales: entity.productFlashSales,
      merchant: entity?.merchant,
    });
  }
}
