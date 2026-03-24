import { User } from "@/model/user.entity";
import { ApiProperty } from "@nestjs/swagger";
export class responseRegisterDto {
  @ApiProperty({
    description: 'Status of the registration',
    example: 'SUCCESS'
  })
  isSuccess: string;

  @ApiProperty({
    description: 'Phone number used for registration',
    example: '886924070'
  })
  phoneNumber: string;

    @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGc...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGc...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Refresh token expiration time in seconds',
    example: 2592000
  })
  refreshExpiresIn: number;

  @ApiProperty({
    description: 'ID token containing user information',
    example: 'eyJhbGc...'
  })
  idToken: string;

  @ApiProperty({
    description: 'Session state identifier',
    example: '605b87a1-bef6-4459-8fbc-17ac359a8f57'
  })
  sessionState: string;

  @ApiProperty({
    description: 'OAuth scope',
    example: 'openid profile phone'
  })
  scope: string;
}

export class responseCreatePersonalDto {
  @ApiProperty({
    description: 'Username of the registered user',
    example: 'P0987564732'
  })
  username: string;
}

export class ResponseRegisterUserDto {
  id: number;
  countryCode: string;
  phoneNumber: string;
  email: string;
  name: string;
  firstNameTh: string;
  lastNameTh: string;
  middleNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  middleNameEn: string;
  kycStatus: string;
  createdInAuth: Date;
  registerStatus: string;
  registerStep: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  cisNumber: string;

  public static fromUserData(userData: User): ResponseRegisterUserDto {
    const dto = new ResponseRegisterUserDto();
    dto.id = userData.id;
    dto.countryCode = userData.countryCode;
    dto.phoneNumber = userData.tel;
    dto.email = userData.email;
    dto.name = userData.name;
    dto.firstNameTh = userData.firstNameTh;
    dto.lastNameTh = userData.lastNameTh;
    dto.middleNameTh = userData.middleNameTh;
    dto.firstNameEn = userData.firstNameEn;
    dto.lastNameEn = userData.lastNameEn;
    dto.middleNameEn = userData.middleNameEn;
    dto.kycStatus = userData.kycStatus;
    dto.createdInAuth = userData.createdInAuth;
    dto.registerStatus = userData.registerStatus;
    dto.registerStep = userData.registerStep;
    dto.username = userData.username;
    dto.cisNumber = userData.cisNumber;
    dto.createdAt = userData.createdAt;
    dto.updatedAt = userData.updatedAt;

    return dto;
  }
}