import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConsentLanguage,
  ConsentMessage,
  ConsentType,
} from '../../model/consent-message.entity';

@Injectable()
export class ConsentMessageService {
  constructor(
    @InjectRepository(ConsentMessage)
    private readonly consentMessageRepository: Repository<ConsentMessage>,
  ) {}

  /**
   * Finds a consent message by type and optional version or latest flag.
   * @param type - The type of consent message to find.
   * @param version - Optional specific version of the consent message.
   * @param latest - Optional flag to get the latest version.
   * @param language - The language of the consent message (default is TH).
   * @returns The found consent message.
   * @throws BadRequestException if both version and latest are provided.
   * @throws NotFoundException if no consent message is found.
   */
  async findByTypeAndOptions(
    types: ConsentType[],
    version?: string,
    language: ConsentLanguage = ConsentLanguage.TH,
  ): Promise<ConsentMessage | ConsentMessage[]> {
    const query = this.consentMessageRepository
      .createQueryBuilder('cm')
      .where('cm.consentType IN (:...types)', { types })
      .andWhere('cm.language = :language', { language })
      .orderBy({
        'cm.consentType': 'ASC',
        'cm.createdAt': 'DESC',
      })
      .distinctOn(['cm.consentType']);

    if (version) {
      query.andWhere('cm.version = :version', { version });
    }

    const result = await query.getMany();

    if (!result || result.length === 0) {
      throw new NotFoundException('Consent message not found');
    }

    return result.length === 1 ? result[0] : result;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'sync-consent-message' })
  async syncConsentMessage() {
    if (
      !process.env.ALLKONS_ID_API_URL ||
      !process.env.CONSENT_MESSAGE_APP_ID ||
      !process.env.CONSENT_TYPE
    ) {
      console.log('Sync consent message failed: missing environment variables');
      return;
    }
    console.log('Syncing consent message');
    try {
      const response = await fetch(
        `${process.env.ALLKONS_ID_API_URL}/consent/consent-by-app`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: process.env.CONSENT_MESSAGE_APP_ID,
            consentType: process.env.CONSENT_TYPE,
          }),
        },
      );
      const data = await response.json();
      const consentDocuments = data.consentDocument;

      if (!data || consentDocuments.length === 0) {
        console.log('No consent document found from Consent Center. Aborting');
        return;
      }

      const currentConsentMessages = await this.findByTypeAndOptions([
        ConsentType.PRIVACY_POLICY,
        ConsentType.TERMS_OF_SERVICE,
        ConsentType.MARKETING_CONSENT,
      ]);

      const newConsentMessages = [];

      if (Array.isArray(currentConsentMessages)) {
        consentDocuments.forEach((consentDocument) => {
          const consentType = this.documentNameToConsentType(
            consentDocument.consentMasterDocumentName,
          );
          const consentMessage = currentConsentMessages.find(
            (cm) =>
              cm.consentType === consentType &&
              cm.version !== `v${consentDocument.version}`,
          );
          if (consentMessage) {
            newConsentMessages.push({
              consentType,
              version: `v${consentDocument.version}`,
              language: 'th',
              content: consentDocument.documentDetail,
              subject: consentDocument.documentSubject,
              akIdConsentId: consentDocument.consentDocumentId,
            });
          }
        });
      }

      if (newConsentMessages.length === 0) {
        console.log('No new consent message. Aborting');
        return;
      }

      await this.consentMessageRepository.save(newConsentMessages);
      console.log('Sync consent message success');
    } catch (error) {
      console.log('Sync consent message failed', error);
    }
  }

  private documentNameToConsentType(documentName: string): ConsentType {
    switch (documentName) {
      case 'นโยบายความเป็นส่วนตัว Allkons':
        return ConsentType.PRIVACY_POLICY;
      case 'เงื่อนไขการให้บริการ Allkons':
        return ConsentType.TERMS_OF_SERVICE;
      case 'นโยบายทางการตลาด Allkons':
        return ConsentType.MARKETING_CONSENT;
      default:
        break;
    }
  }
}
