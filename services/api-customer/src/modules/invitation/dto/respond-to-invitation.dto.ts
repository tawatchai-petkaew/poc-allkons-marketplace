import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString ,IsOptional} from 'class-validator';
import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from '@/model/enum/user-organization.enum';

export class ApproveInvitationDto {
  @ApiProperty({
  description: 'Reference code of the invitation',
    example: 'INV-ABC12345'
  })
  @IsString()
  @IsNotEmpty()
  refCode: string;

  @ApiProperty({
    description: 'Decision to approve or reject the invitation',
    example: 'APPROVE',
    enum: UserOrganizationInviteStatusApprove,
  })
  @IsString()
    //@IsNotEmpty()
  @IsOptional()
  respond: string;
}

export class RespondToInvitationDto extends ApproveInvitationDto {
  @ApiProperty({
    description: 'Response to the invitation - accept or decline',
    enum: [UserOrganizationInviteStatus.ACCEPTED, UserOrganizationInviteStatus.DECLINED],
    example: UserOrganizationInviteStatus.ACCEPTED
  })
  @IsEnum([UserOrganizationInviteStatus.ACCEPTED, UserOrganizationInviteStatus.DECLINED])
  response: UserOrganizationInviteStatus.ACCEPTED | UserOrganizationInviteStatus.DECLINED;
}

export class GetInvitationByPhoneDto {
  @ApiProperty({
    description: 'Country code (e.g., +66)',
    example: '+66',
  })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({
    description: 'Phone number',
    example: '0812345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Filter by invitation status',
    enum: UserOrganizationInviteStatus,
    example: UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
  })
  @IsOptional()
  @IsEnum(UserOrganizationInviteStatus)
  status?: UserOrganizationInviteStatus;
}