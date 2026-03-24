import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
