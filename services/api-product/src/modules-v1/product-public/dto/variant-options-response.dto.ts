import { ApiProperty } from '@nestjs/swagger';

class VariantOptionDto {
  @ApiProperty()
  dimensionId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  values: string[];
}

export class VariantOptionsResponseDto {
  @ApiProperty({ type: [VariantOptionDto] })
  variantOptions: VariantOptionDto[];
}
