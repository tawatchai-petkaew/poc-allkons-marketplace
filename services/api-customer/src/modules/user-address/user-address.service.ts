import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress, AddressTypeEnum } from '../../model/user-address.entity';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UserAddressDto } from './dto/user-address.dto';
import { Country } from '@/model/country.entity';
import { Province } from '@/model/province.entity';
import { District } from '@/model/district.entity';
import { SubDistrict } from '@/model/sub-district.entity';
import { CreateOrganizationAddressDto } from './dto/create-organization-address.dto';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepo: Repository<UserAddress>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(SubDistrict)
    private readonly subDistrictRepo: Repository<SubDistrict>,
  ) {}

  /**
   * Validate address relationships
   * @param addressData Address data to validate
   */
  private async validateAddressRelationships(addressData: {
    addressType: AddressTypeEnum;
    countryId?: number;
    provinceId?: number;
    districtId?: number;
    subDistrictId?: number;
    zipCode?: number;
  }): Promise<void> {
    const {
      countryId,
      provinceId,
      districtId,
      subDistrictId,
      zipCode,
      addressType,
    } = addressData;

    // Validate country exists
    if (countryId) {
      const country = await this.countryRepo.findOne({
        where: { id: countryId },
      });
      if (!country) {
        throw new HttpException(
          {
            message: 'Country not found',
            data: { code: 'COUNTRY_NOT_FOUND', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate province exists and belongs to country
    if (provinceId) {
      const province = await this.provinceRepo.findOne({
        where: { id: provinceId },
        relations: ['country'],
      });

      if (!province) {
        throw new HttpException(
          {
            message: 'Province not found',
            data: { code: 'PROVINCE_NOT_FOUND', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (countryId && province.country?.id !== countryId) {
        throw new HttpException(
          {
            message: 'Province does not belong to the specified country',
            data: { code: 'PROVINCE_COUNTRY_MISMATCH', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate district exists and belongs to province
    if (districtId) {
      const district = await this.districtRepo.findOne({
        where: { id: districtId },
        relations: ['province'],
      });

      if (!district) {
        throw new HttpException(
          {
            message: 'District not found',
            data: { code: 'DISTRICT_NOT_FOUND', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (provinceId && district.province?.id !== provinceId) {
        throw new HttpException(
          {
            message: 'District does not belong to the specified province',
            data: { code: 'DISTRICT_PROVINCE_MISMATCH', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validate sub-district exists and belongs to district
    if (subDistrictId) {
      const subDistrict = await this.subDistrictRepo.findOne({
        where: { id: subDistrictId },
        relations: ['district'],
      });

      if (!subDistrict) {
        throw new HttpException(
          {
            message: 'Sub-district not found',
            data: { code: 'SUB_DISTRICT_NOT_FOUND', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (districtId && subDistrict.district?.id !== districtId) {
        throw new HttpException(
          {
            message: 'Sub-district does not belong to the specified district',
            data: { code: 'SUB_DISTRICT_DISTRICT_MISMATCH', addressType },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate zipCode matches with sub-district
      // if (zipCode && subDistrict.zip_code && subDistrict.zip_code !== zipCode.toString()) {
      //   throw new HttpException(
      //     { message: 'Zip code does not match with the specified sub-district', data: {code: 'ZIPCODE_SUBDISTRICT_MISMATCH', addressType} },
      //     HttpStatus.BAD_REQUEST
      //   );
      // }
    }

    // if (zipCode) {
    //   const zipCodeStr = zipCode.toString();

    //   // Check if zipCode is 5 digits (Thai postal code format)
    //   if (!/^\d{5}$/.test(zipCodeStr)) {
    //     throw new HttpException(
    //       {
    //         message: 'Invalid zip code format. Must be 5 digits',
    //         data: { code: 'INVALID_ZIPCODE_FORMAT', addressType },
    //       },
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }

    //   // Check if zipCode exists in sub_district table
    //   const subDistrictsWithZip = await this.subDistrictRepo.find({
    //     where: { zip_code: zipCodeStr },
    //   });

    //   if (subDistrictsWithZip.length === 0) {
    //     throw new HttpException(
    //       {
    //         message:
    //           'Invalid zip code. No sub-district found with this zip code',
    //         data: { code: 'ZIPCODE_NOT_FOUND', addressType },
    //       },
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }

    //   // If subDistrictId is provided, validate it matches one of the sub-districts with this zip code
    //   // if (subDistrictId) {
    //   //   const matchingSubDistrict = subDistrictsWithZip.find(
    //   //     (sd) => sd.id === subDistrictId,
    //   //   );
    //   //   if (!matchingSubDistrict) {
    //   //     throw new HttpException(
    //   //       {
    //   //         message: 'Sub-district and zip code do not match',
    //   //         data: { code: 'ZIPCODE_SUBDISTRICT_MISMATCH', addressType },
    //   //       },
    //   //       HttpStatus.BAD_REQUEST,
    //   //     );
    //   //   }
    //   // }

    //   // If districtId is provided but subDistrictId is not, validate zip code belongs to a sub-district in the specified district
    //   if (districtId && !subDistrictId) {
    //     const validSubDistricts = await this.subDistrictRepo.find({
    //       where: {
    //         zip_code: zipCodeStr,
    //         district: { id: districtId },
    //       },
    //       relations: ['district'],
    //     });

    //     if (validSubDistricts.length === 0) {
    //       throw new HttpException(
    //         {
    //           message:
    //             'Zip code does not belong to any sub-district in the specified district',
    //           data: { code: 'ZIPCODE_DISTRICT_MISMATCH', addressType },
    //         },
    //         HttpStatus.BAD_REQUEST,
    //       );
    //     }
    //   }

    //   // If provinceId is provided but districtId and subDistrictId are not, validate zip code belongs to a sub-district in the specified province
    //   if (provinceId && !districtId && !subDistrictId) {
    //     const validSubDistricts = await this.subDistrictRepo.find({
    //       where: {
    //         zip_code: zipCodeStr,
    //         district: { province: { id: provinceId } },
    //       },
    //       relations: ['district', 'district.province'],
    //     });

    //     if (validSubDistricts.length === 0) {
    //       throw new HttpException(
    //         {
    //           message:
    //             'Zip code does not belong to any sub-district in the specified province',
    //           data: { code: 'ZIPCODE_PROVINCE_MISMATCH', addressType },
    //         },
    //         HttpStatus.BAD_REQUEST,
    //       );
    //     }
    //   }
    // }
  }

  /**
   * Create a new user address
   * @param createDto Address data to create
   * @returns Created user address
   */
  async create(createDto: CreateUserAddressDto): Promise<UserAddressDto> {
    try {
      const entity = this.userAddressRepo.create(createDto);
      const savedEntity = await this.userAddressRepo.save(entity);
      return UserAddressDto.fromEntity(savedEntity);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to create user address: ${error.message}`,
          code: 'CREATE_USER_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an existing user address
   * @param id Address ID
   * @param updateDto Address data to update
   * @returns Updated user address
   */
  async update(
    id: number,
    updateDto: UpdateUserAddressDto,
  ): Promise<UserAddressDto> {
    try {
      const existingAddress = await this.userAddressRepo.findOne({
        where: { id },
      });
      if (!existingAddress) {
        throw new HttpException(
          { message: 'User address not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(existingAddress, updateDto);
      const savedEntity = await this.userAddressRepo.save(existingAddress);
      return UserAddressDto.fromEntity(savedEntity);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to update user address: ${error.message}`,
          code: 'UPDATE_USER_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find user address by user ID and address type
   * @param userId User ID
   * @param addressType Address type
   * @returns User address or null
   */
  async findByUserIdAndType(
    userId: number,
    addressType: AddressTypeEnum,
  ): Promise<UserAddressDto | null> {
    try {
      const entity = await this.userAddressRepo.findOne({
        where: { userId, addressType },
      });
      return entity ? UserAddressDto.fromEntity(entity) : null;
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find user address: ${error.message}`,
          code: 'FIND_USER_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find all addresses for a user
   * @param userId User ID
   * @returns Array of user addresses
   */
  async findByUserId(userId: number): Promise<UserAddressDto[]> {
    try {
      const entities = await this.userAddressRepo.find({
        where: { userId },
        relations: ['country', 'province', 'district', 'subDistrict'],
      });
      return entities.map((entity) => UserAddressDto.fromEntity(entity));
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find user addresses: ${error.message}`,
          code: 'FIND_USER_ADDRESSES_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create or update user address for a specific address type
   * @param userId User ID
   * @param addressType Type of address (ID_CARD, CURRENT, TAX_INVOICE)
   * @param addressData Address information
   * @returns Created or updated user address
   */
  async createOrUpdate(
    userId: number,
    addressType: AddressTypeEnum,
    addressData: {
      usedAddress?: AddressTypeEnum;
      address: string;
      countryId?: number;
      provinceId?: number;
      districtId?: number;
      subDistrictId?: number;
      zipCode?: number;
      cisNumber?: string;
    },
  ): Promise<UserAddressDto> {
    try {
      // Validate address relationships before proceeding
      await this.validateAddressRelationships({
        addressType: addressType,
        countryId: addressData.countryId,
        provinceId: addressData.provinceId,
        districtId: addressData.districtId,
        subDistrictId: addressData.subDistrictId,
        zipCode: addressData.zipCode,
      });

      // Check if address already exists for this user and type
      const existingAddress = await this.findByUserIdAndType(
        userId,
        addressType,
      );

      if (existingAddress) {
        // Update existing address
        return await this.update(existingAddress.id, {
          usedAddress: addressData.usedAddress,
          address: addressData.address,
          countryId: addressData.countryId,
          provinceId: addressData.provinceId,
          districtId: addressData.districtId,
          subDistrictId: addressData.subDistrictId,
          cisNumber: addressData.cisNumber,
        });
      } else {
        // Create new address
        return await this.create({
          userId,
          addressType,
          usedAddress: addressData.usedAddress,
          address: addressData.address,
          countryId: addressData.countryId,
          provinceId: addressData.provinceId,
          districtId: addressData.districtId,
          subDistrictId: addressData.subDistrictId,
          zipCode: addressData.zipCode, // Assuming zipCode is part of addressData
          cisNumber: addressData.cisNumber,
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to create or update user address: ${error.message}`,
          code: 'CREATE_OR_UPDATE_USER_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create or update organization addresses for a specific organization
   * @param organizationId Organization ID
   * @param addressesData Array of address information with types
   * @returns Array of created or updated addresses
   */
  async createOrUpdateOrganizationAddresses(
    organization: number,
    addressType: AddressTypeEnum,
    addressData: {
      usedAddress?: AddressTypeEnum;
      address: string;
      countryId?: number;
      provinceId?: number;
      districtId?: number;
      subDistrictId?: number;
      zipCode?: number;
      cisNumber?: string;
    },
  ): Promise<UserAddressDto> {
    try {
      // Validate address relationships before proceeding
      await this.validateAddressRelationships({
        addressType: addressType,
        countryId: addressData.countryId,
        provinceId: addressData.provinceId,
        districtId: addressData.districtId,
        subDistrictId: addressData.subDistrictId,
        zipCode: addressData.zipCode,
      });

      // Check if address already exists for this organization and type
      const existingAddress = await this.findByOrganizationIdAndType(
        organization,
        addressType,
      );

      if (existingAddress) {
        // Update existing address
        return await this.update(existingAddress.id, {
          usedAddress: addressData.usedAddress,
          address: addressData.address,
          countryId: addressData.countryId,
          provinceId: addressData.provinceId,
          districtId: addressData.districtId,
          subDistrictId: addressData.subDistrictId,
          cisNumber: addressData.cisNumber,
        });
      } else {
        // Create new address
        return await this.createOrganizationAddress({
          organizationId: organization,
          addressType,
          usedAddress: addressData.usedAddress,
          address: addressData.address,
          countryId: addressData.countryId,
          provinceId: addressData.provinceId,
          districtId: addressData.districtId,
          subDistrictId: addressData.subDistrictId,
          zipCode: addressData.zipCode, // Assuming zipCode is part of addressData
          cisNumber: addressData.cisNumber,
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to create or update organization address: ${error.message}`,
          code: 'CREATE_OR_UPDATE_ORGANIZATION_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find all addresses for an organization
   * @param organizationId Organization ID
   * @returns Array of organization addresses
   */
  async findByOrganizationId(
    organizationId: number,
  ): Promise<UserAddressDto[]> {
    try {
      const entities = await this.userAddressRepo.find({
        where: { organizationId },
        relations: ['country', 'province', 'district', 'subDistrict'],
      });
      return entities.map((entity) => UserAddressDto.fromEntity(entity));
    } catch (error) {
      console.error('Error finding organization addresses:', error);
      throw new HttpException(
        {
          message: `Failed to find organization addresses: ${error.message}`,
          data: {
            organizationId,
            code: 'FIND_ORGANIZATION_ADDRESSES_FAILED',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find organization address by type
   * @param organizationId Organization ID
   * @param addressType Address type
   * @returns Organization address or null
   */
  async findByOrganizationIdAndType(
    organizationId: number,
    addressType: AddressTypeEnum,
  ): Promise<UserAddressDto | null> {
    try {
      const entity = await this.userAddressRepo.findOne({
        where: { organizationId, addressType },
        relations: ['country', 'province', 'district', 'subDistrict'],
      });
      return entity ? UserAddressDto.fromEntity(entity) : null;
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find organization address by type: ${error.message}`,
          code: 'FIND_ORGANIZATION_ADDRESS_BY_TYPE_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new organization address
   * @param createDto Address data to create
   * @returns Created organization address
   */
  async createOrganizationAddress(
    createDto: CreateOrganizationAddressDto,
  ): Promise<UserAddressDto> {
    try {
      const entity = this.userAddressRepo.create(createDto);
      const savedEntity = await this.userAddressRepo.save(entity);
      return UserAddressDto.fromEntity(savedEntity);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: `Failed to create user address: ${error.message}`,
          code: 'CREATE_ORGANIZATION_ADDRESS_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find province by code
   * @param code Province code
   * @returns Province or null
   */
  async findProvinceByCode(code: string): Promise<Province | null> {
    try {
      const province = await this.provinceRepo.findOne({ where: { code } });
      return province || null;
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find province by code: ${error.message}`,
          data: { code: 'FIND_PROVINCE_BY_CODE_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find district by code
   * @param code District code
   * @returns District or null
   */
  async findDistrictByCode(code: string): Promise<District | null> {
    try {
      const district = await this.districtRepo.findOne({ where: { code } });
      return district || null;
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find district by code: ${error.message}`,
          data: { code: 'FIND_DISTRICT_BY_CODE_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find sub-district by code
   * @param code Sub-district code
   * @returns Sub-district or null
   */
  async findSubDistrictByCode(code: string): Promise<SubDistrict | null> {
    try {
      const subDistrict = await this.subDistrictRepo.findOne({
        where: { code },
      });
      return subDistrict || null;
    } catch (error) {
      throw new HttpException(
        {
          message: `Failed to find sub-district by code: ${error.message}`,
          data: { code: 'FIND_SUB_DISTRICT_BY_CODE_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserAddressByMerchantId(merchantId: number) {
    const userAddress = await this.userAddressRepo.find({
      where: { merchantId },
    });
    return userAddress;
  }

  async findUserAddressByStoreId(storeId: number) {
    const userAddress = await this.userAddressRepo.find({
      where: { storeId },
    });
    return userAddress;
  }

  async findUserAddressByOrgBranchId(organizeBranchId: number) {
    const userAddress = await this.userAddressRepo.find({
      where: { organizeBranchId },
    });
    return userAddress;
  }

  async findUserAddressByOrgId(organizationId: number) {
    const userAddress = await this.userAddressRepo.find({
      where: { organizationId },
    });
    return userAddress;
  }

  async deleteUserAddressByIds(ids: number[]) {
    return await this.userAddressRepo.delete(ids);
  }

  async deleteUserAddressById(id: number) {
    return await this.userAddressRepo.delete(id);
  }
}
