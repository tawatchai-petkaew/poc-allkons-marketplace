import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Response DTOs ───────────────────────────────────────────────────────────

export class CoverImageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;
}

export class MerchantImageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  order: number;
}

export class UpdateMerchantProductImagesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional({ type: CoverImageResponseDto, nullable: true })
  coverImage: CoverImageResponseDto | null;

  @ApiProperty({ type: [MerchantImageResponseDto] })
  merchantImages: MerchantImageResponseDto[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const MAX_MERCHANT_IMAGES = 4;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const S3_MERCHANT_IMAGE_FOLDER = 'allkons_m/merchant-product-images';

