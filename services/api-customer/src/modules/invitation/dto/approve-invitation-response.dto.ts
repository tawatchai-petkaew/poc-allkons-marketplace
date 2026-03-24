import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';

export class ApproveInvitationResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Invitation approved and email sent successfully'
  })
  successMessage: string;

  @ApiProperty({
    description: 'New status of the invitation',
    enum: UserOrganizationInviteStatus,
    example: UserOrganizationInviteStatus.SENT
  })
  status: UserOrganizationInviteStatus;

  @ApiProperty({
    description: 'Organization ID that was linked',
    example: 456
  })
  organizationId: number;

  @ApiProperty({
    description: 'Email address that the invitation was sent to',
    example: 'user@example.com'
  })
  emailSentTo: string;
}