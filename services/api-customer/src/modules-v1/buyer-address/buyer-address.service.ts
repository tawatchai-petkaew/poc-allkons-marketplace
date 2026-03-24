import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBuyerAddressDto } from './dto/create-buyer-address.dto';
import {
  SaveBuyerAddressDto,
  UpdateBuyerAddressDto,
} from './dto/update-buyer-address.dto';
import {
  AddressStatus,
  UserCustomerAddressEntity,
} from '@/model/user-customer-address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CisService } from '@/modules/cis/cis.service';
import {
  CreateCustomerAddressCis,
  UpdateCustomerAddressCis,
} from '@/modules/cis/interfaces/api-request.interface';
import {
  AddressTypeCis,
  JuristicTypeCIS,
  OrganizeTypeCIS,
  PlatformCIS,
} from '@/modules/cis/enum/cis.enum';
import {
  AddressTypeCis as AddressType,
  PersonalType,
} from '@/model/user-customer-address.entity';
import { Platform } from '@/model/organization-contact.entity';
@Injectable()
export class BuyerAddressService {
  constructor(
    @InjectRepository(UserCustomerAddressEntity)
    private readonly userCustomerAddressRepo: Repository<UserCustomerAddressEntity>,

    private readonly cisService: CisService,
  ) {}

  async createAddress(
    userId: number,
    createBuyerAddressDto: CreateBuyerAddressDto,
  ) {
    // Start a transaction
    const queryRunner =
      this.userCustomerAddressRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payloadCis: CreateCustomerAddressCis = {
        app_id: process.env.APP_ID_BUYER,
        cis_number: createBuyerAddressDto.cisNumber,
        platform: PlatformCIS.ALLKONS_M_BUYER,
        contact_name: createBuyerAddressDto.contactName,
        contact_phone_number: createBuyerAddressDto.contactPhoneNumber,
        address_type:
          createBuyerAddressDto.addressType === AddressType.TAX_INVOICE_ADDRESS
            ? 1
            : AddressTypeCis[createBuyerAddressDto.addressType],
        address_name: createBuyerAddressDto.addressName,
        address_info: createBuyerAddressDto.addressInfo,
        address_detail: createBuyerAddressDto.remark,
        street: null,
        country: createBuyerAddressDto.countryId || 1,
        province: createBuyerAddressDto.provinceId,
        district: createBuyerAddressDto.districtId,
        sub_district: createBuyerAddressDto.subDistrictId,
        zipcode: createBuyerAddressDto.zipcodeId,
        country_name: createBuyerAddressDto.countryName || 'ประเทศไทย',
        province_name: createBuyerAddressDto.provinceName,
        district_name: createBuyerAddressDto.districtName,
        sub_district_name: createBuyerAddressDto.subDistrictName,
        zipcode_name: createBuyerAddressDto.zipcodeName,
        latitude: createBuyerAddressDto.latitude || null,
        longitude: createBuyerAddressDto.longitude || null,
        is_default: createBuyerAddressDto.isDefault,
        is_kyc_document: false,
        // tax information - only when addressType is TAX_INVOICE_ADDRESS
        ...(createBuyerAddressDto.addressType ===
          AddressType.TAX_INVOICE_ADDRESS && {
          tax_invoice_juristic_type:
            JuristicTypeCIS[createBuyerAddressDto.juristicTypeId],
          tax_invoice_juristic_name: createBuyerAddressDto.contactName || null,
          tax_invoice_type: createBuyerAddressDto.personalTaxIdType,
          tax_invoice_customer_type:
            createBuyerAddressDto.personalType === PersonalType.PERSONAL
              ? 1
              : 2,
          tax_invoice_tax_id: createBuyerAddressDto.taxId || null,
          is_tax_invoice: true,
          branch: OrganizeTypeCIS[createBuyerAddressDto.branchType],
        }),
      };

      console.log('Payload CIS:', payloadCis);

      const createAddress = await this.cisService.createCustomerAddress(
        payloadCis,
        Platform.BUYER,
      );

      if (!createAddress?.data?.id) {
        throw new InternalServerErrorException(
          'Failed to create address in CIS system',
        );
      }

      if (createBuyerAddressDto.isDefault) {
        await this.disableDefaultAllAddress(
          userId,
          createBuyerAddressDto.addressType,
        );
      }

      createBuyerAddressDto.cisNumber = createAddress.data.id;
      delete createBuyerAddressDto.zipcodeId;

      // Set projectId to null if it's 0 or falsy to avoid foreign key constraint violation
      if (
        !createBuyerAddressDto.projectId ||
        createBuyerAddressDto.projectId === 0
      ) {
        createBuyerAddressDto.projectId = null;
      }

      const newAddress = queryRunner.manager.create(
        UserCustomerAddressEntity,
        createBuyerAddressDto,
      );

      const savedAddress = await queryRunner.manager.save(newAddress);

      await queryRunner.commitTransaction();
      return savedAddress;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to create address: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async existsByAddress(
    userId: number,
    createBuyerAddressDto: CreateBuyerAddressDto,
  ): Promise<boolean> {
    const existingAddress = await this.userCustomerAddressRepo.findOne({
      where: {
        userId: userId,
        addressInfo: createBuyerAddressDto.addressInfo,
        contactPhoneNumber: createBuyerAddressDto.contactPhoneNumber,
        contactName: createBuyerAddressDto.contactName,
        provinceId: createBuyerAddressDto.provinceId,
        districtId: createBuyerAddressDto.districtId,
        subDistrictId: createBuyerAddressDto.subDistrictId,
        zipcodeId: createBuyerAddressDto.zipcodeId,
        status: AddressStatus.ACTIVE,
      },
    });
    return !!existingAddress;
  }

  async findAllAddress(
    userId: number,
    {
      page = 1,
      pageLimit = 10,
      addressTypes,
    }: { page?: number; pageLimit?: number; addressTypes?: string[] },
  ) {
    const skip = (page - 1) * pageLimit;

    const queryBuilder = this.userCustomerAddressRepo
      .createQueryBuilder('address')
      .leftJoin('address.project', 'project')
      .leftJoin('address.subDistrict', 'subDistrict')
      .addSelect(['project.name', 'subDistrict.zipCodeId'])
      .where('address.userId = :userId', { userId })
      .andWhere('address.status = :status', { status: AddressStatus.ACTIVE });

    // Filter by addressTypes if provided
    if (addressTypes && addressTypes.length > 0) {
      queryBuilder.andWhere('address.addressType IN (:...addressTypes)', {
        addressTypes,
      });
    }

    queryBuilder
      .orderBy('address.isDefault', 'DESC')
      .addOrderBy('address.createdAt', 'DESC')
      .skip(skip)
      .take(pageLimit);

    const [items, total] = await queryBuilder.getManyAndCount();

    const result = items.map((item) => {
      const { project, subDistrict, ...rest } = item;
      return {
        ...rest,
        projectName: project?.name ?? null,
        zipcodeId: Number(subDistrict?.zipCodeId) ?? null,
      };
    });

    return {
      items: result,
      meta: {
        total,
        page,
        pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    };
  }

  async findOneAddress(userId: number, id: number) {
    const item = await this.userCustomerAddressRepo
      .createQueryBuilder('address')
      .leftJoin('address.project', 'project')
      .leftJoin('address.subDistrict', 'subDistrict')
      .addSelect(['project.name', 'subDistrict.zipCodeId'])
      .where('address.userId = :userId', { userId })
      .andWhere('address.id = :id', { id })
      .andWhere('address.status = :status', { status: AddressStatus.ACTIVE })
      .getOne();

    if (!item) return null;

    return {
      ...item,
      projectName: item.project?.name ?? null,
      zipcodeId: Number(item.subDistrict?.zipCodeId) ?? null,
      project: undefined,
      subDistrict: undefined,
    };
  }

  async updateAddress(
    userId: number,
    id: number,
    updateBuyerAddressDto: UpdateBuyerAddressDto,
  ) {
    let addressToUpdate = await this.userCustomerAddressRepo.findOne({
      where: { id, userId, status: AddressStatus.ACTIVE },
    });

    if (!addressToUpdate) {
      throw new InternalServerErrorException('Address not found');
    }

    const payloadCis: UpdateCustomerAddressCis = {
      id: addressToUpdate.cisNumber, // CIS number of address
      app_id: process.env.APP_ID_BUYER,
      cis_number: null, // CIS number of the user
      platform: PlatformCIS.ALLKONS_M_BUYER,
      contact_name: updateBuyerAddressDto.contactName,
      contact_phone_number: updateBuyerAddressDto.contactPhoneNumber,
      address_type:
        updateBuyerAddressDto.addressType === AddressType.TAX_INVOICE_ADDRESS
          ? 1
          : AddressTypeCis[updateBuyerAddressDto.addressType],
      address_name: updateBuyerAddressDto.addressName,
      address_info: updateBuyerAddressDto.addressInfo,
      address_detail: updateBuyerAddressDto.remark,
      street: null,
      country: updateBuyerAddressDto.countryId || 1,
      province: updateBuyerAddressDto.provinceId,
      district: updateBuyerAddressDto.districtId,
      sub_district: updateBuyerAddressDto.subDistrictId,
      zipcode: updateBuyerAddressDto.zipcodeId,
      country_name: updateBuyerAddressDto.countryName || 'ประเทศไทย',
      province_name: updateBuyerAddressDto.provinceName,
      district_name: updateBuyerAddressDto.districtName,
      sub_district_name: updateBuyerAddressDto.subDistrictName,
      zipcode_name: updateBuyerAddressDto.zipcodeName,
      latitude: updateBuyerAddressDto.latitude || null,
      longitude: updateBuyerAddressDto.longitude || null,
      is_default: updateBuyerAddressDto.isDefault,
      is_kyc_document: false,
      // tax information - only when addressType is TAX_INVOICE_ADDRESS
      ...(updateBuyerAddressDto.addressType ===
        AddressType.TAX_INVOICE_ADDRESS && {
        tax_invoice_juristic_type:
          JuristicTypeCIS[updateBuyerAddressDto.juristicTypeId],
        tax_invoice_juristic_name: updateBuyerAddressDto.contactName || null,
        tax_invoice_type: updateBuyerAddressDto.personalTaxIdType,
        tax_invoice_customer_type:
          updateBuyerAddressDto.personalType === PersonalType.PERSONAL ? 1 : 2,
        tax_invoice_tax_id: updateBuyerAddressDto.taxId || null,
        is_tax_invoice: true,
        branch: OrganizeTypeCIS[updateBuyerAddressDto.branchType],
      }),
    };

    // Update the address in the CIS system
    const updateAddress = await this.cisService.updateCustomerAddress(
      payloadCis,
      Platform.BUYER,
    );

    // If the update fails, throw an error
    if (!updateAddress || !updateAddress.data || !updateAddress.data.id) {
      throw new InternalServerErrorException(
        'Failed to update address in CIS system',
      );
    }

    const updateDto = new SaveBuyerAddressDto(updateBuyerAddressDto);

    // Set projectId to null if it's 0 or falsy to avoid foreign key constraint violation
    if (!updateDto.projectId || updateDto.projectId === 0) {
      updateDto.projectId = null;
    }

    addressToUpdate = this.userCustomerAddressRepo.create({
      ...addressToUpdate,
      ...updateDto,
      updatedAt: new Date(),
    });

    if (!addressToUpdate) {
      throw new InternalServerErrorException('Address not found');
    }

    if (addressToUpdate.userId !== userId) {
      throw new InternalServerErrorException('User ID mismatch');
    }

    if (addressToUpdate.isDefault) {
      await this.disableDefaultAllAddress(
        userId,
        updateBuyerAddressDto.addressType,
      );

      // Set current address as default
      await this.userCustomerAddressRepo.update(
        { id: addressToUpdate.id },
        { isDefault: true },
      );
    }

    const updatedAddress = await this.userCustomerAddressRepo.save(
      addressToUpdate,
    );
    return { ...updatedAddress, zipcodeId: updateBuyerAddressDto.zipcodeId };
  }

  async removeAddress(userId: number, id: number) {
    // Start a transaction
    const queryRunner =
      this.userCustomerAddressRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const addressToDelete = await queryRunner.manager.findOne(
        UserCustomerAddressEntity,
        {
          where: { id, userId, status: AddressStatus.ACTIVE },
        },
      );

      if (!addressToDelete) {
        throw new InternalServerErrorException('Address not found');
      }

      if (addressToDelete.userId !== userId) {
        throw new InternalServerErrorException('User ID mismatch');
      }

      // Delete the address in the CIS system
      const deletedAddress = await this.cisService.deleteCustomerAddress(
        addressToDelete.cisNumber,
        Platform.BUYER,
      );

      if (!deletedAddress || deletedAddress.message === '9999') {
        throw new InternalServerErrorException(
          'Failed to delete address in CIS system',
        );
      }

      // Set the address status to INACTIVE instead of deleting it
      addressToDelete.status = AddressStatus.DELETED;
      await queryRunner.manager.save(
        UserCustomerAddressEntity,
        addressToDelete,
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Address deleted successfully',
        data: addressToDelete.cisNumber,
      };
    } catch (error) {
      // Rollback the transaction in case of any error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async disableDefaultAllAddress(
    userId: number,
    addressType: AddressType,
    excludeId?: number,
  ) {
    const isShippingOrWorkSite =
      addressType === AddressType.SHIPPING_ADDRESS ||
      addressType === AddressType.WORK_SITE_ADDRESS;

    if (isShippingOrWorkSite) {
      // Clear defaults for both SHIPPING and WORK_SITE
      await this.userCustomerAddressRepo.update(
        {
          userId,
          isDefault: true,
          ...(excludeId ? { id: Not(excludeId) } : {}),
          addressType: In([
            AddressType.SHIPPING_ADDRESS,
            AddressType.WORK_SITE_ADDRESS,
          ]),
        },
        { isDefault: false },
      );
    } else {
      // Clear defaults for the same type only
      await this.userCustomerAddressRepo.update(
        {
          userId,
          isDefault: true,
          ...(excludeId ? { id: Not(excludeId) } : {}),
          addressType,
        },
        { isDefault: false },
      );
    }
  }
}
