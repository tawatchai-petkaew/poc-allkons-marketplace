import { Merchant } from '@/model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorHandler } from 'allkons-api-helper';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
  ) {}

  async getCurrentMerchantAndTriggerLastAccess({
    slug,
    userId,
  }: {
    slug: string;
    userId: number;
  }) {
    try {
      // Single query: Get merchant with membership validation
      const merchant = await this.merchantRepo
        .createQueryBuilder('merchant')
        .innerJoin(
          'user_merchants_merchant',
          'um',
          'um.merchantId = merchant.id AND um.userId = :userId',
          { userId },
        )
        .leftJoinAndSelect('merchant.merchantTranslations', 'translation')
        .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
        .leftJoinAndSelect('merchantIcon.imageUpload', 'icon')
        .select([
          'merchant.id',
          'merchant.slug',
          'merchant.status',
          'translation.name',
          'merchantIcon.id',
          'icon.url',
        ])
        .where('merchant.slug = :slug', { slug })
        .getOne();

      if (!merchant) {
        ErrorHandler.handleNotFoundError(
          'User is not a member of this merchant or merchant not found',
        );
      }

      // Trigger last access update (fire and forget)
      this.updateLastAccessedAt(userId, merchant.id).catch((err) => {
        console.error('Failed to update last accessed:', err);
      });

      // Transform response
      const name =
        merchant.merchantTranslations?.find((t) => t.locale === 'th')?.name ||
        merchant.merchantTranslations?.[0]?.name ||
        null;

      return {
        id: merchant.id,
        slug: merchant.slug,
        name,
        status: merchant.status,
        merchantIcon: merchant.merchantIcon
          ? { imageUpload: { url: merchant.merchantIcon.imageUpload?.url } }
          : null,
      };
    } catch (error) {
      ErrorHandler.handleInternalServerError(
        'Failed to get current merchant',
        error.message,
      );
    }
  }

  async getMerchantAndTriggerLastAccess({
    slug,
    userId,
  }: {
    slug: string;
    userId: number;
  }) {
    try {
      // Single query: Get merchant with membership validation
      const merchant = await this.merchantRepo
        .createQueryBuilder('merchant')
        .leftJoinAndSelect('merchant.merchantTranslations', 'translation')
        .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
        .leftJoinAndSelect('merchantIcon.imageUpload', 'icon')
        .select([
          'merchant.id',
          'merchant.slug',
          'merchant.status',
          'merchant.merchantType',
          'translation.name',
          'merchantIcon.id',
          'icon.url',
        ])
        .where('merchant.slug = :slug', { slug })
        .getOne();

      if (!merchant) {
        ErrorHandler.handleNotFoundError(
          'User is not a member of this merchant or merchant not found',
        );
      }

      // Trigger last access update (fire and forget)
      this.updateLastAccessedAt(userId, merchant.id).catch((err) => {
        console.error('Failed to update last accessed:', err);
      });

      // Transform response
      const name =
        merchant.merchantTranslations?.find((t) => t.locale === 'th')?.name ||
        merchant.merchantTranslations?.[0]?.name ||
        null;

      return {
        id: merchant.id,
        slug: merchant.slug,
        name,
        status: merchant.status,
        merchantIcon: merchant.merchantIcon
          ? { imageUpload: { url: merchant.merchantIcon.imageUpload?.url } }
          : null,
      };
    } catch (error) {
      ErrorHandler.handleInternalServerError(
        'Failed to get current merchant',
        error.message,
      );
    }
  }

  private async updateLastAccessedAt(
    userId: number,
    merchantId: number,
  ): Promise<void> {
    await this.merchantRepo.manager
      .createQueryBuilder()
      .update('user_merchants_merchant')
      .set({ lastAccessedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .execute();
  }
}
