/**
 * Search Document DTO - Elasticsearch Document Shape
 *
 * 🔧 FIX OLD PROBLEM: Clearly defined document structure replaces ad-hoc object building
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Search Document DTO - Elasticsearch Document Shape
 *
 * 🔧 FIX OLD PROBLEM: Clearly defined document structure replaces ad-hoc object building
 */
export class SearchDocumentDto {
  // Primary Keys
  @ApiProperty()
  id: number;
  @ApiProperty()
  productId: number;

  // Basic Info
  @ApiProperty({
    description:
      'Display name (uses variant alias if available, otherwise product name)',
  })
  name: string;
  @ApiProperty({ description: 'Original product name from product.name' })
  productName: string;
  @ApiPropertyOptional({
    description: 'Product variant alias from product_variant.alias',
  })
  productVariantName: string | null;
  @ApiProperty()
  slug: string;
  @ApiPropertyOptional()
  sku: string | null;
  @ApiPropertyOptional()
  barcode: string | null;

  // Status
  @ApiProperty()
  productStatus: string;
  @ApiProperty()
  variantStatus: string;

  // Pricing
  @ApiProperty()
  minPrice: number;
  @ApiProperty()
  maxPrice: number;

  // Categories (denormalized for search)
  @ApiProperty()
  categoryId: number;
  @ApiProperty()
  categoryName: string;
  @ApiProperty()
  categoryPath: string; // e.g., "Electronics > Phones > Smartphones"

  // Brand
  @ApiPropertyOptional()
  brandId: number | null;
  @ApiPropertyOptional()
  brandName: string | null;

  // Search Enhancement
  @ApiProperty()
  boostScore: number;

  @ApiPropertyOptional()
  score?: number;

  // Business Logic
  @ApiProperty({ description: 'Number of merchants selling this product' })
  sellingMerchantCount: number;
  @ApiProperty({
    type: [Number],
    description: 'Array of merchant IDs that sell this product',
  })
  merchantIds: number[];

  // Timestamps
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;

  // Metadata
  @ApiProperty()
  isActive: boolean;
}

/**
 * Partial Search Document for updates
 */
export type PartialSearchDocumentDto = Partial<SearchDocumentDto> & {
  id: number;
};

/**
 * Search Document Action - Index or Delete
 */
export interface SearchDocumentAction {
  action: 'index' | 'delete';
  document: SearchDocumentDto | { id: number };
}
