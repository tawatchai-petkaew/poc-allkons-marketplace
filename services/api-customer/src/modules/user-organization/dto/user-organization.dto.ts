import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import { RoleResponseDto } from '@/modules/organization/response-dto/role-list.response.dto';
import { UserDto } from '@/modules/user/dto/get-user-organizations-response.dto';
import { BasePaginatedResponseDto } from '@/utils/dto/pagination.dto';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

class UserOrganizationDto extends PickType(UserDto, [
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

export class UserOrganizationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  isOwner: boolean;

  @ApiProperty()
  isCreator: boolean;

  @ApiProperty()
  memberStatus: UserOrganizationInviteStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ description: 'User information' })
  users: UserOrganizationDto;

  @ApiProperty({ description: 'Role information' })
  role: RoleDto;
}

export class GetUserOrganizationsResponseDto extends BasePaginatedResponseDto<UserOrganizationResponseDto> {}
