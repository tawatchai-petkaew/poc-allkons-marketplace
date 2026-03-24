import { ApiProperty } from '@nestjs/swagger';
import {
  PaginationMeta,
  ApiPaginatedResponse,
} from '@/utils/dto/pagination.dto';

export class MerchantDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  merchantName: string;

  @ApiProperty()
  merchantBranchCode: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StoreDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  storeBranchName: string;

  @ApiProperty()
  storeBranchCode?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [MerchantDto] })
  merchants?: MerchantDto[];
}

export class GetOrganizationStoresResponseDto extends ApiPaginatedResponse<StoreDto> {
  public static fromStores(
    stores: any[],
    total: number,
    page: number,
    limit: number,
  ): GetOrganizationStoresResponseDto {
    const storeDtos = stores.map((store) => ({
      id: store.id,
      storeBranchName: store.storeBranchName,
      storeBranchCode: store.storeBranchCode,
      customerProfileType: store.customerProfileType,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      merchants:
        store.merchants?.map((merchant) => ({
          id: merchant.id,
          merchantName: merchant.merchantName,
          merchantBranchCode: merchant.merchantBranchCode,
        })) || [],
    }));

    return Object.assign(
      new GetOrganizationStoresResponseDto(
        storeDtos,
        page,
        limit,
        total,
        'Organization stores retrieved successfully',
      ),
      {
        data: {
          items: storeDtos,
          pagination: new PaginationMeta(page, limit, total),
        },
      },
    );
  }
}