import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionAction, PermissionResource, PermissionGroup } from '../../../model/permissions.entity';

export class FilterPermissionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(PermissionResource)
  resource?: PermissionResource;

  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction;

  @IsOptional()
  @IsEnum(PermissionGroup)
  group?: PermissionGroup;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionTh?: string;

  @IsOptional()
  @IsString()
  groupNameTh?: string;
}
