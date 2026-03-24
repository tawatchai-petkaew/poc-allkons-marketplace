import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveOrganizationConsentDto } from './dto/save-organization-consent.dto';
import { SaveOrganizationConsentResponseDto } from './dto/save-organization-consent-response.dto';
import { ConsentMessage } from '@/model/consent-message.entity';
import { Organization } from '@/model/organization.entity';
import { OrganizationConsent } from '@/model/organization-consent.entity';
import { UserConsentService } from '../user-consent/user-consent.service';

@Injectable()
export class OrganizationConsentService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(OrganizationConsent)
    private readonly organizationConsentRepository: Repository<OrganizationConsent>,
    @InjectRepository(ConsentMessage)
    private readonly consentMessageRepository: Repository<ConsentMessage>,
    private readonly userConsentService: UserConsentService,
  ) {}

  async saveOrganizationConsent(saveUserConsentDto: SaveOrganizationConsentDto): Promise<SaveOrganizationConsentResponseDto> {
    const { organizationId, consentIds, akIdConsentIds, tokenAllkonsId } = saveUserConsentDto;

    if (!consentIds || consentIds.length === 0) {
      throw new BadRequestException('At least one consent ID is required');
    }

    // Validate organization id is exist
    const organization = await this.organizationRepo.findOne({ where: { id: organizationId } });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    // Validate consent message IDs exist
    const consentMessages = await this.consentMessageRepository.findByIds(consentIds);
    
    if (consentMessages.length !== consentIds.length) {
      const foundIds = consentMessages.map(cm => cm.id);
      const missingIds = consentIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Consent messages with IDs ${missingIds.join(', ')} not found`);
    }

    // Save user consents
    const savedConsents = [];
    const skippedConsents = [];
    
    for (const consentMessage of consentMessages) {
      // Check if consent already exists
      const existingConsent = await this.organizationConsentRepository.findOne({
        where: {
          organizeId: organizationId,
          consentMsgId: consentMessage.id
        }
      });

      if (!existingConsent) {
        const userConsent = this.organizationConsentRepository.create({
          organizeId: organization.id,
          consentMessage: consentMessage,
          updatedAt: new Date()
        });

        const saved = await this.organizationConsentRepository.save(userConsent);
        
        // Load with relations for response
        const savedWithRelations = await this.organizationConsentRepository.findOne({
          where: { id: saved.id },
          relations: ['consentMessage']
        });
        
        savedConsents.push(savedWithRelations);
      } else {
        // Keep track of skipped consents for logging
        skippedConsents.push(consentMessage.id);
      }
    }

    // Log if some consents were skipped
    if (skippedConsents.length > 0) {
      console.log(`User ${organization.id} already has consents for message IDs: ${skippedConsents.join(', ')}`);
    }
    if (tokenAllkonsId && akIdConsentIds?.length > 0) {
      await this.userConsentService.createUserConsentAllkonsId(
        akIdConsentIds,
        tokenAllkonsId,
      );
    }
    return SaveOrganizationConsentResponseDto.create('success');
  }

  async findOrganizationConsentByUserId(organizeId: number): Promise<OrganizationConsent[]> {
    const organizationConsents = await this.organizationConsentRepository.find({
      where: { organizeId },
    });
    return organizationConsents;
  }

  async findOrganizationConsentByOrgId(organizeId: number): Promise<OrganizationConsent[]> {
    const organizationConsents = await this.organizationConsentRepository.find({
      where: { organizeId },
    });
    return organizationConsents;
  }

  async deleteOrganizationConsentById(ids: number[]) {
    return await this.organizationConsentRepository.delete(ids);
  }
}
