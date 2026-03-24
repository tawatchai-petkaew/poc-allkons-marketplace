import { IsOptional } from 'class-validator';

import { ProductDiscount } from '../../../model/product-discount.entity';

export enum ProductDiscountType {
  REMAIN = 'remain',
  DECREASE = 'decrease'
}

export enum ProductDiscountUnitType {
  BATH = 'bath',
  PERCENT = 'percent'
}

export class ProductDiscountDto implements Readonly<ProductDiscountDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  type: ProductDiscountType;

  @IsOptional()
  unitType: ProductDiscountUnitType;

  @IsOptional()
  value: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  public static from(dto: Partial<ProductDiscountDto>) {
    const it = new ProductDiscountDto();
    it.id = dto.id;
    it.type = dto.type;
    it.unitType = dto.unitType;
    it.value = dto.value;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;

    return it;
  }

  public static fromEntity(entity: ProductDiscount): ProductDiscountDto {
    return this.from({
      id: entity.id,
      type: entity.type,
      unitType: entity.unitType,
      value: entity.value,
      startDate: entity.startDate,
      endDate: entity.endDate
    });
  }

  public static toEntity(dto: Partial<ProductDiscountDto>) {
    const it = new ProductDiscount();
    it.type = dto.type;
    it.unitType = dto.unitType;
    it.value = dto.value;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;

    return it;
  }
}
