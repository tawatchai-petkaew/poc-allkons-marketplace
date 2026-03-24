import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchDocumentDto } from './search-document.dto';

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageLimit: number;

  @ApiProperty({
    example: { value: 100, relation: 'eq' },
  })
  totalResultCount: {
    value: number;
    relation: string;
  };
}

export class FacetDto {
  @ApiProperty({ example: 'brandName' })
  group: string;

  @ApiProperty({ example: 'Samsung' })
  facetName: string;

  @ApiProperty({ example: 10 })
  count: number;
}

export class SearchProductResponseDto {
  @ApiProperty()
  pagination: PaginationDto;

  @ApiProperty({ type: [FacetDto] })
  facets: FacetDto[];

  @ApiProperty({ type: [SearchDocumentDto] })
  items: SearchDocumentDto[];

  @ApiProperty({ type: [String] })
  suggestions: string[];

  @ApiProperty({ type: [Number] })
  allItemIds: number[];
}

export class AutocompleteResponseDto {
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
  categoryId: number;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  categoryPath: string;
}
