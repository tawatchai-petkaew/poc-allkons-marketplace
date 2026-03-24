import { IsOptional, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  registrationToken: string;

  @IsNotEmpty()
  refreshToken: string;
}
