import { IsNotEmpty, IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { ProductTranslation } from '../../../model/product-translation.entity';

export class ProductTranslationDto implements Readonly<ProductTranslationDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  highlight: string;

  @IsOptional()
  description: string;

  @IsOptional()
  bigUnit: string;

  @IsOptional()
  unit: string;

  @IsNotEmpty()
  locale: string;

  @IsOptional()
  product: Product;

  public static from(dto: Partial<ProductTranslationDto>) {
    const it = new ProductTranslationDto();
    it.id = dto.id;
    it.name = dto.name;
    it.highlight = dto.highlight;
    it.description = dto.description;
    it.unit = dto.unit;
    it.bigUnit = dto.bigUnit;

    return it;
  }

  public static fromEntity(entity: ProductTranslation): ProductTranslationDto {
    return this.from({
      id: entity.id,
      name: entity.name,
      highlight: entity.highlight,
      description: entity.description,
      unit: entity.unit,
      bigUnit: entity.bigUnit
    });
  }

  public static toEntity(dto: Partial<ProductTranslationDto>) {
    const it = new ProductTranslation();
    it.name = dto.name;
    it.highlight = dto.highlight;
    it.description = dto.description;
    it.unit = dto.unit;
    it.bigUnit = dto.bigUnit;
    it.product = dto.product;
    it.locale = dto.locale;

    return it;
  }
}
