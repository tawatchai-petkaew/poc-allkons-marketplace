import { ApiProperty, PickType } from '@nestjs/swagger';
import { ProductVariant } from '@/model/product-variant.entity';
import { Product } from '@/model/product.entity';
import { Brand } from '@/model/brand.entity';
import { Category } from '@/model/category.entity';

class BrandDto extends PickType(Brand, ['id', 'name', 'name_th'] as const) {}

class CategoryDto extends PickType(Category, ['id', 'name'] as const) {}

class ProductDto extends PickType(Product, [
  'id',
  'brandId',
  'categoryId',
] as const) {
  @ApiProperty({ type: BrandDto, required: false })
  brand?: BrandDto;

  @ApiProperty({ type: CategoryDto, required: false })
  category?: CategoryDto;
}

class DimensionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  value: string;
}

export class ProductVariantResponseDto extends PickType(ProductVariant, [
  'id',
  'sku',
  'alias',
  'barcode',
  'description',
  'howToUseText',
  'suggestionText',
  'cautionText',
  'salesUnit',
  'urlVideo',
  'series',
  'model',
  'material',
  'guarantee',
  'detailGuarantee',
  'packageWidth',
  'packageWidthUnit',
  'packageHeight',
  'packageHeightUnit',
  'packageDepth',
  'packageDepthUnit',
  'packageShape',
  'productWidth',
  'productWidthUnit',
  'productHeight',
  'productHeightUnit',
  'productDepth',
  'productDepthUnit',
  'tIS',
  'grossWeight',
  'grossWeightUnit',
  'netWeight',
  'netWeightUnit',
  'status',
  'productId',
] as const) {
  @ApiProperty({ type: ProductDto })
  product: ProductDto;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [DimensionDto] })
  dimensions: DimensionDto[];

  @ApiProperty()
  merchantProductId: number;

  @ApiProperty()
  priceIncludeVat: number;

  @ApiProperty({ required: false })
  specialPriceIncludeVat?: number;

  @ApiProperty()
  quantity: number;
}
