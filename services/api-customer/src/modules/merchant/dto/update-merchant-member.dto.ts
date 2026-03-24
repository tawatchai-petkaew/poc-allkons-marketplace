import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateMerchantMemberDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  userUuid: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  roleId: number;
}
