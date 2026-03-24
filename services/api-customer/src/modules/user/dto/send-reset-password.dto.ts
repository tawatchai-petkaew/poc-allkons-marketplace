import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
