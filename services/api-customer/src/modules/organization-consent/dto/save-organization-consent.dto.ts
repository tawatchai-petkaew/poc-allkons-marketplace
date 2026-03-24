import {
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { number } from 'zod';

export class SaveOrganizationConsentDto {
  @ApiProperty({
    description: 'Organization Id of the user',
    example: 1,
    type: number,
  })
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;

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
