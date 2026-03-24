import { IsNotEmpty, IsOptional } from 'class-validator';

export class PredictDto implements Readonly<PredictDto> {
  @IsNotEmpty()
  servingConfigsId: string;

  @IsNotEmpty()
  userEvent: any;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  pageToken?: string;

  @IsOptional()
  filter?: string;

  @IsOptional()
  validateOnly?: boolean;

  @IsOptional()
  params?: any;

  @IsOptional()
  labels?: any;
}