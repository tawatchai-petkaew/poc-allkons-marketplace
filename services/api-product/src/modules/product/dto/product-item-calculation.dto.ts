import { IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { ProductDiscountDto } from './product-discount.dto';
import { ProductBigUnitDiscountDto } from './product-big-unit-discount.dto';

export class ProductItemCalculationDto
  implements Readonly<ProductItemCalculationDto> {
  @IsOptional()
  id: number;

  @IsOptional()
  slug: string;

  @IsOptional()
  primaryOptionsValue: string;

  @IsOptional()
  secondaryOptionsValue: string;

  @IsOptional()
  price: number;

  @IsOptional()
  bigUnitPrice: number;

  @IsOptional()
  cost: number;

  @IsOptional()
  soldQuantity: number;

  @IsOptional()
  product: Product;

  @IsOptional()
  productDiscount: ProductDiscountDto;

  @IsOptional()
  productBigUnitDiscount: ProductBigUnitDiscountDto;

  @IsOptional()
  flashSaleSmallUnit: string;

  @IsOptional()
  flashSaleBigUnit: string;
}
