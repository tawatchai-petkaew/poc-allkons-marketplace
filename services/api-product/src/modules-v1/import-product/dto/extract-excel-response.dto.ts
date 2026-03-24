import { ApiProperty } from '@nestjs/swagger';

export class DataColumnStatus {
  @ApiProperty()
  columnNo: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class DataRowStatus {
  @ApiProperty()
  rowNo: number;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ type: [DataColumnStatus] })
  columns: DataColumnStatus[];
}

export class DataSheet {
  @ApiProperty()
  sheetNo: number;

  @ApiProperty()
  sheetName: string;

  @ApiProperty({ type: [DataRowStatus] })
  rows: DataRowStatus[];
}

export class ResultSummary {
  @ApiProperty()
  all: number;

  @ApiProperty()
  pass: number;

  @ApiProperty()
  fail: number;
}

export class ExtractExcelResponseDto {
  constructor(data?: Partial<ExtractExcelResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @ApiProperty({ type: ResultSummary })
  result: ResultSummary;

  @ApiProperty({
    required: false,
    description: 'UUID of the import batch for tracking',
  })
  batchUuid?: string;

  @ApiProperty({ required: false, description: 'Result Excel filename with validation' })
  resultFileName?: string;

  @ApiProperty({
    required: false,
    description: 'Presigned URL to download result Excel file',
  })
  resultFileUrl?: string;

  @ApiProperty({
    required: false,
    description: 'URL expiration time in seconds (7 days)',
  })
  expiresIn?: number;
}

// For backward compatibility
export type ExtractExcelResult = Pick<ExtractExcelResponseDto, 'result'>;
