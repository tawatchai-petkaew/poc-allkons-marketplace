import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum DnsRecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
  TXT = 'TXT',
}
export class CreateSubdomainDto {
  @IsString()
  subdomain: string;

  @IsOptional()
  @IsEnum(DnsRecordType)
  type: DnsRecordType = DnsRecordType.CNAME;

  @IsOptional()
  @IsString()
  content: string = 'allkons.com'; // IP address หรือ domain name

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(86400)
  ttl?: number = 1; // Auto = 1

  @IsOptional()
  @IsBoolean()
  proxied?: boolean = false;

  @IsOptional()
  @IsNumber()
  priority?: number = 10; // สำหรับ MX records
}
