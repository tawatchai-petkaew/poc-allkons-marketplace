import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';

export class GetOrganizationUsersQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search by user name, email, or phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by role ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;

  @ApiProperty({
    description: 'Filter by owner status',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isOwner?: boolean;

  @ApiProperty({
    description: 'Filter by user organization status',
    enum: UserOrganizationInviteStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserOrganizationInviteStatus)
  membershipStatus?: UserOrganizationInviteStatus;

  @ApiProperty({
    description: 'Filter by user organization status',
    enum: UserOrganizationInviteStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserOrganizationInviteStatus)
  inviteStatus?: UserOrganizationInviteStatus;

  @ApiProperty({
    description:
      'Filter by user organization invite status (can accept multiple values)',
    enum: UserOrganizationInviteStatus,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserOrganizationInviteStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  inviteMultipleStatus?: UserOrganizationInviteStatus[];
}

class InvitedByUser {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstNameTh: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastNameTh: string;
}

export class OrganizationUserDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid?: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+66812345678',
  })
  phone: string;

  @ApiProperty({
    description: 'User role ID in organization',
    example: 1,
  })
  roleId: number;

  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
  })
  roleName: string;

  @ApiProperty({
    description: 'Is user owner of organization',
    example: false,
  })
  isOwner: boolean;

  @ApiProperty({
    description: 'User organization membership status',
    enum: UserOrganizationInviteStatus,
    example: UserOrganizationInviteStatus.ACCEPTED,
  })
  membershipStatus: UserOrganizationInviteStatus;

  @ApiProperty({
    description: 'User account creation date',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Is user invited and pending acceptance',
    example: 'INV-ABCD1234',
  })
  refCode: string;

  @ApiProperty({
    description: ' InvitedByUser',
  })
  invitedByUser?: InvitedByUser;

  @ApiProperty({
    description: 'Invitation link',
    example: 'http://localhost:30000/invite-organize?refcode=INV-53730B9B',
  })
  invitationLink?: string | null;

  @ApiProperty({
    description: 'organizeName',
    example: 'My Organization',
  })
  organizeName?: string | null;
}

export class OrganizationUsersResponseDto {
  @ApiProperty({
    description: 'List of users in organization',
    type: [OrganizationUserDto],
  })
  users: OrganizationUserDto[];

  @ApiProperty({
    description: 'Total number of filtered users',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of all users in organization (without filters)',
    example: 100,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}
