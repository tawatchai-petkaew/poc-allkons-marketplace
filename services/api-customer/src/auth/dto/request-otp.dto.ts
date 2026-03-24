import { IsNotEmpty, IsOptional } from 'class-validator';

export class RequestOTPDto {
  @IsNotEmpty()
  tel: string;

  @IsOptional()
  countryCode: string;
}
