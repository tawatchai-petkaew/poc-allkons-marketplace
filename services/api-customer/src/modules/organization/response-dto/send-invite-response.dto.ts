import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SendInviteResponseDto {
  @ApiProperty({
    type: Boolean,
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    type: String,
    example: 'User invited successfully',
  })
  @Expose()
  message: string;
}
