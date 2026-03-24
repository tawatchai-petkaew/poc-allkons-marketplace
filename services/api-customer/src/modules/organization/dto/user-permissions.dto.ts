import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionDto {
  @ApiProperty({
    description: 'Permission ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Permission code',
    example: 'ORG_READ'
  })
  code: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'Organization Read'
  })
  name: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows reading organization data'
  })
  description?: string;

  @ApiProperty({
    description: 'Permission action',
    example: 'READ'
  })
  action: string;

  @ApiProperty({
    description: 'Permission resource',
    example: 'ORGANIZATION'
  })
  resource: string;
}

export class UserRoleDto {
  @ApiProperty({
    description: 'Role ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN'
  })
  name: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Administrator'
  })
  displayName: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Full access to organization'
  })
  description?: string;

  @ApiProperty({
    description: 'Whether role is active',
    example: true
  })
  isActive: boolean;
}

export class UserOrganizationPermissionsResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 123
  })
  userId: number;

  @ApiProperty({
    description: 'Organization ID',
    example: 456
  })
  organizationId: number;

  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corporation'
  })
  organizationName: string;

  @ApiProperty({
    description: 'Whether user is owner of the organization',
    example: false
  })
  isOwner: boolean;

  @ApiProperty({
    description: 'User role in the organization',
    type: UserRoleDto,
    nullable: true
  })
  role: UserRoleDto | null;

  @ApiProperty({
    description: 'List of permissions user has in the organization',
    type: [UserPermissionDto]
  })
  permissions: UserPermissionDto[];

  @ApiProperty({
    description: 'List of permission codes for easy checking',
    type: [String],
    example: ['ORG_READ', 'ORG_WRITE', 'ORG_MANAGE']
  })
  permissionCodes: string[];

  @ApiProperty({
    description: 'Timestamp when permissions were retrieved',
    example: '2025-08-20T17:41:03.000Z'
  })
  retrievedAt: Date;
}

export class CheckPermissionDto {
  @ApiProperty({
    description: 'Permission code to check',
    example: 'ORG_ADMIN'
  })
  permissionCode: string;

  @ApiProperty({
    description: 'Organization ID to check permission for',
    example: 456
  })
  organizationId: number;
}

export class CheckPermissionResponseDto {
  @ApiProperty({
    description: 'Whether user has the permission',
    example: true
  })
  hasPermission: boolean;

  @ApiProperty({
    description: 'Permission code that was checked',
    example: 'ORG_ADMIN'
  })
  permissionCode: string;

  @ApiProperty({
    description: 'Organization ID that was checked',
    example: 456
  })
  organizationId: number;

  @ApiProperty({
    description: 'User ID',
    example: 123
  })
  userId: number;
}
