import { User } from '@/model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorHandler } from 'allkons-api-helper';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findUserByUuid(uuid: string) {
    return this.userRepo.findOne({ where: { uuid } });
  }

  async getUserProfileByUserId(userId: number) {
    try {
      const user = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.imageUpload', 'profileImage')
        .leftJoinAndSelect('user.merchants', 'merchants')
        .leftJoinAndSelect('merchants.organization', 'organization')
        .leftJoinAndSelect(
          'merchants.userMerchant',
          'userMerchant',
          'userMerchant.userId = :userId',
          { userId },
        )
        .select([
          // User fields
          'user.id',
          'user.uuid',
          'user.name',
          'user.tel',
          'user.email',
          'user.role',
          'user.locale',
          'user.interfaceMode',
          'user.onBoardingStep',
          'user.interfaceMode',
          'user.createdInAuth',
          // Merchant fields
          'merchants.id',
          'merchants.uuid',
          'merchants.slug',
          'merchants.organizeId',
          // Organization fields
          'organization.id',
          'organization.uuid',
          'organization.organizationType',
          'profileImage.id',
          'profileImage.url',
          // UserMerchant fields
          'userMerchant.lastAccessedAt',
        ])
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        ErrorHandler.handleNotFoundError('User not found');
      }

      return this.transformUserProfile(user);
    } catch (error) {
      ErrorHandler.handleInternalServerError(error.message);
    }
  }

  private transformUserProfile(user: User) {
    const transformed = {
      ...user,
      profileImageUrl: user.imageUpload?.url || null,
      merchants: (user.merchants || []).map((merchant: any) => ({
        ...merchant,
        organizeUuid: merchant.organization?.uuid,
        lastAccessedAt: merchant.userMerchant?.[0]?.lastAccessedAt || null,
      })),
    };

    return plainToInstance(UserProfileResponseDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  // copy logic from findUserOrgByCountryAndPhoneNumber
  async findUserOrgByUuid(uuid: string) {
    const userOrgs = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userOrganizations', 'userOrg')
      .leftJoinAndSelect('userOrg.organization', 'organization')
      .leftJoinAndSelect('organization.juristic', 'juristic')
      .leftJoinAndSelect('userOrg.role', 'role')
      .where('user.uuid = :uuid', { uuid })
      .getOne();
    return userOrgs;
  }
}
