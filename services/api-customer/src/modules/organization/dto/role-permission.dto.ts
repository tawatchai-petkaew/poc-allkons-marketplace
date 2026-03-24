import { PermissionAction, PermissionGroup, PermissionResource } from '@/model/permissions.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RolePermissionDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  @ApiProperty()
  displayName: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  roleId?: number;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  permissions: number[];
}

export class PermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  descriptionTh: string;

  @ApiProperty({ enum: PermissionResource })
  resource: PermissionResource;

  @ApiProperty({ enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty({ enum: PermissionGroup })
  group: PermissionGroup;

  @ApiProperty()
  groupNameTh: string;

  @ApiProperty({ description: 'Whether this permission is assigned to the role' })
  isSelected: boolean;
}

export class GroupedPermissionDto {
  @ApiProperty({ enum: PermissionGroup })
  group: PermissionGroup;

  @ApiProperty()
  groupNameTh: string;

  @ApiProperty({ type: [PermissionDto] })
  permissions: PermissionDto[];
}

export class RolePermissionsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty({ type: [GroupedPermissionDto], description: 'Permissions grouped by category' })
  permissionGroups: GroupedPermissionDto[];
}

export class GetRolePermissionsQueryDto {
  @ApiProperty({ required: false })
  roleId?: number;

  @ApiProperty({ required: false })
  includeInactive?: boolean;
}

export class RolePermissionsResponseDto {
  @ApiProperty({ type: [RolePermissionsDto] })
  roles: RolePermissionsDto[];

  @ApiProperty()
  total: number;
}

export class SingleRolePermissionsResponseDto {
  @ApiProperty({ type: RolePermissionsDto })
  role: RolePermissionsDto;
}