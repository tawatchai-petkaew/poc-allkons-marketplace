import { MerchantProduct } from '@/model/merchant-product.entity';
import { ApiProperty } from '@nestjs/swagger';

class MetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Number of items in current page' })
  itemCount: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;
}

export class SearchProductResponseDto {
  @ApiProperty({ type: [MerchantProduct] })
  items: MerchantProduct[];

  @ApiProperty({ type: MetaDto })
  meta: MetaDto;
}
