import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';
import { ProductCatalog } from '../../../model/product-catalog.entity';
import { ProductProductCatalog } from '../../../model/product-product-catalog.entity';

import {
  ProductCatalogStatus,
  ProductCatalogMainStatus
} from '../enum/product-catalog.enum';

export class ProductCatalogDto implements Readonly<ProductCatalogDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  status: ProductCatalogStatus;

  @IsNotEmpty()
  mainStatus: ProductCatalogMainStatus;

  @IsNotEmpty()
  merchant: Merchant;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  productProductCatalogs: ProductProductCatalog[];

  public static from(dto: Partial<ProductCatalogDto>) {
    const it = new ProductCatalog();
    it.id = dto.id;
    it.name = dto.name;
    it.status = dto.status;
    it.mainStatus = dto.mainStatus;
    it.merchant = dto.merchant;
    it.imageUpload = dto.imageUpload;
    it.productProductCatalogs = dto.productProductCatalogs;

    return it;
  }

  public static fromEntity(entity: any) {
    return this.from({
      id: entity.id,
      name: entity.name,
      status: entity.status,
      merchant: entity.merchant,
      mainStatus: entity.mainStatus,
      imageUpload: entity.imageUpload,
      productProductCatalogs: entity.productProductCatalogs
    });
  }
}
