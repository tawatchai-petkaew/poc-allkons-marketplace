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
  accepted_at: string;
}

export class SaveUserConsentResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User consent saved successfully'
  })
  message: string;

  @ApiProperty({
    description: 'List of saved consents',
    type: [SavedConsentDto]
  })
  saved: SavedConsentDto[];

  static create(savedConsents: any[]): SaveUserConsentResponseDto {
    return {
      message: 'User consent saved successfully',
      saved: savedConsents.map(consent => ({
        type: consent.consentMessage.consentType,
        version: consent.consentMessage.version,
        accepted_at: consent.acceptedAt.toISOString()
      }))
    };
  }
}
