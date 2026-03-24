import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';

import { Merchant } from '../../model/merchant.entity';
import { Article } from '../../model/article.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { ArticleDto } from './dto/article.dto';
import { ArticlesDto } from './dto/articles.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class ArticlePublicService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    name: string = '',
    tag: string = '',
  ): Promise<any> {
    try {
      const merchant: Merchant =
        await this.contextService.currentMerchantOnSlug();
      const currentDate = new Date();
      const cacheKey = `articles:${merchant.id}`;

      const cached: any = await this.cacheManager.get(cacheKey);
      if (cached) return cached;

      let articles = this.articleRepo
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.merchant', 'merchant')
        .leftJoinAndSelect('article.imageUpload', 'imageUpload')
        .where('merchant.id = :merchantId', { merchantId: merchant.id })
        .andWhere('article.isPublished = :articleIsPublished', {
          articleIsPublished: true,
        })
        .andWhere('article.releasedAt < :releasedAt', {
          releasedAt: new Date(
            currentDate.getTime() +
              currentDate.getTimezoneOffset() * 60 * 1000 * -1,
          ).toISOString(),
        });

      if (tag !== '') {
        articles = await articles.andWhere(':articleTag = ANY(article.tag)', {
          articleTag: tag,
        });
      }

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
        data:
          data.items?.map((item) => ArticlesDto.fromEntity(item)) ||
          data?.map((item) => ArticlesDto.fromEntity(item)),
        meta: data?.meta,
      };

      await this.cacheManager.set(cacheKey, result, 60 * 1000 * 1); // cache 1 min
      return result;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  public async showById(id: string): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const currentDate = new Date();

    if (parseInt(id) > 0) {
      const articleWithId = await this.articleRepo.findOne({
        where: {
          id: +id,
          merchant: merchant,
          isPublished: true,
          releasedAt: LessThan(
            new Date(
              currentDate.getTime() +
                currentDate.getTimezoneOffset() * 60 * 1000 * -1,
            ).toISOString(),
          ),
        },
        relations: ['imageUpload'],
      });

      const articleData = ArticleDto.fromEntity(articleWithId);

      return {
        data: articleData,
      };
    } else {
      const articleWithSlug = await this.articleRepo.findOne({
        where: {
          urlSlug: id,
          merchant: merchant,
          isPublished: true,
          releasedAt: LessThan(
            new Date(
              currentDate.getTime() +
                currentDate.getTimezoneOffset() * 60 * 1000 * -1,
            ).toISOString(),
          ),
        },
        relations: ['imageUpload'],
      });

      const articleData = ArticleDto.fromEntity(articleWithSlug);

      return {
        data: articleData,
      };
    }
  }
}
