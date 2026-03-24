import { Type } from "class-transformer";
import { IsArray, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetTypeToPermanentDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'number',
    },
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => Number)
  fileIds: number[]
}