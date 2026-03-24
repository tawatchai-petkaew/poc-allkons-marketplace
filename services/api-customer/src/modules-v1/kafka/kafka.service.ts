import { Inject, Injectable } from '@nestjs/common';
import { KafkaMessage } from './kafka.controller';
import {
  AddressStatus,
  UserCustomerAddressEntity,
} from '@/model/user-customer-address.entity';
import { CisService } from '@/modules/cis/cis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuyerAddressDto } from '../buyer-address/dto/create-buyer-address.dto';
import { User } from '@/model/user.entity';
import { UpdateBuyerAddressDto } from '../buyer-address/dto/update-buyer-address.dto';
import { Platform } from '@/model/organization-contact.entity';
import { BuyerAddressService } from '../buyer-address/buyer-address.service';
import { OrganizationService } from '../../modules/organization/organization.service';
import { kycStatus } from '@/model/organization.entity';
import { SendVerifyStatusService } from '../../modules/send-verify-status/send-verify-status.service';
import { SendVerifyStatusInfo } from '../../modules/send-verify-status/interfaces/send-verify-status.interface';
import { KycStatusCIS } from '../../modules/cis/enum/cis.enum';
import { Merchant, SubDomainStatus } from '@/model/merchant.entity';
import { UserService } from '@/modules/user/user.service';
import { clearCacheByPattern } from '@/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

enum MASTER_CODE {
  PLATFORM = 'PLATFORM',
  ADDRESS_TYPE = 'ADDRESS_TYPE',
  ORGANIZE_TYPE = 'ORGANIZE_TYPE',
  JURISTIC_TYPE = 'JURISTIC_TYPE',
  CUSTOMER_TYPE = 'CUSTOMER_TYPE',
}
enum ADDRESS_TYPE_CODE {
  S = 'SHIPPING_ADDRESS',
  W = 'WORK_SITE_ADDRESS',
}
@Injectable()
export class KafkaService {
  constructor(
    @InjectRepository(UserCustomerAddressEntity)
    private readonly userCustomerAddressRepo: Repository<UserCustomerAddressEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly cisService: CisService,
    private readonly buyerAddressService: BuyerAddressService,
    private readonly organizationService: OrganizationService,
    private readonly sendVerifyStatusViaSMS: SendVerifyStatusService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async processAddressCreation(message: KafkaMessage): Promise<void> {
    const { address_id, cis_number } = message;
    try {
      const userDetail = await this.userRepository.findOne({
        where: { cisNumber: cis_number },
      });

      if (!userDetail) {
        console.error('User not found for cis_number:', cis_number);
        return;
      }

      const payloadCis = {
        app_id: process.env.APP_ID_BUYER,
        id: address_id,
        cis_number: null,
        address_type: null,
        platform: null,
      };

      const addressData = await this.cisService.getCustomerAddressDetailById(
        Platform.BUYER,
        payloadCis,
      );

      if (!addressData || !addressData.data) {
        console.error('No address data found for ID:', address_id);
        return;
      }

      const cisData = addressData.data;

      const platform = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.PLATFORM,
          id: cisData.platform,
          code: null,
        },
      );

      const addressType = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.ADDRESS_TYPE,
          id: cisData.address_type,
          code: null,
        },
      );

      if (!addressType || !addressType.data) {
        console.error('Address type not found for ID:', cisData.address_type);
        return;
      }
      if ((platform.code = 'REVAMP_BUYER')) {
        const payload: CreateBuyerAddressDto = {
          cisNumber: cisData.id,
          contactName: cisData.contact_name,
          addressType: ADDRESS_TYPE_CODE[addressType.data.code],
          isDefault: cisData.is_default || false,
          contactPhoneNumber: cisData.contact_phone_number,
          countryId: cisData.country,
          provinceId: cisData.province,
          districtId: cisData.district,
          subDistrictId: cisData.sub_district,
          countryName: cisData.country_name,
          provinceName: cisData.province_name,
          districtName: cisData.district_name,
          subDistrictName: cisData.sub_district_name,
          zipcodeName: cisData.zipcode_name,
          addressName: cisData.address_name,
          addressInfo: cisData.address_info,
          userId: userDetail.id,
          latitude: cisData.latitude || null,
          longitude: cisData.longitude || null,
          organizeId: null,
          remark: cisData.address_detail,
          status: AddressStatus.ACTIVE,
        };

        if (payload.isDefault) {
          await this.buyerAddressService.disableDefaultAllAddress(
            userDetail.id,
            payload.addressType,
          );
        }

        const existingAddress = await this.userCustomerAddressRepo.findOne({
          where: { cisNumber: address_id, status: AddressStatus.ACTIVE },
        });

        if (existingAddress) {
          await this.userCustomerAddressRepo.update(
            { cisNumber: address_id },
            payload,
          );
          console.log(
            `Address already exists Update successfully: ${existingAddress.cisNumber}`,
          );
        } else {
          const newAddress = this.userCustomerAddressRepo.create(payload);
          await this.userCustomerAddressRepo.save(newAddress);
          console.log('Address created successfully:', newAddress.cisNumber);
        }
      } else {
        // for seller
      }
    } catch (error) {
      console.error('Error processing address creation:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async processAddressUpdate(message: KafkaMessage): Promise<void> {
    const { address_id, cis_number } = message;

    try {
      const userDetail = await this.userRepository.findOne({
        where: { cisNumber: cis_number },
      });

      if (!userDetail) {
        console.error('User not found for cis_number:', cis_number);
        return;
      }

      const payloadCis = {
        app_id: process.env.APP_ID_BUYER,
        id: address_id,
        cis_number: null,
        address_type: null,
        platform: null,
      };

      const addressData = await this.cisService.getCustomerAddressDetailById(
        Platform.BUYER,
        payloadCis,
      );

      if (!addressData || !addressData.data) {
        console.error('No address data found for ID:', address_id);
        return;
      }

      const cisData = addressData.data;

      const platform = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.PLATFORM,
          id: cisData.platform,
          code: null,
        },
      );

      const addressType = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.ADDRESS_TYPE,
          id: cisData.address_type,
          code: null,
        },
      );

      if (!addressType || !addressType.data) {
        console.error('Address type not found for ID:', cisData.address_type);
        return;
      }

      if ((platform.code = 'REVAMP_BUYER')) {
        const payload: UpdateBuyerAddressDto = {
          cisNumber: cisData.id,
          contactName: cisData.contact_name,
          addressType: ADDRESS_TYPE_CODE[addressType.data.code],
          isDefault: cisData.is_default || false,
          contactPhoneNumber: cisData.contact_phone_number,
          countryId: cisData.country,
          provinceId: cisData.province,
          districtId: cisData.district,
          subDistrictId: cisData.sub_district,
          countryName: cisData.country_name,
          provinceName: cisData.province_name,
          districtName: cisData.district_name,
          subDistrictName: cisData.sub_district_name,
          zipcodeName: cisData.zipcode_name,
          addressName: cisData.address_name,
          addressInfo: cisData.address_info,
          userId: userDetail.id,
          latitude: cisData.latitude || null,
          longitude: cisData.longitude || null,
          organizeId: null,
          remark: cisData.address_detail,
          status: AddressStatus.ACTIVE,
        };

        if (payload.isDefault) {
          await this.buyerAddressService.disableDefaultAllAddress(
            userDetail.id,
            payload.addressType,
          );
        }

        await this.userCustomerAddressRepo.update(
          { cisNumber: payload.cisNumber },
          payload,
        );

        const newAddress = await this.userCustomerAddressRepo.findOne({
          where: { cisNumber: payload.cisNumber },
        });

        console.log('Address updated successfully:', newAddress?.cisNumber);
      } else {
        // for seller
      }
    } catch (error) {
      console.error('Error processing address creation:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async processAddressDelete(message: KafkaMessage): Promise<void> {
    const { address_id, cis_number } = message;

    try {
      const userDetail = await this.userRepository.findOne({
        where: { cisNumber: cis_number },
      });

      if (!userDetail) {
        console.error('User not found for cis_number:', cis_number);
        return;
      }

      const payloadCis = {
        app_id: process.env.APP_ID_BUYER,
        id: address_id,
        cis_number: null,
        address_type: null,
        platform: null,
      };

      const addressData = await this.cisService.getCustomerAddressDetailById(
        Platform.BUYER,
        payloadCis,
      );

      if (!addressData || !addressData.data) {
        console.error('No address data found for ID:', address_id);
        return;
      }

      const cisData = addressData.data;

      const platform = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.PLATFORM,
          id: cisData.platform,
          code: null,
        },
      );

      const addressType = await this.cisService.findMasterDataById(
        Platform.BUYER,
        {
          app_id: process.env.APP_ID_BUYER,
          master_code: MASTER_CODE.ADDRESS_TYPE,
          id: cisData.address_type,
          code: null,
        },
      );

      if (!addressType || !addressType.data) {
        console.error('Address type not found for ID:', cisData.address_type);
        return;
      }

      if ((platform.code = 'REVAMP_BUYER')) {
        await this.userCustomerAddressRepo.update(
          { cisNumber: address_id },
          { status: AddressStatus.DELETED },
        );

        const updatedAddress = await this.userCustomerAddressRepo.findOne({
          where: { cisNumber: address_id },
        });

        if (updatedAddress) {
          console.log(
            'Address deleted successfully:',
            updatedAddress.cisNumber,
          );
        } else {
          console.log('No address found for deletion.');
        }
      } else {
        //for seller
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  }

  /**
   * Process KYC status change messages.
   * @param message The Kafka message containing KYC status information.
   */
  async processKycStatus(message: KafkaMessage): Promise<void> {
    await Promise.all([ 
      clearCacheByPattern(this.cacheManager,`draft-organize-info:*`),
      clearCacheByPattern(this.cacheManager,`user:organizations:user:*`),
    ])
    const { kyc_status, cis_number } = message;
    try {
      const organization = await this.organizationService.findByCisNumber(
        cis_number,
      );

      const user = await this.userService.findByCisNumber(cis_number);
      if (!organization && !user) {
        return;
      }

      if (user) {
        switch (kyc_status) {
          case kycStatus.APPROVE:
            user.kycStatus = kycStatus.APPROVE;
            user.remarkKyc = null; // mock remarkKyc message
            break;
          case kycStatus.REQUEST_MORE:
            user.kycStatus = kycStatus.REQUEST_MORE;
            user.remarkKyc = 'ขอข้อมูลเพิ่มเติม'; // mock remarkKyc message
            break;
          case kycStatus.REJECT:
            user.kycStatus = kycStatus.REJECT;
            user.remarkKyc = 'ไม่ผ่านการตรวจสอบ'; // mock remarkKyc message
            break;
          default:
            console.error('Unknown KYC status:', kyc_status);
            return;
        }

        await Promise.all([this.userService.updateUserFromDraft(user)]);
      } else {
        let draftKyc: kycStatus = organization.kycStatus;
        switch (kyc_status) {
          case kycStatus.APPROVE:
            organization.kycStatus = kycStatus.APPROVE;
            organization.remarkKyc = null; // mock remarkKyc message
            draftKyc = kycStatus.APPROVE;
            await this.merchantRepository.update(
              { organizeId: organization.id },
              { subdomainStatus: SubDomainStatus.READY },
            );
            break;
          case kycStatus.REQUEST_MORE:
            organization.kycStatus = kycStatus.REQUEST_MORE;
            organization.remarkKyc = 'ขอข้อมูลเพิ่มเติม'; // mock remarkKyc message
            draftKyc = kycStatus.REQUEST_MORE;
            break;
          case kycStatus.REJECT:
            organization.kycStatus = kycStatus.REJECT;
            organization.remarkKyc = 'ไม่ผ่านการตรวจสอบ'; // mock remarkKyc message
            draftKyc = kycStatus.REJECT;
            break;
          default:
            organization.kycStatus = KycStatusCIS[kyc_status];
            organization.remarkKyc = null;
            draftKyc = KycStatusCIS[kyc_status];
            break;
        }

        const sendSms: SendVerifyStatusInfo = {
          cisNumber: organization.cisNumber,
          kycStatus: KycStatusCIS[draftKyc],
          reason: organization.remarkKyc || '',
        };

        await Promise.all([
          this.organizationService.updateOrganizationFromDraft(
            organization.id,
            organization,
          ),
          this.organizationService.updateKycDraftProfile(
            organization.id,
            draftKyc,
          ),
          this.sendVerifyStatusViaSMS.sendVerifyStatusViaSMS(sendSms),
        ]);
      }
    } catch (error) {
      console.error('Error updating KYC status for organization:', error);
    }
  }
}
