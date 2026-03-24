import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendChangeEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
