import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { MasterDataType } from '../enum/cis.enum';

export class MasterDataRequestDto {
  @ApiProperty({
    description: 'Master code for getting master data',
    example: 'JURISTIC_TYPE',
    enum: MasterDataType
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(MasterDataType, {
    message: 'masterCode must be one of the following values: BANK_ACCOUNT_TYPE, COUNTRY, PROVINCE, DISTRICT, SUB_DISTRICT, ZIPCODE, DOCUMENT_TYPE, JURISTIC_TYPE, PLATFORM, ROLE_BUSINESS, NATURE_BUSINESS'
  })
  masterCode: string;
}