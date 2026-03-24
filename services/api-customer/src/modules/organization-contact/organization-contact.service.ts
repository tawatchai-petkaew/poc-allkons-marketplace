import { OrganizationContact } from '@/model/organization-contact.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationContact } from './interface/create-contact.interface';

@Injectable()
export class OrganizationContactService {

  constructor(
    @InjectRepository(OrganizationContact)
    private readonly organizationContactRepository: Repository<OrganizationContact>,
  ) { }

  /**
   * Create a new organization contact
   * @param dto Data transfer object containing contact details
   * @returns Promise resolving to the created OrganizationContact entity
   */
  public async createOrganizationContact(dto: CreateOrganizationContact): Promise<OrganizationContact> {
    const organizationContact = new OrganizationContact();

    organizationContact.userId = dto.userId;
    organizationContact.platform = dto.platform;
    organizationContact.cisNumber = dto.cisNumber;
    organizationContact.contactType = dto.contactType;
    organizationContact.contact = dto.contact;
    organizationContact.usagePurposeType = dto.usagePurposeType;
    organizationContact.isVerify = dto.isVerify;
    organizationContact.isDefault = dto.isDefault;
    organizationContact.isKycDocument = dto.isKycDocument;
    organizationContact.activeStatus = dto.activeStatus ?? true;
    organizationContact.organizeId = dto.organizeId ?? null;
    organizationContact.organizeBranchId = dto.organizeBranchId ?? null;

    return await this.organizationContactRepository.save(organizationContact);
  }

  async deleteOrganizationContactByIds(ids: number[]) {
    return await this.organizationContactRepository.delete(ids);
  }

  async findOrganizationContactByUserId(userId: number) {
    return await this.organizationContactRepository.find({
      where: { userId },
    });
  }

  async findOrganizationContactByMerchantId(merchantId: number) {
    return await this.organizationContactRepository.find({
      where: { merchantId },
    });
  }

  async findOrganizationContactByStoreId(storeId: number) {
    return await this.organizationContactRepository.find({
      where: { storeId },
    });
  }

  async findOrganizationContactByOrgBranchId(organizeBranchId: number) {
    return await this.organizationContactRepository.find({
      where: { organizeBranchId },
    });
  }

  async findOrganizationContactByOrgId(organizeId: number) {
    return await this.organizationContactRepository.find({
      where: { organizeId },
    });
  }
}
