import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  refno: string;
}

export class VerifyEmailOtpAuthCenterDto extends VerifyEmailDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class CheckEmailDto extends SendEmailDto {}