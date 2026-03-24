import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteInviteResponseDto {
  @ApiProperty({
    type: Boolean,
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    type: String,
    example: 'Invitation deleted successfully',
  })
  @Expose()
  message: string;
}
