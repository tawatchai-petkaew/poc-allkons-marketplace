import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  // รูปแบบ E.164 (ไม่มีเครื่องหมาย +) เช่น ไทย: 6681xxxxxxx
  @Matches(/^[1-9]\d{7,14}$/, {
    message: 'phoneNumber ต้องเป็นรูปแบบ E.164 โดยไม่มีเครื่องหมาย +',
  })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsString()
  sender?: string;
}
