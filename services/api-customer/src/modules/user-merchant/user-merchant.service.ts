import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserMerchant } from '../../model/user-merchant.entity';
import { User } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { Role } from '../../model/roles.entity';
import { UserOrganization } from '../../model/user-organization.entity';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import {
  AddUsersToMerchantDto,
  AddUsersToMerchantResponseDto,
} from './dto/add-user-to-merchant.dto';
import { CisService } from '@/modules/cis/cis.service';
import { RelationType } from '@/modules/cis/enum/cis.enum';
import { clearCacheByPattern } from '@/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserMerchantService {
  constructor(
    @InjectRepository(UserMerchant)
    private readonly userMerchantRepo: Repository<UserMerchant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    private readonly roleService: RoleService,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepo: Repository<UserOrganization>,
    private readonly cisService: CisService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async updateLastAccessedAt(
    userId: number,
    merchantId: number,
  ): Promise<void> {
    // ค้นหา record ที่มีอยู่
    let userMerchant = await this.userMerchantRepo.findOne({
      where: {
        userId: userId,
        merchantId: merchantId,
      },
    });

    if (userMerchant) {
      // อัพเดท lastAccessedAt ถ้า record มีอยู่แล้ว
      userMerchant.lastAccessedAt = new Date();
      await this.userMerchantRepo.save(userMerchant);
    } else {
      // สร้าง record ใหม่ถ้ายังไม่มี
      userMerchant = this.userMerchantRepo.create({
        userId: userId,
        merchantId: merchantId,
        lastAccessedAt: new Date(),
      });
      await this.userMerchantRepo.save(userMerchant);
    }
  }

  async getLastAccessedMerchant(userId: number): Promise<UserMerchant | null> {
    // ค้นหา merchant ล่าสุดที่ user เข้าใช้งาน
    return await this.userMerchantRepo.findOne({
      where: { userId: userId },
      order: { lastAccessedAt: 'DESC' },
      relations: ['merchant'],
    });
  }

  async getUserMerchantHistory(userId: number): Promise<UserMerchant[]> {
    // ดึงประวัติการเข้าใช้งาน merchant ทั้งหมดของ user
    return await this.userMerchantRepo.find({
      where: { userId: userId },
      order: { lastAccessedAt: 'DESC' },
      relations: ['merchant'],
    });
  }

  async findUserMerchantByUserId(userId: number): Promise<UserMerchant[]> {
    return this.userMerchantRepo.find({
      where: { userId },
    });
  }

  async delete(merchant: UserMerchant): Promise<void> {
    await this.userMerchantRepo.delete(merchant);
  }

  /**
   * Add multiple users to a merchant with optional roles
   * @param dto DTO containing merchantId and array of users with their roles
   * @returns Response with details of the operation
   */
  async addUsersToMerchant(
    dto: AddUsersToMerchantDto,
  ): Promise<AddUsersToMerchantResponseDto> {
    const { merchantId, users } = dto;
    const details: AddUsersToMerchantResponseDto['details'] = [];
    let addedCount = 0;
    await clearCacheByPattern(
      this.cacheManager,
      `merchant:members:${merchantId}:*`,
    );
    try {
      // 1. Validate merchant exists
      const merchant = await this.merchantRepo.findOne({
        where: { id: merchantId },
        select: ['id', 'organizeId', 'merchantName', 'cisNumber'],
      });

      if (!merchant) {
        throw new HttpException(
          {
            message: 'Merchant not found',
            error: { code: 'MERCHANT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Extract all user IDs and role IDs for batch validation
      const userIds = users.map((u) => u.userId);
      const roleIds = users.filter((u) => u.roleId).map((u) => u.roleId);

      // 3. Validate all users exist and belong to the same organization
      const existingUsers = await this.userRepo.find({
        where: { id: In(userIds) },
        select: [
          'id',
          'email',
          'name',
          'firstNameTh',
          'lastNameTh',
          'countryCode',
          'tel',
          'cisNumber',
        ],
      });

      const existingUserIds = existingUsers.map((u) => u.id);
      const missingUserIds = userIds.filter(
        (id) => !existingUserIds.includes(id),
      );

      if (missingUserIds.length > 0) {
        throw new HttpException(
          {
            message: `Users not found: ${missingUserIds.join(', ')}`,
            error: { code: 'USERS_NOT_FOUND', missingUserIds },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // 4. Validate users are members of the merchant's organization with ACCEPTED status
      const userOrganizations = await this.userOrganizationRepo.find({
        where: {
          userId: In(userIds),
          organizeId: merchant.organizeId,
          memberStatus: UserOrganizationInviteStatus.ACCEPTED,
        },
        select: ['userId', 'organizeId'],
      });

      const validUserIds = userOrganizations.map((uo) => uo.userId);
      const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

      if (invalidUserIds.length > 0) {
        throw new HttpException(
          {
            message: `Users are not members of merchant's organization or not accepted: ${invalidUserIds.join(
              ', ',
            )}`,
            error: { code: 'USERS_NOT_IN_ORGANIZATION', invalidUserIds },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 5. Validate all roles exist and are active (if provided)
      let existingRoles: Role[] = [];
      if (roleIds.length > 0) {
        existingRoles = await this.roleService.getRoleIdAndNameByIds(roleIds);

        const existingRoleIds = existingRoles.map((r) => r.id);
        const invalidRoleIds = roleIds.filter(
          (id) => !existingRoleIds.includes(id),
        );

        if (invalidRoleIds.length > 0) {
          throw new HttpException(
            {
              message: `Roles not found or inactive: ${invalidRoleIds.join(
                ', ',
              )}`,
              error: { code: 'ROLES_NOT_FOUND', invalidRoleIds },
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // 6. Check existing user-merchant relationships
      const existingUserMerchants = await this.userMerchantRepo.find({
        where: {
          userId: In(userIds),
          merchantId,
        },
        select: ['userId', 'merchantId', 'roleId'],
      });

      const existingUserMerchantMap = new Map(
        existingUserMerchants.map((um) => [um.userId, um]),
      );

      // 7. Process each user
      for (const userItem of users) {
        const { userId, roleId } = userItem;

        try {
          const existingRelation = existingUserMerchantMap.get(userId);

          if (existingRelation) {
            // User already exists in merchant
            details.push({
              userId,
              merchantId,
              roleId: existingRelation.roleId,
              status: 'already_exists',
              reason: 'User is already a member of this merchant',
            });
          } else {
            // Add new user to merchant
            const newUserMerchant = this.userMerchantRepo.create({
              userId,
              merchantId,
              roleId: roleId || null,
              lastAccessedAt: null,
            });

            await this.userMerchantRepo.save(newUserMerchant);

            // Get user details for admin record
            const user = existingUsers.find((u) => u.id === userId);

            // Create CIS relationship for user-merchant
            try {
              if (user.cisNumber && merchant.cisNumber) {
                // Find role name from existingRoles
                const role = existingRoles.find((r) => r.id === roleId);
                const roleName = role?.name || 'MEMBER';

                await this.cisService.createRelationship(
                  user.cisNumber,
                  merchant.cisNumber,
                  RelationType.EMPLOYEE,
                  roleName,
                  false,
                );
              } else {
                console.warn(
                  `Skipping CIS relationship creation for user ${userId} and merchant ${merchantId}: missing CIS number`,
                );
              }
            } catch (cisError) {
              // Log error but don't fail the whole operation
              console.error(
                `Failed to create CIS relationship for user ${userId} and merchant ${merchantId}:`,
                cisError,
              );
            }

            addedCount++;

            details.push({
              userId,
              merchantId,
              roleId: roleId || undefined,
              status: 'added',
            });
          }
        } catch (error) {
          details.push({
            userId,
            merchantId,
            roleId: roleId || undefined,
            status: 'failed',
            reason: error.message || 'Unknown error',
          });
        }
      }

      return {
        addedCount,
        details,
      };
    } catch (error) {
      // Re-throw HttpException errors
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        {
          message: 'Failed to add users to merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findMember(
    merchantId: number,
    userId: number,
  ): Promise<UserMerchant | null> {
    try {
      const member = await this.userMerchantRepo.findOne({
        where: {
          merchantId,
          userId,
        },
      });
      if (!member) {
        throw new HttpException(
          {
            message: 'Member not found in merchant',
            error: { code: 'MEMBER_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return member;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to find member in merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMerchantMember(
    userMerchant: UserMerchant,
    roleId: number,
  ): Promise<string> {
    try {
      userMerchant.roleId = roleId;
      await this.userMerchantRepo.save(userMerchant);
      return 'Member role updated successfully';
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to update member role in merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMerchantMember(
    merchantId: number,
    userId: number,
  ): Promise<string> {
    try {
      await this.userMerchantRepo.delete({ userId, merchantId });
      return 'Delete member successfully';
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          message: 'Failed to delete member in merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
