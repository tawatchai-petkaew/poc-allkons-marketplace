import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

export class MerchantInfoDto {
  @ApiProperty({ example: 1, description: 'Merchant ID' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  merchantId: number;

  @ApiProperty({ example: 2, description: 'Role ID for this merchant' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  roleId: number;
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the invitee' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the invitee' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the invitee' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName: string;

  @ApiPropertyOptional({ example: '+66', description: 'Country code' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  countryCode: string;

  @ApiProperty({ example: '+66812345678', description: 'Phone number of the invitee' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phoneNumber: string;

  @ApiProperty({ example: 1, description: 'Role ID to assign to the invitee' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  roleId: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', description: 'Invitation expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: true, description: 'Add user to white list', default: false })
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  addInWhiteList: boolean;

  @ApiPropertyOptional({ 
    example: [{ merchantId: 1, roleId: 2 }], 
    description: 'Merchant information associated with the invitation',
    type: [MerchantInfoDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MerchantInfoDto)
  merchantInfo: MerchantInfoDto[];

  @ApiPropertyOptional({ example: true, description: 'Confirm sending invitation despite duplicate checks' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  confirmInvite?: boolean; // to confirm duplicate checks
}

export class UpdateInvitationStatusDto {
  @ApiProperty({ 
    enum: UserOrganizationInviteStatus, 
    example: UserOrganizationInviteStatus.ACCEPTED,
    description: 'New status of the invitation'
  })
  @IsEnum(UserOrganizationInviteStatus)
  status: UserOrganizationInviteStatus;
}