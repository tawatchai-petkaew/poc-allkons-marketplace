import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO for basic organization information
 */
export class OrganizationBaseDto {
  @ApiProperty({
    description: 'Organization ID',
    example: 123,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Organization name',
    example: 'ABC Company Limited',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Organization type',
    example: 'JURISTIC',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'CIS number from CIS system',
    example: '6e17b7c8-fa57-4ed9-9f5c-e2c54c04140f',
  })
  @Expose()
  cisNumber: string;

  @ApiProperty({
    description: 'Organization creation timestamp',
    example: '2024-10-22T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;
}

/**
 * Response DTO for successful organization creation
 */
export class CreateOrganizationResponseDto {
  @ApiProperty({
    description: 'Organization information',
    type: OrganizationBaseDto,
  })
  @Expose()
  @Type(() => OrganizationBaseDto)
  organization: OrganizationBaseDto;

  @ApiProperty({
    description: 'User ID who created the organization',
    example: 456,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: 'Role ID assigned to the user in organization',
    example: 1,
  })
  @Expose()
  roleId: number;

  /**
   * Factory method for response from organization
   */
  static from(data: {
    organization: any;
    userId: number;
    roleId: number;
  }): CreateOrganizationResponseDto {
    const response = new CreateOrganizationResponseDto();
    
    const orgBase = new OrganizationBaseDto();
    orgBase.id = data.organization.id;
    orgBase.name = data.organization.organizeName || data.organization.name;
    orgBase.type = data.organization.organizeType || data.organization.type;
    orgBase.cisNumber = data.organization.cisNumber;
    orgBase.createdAt = data.organization.createdAt;
    
    response.organization = orgBase;
    response.userId = data.userId;
    response.roleId = data.roleId;
    
    return response;
  }
}
