import { User } from '@/model';
import { Organization } from '@/model/organization.entity';
import { PhoneWhiteList } from '@/model/phone-white-list.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, getConnection, Repository } from 'typeorm';
import {
  CreatePhoneWhiteListDto,
  GetPhoneWhiteListQueryDto,
  PhoneWhiteListPaginatedResponseDto,
  PhoneWhiteListResponseDto,
  UpdatePhoneWhiteListDto,
} from '../organization/dto/phone-white-list.dto';

@Injectable()
export class PhoneWhiteListService {
  constructor(
    @InjectRepository(PhoneWhiteList)
    private readonly phoneWhiteListRepo: Repository<PhoneWhiteList>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Get phone white list for organization with pagination
   */
  async getPhoneWhiteList(
    organizationId: number,
    query: GetPhoneWhiteListQueryDto,
  ): Promise<PhoneWhiteListPaginatedResponseDto> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.phoneWhiteListRepo
      .createQueryBuilder('phone')
      .where('phone.organizationId = :organizationId', { organizationId });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(phone.phoneNumber LIKE :search OR phone.label LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('phone.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const phones = await queryBuilder
      .orderBy('phone.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    for (let i = 0; i < phones.length; i++) {
      const user = await this.userRepo.findOne({
        where: {
          countryCode: phones[i].countryCode,
          tel: phones[i].phoneNumber,
        },
      });
      if (!user) {
        phones[i].isActive = false;
      }
    }

    const result: PhoneWhiteListPaginatedResponseDto = {
      phoneLists: phones.map((phone) =>
        this.transformPhoneToResponseDto(phone),
      ),
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };

    return result;
  }

  /**
   * Get phone white list by ID
   */
  async getPhoneWhiteListById(
    organizationId: number,
    phoneId: number,
  ): Promise<PhoneWhiteListResponseDto> {
    const phone = await this.phoneWhiteListRepo.findOne({
      where: { id: phoneId, organizationId },
    });

    if (!phone) {
      throw new HttpException(
        {
          message: 'Phone white list entry not found',
          error: { code: 'PHONE_WHITE_LIST_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.transformPhoneToResponseDto(phone);
  }

  /**
   * Create new phone white list entry
   */
  async createPhoneWhiteList(
    organizationId: number,
    createDto: CreatePhoneWhiteListDto[],
  ): Promise<boolean> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let i = 0; i < createDto.length; i++) {
        const validation = await this.isPhoneNumberWhitelisted(
          organizationId,
          createDto[i].phoneNumber,
          createDto[i].countryCode,
        );

        if (!validation.isValid) {
          await queryRunner.rollbackTransaction();
          throw new HttpException(
            {
              message: validation.message,
              error: { code: validation.code },
            },
            HttpStatus.CONFLICT,
          );
        }

        await queryRunner.manager.save(
          this.phoneWhiteListRepo.create({
            organizationId,
            phoneNumber: createDto[i].phoneNumber,
            countryCode: createDto[i].countryCode,
          }),
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        {
          message: 'Add phone white list failed',
          error: { code: 'ADD_PHONE_FAIL' },
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  /**
   * Update phone white list entry
   */
  async updatePhoneWhiteList(
    organizationId: number,
    phoneId: number,
    updateDto: UpdatePhoneWhiteListDto,
  ): Promise<PhoneWhiteListResponseDto> {
    const phone = await this.phoneWhiteListRepo.findOne({
      where: { id: phoneId, organizationId },
    });

    if (!phone) {
      throw new HttpException(
        {
          message: 'Phone white list entry not found',
          error: { code: 'PHONE_WHITE_LIST_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check for duplicate phone number if updating phone number (global check)
    if (updateDto.phoneNumber && updateDto.phoneNumber !== phone.phoneNumber) {
      const existingPhone = await this.phoneWhiteListRepo.findOne({
        where: {
          phoneNumber: updateDto.phoneNumber,
          countryCode: updateDto.countryCode || phone.countryCode,
        },
      });

      // Exclude current record from duplicate check
      if (existingPhone && existingPhone.id !== phoneId) {
        throw new HttpException(
          {
            message: 'Phone number already exists in the system',
            error: { code: 'PHONE_ALREADY_EXISTS_GLOBALLY' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Update phone white list entry
    Object.assign(phone, updateDto);
    const updatedPhone = await this.phoneWhiteListRepo.save(phone);

    return this.transformPhoneToResponseDto(updatedPhone);
  }

  /**
   * Delete phone white list entry
   */
  async deletePhoneWhiteList(
    organizationId: number,
    phoneId: number,
  ): Promise<{ success: boolean; message: string }> {
    const phone = await this.phoneWhiteListRepo.findOne({
      where: { id: phoneId, organizationId },
    });

    if (!phone) {
      throw new HttpException(
        {
          message: 'Phone white list entry not found',
          error: { code: 'PHONE_WHITE_LIST_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.phoneWhiteListRepo.remove(phone);

    return {
      success: true,
      message: 'Phone white list entry deleted successfully',
    };
  }

  /**
   * Check if phone number exists in organization's white list
   */
  async isPhoneNumberWhitelisted(
    organizationId: number,
    phoneNumber: string,
    countryCode?: string,
  ): Promise<{ isValid: boolean; message?: string; code?: string }> {
    const whitelist = await this.phoneWhiteListRepo.findOne({
      where: {
        phoneNumber,
        countryCode: countryCode || null,
        isActive: true,
      },
    });

    if (whitelist) {
      if (whitelist.organizationId == organizationId) {
        return {
          isValid: false,
          message: 'Phone is duplicate white list in organize',
          code: 'PHONE_DUP_WHITE_ORG',
        };
      } else {
        return {
          isValid: false,
          message: 'Phone is duplicate white list',
          code: 'PHONE_DUP_WHITE',
        };
      }
    } else {
      const user = await this.userRepo.findOne({
        where: { tel: phoneNumber, countryCode },
        relations: ['userOrganizations'],
      });
      if (
        user?.userOrganizations?.some(
          (org: any) => org.organizeId !== organizationId,
        )
      ) {
        return {
          isValid: false,
          message: 'Phone is duplicate in organize',
          code: 'PHONE_DUP_ORG',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Check if phone number exists globally in the system
   */
  async isPhoneNumberExistsGlobally(
    phoneNumber: string,
    countryCode?: string,
  ): Promise<{ exists: boolean; organizationId?: number; createdAt?: Date }> {
    const phone = await this.phoneWhiteListRepo.findOne({
      where: {
        phoneNumber,
        countryCode: countryCode || null,
      },
    });

    return {
      exists: !!phone,
      organizationId: phone?.organizationId,
      createdAt: phone?.createdAt,
    };
  }

  /**
   * Get all active phone numbers for organization
   */
  async getActivePhoneNumbers(organizationId: number): Promise<string[]> {
    const phones = await this.phoneWhiteListRepo.find({
      where: {
        organizationId,
        isActive: true,
      },
      select: ['phoneNumber', 'countryCode'],
    });

    return phones.map((phone) => {
      if (phone.countryCode && phone.phoneNumber) {
        return `${phone.countryCode}${phone.phoneNumber.replace(/^0/, '')}`;
      }
      return phone.phoneNumber;
    });
  }

  /**
   * Find many phone white list
   */
  async findMany(
    query: FindConditions<PhoneWhiteList>,
  ): Promise<PhoneWhiteList[]> {
    return await this.phoneWhiteListRepo.find({
      where: {
        ...query,
      },
    });
  }

  /**
   * Transform PhoneWhiteList entity to response DTO
   */
  private transformPhoneToResponseDto(
    phone: PhoneWhiteList,
  ): PhoneWhiteListResponseDto {
    return {
      id: phone.id,
      organizationId: phone.organizationId,
      phoneNumber: phone.phoneNumber,
      countryCode: phone.countryCode,
      label: phone.label,
      isActive: phone.isActive,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    };
  }
}
