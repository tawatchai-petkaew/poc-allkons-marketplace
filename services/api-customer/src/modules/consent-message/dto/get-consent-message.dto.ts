import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ConsentType,
  ConsentLanguage,
} from '../../../model/consent-message.entity';

export class GetConsentMessageDto {
  @IsOptional()
  @IsEnum(ConsentType)
  type?: ConsentType;

  @IsOptional()
  @IsEnum(ConsentType, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        return value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim());
      }
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  types?: ConsentType[];

  @IsOptional()
  version?: string;

  @IsOptional()
  @IsEnum(ConsentLanguage)
  @Transform(({ value }) => value || ConsentLanguage.TH)
  language?: ConsentLanguage = ConsentLanguage.TH;
}
