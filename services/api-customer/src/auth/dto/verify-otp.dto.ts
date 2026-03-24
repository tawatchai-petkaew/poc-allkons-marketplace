import { IsNotEmpty } from 'class-validator';

export class VerifyOTPDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  pin: string;
}
