import { ApiProperty } from '@nestjs/swagger';

export class SavedConsentDto {
  @ApiProperty({
    description: 'Type of consent',
    example: 'privacy_policy'
  })
  type: string;

  @ApiProperty({
    description: 'Version of consent',
    example: 'v2.0'
  })
  version: string;

  @ApiProperty({
    description: 'Timestamp when consent was accepted',
    example: '2025-06-11T09:10:00Z'
  })
  updated_at: string;
}

export class SaveOrganizationConsentResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Organization consent saved successfully'
  })
  message: string

  @ApiProperty({
    description: 'status',
    type: String
  })
  status: string;

  static create(status: string): SaveOrganizationConsentResponseDto {
    return {
      message: 'Organization consent saved successfully',
      status
    };
  }
}
