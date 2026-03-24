import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchDto implements Readonly<SearchDto> {
  @IsOptional()
  pageSize?: number;

  @IsOptional()
  offset?: number;

  @IsOptional()
  pageToken?: string;

  @IsOptional()
  filter?: string;

  @IsOptional()
  visitorId?: string;

  @IsNotEmpty()
  query: string;
}