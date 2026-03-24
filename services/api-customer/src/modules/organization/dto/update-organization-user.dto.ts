import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email: string;
}

export class UpdateOrganizationUserResponseDto {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    updatedAt: Date;
  };
}
