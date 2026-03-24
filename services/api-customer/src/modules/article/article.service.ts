import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext } from 'nestjs-i18n';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { Article } from '../../model/article.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant } from '../../model/merchant.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { MerchantService } from '../merchant/merchant.service';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    private merchantService: MerchantService,
    private readonly contextService: RequestContextService,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    name: string = '',
  ): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    let articles = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.merchant', 'merchant')
      .leftJoinAndSelect('article.imageUpload', 'imageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id });

    if (name !== '') {
      articles = await articles.andWhere('article.name like :name', {
        name: `%${name}%`,
      });
    }

    articles = await articles.orderBy('article.releasedAt', 'DESC');

    const data: any =
      withPagination === 'true'
        ? await paginate<Article>(articles, options)
        : await articles.getMany();

    const result = {
      data: data.items || data,
      meta: data?.meta,
    };

    return result;
  }

  public async create(
    dto: CreateArticleDto,
    userId: any,
    i18n: I18nContext,
  ): Promise<ArticleDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
      id: dto?.imageUploadId,
    });

    const articles = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.merchant', 'merchant')
      .where('merchant.id = :id', { id: merchant.id })
      .andWhere('article.urlSlug = :urlSlug', { urlSlug: dto.urlSlug })
      .andWhere('article.urlSlug != null')
      .getMany();

    if (articles.length > 0) {
      throw new Error(i18n.t('errors.URL_EXISTS'));
    }

    const parentDto = {
      ...dto,
      imageUpload,
      merchant,
    };

    const createArticle = await this.articleRepo
      .save(CreateArticleDto.toEntity(parentDto))
      .then(async (e) => {
        await this.merchantService.setSoftDeleteRepository(
          'article',
          e.id,
          merchant.slug,
        );

        return CreateArticleDto.fromEntity(e);
      });
    return null;
  }

  public async showById(id: number): Promise<ArticleDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const article = await this.articleRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: ['imageUpload'],
    });

    return null;
  }

  public async update(
    id: number,
    dto: UpdateArticleDto,
    userId: any,
    i18n: I18nContext,
  ): Promise<ArticleDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const imageUpload: ImageUpload =
      dto?.imageUploadId === null
        ? null
        : await this.imageUploadRepo.findOne({ id: dto?.imageUploadId });

    const article = await this.articleRepo.findOne(id, {
      where: {
        merchant: merchant,
      },
      relations: ['imageUpload'],
    });

    if (dto?.urlSlug) {
      const articles = await this.articleRepo
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.merchant', 'merchant')
        .where('article.id != :article_id', { article_id: article.id })
        .andWhere('merchant.id = :id', { id: merchant.id })
        .andWhere('article.urlSlug = :urlSlug', { urlSlug: dto.urlSlug })
        .getMany();

      if (articles.length > 0) {
        throw new Error(i18n.t('errors.URL_EXISTS'));
      }
    }

    const parentDto = {
      ...dto,
      imageUpload,
      merchant,
    };

    const articleEntity = UpdateArticleDto.toEntity(parentDto);

    const articleEntityUpdated = this.articleRepo
      .save(Object.assign(article, articleEntity))
      .then(async (e) => {
        return e;
      });

    return null;
  }

  public async delete(id: number) {
    return await this.articleRepo.softDelete(id);
  }
}
