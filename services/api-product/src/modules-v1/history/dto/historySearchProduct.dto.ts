import { HistorySearchProductType } from '@/model/enum/historySearchProduct.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class HistorySearchProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  keyword: string;

  @ApiProperty({ enum: HistorySearchProductType })
  type: HistorySearchProductType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class addHistorySearchProductDto {
  @ApiProperty({ example: 'ค้นหาสินค้า' })
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @ApiProperty({
    enum: HistorySearchProductType,
    example: HistorySearchProductType.SEARCH,
  })
  @IsNotEmpty()
  @IsEnum(HistorySearchProductType)
  type: HistorySearchProductType;
}

export class deleteHistorySearchProductByIdDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;
}
