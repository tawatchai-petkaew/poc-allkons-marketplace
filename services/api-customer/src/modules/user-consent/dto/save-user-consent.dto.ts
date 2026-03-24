import {
  IsString,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveUserConsentDto {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '0891234567',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Array of consent message IDs that user accepts',
    example: [1, 2],
    type: [Number],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  consentIds: number[];

  @ApiProperty({
    description: 'Array of consent message IDs that user accepts',
    example: [1, 2],
    type: [Number],
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  akIdConsentIds?: string[];

  @ApiProperty({
    description: 'tokenAllkonsId from Allkons system',
    example: 'some-token-id',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  tokenAllkonsId?: string;
}
