import { IsOptional } from 'class-validator';

import { ProductBigUnitDiscount } from '../../../model/product-big-unit-discount.entity';

export enum ProductBigUnitDiscountType {
  REMAIN = 'remain',
  DECREASE = 'decrease'
}

export enum ProductBigUnitDiscountUnitType {
  BATH = 'bath',
  PERCENT = 'percent'
}

export class ProductBigUnitDiscountDto
  implements Readonly<ProductBigUnitDiscountDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  type: ProductBigUnitDiscountType;

  @IsOptional()
  unitType: ProductBigUnitDiscountUnitType;

  @IsOptional()
  value: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  public static from(dto: Partial<ProductBigUnitDiscountDto>) {
    const it = new ProductBigUnitDiscountDto();
    it.id = dto.id;
    it.type = dto.type;
    it.unitType = dto.unitType;
    it.value = dto.value;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;

    return it;
  }

  public static fromEntity(
    entity: ProductBigUnitDiscount
  ): ProductBigUnitDiscountDto {
    return this.from({
      id: entity.id,
      type: entity.type,
      unitType: entity.unitType,
      value: entity.value,
      startDate: entity.startDate,
      endDate: entity.endDate
    });
  }

  public static toEntity(dto: Partial<ProductBigUnitDiscountDto>) {
    const it = new ProductBigUnitDiscount();
    it.type = dto.type;
    it.unitType = dto.unitType;
    it.value = dto.value;
    it.startDate = dto.startDate;
    it.endDate = dto.endDate;

    return it;
  }
}
