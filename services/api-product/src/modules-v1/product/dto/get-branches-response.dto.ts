import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  subdistrict: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  postcode: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  isCurrent: boolean;
}

export class ProductBranchResponseDto {
  @ApiProperty()
  sku: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty({ nullable: true })
  specialPrice: number;

  @ApiProperty({ nullable: true })
  image: string;
}

export class GetBranchesResponseDto {
  @ApiProperty({ type: BranchResponseDto })
  merchant: BranchResponseDto;

  @ApiProperty({ type: ProductBranchResponseDto })
  product: ProductBranchResponseDto;
}

export class GetBranchesListResponseDto {
  @ApiProperty({ type: [GetBranchesResponseDto] })
  data: GetBranchesResponseDto[];
}
