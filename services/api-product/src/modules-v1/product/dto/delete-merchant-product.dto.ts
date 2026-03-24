import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ArrayNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Request ─────────────────────────────────────────────────────────────────

export class DeleteMerchantProductRequestDto {
  @ApiProperty({
    description: 'List of productVariantIds to soft-delete',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  @Type(() => Number)
  productVariantIds: number[];
}

// ─── Response ────────────────────────────────────────────────────────────────

export class DeleteMerchantProductResponseDto {
  @ApiProperty({
    description: 'Total number of products requested for deletion',
    example: 3,
  })
  totalRequested: number;

  @ApiProperty({
    description: 'Number of products successfully deleted',
    example: 3,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of products that failed to delete',
    example: 0,
  })
  failedCount: number;
}
