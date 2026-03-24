import { IsNotEmpty } from 'class-validator';

export class AuthLoginTelDto {
  @IsNotEmpty()
  tel: string;

  @IsNotEmpty()
  password: string;
}
