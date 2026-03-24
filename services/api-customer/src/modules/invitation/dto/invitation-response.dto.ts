import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Invitation accepted successfully'
  })
  message: string;

  @ApiProperty({
    description: 'New status of the invitation',
    enum: UserOrganizationInviteStatus,
    example: UserOrganizationInviteStatus.ACCEPTED
  })
  status: UserOrganizationInviteStatus;

  @ApiProperty({
    description: 'User ID that was linked (if applicable)',
    example: 123,
    required: false
  })
  userId?: number;

  @ApiProperty({
    description: 'Organization ID that was linked',
    example: 456
  })
  organizationId: number;
}