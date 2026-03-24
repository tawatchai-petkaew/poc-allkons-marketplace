import { JuristicTypeCIS } from "@/modules/cis/enum/cis.enum";
import { RoleBusinessType } from "@/modules/register/enum/register.enum";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf } from "class-validator";

export class CreateUserOrganizeDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsBoolean()
  acceptTerms: boolean;

  @IsEnum(JuristicTypeCIS, { message: 'Juristic type must be one of the defined types' })
  @IsString()
  @IsNotEmpty()
  juristicType: number;

  @IsString()
  @IsNotEmpty()
  juristicName: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsNotEmpty()
  @IsEnum(RoleBusinessType, { each: true, message: 'Each businessType must be a valid RoleBusinessType' })
  businessType: string[];

  @ValidateIf(o => o.juristicType === "OTHER")
  @IsString()
  @IsNotEmpty({ message: 'remarkTypeOther is required when juristicType is OTHER' })
  remarkTypeOther?: string;

  @IsNumber()
  juristicTypeId?: number;
}