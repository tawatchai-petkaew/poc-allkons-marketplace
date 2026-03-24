import { DraftOrganize } from '@/model/draft-organize.entity';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import { RegisterStep } from '@/model/enum/user.enum';
import {
  JuristicType,
  JuristicTypeLanguage,
} from '@/model/juristic-type.entity';
import { Platform } from '@/model/organization-contact.entity';
import {
  LeaveStatus,
  OrganizationLeaveLog,
} from '@/model/organization-leave-log.entity';
import {
  Organization,
  OrganizationType,
  Type,
} from '@/model/organization.entity';
import { UserMerchant } from '@/model/user-merchant.entity';

import { Store } from '@/model/store.entity';
import { AddressTypeEnum } from '@/model/user-address.entity';
import { UserIdentityDocument } from '@/model/user-identity-document.entity';
import { kycStatus, User } from '@/model/user.entity';
import { CreateInvitationData } from '@/modules/invitation/interface/invitation.interface';
import { InvitationService } from '@/modules/invitation/invitation.service';
import { clearCacheByPattern } from '@/utils';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import {
  extractNumber,
  formatPhoneToCompactNational,
  isNonEmptyArray,
  isNonEmptyObj,
  maskPhoneNumber,
  removeOrganizationNamePrefixSuffix,
} from '@/utils/utils';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CisService } from '../cis/cis.service';
import {
  AddressTypeCis,
  CustomerProfileType,
  CustomerStatusCIS,
  DocumentAttachType,
  DocumentTypeCis,
  DocumentTypeCodeFromCis,
  JuristicTypeCIS,
  KycStatusCIS,
  OrganizeTypeCIS,
  PlatformCIS,
  RelationType,
  RoleBusinessTypeCIS,
  RoleCis,
} from '../cis/enum/cis.enum';
import {
  CreateCustomerAddressCis,
  DocumentAttachItem,
  UpdateJuristicProfileCis,
} from '../cis/interfaces/api-request.interface';
import { CisResponse } from '../cis/interfaces/api-response.interface';
import { CreateJuristicProfilePayload } from '../cis/interfaces/cis.interface';
import { CommonService } from '../common/common.service';
import { DbdService } from '../dbd/dbd.service';
import { PermissionService } from '../permission/permission.service';
import { PhoneWhiteListService } from '../phone-white-list/phone-white-list.service';
import {
  OrgIndividualDto,
  OrgTypeJuristicDto,
  OrgTypePersonalDto,
} from '../register/dto/create-register.dto';
import { RoleService } from '../role/role.service';
import { StoreService } from '../store/store.service';
import { UserAddressDto } from '../user-address/dto/user-address.dto';
import { UserAddressService } from '../user-address/user-address.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { GetUserOrganizationsResponseDto } from '../user/dto/get-user-organizations-response.dto';
import { DocumentType } from '../user/enum/file-type.enum';
import { UserService } from '../user/user.service';
import {
  AddressInfo,
  ContactInfo,
  OrgInfoJuristic,
  OrgInfoPersonal,
  OrgInfoRegisteredIndividual,
} from './dto/cis-data.dto';
import { CreateOrganizationResponseDto } from './dto/create-organization/create-organization-response.dto';
import {
  CreateOrganizationDto,
  JuristicOrganizationInfoDto,
  PersonalOrganizationInfoDto,
  RegisteredIndividualInfoDto,
} from './dto/create-organization/create-organization.dto';
import { CheckTaxIdResponseDto } from './dto/dbd.dto';
import {
  DraftOrganizeInfoDto,
  DraftOrganizeInfoResponseDto,
} from './dto/draft-organize-info.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import {
  UploadIdentityVerificationDto,
  VerificationDocument,
} from './dto/identity-verification/identity-verification.dto';
import { CreateInvitationDto } from './dto/invitation.dto';
import { InviteValidatePhoneDto } from './dto/invite-validate-phone.dto';
import {
  CreateLeaveRequestResponseDto,
  GetLeaveRequestsResponseDto,
  LeaveRequestResponseDto,
} from './dto/leave-log/leave-request-response.dto';
import {
  CreateLeaveRequestDto,
  GetLeaveRequestsQueryDto,
  UpdateLeaveRequestDto,
} from './dto/leave-log/leave-request.dto';
import {
  OrganizationDto,
  OrganizationResponseDto,
} from './dto/organization.dto';
import {
  CreatePhoneWhiteListDto,
  GetPhoneWhiteListQueryDto,
  PhoneWhiteListPaginatedResponseDto,
  PhoneWhiteListResponseDto,
  UpdatePhoneWhiteListDto,
} from './dto/phone-white-list.dto';
import { GetOrganizationStoresResponseDto } from './dto/store.dto';
import { UpdateIdentityVerificationDto } from './dto/update-identity-verification.dto';
import { CreateOrganizationAddressDto } from './dto/update-organization-address.dto';
import {
  UpdateOrganizationUserDto,
  UpdateOrganizationUserResponseDto,
} from './dto/update-organization-user.dto';
import { DocumentTypeCode } from './dto/upload-document-to-cis.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import {
  JuristicTypeValue,
  OrganizationBranchType,
  OrgType,
} from './enum/organization.enum';
import {
  InviteValidatePhoneResponseDto,
  InviteValidatePhoneUserInfoResponseDto,
} from './response-dto/invite-validate-phone-response.dto';

// Interface for invitation validation results
interface InvitationValidationResult {
  status: UserOrganizationInviteStatus;
  needsApproval: boolean;
  approverOrgId?: number;
  validationErrors?: { code: string; message: string }[];
}

interface CreateOrganizationHandlerResult {
  organization: Organization;
  roleId: number;
}

import { AutoTrace } from 'allkons-api-helper';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { PaginationType } from '@/types/pagination.type';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(JuristicType)
    private readonly juristicTypeRepo: Repository<JuristicType>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly userAddressService: UserAddressService,
    private readonly cisService: CisService,
    private readonly dbdService: DbdService,
    private readonly invitationService: InvitationService,
    private readonly userOrganizationService: UserOrganizationService,
    @InjectRepository(DraftOrganize)
    private readonly draftOrganizeRepo: Repository<DraftOrganize>,
    @InjectRepository(UserIdentityDocument)
    private readonly userIdentifyDocument: Repository<UserIdentityDocument>,
    private readonly phoneWhiteListService: PhoneWhiteListService,
    private readonly commonService: CommonService,
    @InjectQueue('organization-consumer')
    private organizationQueue: Queue,
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
    @InjectRepository(OrganizationLeaveLog)
    private readonly leaveLogRepo: Repository<OrganizationLeaveLog>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectQueue('invite-member-consumer')
    private inviteMemberQueue: Queue,
    @InjectQueue('approve-member-consumer')
    private approveMemberQueue: Queue,
    private readonly permissionService: PermissionService,
    private readonly storeService: StoreService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserMerchant)
    private readonly userMerchantRepository: Repository<UserMerchant>,
  ) {}

  async createOrganization(body: OrganizationDto) {
    const organization = new Organization(body);
    return await this.organizationRepo.save(organization);
  }

  async updateOrganization(id: number, body: OrganizationDto) {
    const organization = await this.organizationRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!organization) {
      throw new Error('Organization not found');
    }
    Object.assign(organization, body);
    const result = await this.organizationRepo.save(organization);

    // Invalidate cache after update
    const cacheKey = `organization:${id}`;
    await this.cacheManager.del(cacheKey);

    return result;
  }

  async findByTaxId(taxId: string) {
    return await this.organizationRepo.findOne({
      where: {
        taxId: taxId,
      },
    });
  }

  async findByTaxIdAndBranchNumber(
    taxId: string,
    organizeBranchNumber: string,
  ) {
    return await this.organizationRepo.findOne({
      where: {
        taxId,
        branchNumber: organizeBranchNumber,
      },
    });
  }

  async findByTaxIdAndBranchNumberOrg(
    taxId: string,
    organizeBranchNumber: string,
  ) {
    return await this.organizationRepo.findOne({
      where: {
        taxId,
        branchNumber: organizeBranchNumber,
      },
    });
  }

  async findByRegistrationNumber(registrationNumber: string) {
    return await this.organizationRepo.findOne({
      where: {
        registrationNumber: registrationNumber,
      },
    });
  }

  async findOrgById(id: number): Promise<Organization> {
    // Check cache first
    const cacheKey = `organization:${id}`;
    const cachedOrganization = await this.cacheManager.get<Organization>(
      cacheKey,
    );

    if (cachedOrganization) {
      return cachedOrganization;
    }

    // Cache miss - query database
    const organization = await this.organizationRepo.findOne({
      where: { id },
    });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, organization, 300);

    return organization;
  }

  async findOrgByUuid(uuid: string): Promise<Organization> {
    // Check cache first
    const cacheKey = `organization:${uuid}`;
    const cachedOrganization = await this.cacheManager.get<Organization>(
      cacheKey,
    );

    if (cachedOrganization) {
      return cachedOrganization;
    }

    // Cache miss - query database
    const organization = await this.organizationRepo.findOne({
      where: { uuid },
    });
    if (!organization) {
      throw new NotFoundException({
        message: 'Organization not found',
        code: ErrorCode.ORGANIZATION_NOT_FOUND,
      });
    }

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, organization, 300);

    return organization;
  }

  async findOrgByCisNumber(cisNumber: string) {
    return await this.organizationRepo.findOne({
      where: {
        cisNumber,
      },
    });
  }

  async deleteOrganization(id: string) {
    const organization = await this.organizationRepo.findOne({
      where: {
        uuid: id,
        deletedAt: null,
      },
      select: ['id', 'uuid'],
    });
    if (!organization) {
      throw new Error('Organization not found');
    }
    const result = await this.organizationRepo.delete(id);

    // Invalidate cache after delete
    const cacheKey = `organization:${id}`;
    await this.cacheManager.del(cacheKey);

    return result;
  }

  async deleteOrganizationByIds(ids: number[]) {
    const result = await this.organizationRepo.delete(ids);

    // Invalidate cache for all deleted organizations
    for (const id of ids) {
      const cacheKey = `organization:${id}`;
      await this.cacheManager.del(cacheKey);
    }

    return result;
  }

  async removeOrganization(id: number) {
    const organization = await this.organizationRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!organization) {
      throw new Error('Organization not found');
    }
    const result = await this.organizationRepo.delete(id);

    // Invalidate cache after delete
    const cacheKey = `organization:${id}`;
    await this.cacheManager.del(cacheKey);

    return result;
  }

  async updateIdentityVerification(
    id: string,
    body: UpdateIdentityVerificationDto,
  ): Promise<{
    organizationId: string;
    sendApproval: boolean;
    message: string;
    codeCheck: string;
  }> {
    const organization = await this.organizationRepo.findOne({
      where: { uuid: id },
    });

    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!organization.cisNumber) {
      throw new HttpException(
        {
          message: 'CIS number is required for identity verification',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const { organizeInfo, contactInfo, sendApproval } = body;
      await this.processOrganizationInfo(
        sendApproval,
        organization,
        organizeInfo,
        contactInfo,
      );

      if (body.addressInfo) {
        await this.processAddressInfo(
          organization.id,
          body.addressInfo,
          organization.cisNumber,
        );
      }

      return {
        organizationId: id,
        sendApproval: body.sendApproval,
        message: 'Identity verification updated successfully',
        codeCheck: 'UPDATE_ORGANIZATION_IDENTITY_VERIFICATION_SUCCESS',
      };
    } catch (error) {
      console.error('Error updating organization:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to update organization identity verification',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process organization information updates
   */
  private async processOrganizationInfo(
    sendApproval: boolean,
    organization: Organization,
    organizeInfo: any,
    contactInfo: any,
  ): Promise<void> {
    const cisNumber = organization.cisNumber;

    // Update organization entity
    Object.assign(organization, {
      organizeName: organizeInfo.organizeName,
      businessType: organizeInfo.businessType,
      taxId: organizeInfo.taxId,
      organizeType: JuristicTypeCIS[organizeInfo.juristicType],
      type: organizeInfo.type,
      branchNumber: organizeInfo.branchNumber || null,
      remarkTypeOther: organizeInfo.remarkTypeOther || null,
      mainPhoneNumber: organizeInfo.mainPhoneNumber,
      otherPhoneNumber: organizeInfo.otherPhoneNumber,
      mainEmail: organizeInfo.email,
      juristicTypeId: organizeInfo.juristicTypeId,
    });

    if (contactInfo) {
      Object.assign(organization, {
        contactShownHighestAuthority:
          contactInfo.contactShownHighestAuthority || false,
        highestAuthorityName:
          contactInfo.highestAuthority?.highestAuthorityName || null,
        highestAuthorityPosition:
          contactInfo.highestAuthority?.highestAuthorityPosition || null,
        highestAuthorityPhoneNumber:
          contactInfo.highestAuthority?.highestAuthorityPhoneNumber || null,
        highestAuthorityEmail:
          contactInfo.highestAuthority?.highestAuthorityEmail || null,
        contactName: contactInfo.contact?.contactName || null,
        contactPhoneNumber: contactInfo.contact?.contactPhoneNumber || null,
        contactEmail: contactInfo.contact?.contactEmail || null,
      });
    }

    // Handle KYC status
    let kycStatus: string = organization.kycStatus;
    if (
      sendApproval &&
      organization.kycStatus.toString() === KycStatusCIS.NONE
    ) {
      kycStatus = KycStatusCIS.WAIT_FOR_APPROVE;
      Object.assign(organization, { kycStatus });
    }

    // Prepare CIS request body
    const body = this.prepareCisRequestBody(
      organizeInfo,
      contactInfo,
      cisNumber,
      kycStatus,
    );

    // Save to database first
    try {
      await this.organizationRepo.save(organization);
    } catch (error) {
      console.error('Error saving organization:', error);
      throw new HttpException(
        {
          message: 'Failed to save organization',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Then update CIS
    const roleBusinessTypeValues = organizeInfo.businessType.map(
      (value: string) =>
        RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
    );

    await this.updateOrganizationCisServices(
      body,
      cisNumber,
      roleBusinessTypeValues,
    );
  }

  private prepareCisRequestBody(
    organizeInfo: any,
    contactInfo: any,
    cisNumber: string,
    kycStatus: string,
  ): UpdateJuristicProfileCis {
    const body: UpdateJuristicProfileCis = {
      app_id: this.configService.get<string>('APP_ID_SELLER'),
      cis_number: cisNumber,
      customer_profile_type: CustomerProfileType.JURISTIC,
      customer_status: CustomerStatusCIS.CUSTOMER,
      juristic_name: organizeInfo.organizeName,
      juristic_type: parseInt(JuristicTypeCIS[organizeInfo.juristicType]),
      organize_type: parseInt(OrganizeTypeCIS[organizeInfo.type]),
      tax_id: organizeInfo.taxId,
      contact_shown_highest_authority:
        contactInfo?.contactShownHighestAuthority || false,
      is_dopa: false,
      is_dbd: false,
      kyc_status: KycStatusCIS[kycStatus],
      active_status: true,
    };

    // Add conditional fields
    if (organizeInfo.juristicType === JuristicTypeValue.OTHER) {
      body.juristic_type_remark = organizeInfo.remarkTypeOther || null;
    }

    if (organizeInfo.type === Type.BRANCH) {
      body.branch_number = organizeInfo.branchNumber || null;
    }

    if (contactInfo) {
      Object.assign(body, {
        highest_authority: {
          highest_authority_name:
            contactInfo.highestAuthority.highestAuthorityName,
          highest_authority_position:
            contactInfo.highestAuthority.highestAuthorityPosition,
          highest_authority_phone_number:
            contactInfo.highestAuthority.highestAuthorityPhoneNumber,
          highest_authority_email:
            contactInfo.highestAuthority.highestAuthorityEmail,
        },
        contact: {
          contact_name: contactInfo.contact.contactName,
          contact_phone_number: contactInfo.contact.contactPhoneNumber,
          contact_email: contactInfo.contact.contactEmail,
        },
      });
    }

    return body;
  }

  private async updateOrganizationCisServices(
    body: UpdateJuristicProfileCis,
    cisNumber: string,
    roleBusinessTypeValues: any[],
    remarkTypeOther?: string,
  ): Promise<void> {
    await Promise.all([
      this.cisService.updateJuristicProfile(body),
      this.cisService.updateUserValue(
        cisNumber,
        'ROLE_BUSINESSES',
        roleBusinessTypeValues,
        remarkTypeOther,
      ),
    ]);
  }

  private static readonly ADDRESS_NAMES = {
    ID_CARD: 'ที่อยู่ตามหนังสือรับรอง/บัตรประชาชน',
    CURRENT: 'ที่อยู่ปัจจุบัน',
    TAX_INVOICE: 'ที่อยู่สำหรับออกใบกำกับภาษี',
  } as const;
  /**
   * Process address information updates
   */
  private async processAddressInfo(
    organizationId: number,
    addressInfo: any,
    cisNumber: string,
  ): Promise<void> {
    if (addressInfo.addressIdCard) {
      await this.processAddress(
        organizationId,
        addressInfo.addressIdCard,
        cisNumber,
        OrganizationService.ADDRESS_NAMES.ID_CARD,
        AddressTypeCis.KYC_ADDRESS,
        AddressTypeEnum.ID_CARD,
        true,
      );
    }

    // Process Current address
    if (addressInfo.addressCurrent) {
      await this.processAddress(
        organizationId,
        addressInfo.addressCurrent,
        cisNumber,
        OrganizationService.ADDRESS_NAMES.CURRENT,
        AddressTypeCis.CONTACT_ADDRESS,
        AddressTypeEnum.CURRENT,
        false,
      );
    }

    // Process Tax Invoice address
    if (addressInfo.addressTaxInvoice) {
      await this.processAddress(
        organizationId,
        addressInfo.addressTaxInvoice,
        cisNumber,
        OrganizationService.ADDRESS_NAMES.TAX_INVOICE,
        AddressTypeCis.OFFICIAL_ADDRESS,
        AddressTypeEnum.TAX_INVOICE,
        false,
      );
    }
  }

  /**
   * Process ID Card address
   */
  private async processAddress(
    organizationId: number,
    addressDetail: any,
    cisNumber: string,
    addressName: string,
    addressTypeCis: AddressTypeCis,
    addressType: AddressTypeEnum,
    addressDefault: boolean = false,
    appId: string = this.configService.get<string>('APP_ID_SELLER'),
  ): Promise<void> {
    console.log(
      `[processAddress] START - organizationId: ${organizationId}, cisNumber: ${cisNumber}, addressName: ${addressName}, addressType: ${addressType}, appId: ${appId}`,
    );
    console.log(
      `[processAddress] addressDetail:`,
      JSON.stringify(addressDetail),
    );
    await this.userAddressService.createOrUpdateOrganizationAddresses(
      organizationId,
      addressType,
      {
        usedAddress: addressDetail.usedAddress,
        address: addressDetail.address,
        countryId: parseInt(addressDetail.countryId),
        provinceId: parseInt(addressDetail.provinceId),
        districtId: parseInt(addressDetail.districtId),
        subDistrictId: parseInt(addressDetail.subDistrictId),
        zipCode: parseInt(addressDetail.zipCode),
      },
    );

    // Handle CIS address creation/update
    const organizationAddresses =
      await this.userAddressService.findByOrganizationIdAndType(
        organizationId,
        addressType,
      );

    if (!organizationAddresses) {
      console.log(
        `[processAddress] No organization addresses found - SKIP CIS update`,
      );
      return;
    }

    const address: CreateCustomerAddressCis = {
      app_id: appId,
      cis_number: cisNumber,
      platform: PlatformCIS.ALLKONS_M_SELLER,
      address_name: addressName,
      address_type: addressTypeCis,
      address_info: addressDetail.address,
      country: parseInt(addressDetail.countryId),
      province: parseInt(addressDetail.provinceId),
      district: parseInt(addressDetail.districtId),
      sub_district: parseInt(addressDetail.subDistrictId),
      zipcode: parseInt(addressDetail.zipCode),
      is_default: addressDefault,
    };
    console.log(
      `[processAddress] CIS address payload:`,
      JSON.stringify(address),
    );

    if (organizationAddresses.cisNumber) {
      const addressToUpdate = {
        ...address,
        id: organizationAddresses.cisNumber,
      };
      console.log(
        `[processAddress] Updating existing CIS address (cisNumber: ${organizationAddresses.cisNumber}):`,
        JSON.stringify(addressToUpdate),
      );
      try {
        await this.cisService.updateCustomerAddress(addressToUpdate);
        console.log(`[processAddress] CIS address updated successfully`);
      } catch (error) {
        await this.commonService.writeLog(
          `${this.configService.get(
            'CIS_URL',
          )}/customer-address/update-customer-address`,
          'updateCustomerAddress',
          JSON.stringify(addressToUpdate),
          JSON.stringify(error),
          organizationId,
        );
      }
    } else {
      console.log(
        `[processAddress] Creating new CIS address:`,
        JSON.stringify(address),
      );
      try {
        const createAddress = await this.cisService.createCustomerAddress(
          address,
        );
        console.log(
          `[processAddress] CIS address created successfully - new cisNumber: ${createAddress.data.id}`,
        );
        const cisNumber = createAddress.data.id;
        organizationAddresses.cisNumber = cisNumber;
        await this.userAddressService.update(
          organizationAddresses.id,
          organizationAddresses,
        );
      } catch (error) {
        await this.commonService.writeLog(
          `${this.configService.get(
            'CIS_URL',
          )}/customer-address/create-customer-address`,
          'createCustomerAddress',
          JSON.stringify(address),
          JSON.stringify(error),
          organizationId,
        );
      }
    }
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.organizationRepo.findOne({
      where: { uuid: id },
      relations: ['juristic'],
    });

    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return organization;
  }

  /**
   * Get identity verification data for a organization
   * @param id Organization ID
   * @returns Organization identity verification data
   */
  async getIdentityVerification(id: string): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.getOrganizationById(id);

      // Get organization addresses
      const addresses = await this.userAddressService.findByOrganizationId(
        organization.id,
      );
      return OrganizationResponseDto.fromDto(organization, addresses);
    } catch (error) {
      console.error('Error getting identity verification:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to get organization identity verification',
          data: {
            organizationId: id,
            error: error.message || 'Internal Server Error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async uploadIdentityFiles(
    dto: UploadIdentityVerificationDto,
    files: Express.Multer.File[],
  ): Promise<any> {
    const organization = await this.organizationRepo.findOne({
      where: { uuid: dto.organizationId },
    });
    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          data: { code: 'ORGANIZATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if organization has cisNumber
    if (!organization.cisNumber) {
      throw new HttpException(
        {
          message: 'Organization does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files.length > 6) {
      throw new HttpException(
        {
          message: 'Maximum file limit exceeded. You can upload up to 6 files.',
          data: { code: 'MAX_FILE_LIMIT_EXCEEDED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sellerAppId = this.configService.get<string>('APP_ID_SELLER');
    if (dto.sendApproval) {
      // Attach document and update status
      organization.kycStatus = kycStatus.WAIT_FOR_APPROVE;
      await Promise.all([
        this.cisService.updateStatusVerify(
          sellerAppId,
          organization.cisNumber,
          KycStatusCIS.WAIT_FOR_APPROVE,
        ),
        this.organizationRepo.save(organization),
      ]);
    }

    // Get attachments for the organization
    const attachments = await this.cisService.getAttachDocuments(
      this.configService.get<string>('APP_ID_SELLER'),
      organization.cisNumber,
      DocumentAttachType.VERIFY_DOCUMENT,
      null,
      false,
    );

    if (attachments.data.documents?.length > 0) {
      // Check if the document already exists
      const existingAttachment = attachments.data.documents.filter(
        (doc) => doc.document_type === DocumentTypeCis[dto.documentType],
      );

      if (existingAttachment?.length) {
        const preparedData = existingAttachment.map((doc) => {
          return {
            document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
            document_id: doc.id,
          };
        });
        // Document exists - unattach old document first
        await this.cisService.unattachDocument(
          sellerAppId,
          organization.cisNumber,
          preparedData,
        );

        // Then delete the old document
        existingAttachment.forEach(async (item) => {
          await this.cisService.deleteDocument(sellerAppId, [item.id]);
        });
      }
    }

    // Upload new document
    files?.forEach(async (item) => {
      const uploadResponse = await this.cisService.uploadDocument(
        sellerAppId,
        item,
      );
      const documentId = uploadResponse.data.id;

      const documentItem: DocumentAttachItem = {
        document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
        document_id: documentId,
        document_type: DocumentTypeCis[dto.documentType],
      };

      // Attach the new document
      await this.cisService.attachDocument(
        sellerAppId,
        organization.cisNumber,
        [documentItem],
      );
    });

    const message = attachments.data.documents?.find(
      (doc) => doc.document_type === DocumentTypeCis[dto.documentType],
    )
      ? 'Document updated successfully'
      : 'Document saved successfully';

    return { statusCode: 200, message: 'Success', data: { message } };
  }

  public async getIdentityVerifyDocuments(organizationId: string) {
    const organization = await this.findOrgByUuid(organizationId);
    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          data: { code: 'ORGANIZATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const cisNumber = organization.cisNumber;
    if (!cisNumber) {
      throw new HttpException(
        {
          message: 'Organization does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sellerAppId = this.configService.get<string>('APP_ID_SELLER');
    const documentResponse = await this.cisService.getAttachDocuments(
      sellerAppId,
      cisNumber,
      DocumentAttachType.VERIFY_DOCUMENT,
      null,
      false,
    );
    const documents = documentResponse.data.documents;

    let organizationIdentityDocuments: VerificationDocument[] = [];

    if (!documents?.length) {
      return [];
    }
    documents.forEach((doc) => {
      organizationIdentityDocuments.push({
        id: doc.id,
        documentType: DocumentTypeCodeFromCis[doc.document_type] || null,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        createdAt: doc.create_at,
        updatedAt: doc.update_at,
      });
    });
    return organizationIdentityDocuments;
  }

  public async deleteIdentityDocument(
    organizationId: string,
    documentId: string,
  ) {
    try {
      const organization = await this.findOrgByUuid(organizationId);
      if (!organization) {
        throw new HttpException(
          {
            message: 'Organization not found',
            data: { code: 'ORGANIZATION_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const sellerAppId = this.configService.get<string>('APP_ID_SELLER');
      const documentResponse = await this.cisService.getDocumentById(
        sellerAppId,
        documentId,
      );
      if (!documentResponse || !documentResponse.data) {
        throw new HttpException(
          {
            message: 'Document not found',
            data: { code: 'DOCUMENT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await Promise.all([
        this.cisService.deleteDocument(sellerAppId, [documentId]),
        this.cisService.unattachDocument(sellerAppId, organization.cisNumber, [
          {
            document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
            document_id: documentId,
          },
        ]),
      ]);

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          message: 'Document deleted successfully',
        },
      };
    } catch (error) {
      console.error('Error deleting identity document:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to delete identity document: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'DELETE_IDENTITY_DOCUMENT_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createJuristicProfileCis(
    personalCisNumber: string,
    body: any,
  ): Promise<any> {
    const juristicDataPayload = {
      customer_profile_type: CustomerProfileType.JURISTIC,
      customer_status: CustomerStatusCIS.CUSTOMER,
      juristic_name: body.juristicName,
      juristic_type:
        JuristicTypeCIS[body.juristicType as keyof typeof JuristicTypeCIS],
      juristic_type_remark: body.remarkTypeOther || null,
      organize_type: OrganizeTypeCIS.HEAD_OFFICE,
      tax_id: body.taxId,
      kyc_status: KycStatusCIS.NONE,
    };

    // Create organization profile in CIS
    const createOrganization = await this.cisService.createJuristicProfile(
      juristicDataPayload,
    );
    const juristicCisNumber = createOrganization.cis_number;
    const roleBusinessTypeValues = body.businessType.map(
      (value: string) =>
        RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
    );

    await Promise.all([
      this.cisService.createRelationship(
        personalCisNumber,
        juristicCisNumber,
        RelationType.EMPLOYEE,
        RoleCis.OWNER,
        true,
      ),
      this.cisService.updateUserValue(
        juristicCisNumber,
        'ROLE_BUSINESSES',
        roleBusinessTypeValues,
        body.remarkTypeOther,
      ),
    ]);
    return juristicCisNumber;
  }

  async updateBusinessType(organizationId: string, body: any): Promise<any> {
    const organization = await this.findOrgByUuid(organizationId);
    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          data: { code: 'ORGANIZATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (!organization.cisNumber) {
      throw new HttpException(
        {
          message: 'Organization does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update organization business type
    try {
      organization.businessType = body.businessType;
      await this.organizationRepo.save(organization);
    } catch (error) {
      console.error('Error updating organization business type:', error);
      throw new HttpException(
        {
          message: 'Failed to update organization business type',
          data: { code: 'UPDATE_BUSINESS_TYPE_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const roleBusinessTypeValues = body.businessType.map(
      (value: string) =>
        RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
    );
    await this.cisService.updateUserValue(
      organization.cisNumber,
      'ROLE_BUSINESSES',
      roleBusinessTypeValues,
      body.remarkTypeOther,
    );

    return {
      data: { message: 'Business type updated successfully' },
    };
  }

  async getJuristicTypeList(
    language: JuristicTypeLanguage = JuristicTypeLanguage.TH,
  ): Promise<JuristicType[]> {
    return this.juristicTypeRepo.find({
      where: { language },
      order: { label: 'ASC' },
    });
  }

  async checkTaxId(
    taxId: string,
    organizeBranchNumber?: string,
    excludeOrganizationId?: number,
  ): Promise<CheckTaxIdResponseDto> {
    if (!taxId) {
      throw new HttpException(
        { message: 'Tax ID is required', data: { code: 'TAX_ID_REQUIRED' } },
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkTaxId = await this.checkTaxIdExists(
      taxId,
      organizeBranchNumber,
      excludeOrganizationId,
    );
    if (checkTaxId.exists) {
      throw new HttpException(
        {
          message: checkTaxId.message,
          data: checkTaxId,
          error: { code: 'TAX_ALREADY_EXISTS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check from DBD API
    const juristicPerson = await this.dbdService.getJuristicPersonById(taxId);
    const apiResponse = juristicPerson.data;
    if (apiResponse.length === 0) {
      throw new HttpException(
        { message: 'Tax ID not found in DBD', data: { exists: false } },
        HttpStatus.NOT_FOUND,
      );
    }

    const dbdData = apiResponse[0];
    const dbdJuristicType =
      dbdData.type === 'บริษัทมหาชนจำกัด' ? 'บริษัทมหาชน' : dbdData.type;
    let juristicType: (JuristicType & { otherValue?: string }) | null =
      await this.juristicTypeRepo.findOne({
        where: { label: dbdJuristicType },
      });

    if (!juristicType) {
      const otherType = await this.juristicTypeRepo.findOne({
        where: { value: 'OTHER' },
      });

      if (otherType) {
        juristicType = Object.assign({}, otherType, {
          otherValue: dbdJuristicType,
        });
      }
    }

    // Clean organization name by removing prefix and suffix
    const cleanedOrganizeName = await removeOrganizationNamePrefixSuffix(
      dbdData.nameTH,
      juristicType,
    );
    // Update dbdData with cleaned name
    const cleanedDbdData = {
      ...dbdData,
      nameTH: cleanedOrganizeName,
    };

    // Find Address
    const address = dbdData.address;
    const provinceCode = await extractNumber(address.countrySubDivisionCode);
    const subDistrictCode = address.citySubDivisionCode?.endsWith('00')
      ? address.citySubDivisionCode.slice(0, -2)
      : address.citySubDivisionCode;

    const [province, district, subDistrict] = await Promise.all([
      this.userAddressService.findProvinceByCode(provinceCode),
      this.userAddressService.findDistrictByCode(address.cityCode),
      this.userAddressService.findSubDistrictByCode(subDistrictCode),
    ]);

    return CheckTaxIdResponseDto.fromDbdData(
      cleanedDbdData,
      province,
      district,
      subDistrict,
      juristicType,
    );
  }

  /**
   * Create organization address
   * @param body OrganizationResponseDto
   * @returns OrganizationResponseDto
   */
  async createOrganizationAddress(
    body: CreateOrganizationAddressDto,
  ): Promise<{ success: boolean }> {
    const organization = await this.organizationRepo.findOne({
      where: { taxId: body.taxId },
    });
    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          data: { code: 'ORGANIZATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!organization.cisNumber) {
      throw new HttpException(
        {
          message: 'Organization does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create or update addresses
    const addressInfo = {
      addressIdCard: {
        address: body.address,
        countryId: body.countryId,
        provinceId: body.provinceId,
        districtId: body.districtId,
        subDistrictId: body.subDistrictId,
        zipCode: body.zipCode,
      },
      addressCurrent: {
        usedAddress: 'ID_CARD',
        address: body.address,
        countryId: body.countryId,
        provinceId: body.provinceId,
        districtId: body.districtId,
        subDistrictId: body.subDistrictId,
        zipCode: body.zipCode,
      },
      addressTaxInvoice: {
        usedAddress: 'ID_CARD',
        address: body.address,
        countryId: body.countryId,
        provinceId: body.provinceId,
        districtId: body.districtId,
        subDistrictId: body.subDistrictId,
        zipCode: body.zipCode,
      },
    };
    await this.processAddressInfo(
      organization.id,
      addressInfo,
      organization.cisNumber,
    );

    return { success: true };
  }

  async findByIdCardNumber(idCard: string): Promise<Organization | null> {
    return await this.organizationRepo.findOne({
      where: {
        idCard: idCard,
        deletedAt: null,
      },
    });
  }

  async checkIdCardNumberExists(
    idCardNumber: string,
  ): Promise<{ exists: boolean }> {
    let result = { exists: false };
    const payload = {
      app_id: this.configService.get<string>('APP_ID_SELLER'),
      type: OrganizationType.PERSONAL,
      tax_id: idCardNumber,
      registration_number: null,
    };
    const cisResponse = await this.cisService.customerCheckExist(payload);
    if (cisResponse && cisResponse.data) {
      !cisResponse.data.found
        ? (result.exists = false)
        : (result.exists = true);
    }

    const organization = await this.findByIdCardNumber(idCardNumber);
    if (organization) {
      result.exists = true;
    }
    return result;
  }

  async checkTaxIdExists(
    taxId: string,
    organizeBranchNumber?: string,
    excludeOrganizationId?: number,
  ): Promise<{ exists: boolean; type?: string; message?: string }> {
    let result = { exists: false, type: '', message: '' };
    const payload = {
      app_id: this.configService.get<string>('APP_ID_SELLER'),
      type: 'LIMITED_COMPANY',
      tax_id: taxId,
      registration_number: null,
    };
    const cisResponse = await this.cisService.customerCheckExist(payload);
    if (cisResponse && cisResponse.data) {
      !cisResponse.data.found
        ? (result.exists = false)
        : (result.exists = true);
    }

    if (organizeBranchNumber == '00000') {
      const existingOrganization = await this.findByTaxId(taxId);
      if (existingOrganization) {
        // If excludeOrganizationId is provided and matches the existing organization,
        // don't consider it as duplicate (user is updating their own organization)
        if (
          excludeOrganizationId &&
          existingOrganization.id === excludeOrganizationId
        ) {
          result.exists = false;
        } else {
          result.exists = true;
          result.type = 'tax';
          result.message = 'Tax id is duplicate';
        }
      }
    } else {
      const existingBranch = await this.findByTaxIdAndBranchNumber(
        taxId,
        organizeBranchNumber,
      );
      if (existingBranch) {
        // If excludeOrganizationId is provided and matches the existing organization,
        // don't consider it as duplicate (user is updating their own organization)
        if (
          excludeOrganizationId &&
          existingBranch.id === excludeOrganizationId
        ) {
          result.exists = false;
        } else {
          result.exists = true;
          result.type = 'branch';
          result.message = 'Branch Number id is duplicate';
        }
      }
    }
    return result;
  }

  async checkRegistrationNumberExists(
    registrationNumber: string,
  ): Promise<{ exists: boolean }> {
    let result = { exists: false };
    const payload = {
      app_id: this.configService.get<string>('APP_ID_SELLER'),
      type: OrganizationType.REGISTERED_INDIVIDUAL,
      tax_id: null,
      registration_number: registrationNumber,
    };
    const cisResponse = await this.cisService.customerCheckExist(payload);
    if (cisResponse && cisResponse.data) {
      !cisResponse.data.found
        ? (result.exists = false)
        : (result.exists = true);
    }

    const organization = await this.findByRegistrationNumber(
      registrationNumber,
    );
    if (organization) {
      result.exists = true;
    }
    return result;
  }

  async createPersonalOrganizationProfile(
    bodyDto: OrgTypePersonalDto,
    userId: number,
    cisNumber: string,
    juristicName: string,
    phoneNumber: string,
    email: string = null,
    platform: Platform = Platform.SELLER,
  ): Promise<Organization> {
    // Create organization to cis
    const cisNoOrg = await this.createPersonalOrganizationToCis(
      bodyDto,
      cisNumber,
      juristicName,
      platform,
    );

    try {
      // Create organization in local database
      const createOrganization = await this.createOrganization({
        idCard: bodyDto.idCard,
        cisNumber: cisNoOrg,
        organizationType: OrganizationType.PERSONAL,
        organizeName: juristicName,
        organizeType: JuristicTypeCIS.PERSONAL,
        businessType: bodyDto.businessType ? bodyDto.businessType : [],
        type: Type.HEAD_OFFICE,
        mainPhoneNumber: phoneNumber,
        mainEmail: email || null,
        juristicTypeId: 1,
      });

      const role = await this.roleService.getRoleByName('OWNER');
      // Create user and organization relationship
      await this.userOrganizationService.createUserOrganization({
        userId: userId,
        organizationId: createOrganization.id,
        roleId: role.id,
        isOwner: true,
        memberStatus: UserOrganizationInviteStatus.ACCEPTED,
        isCreator: true,
      });

      return createOrganization;
    } catch (error) {
      console.error('Error creating personal organization profile:', error);
      throw new HttpException(
        {
          message: 'Failed to create personal organization profile',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPersonalOrganizationToCis(
    bodyDto: OrgTypePersonalDto,
    cisNumber: string,
    juristicName: string,
    platform: Platform = Platform.SELLER,
  ): Promise<string> {
    // Find master data by id
    const masterJuristicType = await this.cisService.findMasterDataById(
      Platform.SELLER,
      {
        app_id: this.configService.get<number>('APP_ID_SELLER'),
        master_code: 'JURISTIC_TYPE',
        code: JuristicTypeValue.PERSONAL,
      },
    );

    const payload: CreateJuristicProfilePayload = {
      customer_profile_type: CustomerProfileType.PERSONAL,
      customer_status: CustomerStatusCIS.VISITOR,
      juristic_name: juristicName,
      juristic_type: masterJuristicType
        ? masterJuristicType?.data.id
        : JuristicTypeCIS.PERSONAL,
      organize_type: OrganizeTypeCIS.HEAD_OFFICE,
      tax_id: bodyDto.idCard,
      kyc_status: KycStatusCIS.NONE,
    };
    // Create personal organization to cis
    const cisNoOrg = await this.cisService.createJuristicProfile(
      payload,
      platform,
    );

    await this.cisService.createRelationship(
      cisNumber,
      cisNoOrg.cis_number,
      RelationType.EMPLOYEE,
      RoleCis.OWNER,
      true,
    );

    if (bodyDto.businessType?.length !== 0) {
      const roleBusinessTypeValues = bodyDto.businessType.map(
        (value: string) =>
          RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
      );
      await this.cisService.updateUserValue(
        cisNoOrg.cis_number,
        'ROLE_BUSINESSES',
        roleBusinessTypeValues,
      );
    }

    return cisNoOrg.cis_number;
  }

  async createJuristicOrganizationProfile(
    bodyDto: OrgTypeJuristicDto,
    userId: number,
    cisNumber: string,
    phoneNumber: string,
    email: string = null,
    platform: Platform = Platform.SELLER,
  ): Promise<Organization> {
    try {
      // Create head office organization
      const organization = await this.createOrganization({
        taxId: bodyDto.taxId,
        cisNumber: null,
        organizationType: OrganizationType.JURISTIC,
        organizeName: bodyDto.juristicName,
        organizeType:
          JuristicTypeCIS[bodyDto.juristicType as keyof typeof JuristicTypeCIS],
        businessType: bodyDto.businessType || [],
        type: Type.HEAD_OFFICE,
        mainPhoneNumber: phoneNumber,
        mainEmail: email || null,
        juristicTypeId: bodyDto.juristicTypeId,
        branchNumber: bodyDto.branchNumber || '00000',
        branchName: bodyDto.branchName || null,
        remarkTypeOther: bodyDto.remarkTypeOther || null,
        businessTypeDescription: bodyDto?.businessTypeDescription || null,
      });

      const role = await this.roleService.getRoleByName('OWNER');

      // Create user organization relationship
      await this.userOrganizationService.createUserOrganization({
        userId: userId,
        organizationId: organization.id,
        roleId: role.id,
        isOwner: true,
        memberStatus: UserOrganizationInviteStatus.ACCEPTED,
        isCreator: true,
      });

      // Create organization profile in CIS
      const cisResult = await this.createJuristicOrganizationToCis(
        bodyDto,
        cisNumber,
        platform,
      );

      // Update organization with CIS number
      if (cisResult?.cisNoOrg) {
        organization.cisNumber = cisResult.cisNoOrg;
        await this.organizationRepo.save(organization);
      }

      return organization;
    } catch (error) {
      throw new HttpException(
        `Error creating juristic organization profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createJuristicOrganizationToCis(
    bodyDto: OrgTypeJuristicDto,
    cisNumber: string,
    platform: Platform = Platform.SELLER,
  ): Promise<{ cisNoOrg: string }> {
    // Find master data by id
    const masterJuristicType = await this.cisService.findMasterDataById(
      Platform.SELLER,
      {
        app_id: this.configService.get<number>('APP_ID_SELLER'),
        master_code: 'JURISTIC_TYPE',
        code: bodyDto.juristicType,
      },
    );

    // Head office organization payload
    const payload: CreateJuristicProfilePayload = {
      customer_profile_type: CustomerProfileType.JURISTIC,
      customer_status: CustomerStatusCIS.VISITOR,
      juristic_name: bodyDto.juristicName,
      juristic_type: masterJuristicType
        ? masterJuristicType?.data.id
        : JuristicTypeCIS.PERSONAL,
      organize_type:
        OrganizeTypeCIS[bodyDto.branchType as keyof typeof OrganizeTypeCIS],
      tax_id: bodyDto.taxId,
      kyc_status: KycStatusCIS.NONE,
      juristic_type_remark: bodyDto.remarkTypeOther || null,
      branch_number: bodyDto.branchNumber || '00000',
      remark_type_other: bodyDto.remarkTypeOther || null,
    };

    // Create juristic organization to cis
    const cisNoOrg = await this.cisService.createJuristicProfile(
      payload as CreateJuristicProfilePayload,
      platform,
    );

    await this.cisService.createRelationship(
      cisNumber,
      cisNoOrg.cis_number,
      RelationType.EMPLOYEE,
      RoleCis.OWNER,
      true,
    );

    if (bodyDto.businessType?.length !== 0) {
      const roleBusinessTypeValues = bodyDto.businessType.map(
        (value: string) =>
          RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
      );
      await this.cisService.updateUserValue(
        cisNoOrg.cis_number,
        'ROLE_BUSINESSES',
        roleBusinessTypeValues,
        bodyDto.remarkTypeOther,
      );
    }

    return { cisNoOrg: cisNoOrg.cis_number };
  }

  async createRegisterIndividualProfile(
    bodyDto: OrgIndividualDto,
    userId: number,
    cisNumber: string,
    phoneNumber: string,
    email: string = null,
    platform: Platform = Platform.SELLER,
  ): Promise<Organization> {
    try {
      const juristicType = await this.juristicTypeRepo.findOne({
        where: { value: JuristicTypeValue.REGISTERED_INDIVIDUAL },
      });

      const createOrgDto = new OrganizationDto({
        idCard: bodyDto.idCard,
        registrationNumber: bodyDto.registrationNumber,
        cisNumber: null,
        organizationType: OrganizationType.REGISTERED_INDIVIDUAL,
        organizeName: bodyDto.registrationName,
        organizeType: null,
        businessType: bodyDto.businessType ? bodyDto.businessType : [],
        businessTypeDescription: bodyDto?.businessTypeDescription || null,
        type: Type.HEAD_OFFICE,
        mainPhoneNumber: phoneNumber,
        mainEmail: email || null,
        juristicTypeId: juristicType ? juristicType.id : 1,
      });

      // Create organization in local database
      const organization = await this.createOrganization(createOrgDto);

      const role = await this.roleService.getRoleByName('OWNER');

      // Create user and organization relationship
      await this.userOrganizationService.createUserOrganization({
        userId: userId,
        organizationId: organization.id,
        roleId: role.id,
        isOwner: true,
        memberStatus: UserOrganizationInviteStatus.ACCEPTED,
        isCreator: true,
      });

      const cisResult = await this.createIndividualOrgToCis(
        bodyDto,
        cisNumber,
        platform,
      );

      // Update organization with CIS number
      if (cisResult?.cisNoOrg) {
        organization.cisNumber = cisResult.cisNoOrg;
        await this.organizationRepo.save(organization);
      }
      return organization;
    } catch (error) {
      console.error('Error creating registered individual profile:', error);
      throw new HttpException(
        {
          message: 'Failed to create registered individual profile',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createIndividualOrgToCis(
    bodyDto: OrgIndividualDto,
    cisNumber: string,
    platform: Platform = Platform.SELLER,
  ): Promise<{ cisNoOrg: string }> {
    // Find master data by id
    const masterJuristicType = await this.cisService.findMasterDataById(
      Platform.SELLER,
      {
        app_id: this.configService.get<number>('APP_ID_SELLER'),
        master_code: 'JURISTIC_TYPE',
        code: JuristicTypeValue.REGISTERED_INDIVIDUAL,
      },
    );

    const payload: CreateJuristicProfilePayload = {
      customer_profile_type: CustomerProfileType.PERSONAL,
      customer_status: CustomerStatusCIS.VISITOR,
      juristic_name: bodyDto.registrationName,
      juristic_type: masterJuristicType
        ? masterJuristicType?.data.id
        : JuristicTypeCIS.PERSONAL,
      organize_type: OrganizeTypeCIS.HEAD_OFFICE,
      tax_id: bodyDto.idCard,
      kyc_status: KycStatusCIS.NONE,
      businessRegistration: {
        registration_number: bodyDto.registrationNumber,
        business_name: bodyDto.registrationName,
      },
    };

    // Create registered individual organization to cis (Mock for now)
    const cisNoOrg = await this.cisService.createJuristicProfile(
      payload as CreateJuristicProfilePayload,
      platform,
    );

    // Mock relationship creation to cis
    await Promise.all([
      this.cisService.createRelationship(
        cisNumber,
        cisNoOrg.cis_number,
        RelationType.EMPLOYEE,
        RoleCis.OWNER,
        true,
      ),
    ]);

    if (bodyDto.businessType?.length !== 0) {
      const roleBusinessTypeValues = bodyDto.businessType.map(
        (value: string) =>
          RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
      );
      await this.cisService.updateUserValue(
        cisNoOrg.cis_number,
        'ROLE_BUSINESSES',
        roleBusinessTypeValues,
        bodyDto.businessTypeDescription || null,
      );
    }

    return { cisNoOrg: cisNoOrg.cis_number };
  }

  async createDraftOrganizeInfo(
    draftOrganizeInfoDto: DraftOrganizeInfoDto,
  ): Promise<DraftOrganizeInfoResponseDto> {
    try {
      // Lightweight existence check (SELECT 1) instead of full entity materialization
      const orgExists = await this.organizationRepo
        .createQueryBuilder('org')
        .select('org.id')
        .where('org.id = :id', { id: draftOrganizeInfoDto.organizeId })
        .getRawOne();
      if (!orgExists) {
        throw new HttpException(
          {
            message: 'Organization not found',
            data: { code: 'ORG_ID_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      } else {
        const result = await this.draftOrganizeRepo.save(draftOrganizeInfoDto);

        // Clear cache for draft organize info
        await Promise.all([
          clearCacheByPattern(
            this.cacheManager,
            `draft-organize-info:${draftOrganizeInfoDto.organizeId}:app:*`,
          ),
          clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
        ]);

        return result;
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  async updateDraftOrganizeInfo(
    id: number,
    draftOrganizeInfoDto: DraftOrganizeInfoDto,
  ): Promise<DraftOrganizeInfoResponseDto> {
    try {
      const draft = await this.draftOrganizeRepo.findOne({
        select: [
          'id',
          'organizeId',
          'kycStatus',
          'fileInfo',
          'organizationType',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
        where: { id },
      });

      if (!draft) {
        throw new HttpException(
          {
            message: 'Draft Organization not found',
            data: { code: 'DRAFT_ORG_ID_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (draft.kycStatus === kycStatus.WAIT_FOR_APPROVE) {
        throw new HttpException(
          {
            message: 'CIS Wait for approve',
            data: { code: 'CIS_WAIT_FOR_APPROVE' },
          },
          HttpStatus.NOT_MODIFIED,
        );
      }

      const normalizedPayload: Partial<DraftOrganize> = {
        ...draftOrganizeInfoDto,
        kycStatus: kycStatus.NONE,
        fileInfo:
          !draft.fileInfo || draft.fileInfo === 'null'
            ? null
            : draftOrganizeInfoDto.fileInfo ?? draft.fileInfo,
      };

      await Promise.all([
        this.organizationRepo.update(draft.organizeId, {
          kycStatus: kycStatus.NONE,
        }),
        this.draftOrganizeRepo.update(draft.id, normalizedPayload),
      ]);

      Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `draft-organize-info:${draftOrganizeInfoDto.organizeId}:app:*`,
        ),
        clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      ]);

      const response: DraftOrganizeInfoResponseDto = {
        id: draft.id,
        organizationType: draft.organizationType,
        orgInfo: normalizedPayload.orgInfo!,
        contactInfo: normalizedPayload.contactInfo!,
        addressInfo: normalizedPayload.addressInfo!,
        organizeId: draft.organizeId,
        kycStatus: normalizedPayload.kycStatus,
        createdAt: draft.createdAt,
        updatedAt: new Date(),
        deletedAt: draft.deletedAt ?? null,
      };

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('updateDraftOrganizeInfo failed:', error);

      throw new HttpException(
        {
          message: 'Failed to update draft organization',
          error: error?.message || 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDraftOrganizeInfo(id: number, platform: Platform): Promise<any> {
    try {
      // Fast path: fetch draft with only needed relation column (remarkKyc)
      const draftOrganization = await this.draftOrganizeRepo
        .createQueryBuilder('draft')
        .leftJoin('draft.organization', 'org')
        .addSelect(['org.remarkKyc'])
        .where('draft.organizeId = :id', { id })
        .limit(1)
        .getOne();

      if (draftOrganization) {
        if ((draftOrganization as any).organization) {
          (draftOrganization as any)['remarkKyc'] = (
            draftOrganization as any
          ).organization?.remarkKyc;
          delete (draftOrganization as any).organization;
        }
        return draftOrganization;
      }

      // No draft found: fetch organization without heavy relations
      const organization = await this.organizationRepo
        .createQueryBuilder('org')
        .select([
          'org.id',
          'org.organizationType',
          'org.mainPhoneNumber',
          'org.mainEmail',
          'org.idCard',
          'org.organizeName',
          'org.commercialName',
          'org.registrationNumber',
          'org.isUseFullName',
          'org.taxId',
          'org.type',
          'org.branchNumber',
          'org.juristicTypeId',
          'org.remarkKyc',
          'org.businessType',
          'org.remarkTypeOther',
          'org.kycStatus',
          'org.businessTypeDescription',
        ])
        .where('org.id = :id', { id })
        .limit(1)
        .getOne();
      if (!organization) {
        throw new HttpException(
          {
            message: 'Organization not found',
            data: { code: 'ORG_ID_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // if (platform === Platform.BUYER) {
      const orgInfo = {
        businessType: [],
        juristicType: organization.organizationType,
        mainPhoneNumber: organization.mainPhoneNumber,
        mainEmail: organization.mainEmail,
        idCard: organization.idCard,
        organizeName: organization.organizeName,
        commercialName: organization.commercialName,
        registrationNumber: organization.registrationNumber,
        isUseFullName: organization.isUseFullName,
        taxId: organization.taxId,
        type: organization.type,
        branchNumber: organization.branchNumber,
        juristicTypeId: organization.juristicTypeId,
        branchName:
          organization.type === Type.HEAD_OFFICE
            ? organization.type
            : organization.branchNumber,
      };
      const payload = {
        organizationType: organization.organizationType,
        orgInfo: JSON.stringify(orgInfo),
        contactInfo: '',
        addressInfo: '',
        organizeId: id,
      };
      return this.createDraftOrganizeInfo(payload);
      // }

      // Fetch only user name without materializing full relations
      // const nameRow = await this.organizationRepo
      //   .createQueryBuilder('org')
      //   .leftJoin('org.userOrganization', 'uo')
      //   .leftJoin('uo.user', 'u')
      //   .where('org.id = :id', { id })
      //   .select('u.name', 'name')
      //   .orderBy('uo.id', 'ASC')
      //   .limit(1)
      //   .getRawOne();

      // (organization as any)['name'] = nameRow?.name;
      // return organization;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw error;
    }
  }

  async createDraftDocumentOrganize(
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<any> {
    try {
      const draftOrganization = await this.draftOrganizeRepo.findOne({
        where: { id: uploadDocumentDto.draftOrganizeId },
      });
      if (!draftOrganization) {
        throw new HttpException(
          {
            message: 'Draft Organization not found',
            data: { code: 'DRAFT_ORG_ID_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      } else {
        await this.userIdentifyDocument.delete({
          documentType: uploadDocumentDto.documentType,
          draftOrganizeId: uploadDocumentDto.draftOrganizeId,
        });

        const documents = uploadDocumentDto.fileBase64.map((file) => ({
          documentType: uploadDocumentDto.documentType,
          fileBase64: file,
          draftOrganizeId: uploadDocumentDto.draftOrganizeId,
        }));
        await this.userIdentifyDocument.save(documents);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  async getDocumentOrganize(getDocumentDto: GetDocumentDto): Promise<any> {
    try {
      const draftOrganize = await this.draftOrganizeRepo.findOne({
        where: { id: getDocumentDto.draftOrganizeId },
      });
      const organizeInfo = await this.organizationRepo.findOne({
        where: { id: draftOrganize.organizeId },
      });

      if (
        draftOrganize.kycStatus == kycStatus.APPROVE &&
        organizeInfo.kycStatus == kycStatus.APPROVE
      ) {
        const data = await this.cisService.getAttachDocuments(
          this.configService.get<string>('APP_ID_SELLER'),
          organizeInfo.cisNumber,
          DocumentAttachType.VERIFY_DOCUMENT,
        );
        if (data.code == '0000') {
          const dataBase64 = [];
          for (let i = 0; i < data.data.documents.length; i++) {
            if (
              data.data.documents[i].document_type ===
              DocumentTypeCis[getDocumentDto.documentType]
            ) {
              const dataRes = await this.cisService.getFileDocuments(
                this.configService.get<string>('APP_ID_SELLER'),
                data.data.documents[i].file_path,
              );
              dataBase64.push({
                fileBase64: `data:${
                  data.data.documents[i].file_type
                };base64,${dataRes.toString('base64')}`,
              });
            }
          }
          return dataBase64;
        } else {
          throw new HttpException(
            {
              message: 'Document not found',
              data: { code: 'DOC_NOT_FOUND' },
            },
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        const document = await this.userIdentifyDocument.find({
          where: {
            documentType: getDocumentDto.documentType,
            draftOrganizeId: getDocumentDto.draftOrganizeId,
          },
        });
        if (document) {
          return document;
        } else {
          throw new HttpException(
            {
              message: 'Document not found',
              data: { code: 'DOC_NOT_FOUND' },
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  async approveOrganizeInfo(
    id: number,
    step: number,
    job?: Job,
    platform: Platform = Platform.SELLER,
  ): Promise<any> {
    let url: string;
    let body: any;
    let data: any;
    let errorLog: any;

    const appId =
      platform === Platform.SELLER
        ? process.env.APP_ID_SELLER
        : process.env.APP_ID_BUYER;

    const draftOrganizationInfo = await this.draftOrganizeRepo.findOne({
      where: { id },
    });

    const fileInfo = JSON.parse(draftOrganizationInfo.fileInfo);
    const documents = await this.convertToDocuments(
      fileInfo,
      draftOrganizationInfo.organizeId,
    );

    const organizeInfo = await this.organizationRepo.findOne({
      where: { id: draftOrganizationInfo.organizeId },
      relations: ['juristic'],
    });

    if (
      (await this.verifyOrganizeInfo(
        draftOrganizationInfo.organizationType,
        draftOrganizationInfo.orgInfo,
        documents,
      )) ||
      true
    ) {
      try {
        draftOrganizationInfo.kycStatus = kycStatus.WAIT_FOR_APPROVE;
        await this.draftOrganizeRepo.save(draftOrganizationInfo);
        organizeInfo.remarkKyc = null;
        organizeInfo.kycStatus = kycStatus.WAIT_FOR_APPROVE;
        await this.organizationRepo.save(organizeInfo);

        // Step 1: Upload documents
        if (step <= 1) {
          console.log(
            `[approveOrganizeInfo] Step 1: Upload documents - START (organizeId: ${organizeInfo.id}, cisNumber: ${organizeInfo.cisNumber})`,
          );
          if (
            await this.uploadDocument(
              organizeInfo.id,
              organizeInfo.cisNumber,
              documents,
            )
          ) {
            console.log(
              `[approveOrganizeInfo] Step 1: Upload documents - SUCCESS`,
            );
            step = 2;
          } else {
            console.log(
              `[approveOrganizeInfo] Step 1: Upload documents - FAILED`,
            );
            throw new HttpException(
              {
                message: 'Upload document failed',
                data: { code: 'UPLOAD_DOC_FAIL' },
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        const addressInfo = JSON.parse(
          draftOrganizationInfo.addressInfo,
        ) as AddressInfo;

        url = `${this.configService.get<string>(
          'CIS_URL',
        )}/customer-address/update-customer-address`;

        // Step 2: Process ID Card address
        if (step <= 2) {
          console.log(
            `[approveOrganizeInfo] Step 2: Process ID Card address - START (organizeId: ${organizeInfo.id})`,
          );
          try {
            await this.processAddress(
              organizeInfo.id,
              addressInfo.addressIdCard,
              organizeInfo.cisNumber,
              OrganizationService.ADDRESS_NAMES.ID_CARD,
              AddressTypeCis.KYC_ADDRESS,
              AddressTypeEnum.ID_CARD,
              false,
              appId,
            );
            console.log(
              `[approveOrganizeInfo] Step 2: Process ID Card address - SUCCESS`,
            );
          } catch (error) {
            console.log(
              `[approveOrganizeInfo] Step 2: Process ID Card address - ERROR`,
              error,
            );
            const eventLog = await this.commonService.readLogByOrganizeId(
              organizeInfo.id,
            );
            body = eventLog.data;
            errorLog = eventLog.response;
          }
          step = 3;
        }

        // Step 3: Process Current address
        if (step <= 3) {
          console.log(
            `[approveOrganizeInfo] Step 3: Process Current address - START (organizeId: ${organizeInfo.id})`,
          );
          try {
            await this.processAddress(
              organizeInfo.id,
              addressInfo.addressCurrent,
              organizeInfo.cisNumber,
              OrganizationService.ADDRESS_NAMES.CURRENT,
              AddressTypeCis.KYC_ADDRESS,
              AddressTypeEnum.CURRENT,
              false,
              appId,
            );
            console.log(
              `[approveOrganizeInfo] Step 3: Process Current address - SUCCESS`,
            );
          } catch (error) {
            console.log(
              `[approveOrganizeInfo] Step 3: Process Current address - ERROR`,
              error,
            );
            const eventLog = await this.commonService.readLogByOrganizeId(
              organizeInfo.id,
            );
            body = eventLog.data;
            errorLog = eventLog.response;
          }
          step = 4;
        }

        // Step 4: Process Tax Invoice address
        if (step <= 4) {
          console.log(
            `[approveOrganizeInfo] Step 4: Process Tax Invoice address - START (organizeId: ${organizeInfo.id})`,
          );
          try {
            await this.processAddress(
              organizeInfo.id,
              addressInfo.addressTaxInvoice,
              organizeInfo.cisNumber,
              OrganizationService.ADDRESS_NAMES.TAX_INVOICE,
              AddressTypeCis.KYC_ADDRESS,
              AddressTypeEnum.TAX_INVOICE,
              false,
              appId,
            );
            console.log(
              `[approveOrganizeInfo] Step 4: Process Tax Invoice address - SUCCESS`,
            );
          } catch (error) {
            console.log(
              `[approveOrganizeInfo] Step 4: Process Tax Invoice address - ERROR`,
              error,
            );
            const eventLog = await this.commonService.readLogByOrganizeId(
              organizeInfo.id,
            );
            body = eventLog.data;
            errorLog = eventLog.response;
          }
          step = 5;
        }

        // Step 5: Process contact profiles
        if (step <= 5) {
          console.log(
            `[approveOrganizeInfo] Step 5: Process contact profiles - START (organizeId: ${organizeInfo.id}, cisNumber: ${organizeInfo.cisNumber})`,
          );
          const contactType = await this.cisService.findAllMasterData(
            'CONTACT_TYPE',
          );
          const emailTypeId = (
            contactType.data.find((e: any) => e.code == 'EMAIL') as any
          ).id;
          const phoneTypeId = (
            contactType.data.find((e: any) => e.code == 'PHONE') as any
          ).id;

          const usagePurposeType = await this.cisService.findAllMasterData(
            'USAGE_PURPOSE_TYPE',
          );
          const kycTypeId = (
            usagePurposeType.data.find(
              (e: any) => e.code == 'KYC_CONTACT',
            ) as any
          ).id;

          const platformType = await this.cisService.findAllMasterData(
            'PLATFORM',
          );

          const platformCode =
            platform === Platform.BUYER
              ? 'ALLKONS_M_BUYER'
              : 'ALLKONS_M_SELLER';
          const platformId = (
            platformType.data.find((e: any) => e.code == platformCode) as any
          ).id;

          let orgInfo: any;
          if (
            draftOrganizationInfo.organizationType == OrganizationType.PERSONAL
          ) {
            orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoPersonal;
          } else if (
            draftOrganizationInfo.organizationType == OrganizationType.JURISTIC
          ) {
            orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoJuristic;
          } else if (
            draftOrganizationInfo.organizationType ==
            OrganizationType.REGISTERED_INDIVIDUAL
          ) {
            orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoRegisteredIndividual;
          }

          const customerContactSearch =
            await this.cisService.customerContactSearch(
              organizeInfo.cisNumber,
              platform,
            );

          try {
            if (customerContactSearch?.data?.length == 0) {
              await this.cisService.createContactProfile({
                app_id: appId,
                cis_number: organizeInfo.cisNumber,
                platform: platformId,
                contact_type: emailTypeId,
                usage_purpose_type: kycTypeId,
                contact: orgInfo.mainEmail,
                is_default: true,
              });

              await this.cisService.createContactProfile({
                app_id: appId,
                cis_number: organizeInfo.cisNumber,
                platform: platformId,
                contact_type: phoneTypeId,
                usage_purpose_type: kycTypeId,
                contact: orgInfo.mainPhoneNumber,
                is_default: true,
              });

              if (orgInfo.otherPhoneNumber) {
                await this.cisService.createContactProfile({
                  app_id: appId,
                  cis_number: organizeInfo.cisNumber,
                  platform: platformId,
                  contact_type: phoneTypeId,
                  usage_purpose_type: kycTypeId,
                  contact: orgInfo.otherPhoneNumber,
                  is_default: false,
                });
              }
            } else {
              for (let i = 0; i < customerContactSearch?.data?.length; i++) {
                if (customerContactSearch?.data[i]?.contact_type == 2) {
                  await this.cisService.newUpdateContactProfile({
                    app_id: appId,
                    id: customerContactSearch?.data[i].id,
                    platform: platformId,
                    contact_type: emailTypeId,
                    usage_purpose_type: kycTypeId,
                    contact: orgInfo.mainEmail,
                    is_default: true,
                  });
                } else if (
                  customerContactSearch?.data[i]?.contact_type == 1 &&
                  customerContactSearch?.data[i]?.is_default
                ) {
                  await this.cisService.newUpdateContactProfile({
                    app_id: appId,
                    id: customerContactSearch?.data[i].id,
                    platform: platformId,
                    contact_type: phoneTypeId,
                    usage_purpose_type: kycTypeId,
                    contact: orgInfo.mainPhoneNumber,
                    is_default: true,
                  });
                } else if (orgInfo.otherPhoneNumber) {
                  await this.cisService.newUpdateContactProfile({
                    app_id: appId,
                    id: customerContactSearch?.data[i].id,
                    platform: platformId,
                    contact_type: phoneTypeId,
                    usage_purpose_type: kycTypeId,
                    contact: orgInfo.otherPhoneNumber,
                    is_default: false,
                  });
                } else if (!orgInfo.otherPhoneNumber) {
                  await this.cisService.deleteContactProfile({
                    app_id: appId,
                    id: customerContactSearch?.data[i].id,
                  });
                }
              }
              if (
                customerContactSearch?.data?.length == 2 &&
                orgInfo.otherPhoneNumber
              ) {
                await this.cisService.createContactProfile({
                  app_id: appId,
                  cis_number: organizeInfo.cisNumber,
                  platform: platformId,
                  contact_type: phoneTypeId,
                  usage_purpose_type: kycTypeId,
                  contact: orgInfo.otherPhoneNumber,
                  is_default: false,
                });
              }
            }
          } catch (error) {
            console.log(
              `[approveOrganizeInfo] Step 5: Process contact profiles - ERROR`,
              error,
            );
            const eventLog = await this.commonService.readLogByOrganizeId(
              organizeInfo.id,
            );
            body = eventLog.data;
            errorLog = eventLog.response;
          }
          console.log(
            `[approveOrganizeInfo] Step 5: Process contact profiles - DONE`,
          );
          step = 6;
        }

        // Step 6: Update juristic profile
        if (step <= 6) {
          console.log(
            `[approveOrganizeInfo] Step 6: Update juristic profile - START (organizeId: ${organizeInfo.id}, orgType: ${draftOrganizationInfo.organizationType})`,
          );
          if (
            draftOrganizationInfo.organizationType == OrganizationType.PERSONAL
          ) {
            const orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoPersonal;

            const masterJuristicType = await this.cisService.findMasterDataById(
              Platform.SELLER,
              {
                app_id: this.configService.get<number>('APP_ID_SELLER'),
                master_code: 'JURISTIC_TYPE',
                code: JuristicTypeValue.PERSONAL,
              },
            );

            body = {
              app_id: appId,
              cis_number: organizeInfo.cisNumber,
              customer_profile_type: CustomerProfileType.PERSONAL,
              customer_status: CustomerStatusCIS.VISITOR,
              juristic_name: orgInfo.organizeName,
              juristic_type: masterJuristicType
                ? masterJuristicType?.data.id
                : JuristicTypeCIS.PERSONAL,
              juristic_type_remark: organizeInfo.remarkTypeOther || null,
              organize_type: OrganizeTypeCIS[organizeInfo.type],
              tax_id: orgInfo.idCard,
              branch_number: organizeInfo.branchNumber,
              contact_shown_highest_authority:
                organizeInfo.contactShownHighestAuthority,
              is_dopa: organizeInfo.isDopa,
              is_dbd: organizeInfo.isDbd,
              kyc_status: KycStatusCIS.WAIT_FOR_APPROVE,
              active_status: true,
            };
          } else if (
            draftOrganizationInfo.organizationType == OrganizationType.JURISTIC
          ) {
            const orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoJuristic;

            const masterJuristicType = await this.cisService.findMasterDataById(
              Platform.SELLER,
              {
                app_id: this.configService.get<number>('APP_ID_SELLER'),
                master_code: 'JURISTIC_TYPE',
                code: organizeInfo.juristic.value,
              },
            );

            body = {
              app_id: appId,
              cis_number: organizeInfo.cisNumber,
              customer_profile_type: CustomerProfileType.JURISTIC,
              customer_status: CustomerStatusCIS.VISITOR,
              juristic_name: orgInfo.organizeName,
              juristic_type: masterJuristicType
                ? masterJuristicType?.data.id
                : JuristicTypeCIS.PERSONAL,
              juristic_type_remark: organizeInfo.remarkTypeOther || null,
              organize_type: OrganizeTypeCIS[organizeInfo.type],
              tax_id: orgInfo.taxId,
              branch_number: organizeInfo.branchNumber,
              contact_shown_highest_authority:
                organizeInfo.contactShownHighestAuthority,
              is_dopa: organizeInfo.isDopa,
              is_dbd: organizeInfo.isDbd,
              kyc_status: KycStatusCIS.WAIT_FOR_APPROVE,
              active_status: true,
            };
          } else if (
            draftOrganizationInfo.organizationType ==
            OrganizationType.REGISTERED_INDIVIDUAL
          ) {
            const orgInfo = JSON.parse(
              draftOrganizationInfo.orgInfo,
            ) as OrgInfoRegisteredIndividual;

            const masterJuristicType = await this.cisService.findMasterDataById(
              Platform.SELLER,
              {
                app_id: this.configService.get<number>('APP_ID_SELLER'),
                master_code: 'JURISTIC_TYPE',
                code: JuristicTypeValue.REGISTERED_INDIVIDUAL,
              },
            );

            body = {
              app_id: appId,
              cis_number: organizeInfo.cisNumber,
              customer_profile_type: CustomerProfileType.PERSONAL,
              customer_status: CustomerStatusCIS.VISITOR,
              juristic_name: orgInfo.organizeName,
              juristic_type: masterJuristicType
                ? masterJuristicType?.data.id
                : JuristicTypeCIS.PERSONAL,
              juristic_type_remark: organizeInfo.remarkTypeOther || null,
              organize_type: OrganizeTypeCIS[organizeInfo.type],
              tax_id: orgInfo.idCard,
              branch_number: organizeInfo.branchNumber || '00000',
              contact_shown_highest_authority:
                organizeInfo.contactShownHighestAuthority,
              is_dopa: organizeInfo.isDopa,
              is_dbd: organizeInfo.isDbd,
              kyc_status: KycStatusCIS.WAIT_FOR_APPROVE,
              active_status: true,
              business_registration: {
                business_name: orgInfo.commercialName,
                registration_number: orgInfo.registrationNumber,
              },
            };
          }

          const contactInfo = JSON.parse(
            draftOrganizationInfo.contactInfo,
          ) as ContactInfo;
          Object.assign(body, {
            highest_authority: {
              highest_authority_name:
                contactInfo.highestAuthority.highestAuthorityName,
              highest_authority_position:
                contactInfo.highestAuthority.highestAuthorityPosition,
              highest_authority_phone_number:
                contactInfo.highestAuthority.highestAuthorityPhoneNumber,
              highest_authority_email:
                contactInfo.highestAuthority.highestAuthorityEmail,
            },
            contact: {
              contact_name: contactInfo.contact.contactName,
              contact_phone_number: contactInfo.contact.contactPhoneNumber,
              contact_email: contactInfo.contact.contactEmail,
            },
          });
          url = `${this.configService.get<string>(
            'CIS_URL',
          )}/juristic/update-juristic`;
          data = await this.cisService.updateJuristicProfile(body, platform);
          console.log(
            `[approveOrganizeInfo] Step 6: Update juristic profile - response code: ${data?.code}`,
          );
          if (data.code == '0000') {
            console.log(
              `[approveOrganizeInfo] Step 6: Update juristic profile - SUCCESS (cisNumber: ${data.data.cis_number})`,
            );
            return {
              cis_number: data.data.cis_number,
              status: 'SUCCESS',
            };
          } else {
            if (
              draftOrganizationInfo.organizationType ==
              OrganizationType.REGISTERED_INDIVIDUAL
            ) {
              return {
                cis_number: organizeInfo.cisNumber,
                status: 'SUCCESS',
              };
            } else {
              await this.commonService.writeLog(
                url,
                'approveOrganizeInfo',
                JSON.stringify(body),
                JSON.stringify(data),
                organizeInfo.id,
                null,
              );
            }

            return data;
          }
        }
      } catch (error) {
        await this.commonService.writeLog(
          url,
          'approveOrganizeInfo',
          JSON.stringify(body),
          JSON.stringify(error),
          organizeInfo.id,
          null,
        );

        if (job) {
          job.update({
            ...job.data,
            step,
          });

          if (job.attemptsMade == 2) {
            draftOrganizationInfo.isError = true;
            await this.draftOrganizeRepo.save(draftOrganizationInfo);

            if (step == 6) {
              const highestAuthority = body.highest_authority;
              highestAuthority.highest_authority_phone_number = maskPhoneNumber(
                highestAuthority.highest_authority_phone_number,
              );
              const contact = body.contact;
              contact.contact_phone_number = maskPhoneNumber(
                contact.contact_phone_number,
              );
              body = { ...body, highest_authority: highestAuthority, contact };
            }
            if (error) {
              errorLog = error;
            }

            job.update({
              ...job.data,
              url,
              body,
              error,
            });
          }
        } else {
          this.organizationQueue.add(
            'approve',
            { id, step },
            {
              attempts: 3,
              backoff: {
                type: 'fixed',
                delay: Number(this.configService.get<number>('DELAY_RETRY')),
              },
              delay: Number(this.configService.get<number>('DELAY_RETRY')),
            },
          );
        }

        if (error instanceof HttpException) {
          throw error;
        }
      }
    } else {
      throw new HttpException(
        {
          message: 'Validate not pass',
          data: { code: 'VALIDATE_NOT_PASS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyOrganizeInfo(
    organizationType: OrganizationType,
    orgInfo: any,
    documents: UserIdentityDocument[],
  ): Promise<boolean> {
    if (organizationType == OrganizationType.PERSONAL) {
      const tempOrgInfo = JSON.parse(orgInfo) as OrgInfoPersonal;
      if (
        !(
          tempOrgInfo.idCard.length == 13 &&
          (await this.checkRegistrationNumberExists(tempOrgInfo.idCard)) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.ID_CARD_WITH_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.PHOTO_OF_COMPANY_OR_PROJECT,
          )
        )
      ) {
        return false;
      }
    } else if (organizationType == OrganizationType.JURISTIC) {
      const tempOrgInfo = JSON.parse(orgInfo) as OrgInfoJuristic;
      if (
        !(
          tempOrgInfo.taxId.length == 13 &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.COPY_OF_COMPANY_REGISTRATION,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.PHOTO_OF_COMPANY_OR_PROJECT,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS,
          )
        )
      ) {
        return false;
      }
    } else if (organizationType == OrganizationType.REGISTERED_INDIVIDUAL) {
      const tempOrgInfo = JSON.parse(orgInfo) as OrgInfoRegisteredIndividual;
      if (
        !(
          tempOrgInfo.idCard.length == 13 &&
          (await this.checkRegistrationNumberExists(
            tempOrgInfo.registrationNumber,
          )) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.ID_CARD_WITH_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_ID_OR_PASSPORT_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_HOUSE_REGISTRATION_AUTHORIZED_PERSON,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.COMMERCIALLY_REGISTERED,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType === DocumentType.PHOTO_OF_COMPANY_OR_PROJECT,
          ) &&
          documents.some(
            (e: UserIdentityDocument) =>
              e.documentType ===
              DocumentType.COPY_OF_BANK_ACCOUNT_RECEIVING_PAYMENTS,
          )
        )
      ) {
        return false;
      }
    }
    return true;
  }

  async uploadDocument(
    organizeId: number,
    cisNumber: string,
    documents: UserIdentityDocument[],
  ) {
    let url: string;
    let body: any;
    let response: any;
    try {
      const documentData: DocumentAttachItem[] = [];
      for (let i = 0; i < documents.length; i++) {
        if (documents[i].cisNumber == null) {
          url = `${this.configService.get<string>(
            'CIS_URL',
          )}/document/upload-document`;
          body = { organizeId, file: documents[i].fileBase64 };
          response = await this.uploadFileBase64(
            organizeId,
            documents[i].fileBase64,
          );
          if (response.code == '0000') {
            documents[i].cisNumber = response.data.id;
            await this.userIdentifyDocument.save(documents[i]);
            documentData.push({
              document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
              document_id: response.data.id,
              document_type: DocumentTypeCis[documents[i].documentType],
            });
          } else {
            await this.commonService.writeLog(
              url,
              'uploadDocument',
              JSON.stringify(body),
              JSON.stringify(response),
              organizeId,
            );
            return false;
          }
        }
      }

      if (documentData.length > 0) {
        url = `${this.configService.get<string>(
          'CIS_URL',
        )}/document/get-attach-documents`;
        body = {
          appId: this.configService.get<string>('APP_ID_SELLER'),
          cisNumber,
          documentData,
        };
        response = await this.cisService.attachDocument(
          this.configService.get<string>('APP_ID_SELLER'),
          cisNumber,
          documentData,
        );
        if (response.code == '0000') {
          return true;
        } else {
          await this.commonService.writeLog(
            url,
            'uploadDocument',
            JSON.stringify(body),
            JSON.stringify(response),
            organizeId,
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      await this.commonService.writeLog(
        url,
        'uploadDocument',
        JSON.stringify(body),
        JSON.stringify(response),
        organizeId,
      );
      console.log(error);
      return false;
    }
  }

  async findByCisNumber(cisNumber: string): Promise<Organization> {
    return this.organizationRepo.findOne({
      where: { cisNumber },
    });
  }

  async updateOrganizationFromDraft(
    organizeId: number,
    organization: Organization,
  ): Promise<void> {
    const draftOrganization = await this.draftOrganizeRepo.findOne({
      where: { organizeId: organizeId },
    });

    if (draftOrganization) {
      const { organizationType, orgInfo, contactInfo, addressInfo } =
        draftOrganization;
      const convertOrgInfo = JSON.parse(orgInfo);
      const convertContactInfo = JSON.parse(contactInfo);
      const convertAddressInfo = JSON.parse(addressInfo);

      Object.assign(
        organization,
        { organizationType },
        convertOrgInfo,
        convertContactInfo,
      );
      await Promise.all([
        this.organizationRepo.save(organization),
        this.userAddressService.createOrUpdateOrganizationAddresses(
          organizeId,
          AddressTypeEnum.ID_CARD,
          {
            address: convertAddressInfo.addressIdCard.address,
            countryId: parseInt(convertAddressInfo.addressIdCard.countryId),
            provinceId: parseInt(convertAddressInfo.addressIdCard.provinceId),
            districtId: parseInt(convertAddressInfo.addressIdCard.districtId),
            subDistrictId: parseInt(
              convertAddressInfo.addressIdCard.subDistrictId,
            ),
            zipCode: parseInt(convertAddressInfo.addressIdCard.zipCode),
          },
        ),
        this.userAddressService.createOrUpdateOrganizationAddresses(
          organizeId,
          AddressTypeEnum.CURRENT,
          {
            usedAddress: convertAddressInfo.addressCurrent.usedAddress,
            address: convertAddressInfo.addressCurrent.address,
            countryId: parseInt(convertAddressInfo.addressCurrent.countryId),
            provinceId: parseInt(convertAddressInfo.addressCurrent.provinceId),
            districtId: parseInt(convertAddressInfo.addressCurrent.districtId),
            subDistrictId: parseInt(
              convertAddressInfo.addressCurrent.subDistrictId,
            ),
            zipCode: parseInt(convertAddressInfo.addressCurrent.zipCode),
          },
        ),
        this.userAddressService.createOrUpdateOrganizationAddresses(
          organizeId,
          AddressTypeEnum.TAX_INVOICE,
          {
            usedAddress: convertAddressInfo.addressTaxInvoice.usedAddress,
            address: convertAddressInfo.addressTaxInvoice.address,
            countryId: parseInt(convertAddressInfo.addressTaxInvoice.countryId),
            provinceId: parseInt(
              convertAddressInfo.addressTaxInvoice.provinceId,
            ),
            districtId: parseInt(
              convertAddressInfo.addressTaxInvoice.districtId,
            ),
            subDistrictId: parseInt(
              convertAddressInfo.addressTaxInvoice.subDistrictId,
            ),
            zipCode: parseInt(convertAddressInfo.addressTaxInvoice.zipCode),
          },
        ),
      ]);
    }

    const document = await this.userIdentifyDocument.find({
      where: {
        draftOrganizeId: draftOrganization.id,
      },
    });

    if (document) {
      await this.userIdentifyDocument.remove(document);
    }
  }

  async updateKycDraftProfile(
    organizeId: number,
    kycStatus: kycStatus,
  ): Promise<void> {
    const draftOrganization = await this.draftOrganizeRepo.findOne({
      where: { organizeId: organizeId },
    });
    if (draftOrganization) {
      draftOrganization.kycStatus = kycStatus;
      await this.draftOrganizeRepo.update(
        draftOrganization.id,
        draftOrganization,
      );
    }
  }

  async getOrganizationAddress(
    organizationId: string,
  ): Promise<UserAddressDto[]> {
    const org = await this.findOrgByUuid(organizationId);
    return this.userAddressService.findByOrganizationId(org.id);
  }

  async uploadFileBase64(
    organizationId: number,
    fileBase64: string,
    fileName?: string,
  ): Promise<CisResponse> {
    try {
      // Validate organization exists
      const organization = await this.organizationRepo.findOne({
        where: { id: organizationId },
      });
      if (!organization) {
        throw new HttpException(
          {
            message: 'Organization not found',
            data: { code: 'ORGANIZATION_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Parse base64 data
      if (!fileBase64.includes(',')) {
        throw new HttpException(
          {
            message:
              'Invalid base64 format. Expected data URI format (data:mime/type;base64,data)',
            data: { code: 'INVALID_BASE64_FORMAT' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const [dataUri, base64Data] = fileBase64.split(',');
      const mimeType = dataUri.replace('data:', '').replace(';base64', '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate filename if not provided
      const finalFileName =
        fileName ||
        `document_${Date.now()}.${this.getFileExtensionFromMimeType(mimeType)}`;

      // Create file object for CIS upload
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: finalFileName,
        encoding: '7bit',
        mimetype: mimeType,
        buffer: buffer,
        size: buffer.length,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      // Upload to CIS
      const sellerAppId = this.configService.get<string>('APP_ID_SELLER');
      const uploadResponse = await this.cisService.uploadDocument(
        sellerAppId,
        file,
      );
      return uploadResponse;
    } catch (error) {
      console.error('Error uploading file base64:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to upload file: ${error.message || 'Unknown error'}`,
          data: { code: 'UPLOAD_FILE_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get file extension from MIME type
   * @param mimeType MIME type
   * @returns File extension
   */
  private getFileExtensionFromMimeType(mimeType: string): string {
    const mimeTypeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',
      'text/plain': 'txt',
    };

    return mimeTypeMap[mimeType] || 'bin';
  }

  /**
   * Get users in organization with pagination and filters
   */
  async getOrganizationUsers(
    organizationUuid: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      membershipStatus?: string;
    } = {},
    urlOrigin: string,
    platform: Platform = Platform.SELLER,
  ) {
    const organization = await this.findOrgByUuid(organizationUuid);

    // Check and update expired invitations before fetching data
    await this.updateExpiredInvitations(organization.id);

    const [result, totalUsers] = await Promise.all([
      await this.userOrganizationService.findOrganizationUsers(
        organization.id,
        options,
      ),
      await this.userOrganizationService.countOrganizationUsers(
        organization.id,
      ),
    ]);

    const users = await Promise.all(
      result.userOrganizations.map(async (uo) => ({
        id: uo.user.id,
        uuid: uo.user.uuid,
        email: uo.user.email,
        firstName: uo.user.firstNameTh,
        middleName: uo.user.middleNameTh,
        lastName: uo.user.lastNameTh,
        phone: uo.user.tel,
        countryCode: uo.user.countryCode,
        roleId: uo.roleId,
        roleName: uo.role?.name || null,
        roleDisplayName: uo.role?.displayName || null,
        isOwner: uo.isOwner,
        membershipStatus: uo.memberStatus,
        isRequest: uo.isRequest || false, // Use the isRequest flag from the query result
        isInvitation: uo.isInvitation || false, // Flag to identify invitations
        createdAt: uo.createdAt,
        refCode: uo.refCode || null,
        invitationLink: !!uo.isInvitation
          ? uo.memberStatus !== UserOrganizationInviteStatus.DECLINED
            ? await this.genInvitationLink(
                uo.refCode,
                uo.memberStatus ===
                  UserOrganizationInviteStatus.WAIT_FOR_APPROVE
                  ? 'approver'
                  : 'member',
                urlOrigin,
                platform,
              )
            : null
          : null,
      })),
    );
    for (let i = 0; i < users.length; i++) {
      const orgLeave = await this.leaveLogRepo.findOne({
        where: {
          organizationId: organization.id,
          userId: users[i].id,
          leaveStatus: LeaveStatus.PENDING,
        },
      });
      users[i]['waitingLeave'] = !!orgLeave;
    }

    return {
      users,
      total: result.total, // Total combined count (users + invitations) with filters applied
      totalUsers, // Total users only (from user_organization table without filters)
      totalCurrentPage: users.length, // Total items in current page
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getOrganizationUsersApproveRequestHistory(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
    } = {},
  ) {
    const organization = await this.findOrgByUuid(organizationId);
    const orgId = organization.id;

    // Check and update expired invitations before fetching data
    await this.updateExpiredInvitations(orgId);
    const [result, totalUsers] = await Promise.all([
      await this.userOrganizationService.findOrganizationUsersApproveRequestHistory(
        orgId,
        options,
      ),
      await this.userOrganizationService.countOrganizationUsers(orgId),
    ]);

    const users = result.userOrganizations.map((uo) => ({
      id: uo.user.id,
      email: uo.user.email,
      firstName: uo.user.firstNameTh,
      middleName: uo.user.middleNameTh,
      lastName: uo.user.lastNameTh,
      phone: uo.user.tel,
      countryCode: uo.user.countryCode,
      roleId: uo.roleId,
      roleName: uo.role?.name || null,
      roleDisplayName: uo.role?.displayName || null,
      isOwner: uo.isOwner,
      membershipStatus: uo.memberStatus,
      isRequest: uo.isRequest || false, // Use the isRequest flag from the query result
      isInvitation: uo.isInvitation || false, // Flag to identify invitations
      createdAt: uo.createdAt,
      refCode: uo?.refCode || '',
      organizeName: uo.organizeName || '',
    }));
    //console.log(users);

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);

    return {
      users,
      total: result.total, // Total combined count (users + invitations) with filters applied
      totalUsers, // Total users only (from user_organization table without filters)
      totalCurrentPage: users.length, // Total items in current page
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getOrganizationUsersInviteStatus(
    organizationUuid: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
    } = {},
    userId: number,
  ) {
    // Get user telephone number from userId
    const userById = await this.userService.showById(userId);
    const userTel = userById?.tel || null;

    // Check and update expired invitations before fetching data
    const organization = await this.findOrgByUuid(organizationUuid);
    await this.updateExpiredInvitations(organization.id);
    const [result, totalUsers] = await Promise.all([
      await this.userOrganizationService.findOrganizationUsersInvitationsStatus(
        organization.id,
        options,
        userTel,
      ),
      await this.userOrganizationService.countOrganizationUsers(
        organization.id,
      ),
    ]);

    const users = result.userOrganizations.map((uo) => ({
      id: uo.user.id,
      email: uo.user.email,
      firstName: uo.user.firstNameTh,
      middleName: uo.user.middleNameTh,
      lastName: uo.user.lastNameTh,
      phone: uo.user.tel,
      countryCode: uo.user.countryCode,
      roleId: uo.roleId,
      roleName: uo.role?.name || null,
      roleDisplayName: uo.role?.displayName || null,
      isOwner: uo.isOwner,
      membershipStatus: uo.memberStatus,
      isRequest: uo.isRequest || false, // Use the isRequest flag from the query result
      isInvitation: uo.isInvitation || false, // Flag to identify invitations
      createdAt: uo.createdAt,
      refCode: uo?.refCode || '',
      invitedByUser: uo.invitedByUser,
      organizeName: uo.organizeName || '',
    }));

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationUuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationUuid}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);

    return {
      users,
      total: result.total, // Total combined count (users + invitations) with filters applied
      totalUsers, // Total users only (from user_organization table without filters)
      totalCurrentPage: users.length, // Total items in current page
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getOrganizationUsersInviteStatusApprove(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
    } = {},
  ) {
    // Check and update expired invitations before fetching data
    const organization = await this.findOrgByUuid(organizationId);
    const orgId = organization.id;
    await this.updateExpiredInvitations(orgId);
    const [result, totalUsers] = await Promise.all([
      this.userOrganizationService.findOrganizationUsersInvitationsStatusApprove(
        orgId,
        options,
      ),
      this.userOrganizationService.countOrganizationUsers(orgId),
    ]);

    const users = result.userOrganizations.map((uo) => ({
      id: uo.user.id,
      email: uo.user.email,
      firstName: uo.user.firstNameTh,
      middleName: uo.user.middleNameTh,
      lastName: uo.user.lastNameTh,
      phone: uo.user.tel,
      countryCode: uo.user.countryCode,
      roleId: uo.roleId,
      roleName: uo.role?.name || null,
      roleDisplayName: uo.role?.displayName || null,
      isOwner: uo.isOwner,
      membershipStatus: uo.memberStatus,
      isRequest: uo.isRequest || false, // Use the isRequest flag from the query result
      isInvitation: uo.isInvitation || false, // Flag to identify invitations
      createdAt: uo.createdAt,
      refCode: uo?.refCode || '',
      invitedByUser: uo.invitedByUser,
      organizeName: uo.organizeName || '',
    }));

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);

    return {
      users,
      total: result.total, // Total combined count (users + invitations) with filters applied
      totalUsers, // Total users only (from user_organization table without filters)
      totalCurrentPage: users.length, // Total items in current page
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getOrganizationUsersInviteMultipleStatus(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
      inviteMultipleStatus?: string[];
    } = {},
    userId: string,
    urlOrigin: string,
    platform: Platform = Platform.SELLER,
  ) {
    // Get user telephone number from userId
    const userById = await this.userService.showByUuid(userId);
    const userTel = userById?.tel || null;

    // Check and update expired invitations before fetching data
    const organization = await this.findOrgByUuid(organizationId);
    const orgId = organization.id;
    await this.updateExpiredInvitations(orgId);
    const [result, totalUsers] = await Promise.all([
      this.userOrganizationService.findOrganizationUsersInvitationsMultipleStatus(
        orgId,
        options,
        userTel,
      ),
      this.userOrganizationService.countOrganizationUsers(orgId),
    ]);

    const users = await Promise.all(
      result.userOrganizations.map(async (uo) => ({
        id: uo.user.id,
        email: uo.user.email,
        firstName: uo.user.firstNameTh,
        middleName: uo.user.middleNameTh,
        lastName: uo.user.lastNameTh,
        phone: uo.user.tel,
        countryCode: uo.user.countryCode,
        roleId: uo.roleId,
        roleName: uo.role?.name || null,
        roleDisplayName: uo.role?.displayName || null,
        isOwner: uo.isOwner,
        membershipStatus: uo.memberStatus,
        isRequest: uo.isRequest || false, // Use the isRequest flag from the query result
        isInvitation: uo.isInvitation || false, // Flag to identify invitations
        createdAt: uo.createdAt,
        refCode: uo?.refCode || '',
        invitedByUser: uo.invitedByUser,
        invitationLink: !!uo.isInvitation
          ? uo.memberStatus !== UserOrganizationInviteStatus.DECLINED
            ? await this.genInvitationLink(
                uo.refCode,
                uo.memberStatus ===
                  UserOrganizationInviteStatus.WAIT_FOR_APPROVE
                  ? 'approver'
                  : 'member',
                urlOrigin,
                platform,
              )
            : null
          : null,
        organizeName: uo.organizeName || '',
      })),
    );

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
    ]);

    return {
      users,
      total: result.total, // Total combined count (users + invitations) with filters applied
      totalUsers, // Total users only (from user_organization table without filters)
      totalCurrentPage: users.length, // Total items in current page
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Update organization user profile by other organization member with permission
   * @param organizationId Organization ID
   * @param targetUserId Target user ID to update
   * @param updateData Update data
   * @param currentUserId Current user ID who performing the update
   * @returns Update result
   */
  async updateOrganizationUser(
    organizationId: string,
    targetUserId: string,
    updateData: UpdateOrganizationUserDto,
    currentUserId?: number,
  ): Promise<UpdateOrganizationUserResponseDto> {
    try {
      const organization = await this.findOrgByUuid(organizationId);
      const orgId = organization.id;
      // 1. Verify current user is member of organization (if currentUserId is provided)
      if (currentUserId) {
        const currentUserOrganization =
          await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
            currentUserId,
            orgId,
          );

        if (!currentUserOrganization) {
          throw new HttpException(
            {
              message: 'You are not a member of this organization',
              error: { code: 'USER_NOT_IN_ORGANIZATION' },
            },
            HttpStatus.FORBIDDEN,
          );
        }
      }

      // 2. Verify target user is member of organization
      // Resolve target user UUID to ID
      const targetUser = await this.userService.showByUuid(targetUserId);
      if (!targetUser) {
        throw new HttpException(
          {
            message: 'Target user not found',
            error: { code: 'USER_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const targetUserIdNum = targetUser.id;

      const targetUserOrganization =
        await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
          targetUserIdNum,
          orgId,
        );

      if (!targetUserOrganization) {
        throw new HttpException(
          {
            message: 'Target user not found in organization',
            error: { code: 'TARGET_USER_NOT_IN_ORGANIZATION' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // 4. Get target user data
      // targetUser is already fetched above
      if (!targetUser) {
        throw new HttpException(
          {
            message: 'Target user not found',
            error: { code: 'USER_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.userService.updateUserProfileByOrg(
        targetUserIdNum,
        updateData,
      );

      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `organization:users:${organizationId}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:${organizationId}:*`,
        ),
        clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      ]);

      return {
        success: true,
        message: 'User profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstNameTh,
          middleName: updatedUser.middleNameTh,
          lastName: updatedUser.lastNameTh,
          phone: updatedUser.tel,
          updatedAt: updatedUser.updatedAt,
        },
      };
    } catch (error) {
      console.error('Error updating organization user:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to update user profile',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    organizationId: string,
    userId: string,
    currentUserId: number,
  ) {
    const organization = await this.findOrgByUuid(organizationId);
    const orgId = organization.id;

    // Check if current user has permission to remove users from this organization
    const currentUserOrg =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        currentUserId,
        orgId,
      );

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
    ]);

    if (!currentUserOrg) {
      throw new HttpException(
        {
          message: 'You are not a member of this organization',
          error: { code: 'USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Resolve user UUID to ID
    const user = await this.userService.showByUuid(userId);
    if (!user) {
      throw new HttpException(
        {
          message: 'User not found',
          error: { code: 'USER_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const userIdNum = user.id;

    // Check if target user exists in organization
    const targetUserOrg =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        userIdNum,
        orgId,
      );

    if (!targetUserOrg) {
      throw new HttpException(
        {
          message: 'Target user is not a member of this organization',
          error: { code: 'TARGET_USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isSelfRemoval = currentUserId === userIdNum;

    // Check permissions based on action type
    if (isSelfRemoval) {
      // Removing self - check org_member.remove_self permission
      const hasSelfRemovePermission =
        await this.permissionService.checkUserPermission(
          currentUserId,
          orgId,
          'org_member.remove_self',
        );

      if (!hasSelfRemovePermission.hasPermission) {
        throw new HttpException(
          {
            message:
              'You do not have permission to remove yourself from this organization',
            error: { code: 'INSUFFICIENT_PERMISSIONS' },
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      // Removing other user - check org_member.remove permission
      const hasRemovePermission =
        await this.permissionService.checkUserPermission(
          currentUserId,
          orgId,
          'org_member.remove',
        );

      if (!hasRemovePermission.hasPermission) {
        throw new HttpException(
          {
            message:
              'You do not have permission to remove other users from this organization',
            error: { code: 'INSUFFICIENT_PERMISSIONS' },
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Check if target user has permission to be removed by others
      const targetUserCanBeRemoved =
        await this.permissionService.checkUserPermission(
          userIdNum,
          orgId,
          'org_member.remove_by_others',
        );

      if (!targetUserCanBeRemoved.hasPermission) {
        throw new HttpException(
          {
            message:
              'Target user cannot be removed from this organization by others',
            error: { code: 'TARGET_USER_CANNOT_BE_REMOVED' },
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Check if removing this user would leave organization without owners
    if (targetUserOrg.isOwner) {
      const ownerCount = await this.userOrganizationService.countOwners(orgId);

      if (ownerCount <= 1) {
        throw new HttpException(
          {
            message:
              'Cannot remove the only owner from organization. Organization must have at least one owner.',
            error: { code: 'CANNOT_REMOVE_ONLY_OWNER' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Remove user from organization using user-organization service
    await this.userOrganizationService.removeUserFromOrganization(
      userIdNum,
      orgId,
    );

    // Clear cache for removed user's permissions
    await clearCacheByPattern(
      this.cacheManager,
      `org:${organizationId}:permissions:me:user:${userIdNum}`,
    );

    return {
      success: true,
      message: isSelfRemoval
        ? 'You have successfully left the organization'
        : 'User removed from organization successfully',
    };
  }

  /**
   * Get phone white list for organization with pagination
   */
  async getPhoneWhiteList(
    organizationId: string,
    query: GetPhoneWhiteListQueryDto,
  ): Promise<PhoneWhiteListPaginatedResponseDto> {
    const organization = await this.verifyOrganizationExists(organizationId);
    return this.phoneWhiteListService.getPhoneWhiteList(organization.id, query);
  }

  /**
   * Get phone white list by ID
   */
  async getPhoneWhiteListById(
    organizationId: string,
    phoneId: number,
  ): Promise<PhoneWhiteListResponseDto> {
    const organization = await this.findOrgByUuid(organizationId);
    return this.phoneWhiteListService.getPhoneWhiteListById(
      organization.id,
      phoneId,
    );
  }

  /**
   * Create new phone white list entry
   */
  async createPhoneWhiteList(
    organizationId: number,
    createDto: CreatePhoneWhiteListDto[],
    currentUserId: number,
  ): Promise<boolean> {
    const organizationUuid = await this.organizationRepo.findOne({
      where: { id: organizationId },
      select: ['uuid'],
    });
    // Verify organization exists and user has access
    const organization = await this.verifyOrganizationExists(
      organizationUuid.uuid,
    );

    // Verify user is member of organization
    await this.verifyUserOrganizationMembership(
      currentUserId,
      organizationUuid.uuid,
    );
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:phone-white-list:${organization.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:verify-phone-white-list:${organizationId}:*`,
      ),
    ]);

    return this.phoneWhiteListService.createPhoneWhiteList(
      organization.id,
      createDto,
    );
  }

  /**
   * Update phone white list entry
   */
  async updatePhoneWhiteList(
    organizationId: string,
    phoneId: number,
    updateDto: UpdatePhoneWhiteListDto,
    currentUserId: number,
  ): Promise<PhoneWhiteListResponseDto> {
    // Verify user is member of organization
    await this.verifyUserOrganizationMembership(currentUserId, organizationId);
    const organization = await this.findOrgByUuid(organizationId);

    const result = await this.phoneWhiteListService.updatePhoneWhiteList(
      organization.id,
      phoneId,
      updateDto,
    );

    await clearCacheByPattern(
      this.cacheManager,
      `organization:phone-white-list:${organizationId}:*`,
    );

    return result;
  }

  /**
   * Delete phone white list entry
   */
  async deletePhoneWhiteList(
    organizationId: string,
    phoneId: number,
    currentUserId: number,
  ): Promise<{ success: boolean; message: string }> {
    // Verify user is member of organization
    await this.verifyUserOrganizationMembership(currentUserId, organizationId);
    const organization = await this.findOrgByUuid(organizationId);
    const result = await this.phoneWhiteListService.deletePhoneWhiteList(
      organization.id,
      phoneId,
    );

    await clearCacheByPattern(
      this.cacheManager,
      `organization:phone-white-list:${organizationId}:*`,
    );

    return result;
  }

  /**
   * Verify organization exists
   */
  private async verifyOrganizationExists(
    organizationId: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepo.findOne({
      where: { uuid: organizationId },
    });

    if (!organization) {
      throw new HttpException(
        {
          message: 'Organization not found',
          error: { code: 'ORGANIZATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return organization;
  }

  /**
   * Verify user is member of organization
   */
  private async verifyUserOrganizationMembership(
    userId: number,
    organizationId: string,
  ): Promise<void> {
    const organization = await this.findOrgByUuid(organizationId);
    if (!userId) {
      throw new HttpException(
        {
          message: 'User authentication required',
          error: { code: 'USER_NOT_AUTHENTICATED' },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userOrganization =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        userId,
        organization.id,
      );

    if (!userOrganization) {
      throw new HttpException(
        {
          message: 'You are not a member of this organization',
          error: { code: 'USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async verifyPhoneWhiteList(organizeId: number, phone: string, code: string) {
    return await this.phoneWhiteListService.isPhoneNumberWhitelisted(
      organizeId,
      phone,
      code,
    );
  }

  /**
   * Create a new leave request
   */
  async createLeaveRequest(
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<CreateLeaveRequestResponseDto> {
    const { organizationId, userId: targetUserId } = createLeaveRequestDto;

    // Check if user is member of the organization
    const userOrg =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        targetUserId,
        organizationId,
      );

    if (!userOrg) {
      throw new HttpException(
        {
          message: 'Target user is not a member of this organization',
          error: { code: 'TARGET_USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if user is owner - owners cannot leave their organization
    if (userOrg.isOwner) {
      throw new BadRequestException(
        'Organization owners cannot request to leave',
      );
    }

    const permission = await this.permissionService.findByCode(
      'org_member.remove_by_others',
    );

    if (!permission.rolePermissions.some((rp) => rp.roleId == userOrg.roleId)) {
      throw new BadRequestException('Target user have not permission to leave');
    }

    // Check if there's already a pending request
    const existingRequest = await this.leaveLogRepo.findOne({
      where: {
        userId: targetUserId,
        organizationId,
        roleId: userOrg.roleId,
        leaveStatus: LeaveStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'There is already a pending leave request for this organization',
      );
    }

    // Create the leave request
    const leaveRequest = this.leaveLogRepo.create({
      userId: targetUserId,
      organizationId,
      roleId: userOrg.roleId,
      leaveStatus: LeaveStatus.PENDING,
    });

    const targetOrg = await this.findOrgById(organizationId);

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${targetOrg.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);

    const savedRequest = await this.leaveLogRepo.save(leaveRequest);

    // Clear cache for leave requests list
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `leave-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `exit-requests:org:${organizationId}:*`,
      ),
    ]);

    return savedRequest;
  }

  /**
   * Get leave requests for an organization with pagination and filters
   */
  async getLeaveRequests(
    organizationId: number,
    query: GetLeaveRequestsQueryDto,
  ): Promise<GetLeaveRequestsResponseDto> {
    try {
      const { page = 1, limit = 10, status, userId } = query;

      // Build a lightweight base where-clause we can reuse
      const base = this.leaveLogRepo
        .createQueryBuilder('leaveLog')
        .where('leaveLog.organizationId = :organizationId', { organizationId });

      if (status) {
        base.andWhere('leaveLog.leaveStatus = :status', { status });
      }

      if (userId) {
        base.andWhere('leaveLog.userId = :userId', { userId });
      }

      // Data query with selective joins/columns
      const dataQB = base
        .clone()
        .select([
          'leaveLog.id',
          'leaveLog.leaveStatus',
          'leaveLog.createdAt',
          'leaveLog.updatedAt',
          'user.id',
          'user.uuid',
          'user.firstNameTh',
          'user.middleNameTh',
          'user.lastNameTh',
          'role.id',
          'role.name',
          'role.displayName',
        ])
        .leftJoin('leaveLog.user', 'user')
        .leftJoin('leaveLog.role', 'role')
        .orderBy('leaveLog.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Count query without heavy joins for better performance
      const countQB = base.clone().select('leaveLog.id');

      const [leaveRequests, total] = await Promise.all([
        dataQB.getMany(),
        countQB.getCount(),
      ]);

      const targetOrg = await this.findOrgById(organizationId);

      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `organization:users:${targetOrg.uuid}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:${organizationId}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `leave-requests:org:${organizationId}:*`,
        ),
        clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
        clearCacheByPattern(
          this.cacheManager,
          `exit-requests:org:${organizationId}:*`,
        ),
      ]);

      return GetLeaveRequestsResponseDto.formatResponse(
        leaveRequests,
        total,
        page,
        limit,
      );
    } catch (error) {
      console.error('Error getting leave requests:', error);
      throw new HttpException(
        {
          message: 'Failed to get leave requests',
          error: { code: 'GET_LEAVE_REQUESTS_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update leave request status (approve/reject)
   */
  async updateLeaveRequestStatus(
    id: number,
    organizationId: number,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequestResponseDto> {
    const { status } = updateLeaveRequestDto;

    const leaveRequest = await this.leaveLogRepo.findOne({
      where: { id, organizationId },
      relations: ['user', 'role'],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.leaveStatus !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Update the request
    leaveRequest.leaveStatus = status;

    const updatedRequest = await this.leaveLogRepo.save(leaveRequest);

    // delete user in table merchants  merchant
    const store = await this.storeRepo.manager.query(
      `select m."id" as "merchantId", s."storeBranchName", m."merchantName", m."merchantBranchType", m."status", count(u."id") as "userCount" from store s inner join merchant m on s.id = m."storeId" left join user_merchants_merchant umm on m."id" = umm."merchantId" left join "user" u on umm."userId" = u."id" where s."organizeId" = ${leaveRequest?.organizationId} group by s."id", m."id"  `,
    );
    if (store.length > 0) {
      for (const merchant of store) {
        const merchantId = merchant.merchantId;
        const userId = leaveRequest.userId;
        await this.userMerchantRepository.delete({
          userId: userId,
          merchantId: merchantId,
        });
      }
    }

    // Clear cache for leave requests list

    const targetOrg = await this.findOrgById(organizationId);

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${targetOrg.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `leave-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `exit-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      clearCacheByPattern(this.cacheManager, `merchant:members:*`),
    ]);
    return LeaveRequestResponseDto.formatResponse(updatedRequest);
  }

  /**
   * Find organization leave logs by user ID
   * @param userId The ID of the user to find leave logs for
   * @returns An array of organization leave logs
   */
  async findOrganizationLeaveLogsByUserId(userId: number) {
    return await this.leaveLogRepo.find({
      where: { userId },
    });
  }

  /**
   * Delete organization leave logs by user ID
   * @param userId The ID of the user to delete leave logs for
   */
  async deleteOrganizationLeaveLogsByUserId(userId: number) {
    const leaveLogs = await this.findOrganizationLeaveLogsByUserId(userId);
    if (leaveLogs && leaveLogs.length > 0) {
      await this.leaveLogRepo.remove(leaveLogs);
    }
  }

  async uploadDocumentToCis(
    documentType: string,
    files: Express.Multer.File[],
    draftOrganizeId: number,
    platform: Platform,
    appId: string,
  ) {
    const draftOrg = await this.draftOrganizeRepo.findOne({
      where: { id: draftOrganizeId },
    });

    const organization = await this.findOrgById(draftOrg?.organizeId);

    const fileInfo = draftOrg.fileInfo ? JSON.parse(draftOrg.fileInfo) : {};
    const existingFiles = fileInfo?.[documentType] ?? [];

    try {
      // Upload new files and attach to CIS
      const uploadedDocs = await this.uploadAndAttachFiles(
        files,
        appId,
        organization.cisNumber,
        platform,
        documentType,
      );

      // Update draft organization with new file info
      await this.updateDraftOrgFileInfo(
        draftOrg,
        documentType,
        existingFiles,
        uploadedDocs,
      );
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `draft-organize-info:${draftOrganizeId}:app:*`,
        ),
        clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      ]);

      return uploadedDocs;
    } catch (error) {
      console.error('Error uploading documents to CIS:', error);
      throw error;
    }
  }

  private async uploadAndAttachFiles(
    files: Express.Multer.File[],
    appId: string,
    cisNumber: string,
    platform: Platform,
    documentType: string,
  ): Promise<any[]> {
    const fileArray: any[] = [];

    // Upload files to CIS
    for (const file of files) {
      const responseCis = await this.cisService.uploadDocument(
        appId,
        file,
        platform,
      );

      if (responseCis?.data?.id) {
        fileArray.push({
          document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
          document_id: responseCis.data.id,
          document_type: DocumentTypeCode?.[documentType],
          expired_date: '',
          file_name: file.originalname,
        });
      }
    }

    // Attach uploaded documents
    if (fileArray.length > 0) {
      await this.cisService.attachDocument(
        appId,
        cisNumber,
        fileArray,
        platform,
      );
    }

    // Get and filter attached documents
    const { data } = await this.cisService.getAttachDocuments(
      appId,
      cisNumber,
      DocumentAttachType.VERIFY_DOCUMENT,
    );

    return this.filterAndSortDocuments(
      data.documents || [],
      files,
      documentType,
    );
  }

  private filterAndSortDocuments(
    documents: any[],
    uploadedFiles: Express.Multer.File[],
    documentType: string,
  ): any[] {
    const documentTypeCode = DocumentTypeCode?.[documentType];
    const fileNames = uploadedFiles.map((file) => file.originalname);
    const uniqueSortedFileNames = [...new Set(fileNames)]
      .filter(Boolean)
      .sort();

    const orderMap = new Map(
      uniqueSortedFileNames.map((name, index) => [name, index]),
    );

    // Filter and sort documents, removing duplicates
    const filtered: any[] = [];
    const seenFileNames = new Set<string>();
    const sortedDocs = documents
      .filter(
        (doc) =>
          doc.file_name &&
          orderMap.has(doc.file_name) &&
          doc.document_type === documentTypeCode,
      )
      .sort((a, b) => {
        const orderDiff =
          orderMap.get(a.file_name)! - orderMap.get(b.file_name)!;
        if (orderDiff !== 0) return orderDiff;

        const dateA = new Date(a.create_at || 0).getTime();
        const dateB = new Date(b.create_at || 0).getTime();
        return dateB - dateA;
      });

    for (const doc of sortedDocs) {
      if (!seenFileNames.has(doc.file_name)) {
        filtered.push({
          documentCisId: doc.id,
          fileName: doc.file_name,
          fileType: doc.file_type,
          filePath: doc.file_path,
          fileSize: doc.file_size,
        });
        seenFileNames.add(doc.file_name);
      }
    }

    return filtered;
  }

  private async updateDraftOrgFileInfo(
    draftOrg: any,
    documentType: string,
    existingFiles: any[],
    newDocuments: any[],
  ): Promise<void> {
    const fileInfo = draftOrg.fileInfo ? JSON.parse(draftOrg.fileInfo) : {};
    const allFiles = [...existingFiles, ...newDocuments];

    fileInfo[documentType] = allFiles;
    draftOrg.fileInfo = JSON.stringify(fileInfo);

    await this.draftOrganizeRepo.save(draftOrg);
  }

  async deleteDocumentCis(
    documentId: string[],
    platform: Platform,
    appId: string,
    draftOrganizeId: number,
  ) {
    const draftOrg = await this.draftOrganizeRepo.findOne({
      where: { id: draftOrganizeId },
    });

    const fileInfo = draftOrg.fileInfo ? JSON.parse(draftOrg.fileInfo) : {};

    Object.keys(fileInfo).forEach((key) => {
      fileInfo[key] = fileInfo[key].filter(
        (file: any) => !documentId.includes(file.documentCisId),
      );
    });

    draftOrg.fileInfo = JSON.stringify(fileInfo);
    await this.draftOrganizeRepo.save(draftOrg);
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `draft-organize-info:${draftOrganizeId}:app:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);
    return this.cisService.deleteDocument(appId, documentId, platform);
  }

  private convertToDocuments(
    input: Record<
      string,
      Array<{
        id?: string;
        fileName?: string;
        fileType?: string;
        filePath?: string;
        fileSize?: number;
        documentCisId?: string;
      }>
    >,
    draftOrganizeId: number,
  ): any[] {
    const now = new Date();

    const result: any[] = [];

    Object.entries(input).forEach(([documentType, files]) => {
      if (Array.isArray(files)) {
        files.forEach((file) => {
          result.push({
            id: file.id ?? null,
            draftOrganizeId,
            documentType,
            fileBase64: file.filePath ?? null,
            fileName: file.fileName ?? null,
            fileType: file.fileType ?? null,
            fileSize: file.fileSize ?? null,
            cisNumber: file.documentCisId ?? null,
            createdAt: now,
            updatedAt: now,
          });
        });
      }
    });

    return result;
  }

  /**
   * Get stores for an organization
   * @param organizationId The ID of the organization
   * @param query Query parameters for pagination and search
   */
  async getStores(
    organizationId: number,
    query: BaseQueryDto,
  ): Promise<GetOrganizationStoresResponseDto> {
    try {
      if (!organizationId) {
        throw new BadRequestException('Organization ID is required');
      }

      const { page = 1, limit = 10, search } = query;
      const skip = (page - 1) * limit;
      // Base where builder (no heavy joins) for count efficiency
      const baseQB = this.storeRepo
        .createQueryBuilder('store')
        .where('store.organizeId = :organizationId', { organizationId });

      if (search) {
        baseQB.andWhere(
          '(store.storeBranchName LIKE :search OR store.storeBranchCode LIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Data query with selective joins
      const dataQB = baseQB
        .clone()
        .leftJoinAndSelect('store.merchants', 'merchant')
        .orderBy('store.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      // Count query without joins
      const countQB = baseQB.clone().select('store.id');

      const [stores, total] = await Promise.all([
        dataQB.getMany(),
        countQB.getCount(),
      ]);

      return GetOrganizationStoresResponseDto.fromStores(
        stores,
        total,
        page,
        limit,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error retrieving organization stores:', error);
      throw new HttpException(
        {
          message: 'Failed to retrieve organization stores',
          error: {
            message: error.message || 'Internal Server Error',
            code: 'GET_ORGANIZATION_STORES_FAILED',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate phone before invite user into organization
   * @desc 3rd party validate : auth-center
   * @desc validate : user, organization, phone-whitelist
   * @param body : phone, countryCode
   * @param organizationId : The ID of the organization
   * @returns validate result as boolean and userInfo to FE prefill such as firstName, lastName, Email e.g.
   */
  async validateInvitationPhone(
    body: InviteValidatePhoneDto,
    organizationId: number,
  ): Promise<InviteValidatePhoneResponseDto> {
    let canAddToWhitelist = true;
    let isInMyOrgWhitelist = false;
    let isInOtherWhitelist = false;
    let isUserInMyOrg = false;
    let isUserInOtherOrg = false;
    let isInviting = false;

    const userInfo: InviteValidatePhoneUserInfoResponseDto = {};

    //IMPORTANT: Can't use phoneNumber to get user info from auth-center.

    // check user
    const user = await this.userService.findUserByPhone(
      body.phone,
      body.countryCode,
    );

    if (user) {
      userInfo.id = user.id;
      userInfo.countryCode = user.countryCode;
      userInfo.phone = user.tel;
      userInfo.email = user.email;
      userInfo.firstName = user.firstNameTh;
      userInfo.lastName = user.lastNameTh;

      if (isNonEmptyArray(user.userOrganizations)) {
        const org = user.userOrganizations.find(
          (item) => item.organizeId === organizationId,
        );
        isUserInMyOrg = isNonEmptyObj(org);

        const otherOrg = user.userOrganizations.find(
          (item) => item.organizeId !== organizationId,
        );
        isUserInOtherOrg = isNonEmptyObj(otherOrg);

        if (isUserInOtherOrg) {
          canAddToWhitelist = false;
        }
      }
    }

    const existingInvite =
      await this.invitationService.findPendingInvitationAll(
        body.phone,
        body.countryCode,
      );
    if (existingInvite) {
      isInviting = true;
    }

    // check organization white list
    const phoneWhitelists = await this.phoneWhiteListService.findMany({
      phoneNumber: body.phone,
      countryCode: body.countryCode,
    });
    if (isNonEmptyArray(phoneWhitelists)) {
      canAddToWhitelist = false;

      const foundMyWhitelistOrg = phoneWhitelists.find(
        (item) => item.organizationId === organizationId,
      );
      if (foundMyWhitelistOrg) {
        isInMyOrgWhitelist = true;
      } else {
        isInOtherWhitelist = true;
      }
    }

    return {
      canAddToWhitelist,
      isInMyOrgWhitelist,
      isInOtherWhitelist,
      isUserInMyOrg,
      isUserInOtherOrg,
      isInviting,
      userInfo: isNonEmptyObj(userInfo) ? userInfo : null,
    };
  }

  /**
   * Invite user to organization with comprehensive validation and approval flow
   */
  async inviteUserToOrganization(
    organizationId: number,
    userId: number,
    createInvitationDto: CreateInvitationDto,
    urlOrigin: string,
    platform: Platform,
  ) {
    // Verify organization exists
    const targetOrg = await this.findOrgById(organizationId);
    const orgName = await this.genOrgNameToInvite(targetOrg);

    // Find inviter user
    const inviterUser = await this.userService.findUserById(userId);
    if (!inviterUser) {
      throw new HttpException(
        {
          message: 'Inviter user not found',
          error: { code: 'INVITER_USER_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Find role information
    const targetRole = await this.roleService.findRoleById(
      createInvitationDto.roleId,
    );
    if (!targetRole) {
      throw new HttpException(
        {
          message: `Role with ID ${createInvitationDto.roleId} not found`,
          error: { code: 'ROLE_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate phone number and determine invitation status
    const validateInfo: InviteValidatePhoneDto = {
      phone: createInvitationDto.phoneNumber,
      countryCode: createInvitationDto.countryCode,
    };
    const validateResult = await this.validateInvitationPhone(
      validateInfo,
      organizationId,
    );

    if (
      createInvitationDto.addInWhiteList &&
      !validateResult.canAddToWhitelist
    ) {
      throw new HttpException(
        {
          message: `Can't add phone number in whitelist`,
          error: { code: 'NOT_ADD_PHONE_WHITELIST' },
        },
        HttpStatus.CONFLICT,
      );
    }

    // Determine which email to use and check for duplicates
    let finalEmail = createInvitationDto.email;
    let finalFirstName = createInvitationDto.firstName;
    let finalLastName = createInvitationDto.lastName;

    if (validateResult?.userInfo) {
      // User already exists in the system, use their existing email
      if (validateResult.userInfo.email) {
        finalEmail = validateResult.userInfo.email ?? finalEmail;
      }
      finalFirstName = validateResult.userInfo.firstName ?? finalFirstName;
      finalLastName = validateResult.userInfo.lastName ?? finalLastName;
    } else {
      // User doesn't exist yet, check if the provided email is already taken
      const emailExists = await this.checkEmailInvitation(
        createInvitationDto.email,
      );
      if (emailExists.exists) {
        throw new HttpException(
          {
            message: 'Email is already registered',
            error: { code: 'EMAIL_DUPLICATE' },
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    // Determine invitation status based on validation results
    const inviteResult = await this.determineInvitationStatus(
      validateResult,
      createInvitationDto,
    );

    // Handle any validation errors
    if (inviteResult.validationErrors?.length > 0) {
      const firstError = inviteResult.validationErrors[0];
      throw new HttpException(
        {
          message: firstError.message,
          error: { code: firstError.code },
          allErrors: inviteResult.validationErrors,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Use transaction to ensure data consistency
    const invitation = await this.organizationRepo.manager
      .transaction(async (transactionalEntityManager) => {
        const invitationData: CreateInvitationData = {
          email: finalEmail,
          firstName: finalFirstName,
          lastName: finalLastName,
          countryCode: createInvitationDto.countryCode,
          phoneNumber: createInvitationDto.phoneNumber,
          status: inviteResult.status,
          roleId: createInvitationDto.roleId,
          organizeId: organizationId,
          invitedByUserId: userId,
          expiresAt: createInvitationDto.expiresAt
            ? new Date(createInvitationDto.expiresAt)
            : undefined,
          addInWhiteList: createInvitationDto.addInWhiteList,
          merchantInfo: createInvitationDto.merchantInfo,
          inviteStatus: inviteResult.status,
          approverOrgId: inviteResult.approverOrgId, // Add approverOrgId
          approvedAt:
            inviteResult.status === UserOrganizationInviteStatus.SENT
              ? new Date()
              : undefined,
        };

        return await this.invitationService.createInvitationSafe(
          invitationData,
          { allowReplace: createInvitationDto.confirmInvite || false },
        );
      })
      .catch((error) => {
        throw new HttpException(
          {
            message: 'Failed to create invitation',
            error: { code: 'INVITATION_FAILED', details: error.message },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    // Send notification emails
    await this.sendInvitationEmails(
      {
        invitation,
        needsApproval: inviteResult.needsApproval,
        approverOrgId: inviteResult.approverOrgId,
        createInvitationDto,
        inviterUser,
        targetOrg: orgName,
        targetRole,
      },
      urlOrigin,
      platform,
    );

    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${targetOrg.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
    ]);
    return { success: true, message: 'User invited successfully' };
  }

  /**
   * Resend invitation
   */
  async resendInvitation(
    organizationId: number,
    userId: number,
    invitationId: number,
    isConfirm = false,
    urlOrigin: string,
    platform: Platform,
  ) {
    // find invitation
    const invitation = await this.invitationService.findById(invitationId);
    const organization = invitation.organization;

    // validate invitation is not in org.
    if (organization?.id !== organizationId)
      throw new NotFoundException('Invitation not found');

    // validate can resend
    if (invitation.status !== UserOrganizationInviteStatus.EXPIRED)
      throw new BadRequestException('Invitation status is not EXPIRED');

    const isExist = await this.invitationService.checkDuplicateInvitationNotMy(
      invitationId,
      invitation.phoneNumber,
      organizationId,
      invitation.countryCode,
    );

    if (isExist) throw new BadRequestException('Invitation is already sent');

    // validate warning can add to whitelist
    let canAddToWhitelist = true;
    if (invitation.addInWhiteList) {
      const user = await this.userService.findUserByPhone(
        invitation.phoneNumber,
        invitation.countryCode,
      );
      if (!!user && isNonEmptyArray(user.userOrganizations)) {
        const otherOrg = user.userOrganizations.find(
          (item) => item.organizeId !== organizationId,
        );

        if (isNonEmptyObj(otherOrg)) {
          canAddToWhitelist = false;
        }
      } else {
        const phoneWhitelists = await this.phoneWhiteListService.findMany({
          phoneNumber: invitation.phoneNumber,
          countryCode: invitation.countryCode,
        });
        if (isNonEmptyArray(phoneWhitelists)) canAddToWhitelist = false;
      }

      if (!canAddToWhitelist && !isConfirm) {
        throw new HttpException(
          {
            message: `Can't add phone number in whitelist`,
            error: { code: 'NOT_ADD_PHONE_WHITELIST' },
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    // mapping status
    const status = !!invitation.approvedAt
      ? UserOrganizationInviteStatus.SENT
      : UserOrganizationInviteStatus.WAIT_FOR_APPROVE;

    // create new invitation
    const newInvitation = await this.invitationService.create({
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      phoneNumber: invitation.phoneNumber,
      countryCode: invitation.countryCode,
      roleId: invitation.roleId,
      organizeId: invitation.organizeId,
      invitedByUserId: userId,
      status: status,
      addInWhiteList: canAddToWhitelist && invitation.addInWhiteList,
      merchantInfo: invitation.merchantInfo,
      inviteStatus: status,
      approverOrgId: invitation.approverOrgId,
      approvedAt:
        status === UserOrganizationInviteStatus.SENT ? new Date() : undefined,
    });

    // delete old invitation
    await this.invitationService.softDelete(invitation.id);

    // send email
    const inviterUser = await this.userService.findUserById(userId);
    const orgName = await this.genOrgNameToInvite(organization);

    await this.sendInvitationEmails(
      {
        invitation: newInvitation,
        needsApproval: status === UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        approverOrgId: newInvitation.approverOrgId,
        createInvitationDto: {
          email: newInvitation.email,
          firstName: newInvitation.firstName,
          lastName: newInvitation.lastName,
          countryCode: newInvitation.countryCode,
          phoneNumber: newInvitation.phoneNumber,
          roleId: newInvitation.roleId,
          addInWhiteList: newInvitation.addInWhiteList,
          merchantInfo: newInvitation.merchantInfo,
          confirmInvite: true,
        },
        inviterUser,
        targetOrg: orgName,
        targetRole: invitation.role,
      },
      urlOrigin,
      platform,
    );
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organization.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
    ]);
    return { success: true, message: 'User invited successfully' };
  }

  async deleteInvitation(organizationId: number, invitationId: number) {
    // find invitation
    const invitation = await this.invitationService.findById(invitationId);

    // validate invitation is not in org.
    if (invitation.organization?.id !== organizationId)
      throw new NotFoundException('Invitation not found');

    // validate can delete
    if (
      ![
        UserOrganizationInviteStatus.EXPIRED,
        UserOrganizationInviteStatus.DECLINED,
        UserOrganizationInviteStatus.REJECTED,
      ].includes(invitation.status)
    )
      throw new BadRequestException(
        'Invitation status is not EXPIRED or DECLINED or REJECTED',
      );

    // delete
    await this.invitationService.softDelete(invitationId);
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${invitation.organization.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
    ]);

    return { success: true, message: 'Invitation deleted successfully' };
  }

  /**
   * Handles confirmation requirement checks for invitation conflicts
   */
  private requireConfirmation(
    condition: boolean,
    message: string,
    errorCode: string,
  ): void {
    if (condition) {
      throw new HttpException(
        { message, error: { code: errorCode } },
        HttpStatus.CONFLICT,
      );
    }
  }

  /**
   * Determines invitation status based on various validation conditions
   */
  private async determineInvitationStatus(
    validateResult: InviteValidatePhoneResponseDto,
    createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationValidationResult> {
    const validationErrors: { code: string; message: string }[] = [];
    let status = UserOrganizationInviteStatus.SENT;
    let needsApproval = false;
    let approverOrgId: number;

    // Case 1: User is already in my organization
    if (validateResult.isUserInMyOrg) {
      validationErrors.push({
        code: 'USER_IN_MY_ORG',
        message:
          'User with this phone number is already a member of the organization',
      });
      return { status, needsApproval, validationErrors };
    }

    // Case 2: Phone is already in my organization's whitelist
    if (validateResult.isInMyOrgWhitelist) {
      this.requireConfirmation(
        createInvitationDto.confirmInvite !== true,
        "Phone number is already in this organization's whitelist",
        'PHONE_IN_MY_ORG_WHITELIST',
      );

      if (createInvitationDto?.addInWhiteList === true) {
        validationErrors.push({
          code: 'PHONE_ALREADY_IN_WHITE_LIST',
          message:
            'Phone number is already whitelisted in this organization. Cannot add again.',
        });
        return { status, needsApproval, validationErrors };
      }
      // No approval needed for this case
    }

    // Case 3: Phone is in another organization's whitelist
    if (validateResult.isInOtherWhitelist) {
      this.requireConfirmation(
        createInvitationDto.confirmInvite !== true,
        "Phone number is already in another organization's whitelist",
        'PHONE_IN_OTHER_ORG_WHITELIST',
      );

      const phone =
        await this.phoneWhiteListService.isPhoneNumberExistsGlobally(
          createInvitationDto.phoneNumber,
          createInvitationDto.countryCode,
        );

      status = UserOrganizationInviteStatus.WAIT_FOR_APPROVE;
      needsApproval = true;
      approverOrgId = phone.organizationId;
    }

    // Case 4: Handle conflict between organization and phone whitelist
    // If both phone is in another organization AND in another organization's whitelist
    // Choose the one with the oldest createdAt
    if (validateResult.isInOtherWhitelist) {
      // Get the oldest organization
      const organization = await this.organizationRepo.findOne({
        where: {
          mainPhoneNumber: formatPhoneToCompactNational(
            createInvitationDto.phoneNumber,
            createInvitationDto.countryCode,
          ),
        },
        order: { createdAt: 'ASC' },
      });

      const phone =
        await this.phoneWhiteListService.isPhoneNumberExistsGlobally(
          createInvitationDto.phoneNumber,
          createInvitationDto.countryCode,
        );
      // Compare dates and choose the oldest one
      if (organization && phone) {
        const orgDate = new Date(organization.createdAt);
        const phoneDate = new Date(phone.createdAt);

        // Choose the organization of the oldest record
        if (orgDate.getTime() < phoneDate.getTime()) {
          approverOrgId = organization.id;
        } else {
          approverOrgId = phone.organizationId;
        }
      } else if (organization) {
        approverOrgId = organization.id;
      } else if (phone) {
        approverOrgId = phone.organizationId;
      }
    }

    // Case 5: User is in another organization
    if (validateResult.isUserInOtherOrg) {
      this.requireConfirmation(
        createInvitationDto.confirmInvite !== true,
        'User with this phone number is already a member of another organization',
        'USER_IN_OTHER_ORG',
      );

      // Safety check - make sure userInfo exists
      if (validateResult.userInfo?.id) {
        const userInOtherOrg =
          await this.userOrganizationService.findUserOrganizationsByUserId(
            validateResult.userInfo.id,
          );
        if (isNonEmptyArray(userInOtherOrg)) {
          approverOrgId = userInOtherOrg[0].organizeId;
          status = UserOrganizationInviteStatus.WAIT_FOR_APPROVE;
          needsApproval = true;
        }
      }
    } else {
      // Case 6: User is not in any organization - check for pending invitations
      const existingInvite =
        await this.invitationService.checkDuplicateInvitationAll(
          createInvitationDto.phoneNumber,
          status,
          createInvitationDto.countryCode,
        );

      if (existingInvite) {
        validationErrors.push({
          code: 'INVITATION_PENDING',
          message:
            'There is already a pending invitation for this phone number. Please wait for approval.',
        });
        return { status, needsApproval, validationErrors };
      }
    }

    return { status, needsApproval, approverOrgId };
  }

  /**
   * Sends invitation emails to approvers and invitee
   */
  private async sendInvitationEmails(
    params: {
      invitation: any;
      needsApproval: boolean;
      approverOrgId?: number;
      createInvitationDto: CreateInvitationDto;
      inviterUser: any;
      targetOrg: string;
      targetRole: any;
    },
    urlOrigin: string,
    platform: Platform,
  ): Promise<void> {
    const {
      invitation,
      needsApproval,
      approverOrgId,
      createInvitationDto,
      inviterUser,
      targetOrg,
      targetRole,
    } = params;

    // Send emails to approvers if needed
    if (needsApproval && approverOrgId) {
      const approvers =
        await this.userOrganizationService.findUsersByPermission(
          approverOrgId,
          'org_member.approve_invite',
        );

      const approverEmails = approvers
        .map((a) => ({
          email: a.user.email,
          firstName: a.user.firstNameTh,
          lastName: a.user.lastNameTh,
        }))
        .filter((email) => email.email); // Filter out invalid emails

      for (const approver of approverEmails) {
        this.approveMemberQueue.add('send-email', {
          email: approver.email,
          approverName: `${approver.firstName} ${approver.lastName}`,
          inviteeName: `${createInvitationDto.firstName} ${createInvitationDto.lastName}`,
          contact: maskPhoneNumber(
            formatPhoneToCompactNational(
              createInvitationDto.phoneNumber,
              createInvitationDto.countryCode,
            ),
            true,
          ),
          targetOrg,
          roleName: targetRole ? targetRole.displayName : 'No Role',
          expiresAt: invitation.expiresAt
            ? invitation.expiresAt.toLocaleString('th-TH', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : null,
          refCode: invitation.refCode,
          link: await this.genInvitationLink(
            invitation.refCode,
            'approver',
            urlOrigin,
            platform,
            approverOrgId,
          ),
        });
      }
    } else {
      // Send email to the invitee
      this.inviteMemberQueue.add('send-email', {
        email: createInvitationDto.email,
        orgName: targetOrg,
        inviteeName: `${createInvitationDto.firstName} ${createInvitationDto.lastName}`,
        inviterName: inviterUser
          ? `${inviterUser.firstNameTh} ${inviterUser.lastNameTh}`
          : 'System',
        roleName: targetRole ? targetRole.displayName : 'No Role',
        expiresAt: invitation.expiresAt
          ? invitation.expiresAt.toLocaleString('th-TH', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
        refCode: invitation.refCode,
        link: await this.genInvitationLink(
          invitation.refCode,
          'member',
          urlOrigin,
          platform,
        ),
      });
    }
  }

  /**
   * Update expired invitations status to EXPIRED
   * @param organizationId Organization ID to check invitations for
   */
  private async updateExpiredInvitations(
    organizationId: number,
  ): Promise<void> {
    try {
      // Use invitation service to update expired invitations
      await this.invitationService.updateExpiredInvitations(organizationId);
    } catch (error) {
      // Log error but don't throw to avoid breaking the main function
      console.error('Error updating expired invitations:', error);
    }
  }

  async checkEmailInvitation(email: string): Promise<{ exists: boolean }> {
    const user = await this.userService.checkEmailExists({ email });
    if (user.exists) {
      return { exists: true };
    } else {
      const invite = await this.invitationService.findEmailInInvite(email);
      return { exists: !!invite };
    }
  }

  private async genOrgNameToInvite(org: Organization): Promise<string> {
    let orgName: string = '';
    if (org.organizationType == OrganizationType.PERSONAL) {
      orgName = org?.organizeName;
    } else if (org.organizationType == OrganizationType.REGISTERED_INDIVIDUAL) {
      orgName = `ร้าน ${org?.organizeName}`;
    } else if (org.juristicTypeId) {
      const juristicType = await this.juristicTypeRepo.findOne({
        where: { id: org.juristicTypeId },
      });
      orgName = `${juristicType.prefix} ${org?.organizeName}`;
      if (juristicType.subfix) {
        orgName += ` ${juristicType.subfix}`;
      }
    } else {
      orgName = org?.organizeName;
    }

    return orgName;
  }

  genInvitationLink(
    refCode: string,
    linkType: 'approver' | 'member',
    urlOrigin: string,
    platform: Platform,
    approverOrgId?: number,
  ): string {
    const url = urlOrigin || this.configService.get('BASE_URL');
    if (platform === Platform.BUYER) {
      return linkType === 'member'
        ? `${url}?refcode=${refCode}`
        : `${url}/organization/${approverOrgId}?tab=member&subTab=workOutsideOrg&refcodeApprove=${refCode}`;
    } else {
      return linkType === 'member'
        ? `${url}/invite-organize?refcode=${refCode}`
        : `${url}/organization/members?refcode=${refCode}`;
    }
  }

  async findAllStoreMemberCountPage(
    page: number,
    limit: number,
    organizeId: number,
  ) {
    const { store, total } =
      await this.storeService.findAllStoreMemberCountPage(
        organizeId,
        page,
        limit,
      );
    return { store, total: total[0].total };
  }

  /**
   * Create a new organization based on the provided DTO
   */
  async createNewOrganization(
    createOrganizationDto: CreateOrganizationDto,
    platform: Platform = Platform.SELLER,
  ): Promise<CreateOrganizationResponseDto> {
    const user = await this.userService.findById(createOrganizationDto.userId);
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error: { code: 'USER_NOT_FOUND' },
      });
    }

    // Format phone number
    const phoneNumber = user.tel?.startsWith('0') ? user.tel : `0${user.tel}`;

    try {
      let organization: Organization;
      let roleId: number;

      switch (createOrganizationDto.organizationType) {
        case OrgType.PERSONAL:
          ({ organization, roleId } =
            await this.handleCreatePersonalOrganization(
              createOrganizationDto.personalInfo,
              user,
              phoneNumber,
              platform,
            ));
          break;

        case OrgType.JURISTIC:
          ({ organization, roleId } =
            await this.handleCreateJuristicOrganization(
              createOrganizationDto.juristicInfo,
              user,
              phoneNumber,
              platform,
            ));
          break;

        case OrgType.REGISTERED_INDIVIDUAL:
          ({ organization, roleId } =
            await this.handleCreateRegisteredIndividualOrganization(
              createOrganizationDto.registeredIndividualInfo,
              user,
              phoneNumber,
              platform,
            ));
          break;

        default:
          throw new BadRequestException({
            message: 'Invalid organization type',
            error: { code: 'INVALID_ORGANIZATION_TYPE' },
          });
      }

      // Create default roles and permissions for the organization
      await this.roleService.createRolePermissionDefault(organization.id);

      // Update user's register step if not skipped
      if (!createOrganizationDto.skipRegisterStep) {
        await this.userService.updateUserById(
          { registerStep: RegisterStep.ORG_INFO },
          user.id,
        );
      }

      // Clear cache for user's organizations list
      await clearCacheByPattern(
        this.cacheManager,
        `user:organizations:user:${user.id}:*`,
      );

      return CreateOrganizationResponseDto.from({
        organization,
        userId: user.id,
        roleId,
      });
    } catch (error) {
      // Log error for debugging
      console.error('Error creating organization:', error);

      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      // Throw generic error for unknown errors
      throw new HttpException(
        {
          message: 'Failed to create organization',
          error: {
            code: 'ORGANIZATION_CREATION_ERROR',
            details: error.message,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * manages the creation of a personal organization
   */
  private async handleCreatePersonalOrganization(
    personalInfo: PersonalOrganizationInfoDto,
    user: User,
    phoneNumber: string,
    platform: Platform,
  ): Promise<CreateOrganizationHandlerResult> {
    // check ID Card duplicate
    const checkIdCard = await this.checkIdCardNumberExists(personalInfo.idCard);
    if (checkIdCard.exists) {
      throw new BadRequestException({
        message: 'ID Card already exists',
        data: checkIdCard,
        error: { code: 'ID_CARD_ALREADY_EXISTS' },
      });
    }

    // Create organization
    const organization = await this.createPersonalOrganizationProfile(
      personalInfo,
      user.id,
      user.cisNumber,
      user.name,
      phoneNumber,
      user.email,
      platform,
    );

    // Get owner role
    const role = await this.roleService.getRoleByName('OWNER');

    return { organization, roleId: role.id };
  }

  /**
   * manages the creation of a juristic organization
   */
  private async handleCreateJuristicOrganization(
    juristicInfo: JuristicOrganizationInfoDto,
    user: User,
    phoneNumber: string,
    platform: Platform,
  ): Promise<CreateOrganizationHandlerResult> {
    // Only HEAD_OFFICE branch type is allowed
    if (juristicInfo.branchType !== OrganizationBranchType.HEAD_OFFICE) {
      throw new BadRequestException({
        message:
          'Only HEAD_OFFICE branch type is allowed for register juristic organization',
        error: { code: 'INVALID_BRANCH_TYPE' },
      });
    }

    // Check for duplicate Tax ID
    const checkTaxId = await this.checkTaxIdExists(
      juristicInfo.taxId,
      juristicInfo.branchNumber,
    );
    if (checkTaxId.exists) {
      throw new BadRequestException({
        message: 'Tax ID already exists',
        data: checkTaxId,
        error: { code: 'TAX_ALREADY_EXISTS' },
      });
    }

    // Create organization
    const organization = await this.createJuristicOrganizationProfile(
      juristicInfo,
      user.id,
      user.cisNumber,
      phoneNumber,
      user.email,
      platform,
    );

    // Get owner role
    const role = await this.roleService.getRoleByName('OWNER');

    return { organization, roleId: role.id };
  }

  /**
   * manages the creation of a registered individual organization
   */
  private async handleCreateRegisteredIndividualOrganization(
    registeredIndividualInfo: RegisteredIndividualInfoDto,
    user: User,
    phoneNumber: string,
    platform: Platform,
  ): Promise<CreateOrganizationHandlerResult> {
    // Check for duplicate Registration Number
    const checkRegistrationNumber = await this.checkRegistrationNumberExists(
      registeredIndividualInfo.registrationNumber,
    );
    if (checkRegistrationNumber.exists) {
      throw new BadRequestException({
        message: 'Registration number already exists',
        data: checkRegistrationNumber,
        error: { code: 'REGISTRATION_NUMBER_ALREADY_EXISTS' },
      });
    }

    // Create organization
    const organization = await this.createRegisterIndividualProfile(
      registeredIndividualInfo,
      user.id,
      user.cisNumber,
      phoneNumber,
      user.email,
      platform,
    );

    // Get owner role
    const role = await this.roleService.getRoleByName('OWNER');

    return { organization, roleId: role.id };
  }

  async getUserOrganizations(
    userUuid: string,
    pagination: { page: number; limit: number },
    platform: Platform = Platform.SELLER,
  ): Promise<GetUserOrganizationsResponseDto> {
    const user = await this.userService.showByUuid(userUuid);
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }
    const userIdNum = user.id;
    // If platform is SELLER, exclude PERSONAL organization type
    const excludeOrgType =
      platform === Platform.SELLER ? OrganizationType.PERSONAL : undefined;
    const organizations = await this.userService.findUserOrgById(
      userIdNum,
      pagination,
      excludeOrgType,
    );
    if (!organizations) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      organizations.userOrganizations &&
      organizations.userOrganizations.length > 0
    ) {
      const userCountPromises = organizations.userOrganizations.map(
        async (userOrg) => {
          const totalUsers =
            await this.userOrganizationService.countUsersByOrganizationId(
              userOrg.organizeId,
            );
          return {
            organizeId: userOrg.organizeId,
            totalUsers,
          };
        },
      );

      const userCounts = await Promise.all(userCountPromises);

      organizations.userOrganizations.forEach((userOrg) => {
        const orgUserCount = userCounts.find(
          (count) => count.organizeId === userOrg.organizeId,
        );
        if (orgUserCount) {
          userOrg.organization.totalUsers = orgUserCount.totalUsers;
        }
      });

      /// Get user permissions in each organization
      await Promise.all(
        organizations.userOrganizations.map(async (userOrg) => {
          const permissions =
            await this.permissionService.getUserPermissionsInOrganization(
              userIdNum,
              userOrg.organizeId,
            );
          userOrg.userPermission = permissions;
        }),
      );
    }

    return GetUserOrganizationsResponseDto.fromUserOrganizations(organizations);
  }

  /**
   * Create a leave request (simplified version without permission check)
   * Refactored to reduce duplication and improve performance
   */
  async createExitRequest(
    organizationId: number,
    userId: number,
  ): Promise<CreateLeaveRequestResponseDto> {
    // Validate user membership and fetch organization in parallel
    const userOrg =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        userId,
        organizationId,
      );

    // Validate user is member
    if (!userOrg) {
      throw new HttpException(
        {
          message: 'Target user is not a member of this organization',
          error: { code: 'TARGET_USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if user is owner
    if (userOrg.isOwner) {
      throw new HttpException(
        {
          message: 'Organization owners cannot request to leave',
          error: { code: 'OWNER_CANNOT_LEAVE' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for existing pending request
    const existingRequest = await this.leaveLogRepo.findOne({
      where: {
        userId: userId,
        organizationId,
        leaveStatus: LeaveStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new HttpException(
        {
          message:
            'There is already a pending leave request for this organization',
          error: { code: 'PENDING_LEAVE_REQUEST_EXISTS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save the leave request
    const leaveRequest = this.leaveLogRepo.create({
      userId: userId,
      organizationId,
      roleId: userOrg.roleId,
      leaveStatus: LeaveStatus.PENDING,
    });

    // Save and clear cache in parallel for better performance
    const [savedRequest] = await Promise.all([
      this.leaveLogRepo.save(leaveRequest),
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${userOrg.organization.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      clearCacheByPattern(
        this.cacheManager,
        `leave-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `exit-requests:org:${organizationId}:*`,
      ),
    ]);

    return savedRequest;
  }

  /**
   * Get leave requests (simplified version without permission check)
   */
  async getExitRequests(
    organizationId: number,
    query: {
      page?: number;
      limit?: number;
      status?: LeaveStatus[];
      search?: string;
    },
  ): Promise<PaginationType<OrganizationLeaveLog>> {
    try {
      const { page = 1, limit = 10, status, search } = query;
      const skip = (page - 1) * limit;

      // Build optimized query with leftJoinAndSelect to get related entities
      const queryBuilder = this.leaveLogRepo
        .createQueryBuilder('leaveLog')
        .select([
          'leaveLog.id',
          'leaveLog.leaveStatus',
          'leaveLog.createdAt',
          'leaveLog.updatedAt',
          'user.id',
          'user.firstNameTh',
          'user.lastNameTh',
          'user.email',
          'role.id',
          'role.name',
          'role.displayName',
        ])
        .leftJoin('leaveLog.user', 'user')
        .leftJoin('leaveLog.role', 'role')
        .where('leaveLog.organizationId = :organizationId', { organizationId });

      if (status && status.length > 0) {
        queryBuilder.andWhere('leaveLog.leaveStatus IN (:...status)', {
          status,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.email LIKE :search)',
          { search: `%${search}%` },
        );
      }

      queryBuilder.orderBy('leaveLog.createdAt', 'DESC').skip(skip).take(limit);

      // Single query for both data and count
      const [items, totalItems] = await queryBuilder.getManyAndCount();

      // Return with PaginationType - no transformation needed
      return {
        meta: {
          page,
          pageLimit: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
        items,
      };
    } catch (error) {
      console.error('Error getting leave requests:', error);
      throw new HttpException(
        {
          message: 'Failed to get leave requests',
          error: { code: 'GET_LEAVE_REQUESTS_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveOrRejectExitRequest(
    requestId: number,
    organizationId: number,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<OrganizationLeaveLog> {
    const { status } = updateLeaveRequestDto;

    const leaveRequest = await this.leaveLogRepo.findOne({
      where: { id: requestId, organizationId },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.leaveStatus !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Update the request status
    leaveRequest.leaveStatus = status;
    const updatedRequest = await this.leaveLogRepo.save(leaveRequest);

    const organization = await this.findOrgById(organizationId);
    if (status === LeaveStatus.APPROVED) {
      await this.userOrganizationService.removeUserFromOrganization(
        leaveRequest.userId,
        organizationId,
      );

      const stores = await this.storeRepo.manager.query(
        `SELECT m."id" as "merchantId" 
        FROM store s 
        INNER JOIN merchant m ON s.id = m."storeId" 
        WHERE s."organizeId" = $1`,
        [organizationId],
      );

      if (stores.length > 0) {
        for (const merchant of stores) {
          await this.userMerchantRepository.delete({
            userId: leaveRequest.userId,
            merchantId: merchant.merchantId,
          });
        }
      }
    }

    // Clear cache
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organization.uuid}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `leave-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `exit-requests:org:${organizationId}:*`,
      ),
      clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      clearCacheByPattern(this.cacheManager, `merchant:members:*`),
      clearCacheByPattern(
        this.cacheManager,
        `org:${organization.uuid}:permissions:me:user:${leaveRequest.userId}`,
      ),
    ]);

    return updatedRequest;
  }
}
