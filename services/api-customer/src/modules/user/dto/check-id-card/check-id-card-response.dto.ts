import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../model/user.entity';

export class CheckIdCardResponseDto {
  @ApiProperty({
    description: 'Whether the ID card is already registered',
    example: true
  })
  isRegistered: boolean;

  @ApiProperty({
    description: 'ID card number that was checked',
    example: '1234567890123'
  })
  idCard: string;

  @ApiProperty({
    description: 'Phone number associated with this ID card (if registered)',
    example: '0891234567',
    required: false
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Registration status message',
    example: 'ID card is already registered in the system'
  })
  message: string;

  static fromUser(user: User | null, idCard: string): CheckIdCardResponseDto {
    if (user) {
      return {
        isRegistered: true,
        idCard: idCard,
        phoneNumber: user.tel,
        message: 'ID card is already registered in the system'
      };
    } else {
      return {
        isRegistered: false,
        idCard: idCard,
        message: 'ID card is not registered in the system'
      };
    }
  }
}
