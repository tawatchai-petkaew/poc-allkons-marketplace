import {
  MerchantProductEntityStatus,
  MerchantProductStatus,
} from '@/model/merchant-product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

// ─── Nested DTOs ────────────────────────────────────────────────────────

export class MerchantProductDetailCoverImageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;
}

export class MerchantProductDetailImageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  order?: number;
}

export class MerchantProductDetailImagesDto {
  @ApiProperty({ type: [MerchantProductDetailImageDto] })
  system: MerchantProductDetailImageDto[];

  @ApiProperty({ type: [MerchantProductDetailImageDto] })
  merchant: MerchantProductDetailImageDto[];
}

export class MerchantProductDetailPriceDto {
  @ApiPropertyOptional()
  priceVat: number | null;

  @ApiPropertyOptional()
  priceExcludeVat: number | null;

  @ApiPropertyOptional()
  priceIncludeVat: number | null;

  @ApiPropertyOptional()
  priceVatPercent: number | null;

  @ApiPropertyOptional()
  specialPriceVat: number | null;

  @ApiPropertyOptional()
  specialPriceExcludeVat: number | null;

  @ApiPropertyOptional()
  specialPriceIncludeVat: number | null;

  @ApiPropertyOptional()
  specialPriceVatPercent: number | null;

  @ApiPropertyOptional()
  startDate: string | null;

  @ApiPropertyOptional()
  endDate: string | null;
}

export class MerchantProductDetailCategoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class MerchantProductDetailDocumentDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class MerchantProductDetailSpecificationDto {
  @ApiPropertyOptional()
  series: string | null;

  @ApiPropertyOptional()
  model: string | null;

  @ApiPropertyOptional()
  tIS: string | null;

  @ApiPropertyOptional()
  material: string | null;

  @ApiPropertyOptional()
  guarantee: string | null;
}

export class MerchantProductDetailPackageDto {
  @ApiPropertyOptional({ example: 'cylinder' })
  shape: string | null;

  @ApiPropertyOptional({ example: '30 cm' })
  width: string | null;

  @ApiPropertyOptional({ example: '42 cm' })
  height: string | null;

  @ApiPropertyOptional({ example: '10 cm' })
  depth: string | null;
}

export class MerchantProductDetailDimensionDto {
  @ApiPropertyOptional({ example: '3 m' })
  width: string | null;

  @ApiPropertyOptional({ example: '4 m' })
  height: string | null;

  @ApiPropertyOptional({ example: '1 m' })
  depth: string | null;

  @ApiPropertyOptional({ example: '0.7 kg' })
  netWeight: string | null;
}

export class MerchantProductDetailProductDimensionItemDto {
  @ApiProperty({ example: 'แบบ P-Trap', description: 'Dimension value' })
  value: string;

  @ApiProperty({
    example: 'รูปแบบ',
    description:
      'Product dimension master name (e.g. รูปแบบ, Material, Size, Model)',
  })
  productDimensionMasterName: string;
}

export class MerchantProductDetailAttributeItemDto {
  @ApiPropertyOptional({ example: 'สีโครเมียม', description: 'Value when attributeType is String' })
  stringValue: string | null;

  @ApiPropertyOptional({ description: 'Value when attributeType is Number' })
  numberValue: number | null;

  @ApiProperty({ example: 'color', description: 'Attribute name from product_attribute_master' })
  name: string;

  @ApiProperty({ example: 'String', description: 'String or Number' })
  attributeType: string;
}

export class MerchantProductDetailUserModifyDto {
  @ApiPropertyOptional({
    description: 'When the merchant product record was last updated',
  })
  updatedAt: string | null;

  @ApiPropertyOptional({
    description: 'User who last updated the merchant product record',
  })
  updatedBy: string | null;
}

export class MerchantProductDetailUsageDto {
  @ApiPropertyOptional()
  howToUse: string | null;

  @ApiPropertyOptional()
  suggestion: string | null;

  @ApiPropertyOptional()
  caution: string | null;
}

// ─── Main Response ──────────────────────────────────────────────────────

export class MerchantProductDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  barcode: string | null;

  @ApiPropertyOptional()
  internalBarcode: string | null;

  @ApiPropertyOptional()
  salesUnit: string | null;

  @ApiPropertyOptional()
  sku: string | null;

  @ApiProperty()
  productName: string;

  @ApiPropertyOptional({
    description: 'Product group name from product.name',
  })
  productGroupName: string | null;

  @ApiPropertyOptional()
  videoUrl: string | null;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  customName: string | null;

  @ApiPropertyOptional()
  customDescription: string | null;

  @ApiProperty({
    description:
      'Use custom name, description, and text fields instead of system defaults',
  })
  useCustomDetails: boolean;

  @ApiProperty({
    description:
      'Use merchant-uploaded cover image instead of system cover image',
  })
  useCustomCoverImage: boolean;

  @ApiProperty({
    description:
      'Use merchant-uploaded gallery images instead of system images',
  })
  useCustomMerchantImage: boolean;

  @ApiProperty({ description: 'Prepare days (default 1)', default: 1 })
  prepareDays: number;

  @ApiPropertyOptional({ description: 'Require price inquiry', default: false })
  requirePriceInquiry: boolean | null;

  @ApiProperty({ description: 'Product type ID' })
  productTypeId: number;

  @ApiProperty({
    description: 'Merchant product status (e.g. Selling, NotApproved)',
    enum: MerchantProductStatus,
    example: MerchantProductStatus.SELLING,
  })
  @IsEnum(MerchantProductStatus)
  merchantProductStatus: MerchantProductStatus;

  @ApiProperty()
  specification: MerchantProductDetailSpecificationDto;

  @ApiProperty()
  package: MerchantProductDetailPackageDto;

  @ApiProperty()
  usage: MerchantProductDetailUsageDto;

  @ApiPropertyOptional()
  brand: string | null;

  @ApiPropertyOptional({
    description: 'Merchant product entity status',
    enum: MerchantProductEntityStatus,
    example: MerchantProductEntityStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MerchantProductEntityStatus)
  status?: MerchantProductEntityStatus;

  @ApiProperty()
  price: MerchantProductDetailPriceDto;

  @ApiPropertyOptional({
    type: MerchantProductDetailCoverImageDto,
    nullable: true,
  })
  productCoverImage: MerchantProductDetailCoverImageDto | null;

  @ApiProperty({
    type: MerchantProductDetailUserModifyDto,
    description: 'Created/updated by user identifiers from merchant_product',
  })
  userModify: MerchantProductDetailUserModifyDto;

  @ApiProperty()
  images: MerchantProductDetailImagesDto;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: [MerchantProductDetailCategoryDto] })
  categories: MerchantProductDetailCategoryDto[];

  @ApiProperty({ type: [MerchantProductDetailDocumentDto] })
  documents: MerchantProductDetailDocumentDto[];

  @ApiProperty({
    type: [MerchantProductDetailProductDimensionItemDto],
    description:
      'Product variant dimensions from product_dimension_master (e.g. รูปแบบ, Material, Size, Model)',
  })
  productDimensions: MerchantProductDetailProductDimensionItemDto[];

  @ApiProperty({
    type: [MerchantProductDetailAttributeItemDto],
    description: 'Product variant attributes (stringValue/numberValue, name, attributeType String|Number)',
  })
  attributes: MerchantProductDetailAttributeItemDto[];
}
