import {
  ConsentType,
  ConsentLanguage,
} from '../../../model/consent-message.entity';

export class ConsentMessageResponseDto {
  id: number;
  type: ConsentType;
  version: string;
  language: ConsentLanguage;
  content: string;
  createdAt: Date;
  akIdConsentId?: string;
  subject?: string;
  
  constructor(data: Partial<ConsentMessageResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: any): ConsentMessageResponseDto {
    return new ConsentMessageResponseDto({
      id: entity.id,
      type: entity.consentType,
      version: entity.version,
      language: entity.language,
      content: entity.content,
      createdAt: entity.createdAt,
      akIdConsentId: entity.akIdConsentId,
      subject: entity.subject,
    });
  }

  static fromEntityArray(entities: any[]): ConsentMessageResponseDto[] {
    return entities.map((entity) =>
      ConsentMessageResponseDto.fromEntity(entity),
    );
  }
}
