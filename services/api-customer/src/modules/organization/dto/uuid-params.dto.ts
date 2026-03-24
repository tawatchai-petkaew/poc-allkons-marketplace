import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class UuidParamDto {
  @ApiProperty({ description: 'UUID' })
  @IsUUID()
  uuid: string;
}

export class OrganizationUuidParamDto {
  @ApiProperty({ description: 'Organization UUID' })
  @IsUUID()
  organizationUuid: string;
}

export class DraftOrganizeUuidParamDto {
  @ApiProperty({ description: 'Draft Organize UUID' })
  @IsUUID()
  draftOrganizeUuid: string;
}

export class DraftOrganizeInfoUuidParamDto {
  @ApiProperty({ description: 'Draft Organize Info UUID' })
  @IsUUID()
  draftOrganizeInfoUuid: string;
}

export class PhoneWhiteListByUuidParamsDto extends OrganizationUuidParamDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: 'Phone ID' })
  phoneId: number;
}

export class OrganizationUserUuidParamsDto extends OrganizationUuidParamDto {
  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  userUuid: string;
}
