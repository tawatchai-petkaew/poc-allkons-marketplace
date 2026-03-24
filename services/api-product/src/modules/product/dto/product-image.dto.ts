import { IsOptional } from 'class-validator';

import { ProductImage } from '../../../model/product-image.entity';
import { Product } from '../../../model/product.entity';
import { ImageUpload } from '../../../model/image-upload.entity';

export class ProductImageDto implements Readonly<ProductImageDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  order: number;

  @IsOptional()
  product: Product;

  @IsOptional()
  productId: number;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  public static from(dto: Partial<ProductImageDto>) {
    const it = new ProductImageDto();
    it.id = dto.id;
    it.order = dto.order;
    it.product = dto.product;
    it.imageUpload = dto.imageUpload;

    return it;
  }

  public static fromEntity(entity: ProductImage): ProductImageDto {
    return this.from({
      id: entity.id,
      order: entity.order,
      product: entity.product,
      imageUpload: entity.imageUpload
    });
  }

  public static toEntity(dto: Partial<ProductImageDto>) {
    const it = new ProductImage();
    it.order = dto.order;
    it.product = dto.product;
    it.imageUpload = dto.imageUpload;

    return it;
  }
}
