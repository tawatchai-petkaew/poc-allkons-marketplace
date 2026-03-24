import { ApiProperty } from "@nestjs/swagger";

export class ResponseAuthCenter {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: string | number;

  @ApiProperty()
  refreshExpiresIn: string | number;
}

export class ResponseLoginDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  authCenter: ResponseAuthCenter;
}