import { IsOptional } from 'class-validator';

import { ImageUpload } from '../../../model/image-upload.entity';
import { Product } from '../../../model/product.entity';
import { Stock } from '../../../model/stock.entity';
import { ProductItem } from '../../../model/product-item.entity';
import { ProductDiscount } from '../../../model/product-discount.entity';
import { ProductBigUnitDiscount } from '../../../model/product-big-unit-discount.entity';
import { ProductDiscountDto } from './product-discount.dto';
import { ProductBigUnitDiscountDto } from './product-big-unit-discount.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductItemDto implements Readonly<ProductItemDto> {
  @IsOptional()
  id: number;

  @ApiProperty({ type: String, required: true })
  @IsOptional()
  slug: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  primaryOptionsValue: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  secondaryOptionsValue: string;

  @ApiProperty({ type: Number, required: true })
  @IsOptional()
  price: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  bigUnitPrice: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  cost: number;

  @IsOptional()
  soldQuantity: number;

  @IsOptional()
  imageUpload: ImageUpload;

  @IsOptional()
  imageUploadId: number;

  @IsOptional()
  voucherQuantity: number;

  @IsOptional()
  voucherExpiredDays: number;

  @IsOptional()
  voucherUsedPerUser: number;

  @IsOptional()
  product: Product;

  @IsOptional()
  stock: Stock;

  // @IsOptional()
  // stockAttributes: CreateStockDto;

  @IsOptional()
  productDiscount: ProductDiscount;

  @IsOptional()
  productBigUnitDiscount: ProductBigUnitDiscount;

  @IsOptional()
  productDiscountAttributes: ProductDiscountDto;

  @IsOptional()
  productBigUnitDiscountAttributes: ProductBigUnitDiscountDto;

  public static from(dto: Partial<ProductItemDto>) {
    const it = new ProductItem();
    it.id = dto.id;
    it.slug = dto.slug;
    it.primaryOptionsValue = dto.primaryOptionsValue;
    it.secondaryOptionsValue = dto.secondaryOptionsValue;
    it.price = dto.price;
    it.bigUnitPrice = dto.bigUnitPrice;
    it.cost = dto.cost;
    it.soldQuantity = dto.soldQuantity;
    it.imageUpload = dto.imageUpload;
    it.product = dto.product;
    it.productDiscount = dto.productDiscount;
    it.voucherQuantity = dto.voucherQuantity;
    it.voucherExpiredDays = dto.voucherExpiredDays;
    it.voucherUsedPerUser = dto.voucherUsedPerUser;
    it.productBigUnitDiscount = dto.productBigUnitDiscount;

    return it;
  }

  public static fromEntity(entity: ProductItem) {
    return this.from({
      id: entity.id,
      slug: entity.slug,
      primaryOptionsValue: entity.primaryOptionsValue,
      secondaryOptionsValue: entity.secondaryOptionsValue,
      price: entity.price,
      bigUnitPrice: entity.bigUnitPrice,
      cost: entity.cost,
      soldQuantity: entity.soldQuantity,
      voucherQuantity: entity.voucherQuantity,
      voucherExpiredDays: entity.voucherExpiredDays,
      voucherUsedPerUser: entity.voucherUsedPerUser,
      imageUpload: entity.imageUpload,
      product: entity.product,
      productDiscount: entity.productDiscount,
      productBigUnitDiscount: entity.productBigUnitDiscount
    });
  }

  public static toEntity(dto: Partial<ProductItemDto>) {
    const it = new ProductItem();
    it.slug = dto.slug;
    it.primaryOptionsValue = dto.primaryOptionsValue;
    it.secondaryOptionsValue = dto.secondaryOptionsValue;
    it.price = dto.price;
    it.bigUnitPrice = dto.bigUnitPrice;
    it.cost = dto.cost;
    it.soldQuantity = dto.soldQuantity;
    it.voucherQuantity = dto.voucherQuantity;
    it.voucherExpiredDays = dto.voucherExpiredDays;
    it.voucherUsedPerUser = dto.voucherUsedPerUser;
    it.imageUpload = dto.imageUpload;
    it.product = dto.product;
    it.productDiscount = dto.productDiscount;
    it.productBigUnitDiscount = dto.productBigUnitDiscount;

    return it;
  }
}
