import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';

import {
  ProductCatalog,
  ProductCatalogStatus,
  ProductCatalogMainStatus,
} from '../../model/product-catalog.entity';
import { Product } from '../../model/product.entity';
import { Merchant } from '../../model/merchant.entity';
import { ProductTranslation } from '../../model/product-translation.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { getAllWithTranslation } from '../../utils';

import { ProductDto } from '../product/dto/product.dto';
import { ProductCatalogDto } from './dto/product-catalog.dto';

import { ProductOrderBy } from './enum/product.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductCatalogPublicService {
  constructor(
    @InjectRepository(ProductCatalog)
    private readonly productCatalogRepo: Repository<ProductCatalog>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslateRepo: Repository<ProductTranslation>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    name: string = '',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `catalogs:${merchant.id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    let productCatalogs = this.productCatalogRepo
      .createQueryBuilder('productCatalog')
      .leftJoinAndSelect('productCatalog.merchant', 'merchant')
      .leftJoinAndSelect('productCatalog.imageUpload', 'imageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('productCatalog.status = :status', {
        status: ProductCatalogStatus.ACTIVE,
      });

    if (name !== '') {
      productCatalogs = await productCatalogs.andWhere(
        'productCatalog.name like :name',
        { name: `%${name}%` },
      );
    }

    productCatalogs = await productCatalogs.orderBy(
      'productCatalog.mainStatus',
      'ASC',
    );

    const data: any =
      withPagination === 'true'
        ? await paginate<ProductCatalog>(productCatalogs, options)
        : await productCatalogs.getMany();

    const productCatalogData = data.items || data;

    const resultData = productCatalogData?.map(async (e) => {
      return ProductCatalogDto.fromEntity(e);
    });

    const resultProductCatalogData = await Promise.all(resultData).then(
      (values) => {
        return values;
      },
    );

    const result = {
      data: resultProductCatalogData,
      meta: data?.meta,
    };

    await this.cacheManager.set(cacheKey, result, 60 * 1000 * 1); // cache 1 min
    return result;
  }

  public async showById(
    id: number,
    options: IPaginationOptions,
    withPagination: string = 'true',
    search: string = '',
    orderBy: string = ProductOrderBy.LASTED,
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();

    const productCatalog: ProductCatalog =
      await this.productCatalogRepo.findOne({
        where: {
          id,
          merchant: merchant,
        },
        relations: ['merchant'],
      });

    let products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect(
        'product.productProductCatalogs',
        'productProductCatalog',
      )
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .andWhere('productProductCatalog.productCatalogId = :productCatalogId', {
        productCatalogId: productCatalog.id,
      });

    const productCatalogData = ProductCatalogDto.fromEntity(productCatalog);

    products = await this.orderByList(products, orderBy, search);

    const productResult: any =
      withPagination === 'true'
        ? await paginate<Product>(products, options)
        : await products.getMany();

    const productData = {
      product: await getAllWithTranslation({
        parentRepoClass: this.productRepo,
        parentDtoClass: ProductDto,
        childRepoClass: this.productTranslateRepo,
        parentKeyForGetChild: 'product',
        locale: this.contextService.currentLang,
        parents: productResult.items || productResult,
        meta: productResult.meta,
        relations: [],
        nestedParentChildWithTranslation: [],
      }),
    };

    const combinedData = {
      productCatalogData,
      productData,
    };

    return {
      data: combinedData,
    };
  }

  public async primaryProductCatalog(): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();

    const primaryProductCatalog = await this.productCatalogRepo.findOne({
      where: {
        mainStatus: ProductCatalogMainStatus.PRIMARY,
        merchant,
      },
      relations: ['merchant', 'imageUpload'],
    });

    if (primaryProductCatalog) {
      const productCatalogData = ProductCatalogDto.fromEntity(
        primaryProductCatalog,
      );

      return {
        data: productCatalogData,
      };
    } else {
      return {
        data: null,
      };
    }
  }

  private async orderByList(products, orderBy, search) {
    if (search !== '') {
      return await products
        .addSelect(
          `CASE WHEN productTranslation.name like :frontName then 1 when productTranslation.name like :name then 2 else null end`,
          '_rank',
        )
        .orderBy('_rank');
    }

    if (orderBy === ProductOrderBy.LASTED) {
      products = await products.orderBy('product.id', 'DESC');
    }

    if (orderBy === ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE) {
      products = await products.orderBy('product.minFinalProductPrice', 'ASC');
    }

    if (orderBy === ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE) {
      products = await products.orderBy('product.maxFinalProductPrice', 'DESC');
    }

    if (orderBy === ProductOrderBy.DEFAULT) {
      products = await products.orderBy('product.id', 'ASC');
    }

    if (orderBy === ProductOrderBy.ASC) {
      products = await products.orderBy('product.id', 'ASC');
    }

    if (orderBy === ProductOrderBy.BEST_SELLER) {
      products = await products.orderBy('product.soldQuantity', 'DESC');
    }

    return products;
  }
}
