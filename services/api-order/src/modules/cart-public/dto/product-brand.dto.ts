import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';
import { Product } from '../../../model/product.entity';
import { ProductBrand } from '../../../model/product-brand.entity';

export enum ProductBransStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export class ProductBrandDto implements Readonly<ProductBrandDto> {
  @IsOptional()
  id: number;

  @IsNotEmpty()
  order: number;

  @IsNotEmpty()
  isNoBrand: boolean;

  @IsOptional()
  name: string;

  @IsOptional()
  status: ProductBransStatus;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  logo: ImageUpload;

  @IsOptional()
  products: Product[];

  @IsOptional()
  locale: string;

  public static from(dto: Partial<ProductBrandDto>) {
    const it = new ProductBrandDto();
    it.id = dto.id;
    it.name = dto.name;
    it.isNoBrand = dto.isNoBrand;
    it.order = dto.order;
    it.status = dto.status;
    it.merchant = dto.merchant;
    it.logo = dto.logo;
    it.products = dto.products;

    return it;
  }

  public static fromEntity(
    entity: ProductBrand,
    translation: any,
  ): ProductBrandDto {
    return this.from({
      id: entity.id,
      order: entity.order,
      isNoBrand: entity.isNoBrand,
      status: entity.status,
      merchant: entity.merchant,
      logo: entity.imageUpload,
      products: entity.products,
      name: translation && translation.name ? translation.name : '',
    });
  }

  public static toEntity(dto: Partial<ProductBrandDto>) {
    const it = new ProductBrand();
    it.isNoBrand = dto.isNoBrand;
    it.order = dto.order;
    it.status = dto.status;
    it.merchant = dto.merchant;
    it.imageUpload = dto.logo;
    it.products = dto.products;

    return it;
  }
}
