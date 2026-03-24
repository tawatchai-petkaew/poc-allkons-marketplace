import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Merchant } from '../../model/merchant.entity';
import { Product } from '../../model/product.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { BannerPromotion } from '../../model/banner-promotion.entity';
import { Article } from '../../model/article.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { BannerPromotionDto } from './dto/banner-promotion.dto';
import { CreateBannerPromotionDto } from './dto/create-banner-promotion.dto';
import { UpdateBannerPromotionDto } from './dto/update-banner-promotion.dto';
import { BatchUpdateBannerPromotionDto } from './dto/batch-update-banner-promotion.dto';

@Injectable()
export class BannerPromotionService {
  constructor(
    @InjectRepository(BannerPromotion)
    private readonly bannerPromotionRepo: Repository<BannerPromotion>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    private readonly contextService: RequestContextService,
  ) {}

  public async getAll(): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerPromotions = await this.bannerPromotionRepo.find({
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
        'imageUpload',
      ],
    });

    return bannerPromotions.map((e) => BannerPromotionDto.fromEntity(e));
  }

  public async create(dto: CreateBannerPromotionDto, userId: any) {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const product: Product = await this.productRepo.findOne({
      id: dto?.productId,
    });
    const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
      id: dto?.imageUploadId,
    });
    const article: Article = await this.articleRepo.findOne({
      id: dto?.articleId,
    });

    const parentDto = {
      ...dto,
      product,
      imageUpload,
      article,
      merchant,
    };

    return this.bannerPromotionRepo
      .save(CreateBannerPromotionDto.toEntity(parentDto))
      .then(async (e) => {
        return CreateBannerPromotionDto.fromEntity(e);
      });
  }

  public async createBatchOrUpdate(
    dto: BatchUpdateBannerPromotionDto,
    userId: any,
  ): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const result = await dto?.bannerPromotionAttributes?.map(
      async (attributes) => {
        const merchant: Merchant = await this.contextService.currentMerchant();
        const bannerPromotions = await this.bannerPromotionRepo.find({
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
            'imageUpload',
          ],
        });

        bannerPromotions.forEach(async (banner) => {
          const ids = dto.bannerPromotionAttributes?.map((atr) => atr.id);
          if (ids && !ids.includes(banner.id)) {
            await this.bannerPromotionRepo.softDelete(banner.id);
          }
        });

        if (attributes?.id === null || attributes?.id === undefined) {
          await this.create(attributes, userId);
        }

        if (attributes?.id) {
          await this.update(attributes?.id, attributes, userId);
        }
      },
    );

    const nestedResponse = await Promise.all(result).then((values) => {
      return values;
    });

    return nestedResponse;
  }

  public async showById(id: number): Promise<BannerPromotionDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const bannerPromotion = await this.bannerPromotionRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'imageUpload',
      ],
    });

    return null;
  }

  public async update(
    id: number,
    dto: UpdateBannerPromotionDto,
    userId: any,
  ): Promise<BannerPromotionDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const product: Product = dto?.productId
      ? await this.productRepo.findOne({ id: dto?.productId })
      : null;
    const imageUpload: ImageUpload = dto?.imageUploadId
      ? await this.imageUploadRepo.findOne({ id: dto?.imageUploadId })
      : undefined;
    const article: Article = dto?.articleId
      ? await this.articleRepo.findOne({ id: dto?.articleId })
      : null;

    const bannerPromotion = await this.bannerPromotionRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: [
        'product',
        'article',
        'productBrand',
        'productCategory',
        'productCatalog',
        'imageUpload',
      ],
    });

    const parentDto = {
      ...dto,
      product,
      article,
      imageUpload,
      merchant,
    };

    const bannerPromotionEntity = UpdateBannerPromotionDto.toEntity(parentDto);

    const bannerPromotionEntityUpdated = this.bannerPromotionRepo
      .save(Object.assign(bannerPromotion, bannerPromotionEntity))
      .then(async (e) => {
        return e;
      });

    return null;
  }

  public async delete(id: number) {
    return await this.bannerPromotionRepo.softDelete(id);
  }
}
