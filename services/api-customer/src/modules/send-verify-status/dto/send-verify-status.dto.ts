import { KycStatusCIS } from '@/modules/cis/enum/cis.enum';
import { IsNotEmpty, IsString, Matches, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class SendVerifyStatusDto {
  @IsString()
  @IsNotEmpty()
  cisNumber: string;

  @IsNotEmpty()
  @IsEnum(KycStatusCIS)
  kycStatus: KycStatusCIS;

  @IsString()
  @IsOptional()
  reason?: string;
}
