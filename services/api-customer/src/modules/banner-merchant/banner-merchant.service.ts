import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BannerMerchantApplication } from '../../model/banner-merchant-application.entity';
import { BannerMerchantDesktop } from '../../model/banner-merchant-desktop.entity';
import { BannerMerchant } from '../../model/banner-merchant.entity';
import { Merchant } from '../../model/merchant.entity';
import { Product } from '../../model/product.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Article } from '../../model/article.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { BannerMerchantDto } from './dto/banner-merchant.dto';
import { CreateBannerMerchantDto } from './dto/create-banner-merchant.dto';
import { BannerMerchantDesktopDto } from './dto/banner-merchant-desktop.dto';
import { BannerMerchantApplicationDto } from './dto/banner-merchant-application.dto';
import { UpdateBannerMerchantDto } from './dto/update-banner-merchant.dto';
import { BatchUpdateBannerMerchantDto } from './dto/batch-update-banner-merchant.dto';

@Injectable()
export class BannerMerchantService {
  constructor(
    @InjectRepository(BannerMerchant)
    private readonly bannerMerchantRepo: Repository<BannerMerchant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(BannerMerchantDesktop)
    private readonly bannerMerchantDesktopRepo: Repository<BannerMerchantDesktop>,
    @InjectRepository(BannerMerchantApplication)
    private readonly bannerMerchantApplicationRepo: Repository<BannerMerchantApplication>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    private readonly contextService: RequestContextService,
  ) {}

  public async getAll(): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerMerchants = await this.bannerMerchantRepo.find({
      where: {
        merchant: merchant,
      },
      order: {
        id: 'ASC',
      },
      relations: [
        'product',
        'productBrand',
        'article',
        'productCategory',
        'productCatalog',
        'bannerMerchantDesktop',
        'bannerMerchantDesktop.imageUpload',
        'bannerMerchantApplication',
        'bannerMerchantApplication.imageUpload',
      ],
    });

    return bannerMerchants.map((e) => BannerMerchantDto.fromEntity(e));
  }

  public async create(
    dto: CreateBannerMerchantDto,
    userId: any,
  ): Promise<BannerMerchantDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const product: Product = await this.productRepo.findOne({
      id: dto?.productId,
    });

    const article: Article = await this.articleRepo.findOne({
      id: dto?.articleId,
    });

    const parentDto = {
      ...dto,
      product,
      article,
      merchant,
    };

    const createBanner = await this.bannerMerchantRepo
      .save(CreateBannerMerchantDto.toEntity(parentDto))
      .then(async (e) => {
        if (dto?.bannerMerchantDesktopAttributes) {
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantDesktopAttributes?.imageUploadId,
          });

          const bannerMerchantDesktopDto = {
            ...dto?.bannerMerchantDesktopAttributes,
            imageUpload,
            bannerMerchant: e,
          };

          await this.bannerMerchantDesktopRepo.save(
            BannerMerchantDesktopDto.toEntity(bannerMerchantDesktopDto),
          );
        }

        if (dto?.bannerMerchantApplicationAttributes) {
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantApplicationAttributes?.imageUploadId,
          });

          const bannerMerchantApplicationDto = {
            ...dto?.bannerMerchantApplicationAttributes,
            imageUpload,
            bannerMerchant: e,
          };

          await this.bannerMerchantApplicationRepo.save(
            BannerMerchantApplicationDto.toEntity(bannerMerchantApplicationDto),
          );
        }

        return CreateBannerMerchantDto.fromEntity(e);
      });
    return null;
  }

  public async createBatchOrUpdate(
    dto: BatchUpdateBannerMerchantDto,
    userId: any,
  ): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerMerchants = await this.bannerMerchantRepo.find({
      where: {
        merchant: merchant,
      },
      order: {
        id: 'ASC',
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'bannerMerchantDesktop',
        'bannerMerchantDesktop.imageUpload',
        'bannerMerchantApplication',
        'bannerMerchantApplication.imageUpload',
      ],
    });

    for (const banner of bannerMerchants) {
      const ids = dto.bannerMerchantAttributes?.map((atr) => atr.id);
      if (ids && !ids.includes(banner.id)) {
        await this.bannerMerchantRepo.softDelete(banner.id);
      }
    }

    for (const attributes of dto.bannerMerchantAttributes) {
      if (!attributes?.id) {
        await this.create(attributes, userId);
      }

      if (attributes?.id) {
        await this.update(attributes?.id, attributes, userId);
      }
    }
    return true;
  }

  public async showById(id: number): Promise<BannerMerchantDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerMerchant = await this.bannerMerchantRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'bannerMerchantDesktop',
        'bannerMerchantDesktop.imageUpload',
        'bannerMerchantApplication',
        'bannerMerchantApplication.imageUpload',
      ],
    });

    return null;
  }

  public async update(
    id: number,
    dto: UpdateBannerMerchantDto,
    userId: any,
  ): Promise<BannerMerchantDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const product: Product = dto?.productId
      ? await this.productRepo.findOne({ id: dto?.productId })
      : null;
    const article: Article = dto?.articleId
      ? await this.articleRepo.findOne({ id: dto?.articleId })
      : null;

    const bannerMerchant = await this.bannerMerchantRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'bannerMerchantDesktop',
        'bannerMerchantApplication',
      ],
    });

    const parentDto = {
      ...dto,
      product,
      article,
      merchant,
    };

    const bannerMerchantEntity = UpdateBannerMerchantDto.toEntity(parentDto);

    const existingDesktopId = bannerMerchant?.bannerMerchantDesktop?.id;
    const existingApplicationId = bannerMerchant?.bannerMerchantApplication?.id;

    const bannerMerchantEntityUpdated = this.bannerMerchantRepo
      .save(Object.assign(bannerMerchant, bannerMerchantEntity))
      .then(async (e) => {
        if (
          existingDesktopId &&
          dto?.bannerMerchantDesktopAttributes &&
          (dto?.bannerMerchantDesktopAttributes?.id === undefined ||
            dto?.bannerMerchantDesktopAttributes?.id === null)
        ) {
          await this.bannerMerchantDesktopRepo.delete(existingDesktopId);

          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantDesktopAttributes?.imageUploadId,
          });

          const bannerMerchantDesktopDto = {
            ...dto?.bannerMerchantDesktopAttributes,
            imageUpload,
            bannerMerchant,
          };

          await this.bannerMerchantDesktopRepo.save(
            BannerMerchantDesktopDto.toEntity(bannerMerchantDesktopDto),
          );
        } else if (
          dto?.bannerMerchantDesktopAttributes &&
          (dto?.bannerMerchantDesktopAttributes?.id === undefined ||
            dto?.bannerMerchantDesktopAttributes?.id === null)
        ) {
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantDesktopAttributes?.imageUploadId,
          });

          const bannerMerchantDesktopDto = {
            ...dto?.bannerMerchantDesktopAttributes,
            imageUpload,
            bannerMerchant,
          };

          await this.bannerMerchantDesktopRepo.save(
            BannerMerchantDesktopDto.toEntity(bannerMerchantDesktopDto),
          );
        }

        if (
          existingDesktopId &&
          dto?.bannerMerchantDesktopAttributes &&
          dto?.bannerMerchantDesktopAttributes?.id
        ) {
          const bannerMerchantDesktop =
            await this.bannerMerchantDesktopRepo.findOne({
              id: dto?.bannerMerchantDesktopAttributes?.id,
            });
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantDesktopAttributes?.imageUploadId,
          });

          const bannerMerchantDesktopDto = {
            ...dto?.bannerMerchantDesktopAttributes,
            imageUpload,
            bannerMerchant,
          };

          const bannerMerchantDesktopEntity = BannerMerchantDesktopDto.toEntity(
            bannerMerchantDesktopDto,
          );

          await this.bannerMerchantDesktopRepo.save(
            Object.assign(bannerMerchantDesktop, bannerMerchantDesktopEntity),
          );
        }

        if (
          existingApplicationId &&
          dto?.bannerMerchantApplicationAttributes &&
          (dto?.bannerMerchantApplicationAttributes?.id === undefined ||
            dto?.bannerMerchantApplicationAttributes?.id === null)
        ) {
          await this.bannerMerchantApplicationRepo.delete(
            existingApplicationId,
          );

          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantApplicationAttributes?.imageUploadId,
          });

          const bannerMerchantApplicationDto = {
            ...dto?.bannerMerchantApplicationAttributes,
            imageUpload,
            bannerMerchant,
          };

          await this.bannerMerchantApplicationRepo.save(
            BannerMerchantApplicationDto.toEntity(bannerMerchantApplicationDto),
          );
        } else if (
          dto?.bannerMerchantApplicationAttributes &&
          (dto?.bannerMerchantApplicationAttributes?.id === undefined ||
            dto?.bannerMerchantApplicationAttributes?.id === null)
        ) {
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantApplicationAttributes?.imageUploadId,
          });

          const bannerMerchantApplicationDto = {
            ...dto?.bannerMerchantApplicationAttributes,
            imageUpload,
            bannerMerchant,
          };

          await this.bannerMerchantApplicationRepo.save(
            BannerMerchantApplicationDto.toEntity(bannerMerchantApplicationDto),
          );
        }

        if (
          existingApplicationId &&
          dto?.bannerMerchantApplicationAttributes &&
          dto?.bannerMerchantApplicationAttributes?.id
        ) {
          const bannerMerchantApplication =
            await this.bannerMerchantApplicationRepo.findOne({
              id: dto?.bannerMerchantApplicationAttributes?.id,
            });
          const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
            id: dto?.bannerMerchantApplicationAttributes?.imageUploadId,
          });

          const bannerMerchantApplicationDto = {
            ...dto?.bannerMerchantApplicationAttributes,
            imageUpload,
            bannerMerchant,
          };

          const bannerMerchantApplicationEntity =
            BannerMerchantApplicationDto.toEntity(bannerMerchantApplicationDto);

          await this.bannerMerchantApplicationRepo.save(
            Object.assign(
              bannerMerchantApplication,
              bannerMerchantApplicationEntity,
            ),
          );
        }

        return e;
      });

    return null;
  }

  public async delete(id: number) {
    return await this.bannerMerchantRepo.softDelete(id);
  }
}
