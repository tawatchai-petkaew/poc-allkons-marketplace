import { BasePaginatedResponseDto } from '@/utils/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/mapped-types';
import { UserDto } from '@/modules/user/dto/get-user-organizations-response.dto';
import { RoleResponseDto } from '@/modules/organization/response-dto/role-list.response.dto';

class UserMerchantDto extends PickType(UserDto, [
  'id',
  'uuid',
  'countryCode',
  'phoneNumber',
  'email',
  'firstNameTh',
  'middleNameTh',
  'lastNameTh',
  'firstNameEn',
  'middleNameEn',
  'lastNameEn',
] as const) {}

class RoleDto extends PickType(RoleResponseDto, [
  'id',
  'name',
  'displayName',
] as const) {}

/**
 * Merchant member data DTO
 */
export class MerchantMemberDto {
  @ApiProperty({ description: 'User information' })
  users: UserMerchantDto;

  @ApiProperty({ description: 'Role information' })
  role: RoleDto;

  @ApiProperty({ description: 'Last accessed timestamp' })
  lastAccessedAt: Date;

  @ApiProperty({ description: 'Member joined timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Member updated timestamp' })
  updatedAt: Date;
}

/**
 * Response DTO for merchant members list
 */
export class GetMerchantMembersResponseDto extends BasePaginatedResponseDto<MerchantMemberDto> {
  @ApiProperty({ description: 'Total members without filter' })
  allMembers?: number;
}
