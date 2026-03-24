import { Category } from '@/model/category.entity';
import { ImageUpload } from '@/model/image-upload.entity';
import { ProductCategoryStatus } from '@/model/product-category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class BuyerProductCategoryDto {
  constructor(partials: Partial<BuyerProductCategoryDto>) {
    Object.assign(this, partials);
  }
  @ApiProperty({
    example: 66,
    type: Number,
    nullable: false,
    description: 'Product category ID',
  })
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'Product category name',
    type: String,
    nullable: false,
    description: 'Product category name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
    description: 'Product category order',
  })
  @IsInt()
  order: number;

  @ApiProperty({
    example: 'Product category status',
    type: String,
    nullable: false,
    description: 'Product category status',
  })
  @IsEnum(ProductCategoryStatus)
  status: ProductCategoryStatus;

  @ApiProperty({
    example: 'Product category path',
    type: String,
    nullable: true,
    description: 'Product category path',
  })
  @IsOptional()
  @IsString()
  path?: string | null;

  @ApiProperty({
    example: 'Product category image upload',
    type: ImageUpload,
    nullable: true,
    description: 'Product category image upload',
  })
  @IsOptional()
  imageUpload?: ImageUpload;

  @ApiProperty({
    example: 'Product category sku ID',
    type: String,
    nullable: true,
    description: 'Product category sku ID',
  })
  @IsOptional()
  @IsString()
  skuId?: string | null;

  @ApiProperty({
    example: [BuyerProductCategoryDto],
    type: [BuyerProductCategoryDto],
    nullable: true,
    description: 'Product category sub categories',
  })
  @IsOptional()
  subCategories?: BuyerProductCategoryDto[];
}

export class BuyerProductCategoryDtoV1 extends Category {
  constructor(partials: Partial<BuyerProductCategoryDtoV1>) {
    super();
    Object.assign(this, partials);
  }

  children: Category[];
}
