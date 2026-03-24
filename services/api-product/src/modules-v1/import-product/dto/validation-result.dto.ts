import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ValidationColumnDto {
  @IsNumber()
  columnNo: number;

  @IsString()
  key: string;

  @IsOptional()
  value: any;

  @IsBoolean()
  isValid: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  errors: string[];
}

export class ValidationRowDto {
  @IsNumber()
  rowNo: number;

  @IsBoolean()
  @IsOptional()
  isValid?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationColumnDto)
  columns: ValidationColumnDto[];
}

export class ValidationSheetDto {
  @IsNumber()
  sheetNo: number;

  @IsString()
  sheetName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationRowDto)
  rows: ValidationRowDto[];
}

export class ValidationResultStatsDto {
  @IsNumber()
  all: number;

  @IsNumber()
  pass: number;

  @IsNumber()
  fail: number;
}

export class ValidationResultDataDto {
  @ValidateNested()
  @Type(() => ValidationResultStatsDto)
  result: ValidationResultStatsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationSheetDto)
  dataSheets: ValidationSheetDto[];
}
