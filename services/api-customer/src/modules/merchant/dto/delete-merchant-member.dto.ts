import { UuidParamDto } from '@/modules/organization/dto/uuid-params.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeleteMerchantMemberDto extends UuidParamDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
}
