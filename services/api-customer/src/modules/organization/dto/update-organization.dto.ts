import { RoleBusinessType } from "@/modules/register/enum/register.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty } from "class-validator";

export class UpdateBusinessTypeDto {
  @ApiProperty({
    description: 'Business type to update',
    example: ['AGENT'],
    enum: RoleBusinessType,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(RoleBusinessType, { each: true })
  businessType: string[];
}