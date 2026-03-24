import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';

export enum OrderBy {
  BEST_SELLER = 'best_seller',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export class SearchProductQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'List of category IDs to filter products, separated by commas',
    type: String,
    example: 'cat1,cat2',
  })
  categoryIds?: string;

  @IsOptional()
  @IsEnum(OrderBy)
  @ApiPropertyOptional({
    description: 'Sort order for products',
    enum: OrderBy,
    example: OrderBy.PRICE_ASC,
  })
  orderBy?: OrderBy;
}
