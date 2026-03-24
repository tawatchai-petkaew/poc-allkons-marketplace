import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class InviteValidatePhoneUserInfoResponseDto {
  @ApiProperty({
    example: 1,
    description: 'user id',
  })
  @Expose()
  id?: number;

  @ApiProperty({
    example: 'ไลลา',
    description: 'first name',
  })
  @Expose()
  firstName?: string;

  @ApiProperty({
    example: 'ภูภักดี',
    description: 'last name',
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    example: 'test.mail@allkons.com',
    description: 'email',
  })
  @Expose()
  email?: string;

  @ApiProperty({
    example: '987776543',
    description: 'phone',
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    example: '66',
    description: 'phone country code',
  })
  @Expose()
  countryCode?: string;
}

export class InviteValidatePhoneResponseDto {
  @ApiProperty({
    example: false,
    description: 'สามารถเพิ่มเบอร์ในนามองค์กรได้',
  })
  @Expose()
  canAddToWhitelist: boolean;

  @ApiProperty({
    example: false,
    description: 'อยู่ใน whitelist องค์กรตนเอง',
  })
  @Expose()
  isInMyOrgWhitelist: boolean;

  @ApiProperty({
    example: false,
    description: 'อยู่ใน whitelist องค์กรอื่น',
  })
  @Expose()
  isInOtherWhitelist: boolean;

  @ApiProperty({
    example: false,
    description: 'user อยู่ในองค์กรตนเอง',
  })
  @Expose()
  isUserInMyOrg: boolean;

  @ApiProperty({
    example: false,
    description: 'user อยู่ในองค์กรอื่น',
  })
  @Expose()
  isUserInOtherOrg: boolean;

  @ApiProperty({
    example: false,
    description: 'มีการส่งคำเชิญอยู่',
  })
  @Expose()
  isInviting: boolean;

  @ApiProperty({
    type: InviteValidatePhoneUserInfoResponseDto,
    description: 'user info',
  })
  @Type(() => InviteValidatePhoneUserInfoResponseDto)
  @Expose()
  userInfo: InviteValidatePhoneUserInfoResponseDto | null;
}
