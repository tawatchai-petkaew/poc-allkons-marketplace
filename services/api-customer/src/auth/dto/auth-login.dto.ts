import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class AuthLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  adminId: number | string;
}
