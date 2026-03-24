import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';
import { Product } from '../../../model/product.entity';
import { ProductCategory } from '../../../model/product-category.entity';

export enum ProductCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive'
}

export class ProductCategoryDto implements Readonly<ProductCategoryDto> {
  @IsOptional()
  id: number;

  @IsNotEmpty()
  order: number;

  @IsOptional()
  name: string;

  @IsOptional()
  status: ProductCategoryStatus;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  logo: ImageUpload;

  @IsOptional()
  products: Product[];

  @IsOptional()
  locale: string;

  public static from(dto: Partial<ProductCategoryDto>) {
    const it = new ProductCategoryDto();
    it.id = dto.id;
    it.name = dto.name;
    it.order = dto.order;
    it.status = dto.status;
    it.merchant = dto.merchant;
    it.logo = dto.logo;
    it.products = dto.products;

    return it;
  }

  public static fromEntity(
    entity: ProductCategory,
    translation: any
  ): ProductCategoryDto {
    return this.from({
      id: entity.id,
      order: entity.order,
      status: entity.status,
      merchant: entity.merchant,
      logo: entity.imageUpload,
      products: entity.products,
      name: translation && translation.name ? translation.name : ''
    });
  }

  public static toEntity(dto: Partial<ProductCategoryDto>) {
    const it = new ProductCategory();
    it.order = dto.order;
    it.status = dto.status;
    it.merchant = dto.merchant;
    it.imageUpload = dto.logo;
    it.products = dto.products;

    return it;
  }
}
