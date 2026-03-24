import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ResendInvitationDto {
  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Confirm sending invitation despite duplicate checks',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  confirmInvite?: boolean;
}
