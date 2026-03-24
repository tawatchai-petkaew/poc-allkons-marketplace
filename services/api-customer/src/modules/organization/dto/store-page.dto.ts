import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class GetStorePageDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  limit: number = 10;
}