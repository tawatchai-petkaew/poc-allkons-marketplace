import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportProductsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  searchType?: string; // 'name', 'barcode', 'all'

  @IsOptional()
  @IsString()
  categoryIds?: string; // comma-separated

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  productTypeId?: number;

  @IsOptional()
  @IsString()
  merchantProductStatus?: string;

  @IsOptional()
  @IsString()
  priceType?: string; // 'InVAT' or 'ExVAT'
}
