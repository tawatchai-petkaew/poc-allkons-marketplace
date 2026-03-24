import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRoleInOrganizationDto {
  @ApiProperty({
    description: 'Role ID to assign to user',
    example: 1
  })
  @IsNumber()
  roleId: number;

  @ApiPropertyOptional({
    description: 'Whether user should be owner of organization',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
}

export class UpdateUserRoleResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Updated user organization data' })
  data: any;
}
