import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MerchantSlugParamDto {
  @ApiProperty({
    description: 'Merchant slug (unique identifier)',
    example: 'my-shop',
    minLength: 3,
    maxLength: 63,
    pattern: '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
  })
  @IsNotEmpty({ message: 'Merchant slug is required' })
  @IsString({ message: 'Merchant slug must be a string' })
  @MinLength(3, { message: 'Merchant slug must be at least 3 characters' })
  @MaxLength(63, { message: 'Merchant slug must not exceed 63 characters' })
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message: 'Merchant slug must start and end with lowercase letter or number, and can only contain lowercase letters, numbers, and hyphens (no consecutive hyphens)',
  })
  slug: string;
}
