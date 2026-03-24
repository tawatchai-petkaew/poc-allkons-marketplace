import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { In, Repository } from 'typeorm';
import {
  getAllWithTranslationWithData,
  getByIdWithTranslation,
} from '../../utils';
import { Merchant } from '../../model/merchant.entity';
import { ProductBrandTranslation } from '../../model/product-brand-translation.entity';
import { ProductBrand } from '../../model/product-brand.entity';
import { ProductCategoryTranslation } from '../../model/product-category-translation.entity';
import { ProductCategory } from '../../model/product-category.entity';
import { ProductItem } from '../../model/product-item.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { Product } from '../../model/product.entity';
import { FlashSalePublicService } from '../flash-sale-public/flash-sale-public.service';
import { RequestContextService } from '../request-context/request-context.service';
import { ProductDto } from './dto/product.dto';
import { FlashSale } from '@/model/flash-sale.entity';
import { ProductsDto } from './dto/products.dto';
import { ProductOrderBy } from './enum/product.enum';

@Injectable()
export class ProductPublicService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslateRepo: Repository<ProductTranslation>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductCategoryTranslation)
    private readonly productCategoryTranslationRepo: Repository<ProductCategoryTranslation>,
    @InjectRepository(ProductBrand)
    private readonly productBrandRepo: Repository<ProductBrand>,
    @InjectRepository(ProductBrandTranslation)
    private readonly productBrandTranslationRepo: Repository<ProductBrandTranslation>,
    private readonly contextService: RequestContextService,
    private readonly flashSalePublicService: FlashSalePublicService,
    @InjectRepository(ProductItem)
    private readonly productItemRepo: Repository<ProductItem>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    search: string = '',
    productCategoryIds: Array<number>,
    productBrandIds: Array<number>,
    productCatalogIds: Array<number>,
    orderBy: string = ProductOrderBy.LASTED,
  ): Promise<any> {
    const [merchant, getActiveFlashSale]: [Merchant, FlashSale] =
      await Promise.all([
        this.contextService.currentMerchantOnSlug(),
        this.flashSalePublicService.getActiveFlashSale(),
      ]);

    const cacheKey = `${JSON.stringify(
      options,
    )}-${withPagination}-${search}-${JSON.stringify(
      productCategoryIds,
    )}-${JSON.stringify(productBrandIds)}-${JSON.stringify(
      productCatalogIds,
    )}-${orderBy}`;

    const cachedData = await this.cacheManager?.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const subQuery = this.productItemRepo
      .createQueryBuilder('pi')
      .select('pi.id')
      .where('pi.productId = product.id')
      .orderBy('pi.id', 'ASC')
      .limit(1)
      .getQuery();

    let parents = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect(
        'product.productItems',
        'productItem',
        `productItem.id = (${subQuery})`,
      )
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .where('merchant.id = :id', { id: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .select([
        'product.id',
        'product.barCode',
        'product.slug',
        'product.soldQuantity',
        'product.relationStatus',
        'productImage.id',
        'productImage.imageUpload',
        'imageUpload.id',
        'imageUpload.url',
        'imageUpload.name',
        'productItem.id',
        'productItem.slug',
        'productItem.price',
        'productItem.bigUnitPrice',
        'productItem.soldQuantity',
        'productDiscount.type',
        'productDiscount.value',
        'productTranslation',
      ]);

    if (search.trim() !== '') {
      parents = await this.search(parents, search);
    }
    parents = await this.filter(
      parents,
      productCategoryIds,
      productBrandIds,
      productCatalogIds,
    );
    parents = await this.orderBy(parents, orderBy, search);

    const result: any =
      withPagination === 'true'
        ? await paginate<Product>(parents, options)
        : await parents.getMany();

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: this.contextService.currentLang,
      parents: finalData,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    await this.cacheManager.set(cacheKey, productData, 600);

    return productData;
  }

  public async getBestSeller(
    options: IPaginationOptions,
    withPagination: string = 'true',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const locale = this.contextService.currentLang;

    // Create cache key based on merchant, locale, and pagination options
    const cacheKey = `bestseller:${merchant.id}:${locale}:${options.page}:${options.limit}:${withPagination}`;

    // Try to get from cache first
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return cached;
    }

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale();
    const bestSellerProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslation',
      )
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .andWhere('product.soldQuantity > :soldQuantity', { soldQuantity: 0 })
      .orderBy('product.isPopular', 'DESC')
      .addOrderBy('product.soldQuantity', 'DESC')
      .limit(Number(options.limit))
      .skip((Number(options.page) - 1) * Number(options.limit));

    const result: any =
      withPagination === 'true'
        ? await paginate<Product>(bestSellerProducts, options)
        : await bestSellerProducts.getMany();

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: locale,
      parents: finalData,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    await this.cacheManager?.set(cacheKey, productData, 600);

    return productData;
  }

  public async getNew(
    options: IPaginationOptions,
    withPagination: string = 'true',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const locale = this.contextService.currentLang;

    // Create cache key based on merchant, locale, and pagination options
    const cacheKey = `new:${merchant.id}:${locale}:${options.page}:${options.limit}:${withPagination}`;

    // Try to get from cache first
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return cached;
    }

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale();

    const newProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslation',
      )
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .andWhere('product.isNew = :isNew', { isNew: true })
      .orderBy('product.isNew', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .limit(Number(options.limit))
      .skip((Number(options.page) - 1) * Number(options.limit));

    const result: any =
      withPagination === 'true'
        ? await paginate<Product>(newProducts, options)
        : await newProducts.getMany();

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: locale,
      parents: finalData,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    await this.cacheManager?.set(cacheKey, productData, 600);

    return productData;
  }

  public async getDiscount(
    options: IPaginationOptions,
    withPagination: string = 'true',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const locale = this.contextService.currentLang;

    // Create cache key based on merchant, locale, and pagination options
    const cacheKey = `discount:${merchant.id}:${locale}:${options.page}:${options.limit}:${withPagination}`;

    // Try to get from cache first
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return cached;
    }

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale();

    const productDiscounts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslation',
      )
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .andWhere('productItem.productDiscount is not null')
      .andWhere('productDiscount.value != :value', { value: 0 })
      .getMany();

    const result = productDiscounts
      ?.slice(0, 12)
      .sort(this.compareProductDiscount)
      .reverse();

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: locale,
      parents: finalData,
      meta: null,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    await this.cacheManager?.set(cacheKey, productData, 600);

    return productData;
  }

  public async getRecommend(
    options: IPaginationOptions,
    withPagination: string = 'true',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const locale = this.contextService.currentLang;

    // Create cache key based on merchant, locale, and pagination options
    const cacheKey = `recommend:${merchant.id}:${locale}:${options.page}:${options.limit}:${withPagination}`;

    // Try to get from cache first
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return cached;
    }

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale();

    const recommedProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslation',
      )
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id })
      .andWhere('product.type = :type', { type: 'available' })
      .andWhere('product.isRecommend = :isRecommend', { isRecommend: true })
      .orderBy('product.isRecommend', 'DESC')
      .addOrderBy('product.soldQuantity', 'DESC')
      .limit(Number(options.limit))
      .skip((Number(options.page) - 1) * Number(options.limit));

    const result: any =
      withPagination === 'true'
        ? await paginate<Product>(recommedProducts, options)
        : await recommedProducts.getMany();

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: locale,
      parents: finalData,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    await this.cacheManager?.set(cacheKey, productData, 600);

    return productData;
  }

  public async showBySlug(slug: string): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `productSlug:${merchant.id}:${slug}`;
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return { data: cached };
    }
    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale();

    const parent = await this.productRepo.findOne({
      where: {
        slug,
        merchant: merchant,
      },
      relations: [
        'productCategory',
        'productCategory.productCategoryTranslations',
        'productBrand',
        'productBrand.productBrandTranslations',
        'productImages',
        'productImages.imageUpload',
        'productItems',
        'productItems.productDiscount',
        'productItems.productBigUnitDiscount',
        'productItems.stock',
        'productItems.imageUpload',
        'package',
        'package.packageProducts',
        'package.packageProducts.product',
      ],
    });

    const productData = await getByIdWithTranslation({
      id: parent.id,
      parent: parent,
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: this.contextService.currentLang,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    const finalData = this.flashSalePublicService.transformProduct(
      getActiveFlashSale,
      productData,
    );

    await this.cacheManager.set(cacheKey, finalData, 60 * 1000 * 1); // cache 1 min
    return {
      data: finalData,
    };
  }

  public async getRelationProduct(slug: string): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `relationProduct:${merchant.id}:${slug}`;
    const cached = await this.cacheManager?.get(cacheKey);
    if (cached) {
      return cached;
    }
    const product = await this.productRepo.findOne({
      where: {
        slug,
        merchant: merchant,
      },
      relations: ['productCategory'],
    });
    const relationType = product.relationStatus;
    const ids = product.valueCustomRelationStatus?.map((id) => +id);
    let products;

    if (relationType === 'onCategory') {
      const result = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.productTranslations', 'productTranslation')
        .leftJoinAndSelect('product.merchant', 'merchant')
        .leftJoinAndSelect('product.productCategory', 'productCategory')
        .leftJoinAndSelect(
          'productCategory.productCategoryTranslations',
          'productCategoryTranslation',
        )
        .leftJoinAndSelect('product.productBrand', 'productBrand')
        .leftJoinAndSelect(
          'productBrand.productBrandTranslations',
          'productBrandTranslation',
        )
        .leftJoinAndSelect('product.productImages', 'productImage')
        .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
        .leftJoinAndSelect('product.productItems', 'productItem')
        .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
        .leftJoinAndSelect(
          'productItem.productBigUnitDiscount',
          'productBigUnitDiscount',
        )
        .leftJoinAndSelect('productItem.stock', 'stock')
        .where('product.slug != :slug', { slug: product.slug })
        .andWhere('merchant.id = :id', { id: merchant.id })
        .andWhere('productCategory.id = :categoryId', {
          categoryId: product.productCategory.id,
        })
        .take(5)
        .getMany();

      products = getAllWithTranslationWithData({
        parentRepoClass: this.productRepo,
        parentDtoClass: ProductDto,
        childRepoClass: this.productTranslateRepo,
        parentKeyForGetChild: 'product',
        locale: this.contextService.currentLang,
        parents: result,
        meta: {},
        relations: [],
        nestedParentChildWithTranslation: [
          {
            parentRepoClass: this.productCategoryRepo,
            childRepoClass: this.productCategoryTranslationRepo,
            parentKey: 'productCategory',
          },
          {
            parentRepoClass: this.productBrandRepo,
            childRepoClass: this.productBrandTranslationRepo,
            parentKey: 'productBrand',
          },
        ],
      });
    } else if (relationType === 'allCategory') {
      const result = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.productTranslations', 'productTranslation')
        .leftJoinAndSelect('product.merchant', 'merchant')
        .leftJoinAndSelect('product.productCategory', 'productCategory')
        .leftJoinAndSelect(
          'productCategory.productCategoryTranslations',
          'productCategoryTranslation',
        )
        .leftJoinAndSelect('product.productBrand', 'productBrand')
        .leftJoinAndSelect(
          'productBrand.productBrandTranslations',
          'productBrandTranslation',
        )
        .leftJoinAndSelect('product.productImages', 'productImage')
        .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
        .leftJoinAndSelect('product.productItems', 'productItem')
        .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
        .leftJoinAndSelect(
          'productItem.productBigUnitDiscount',
          'productBigUnitDiscount',
        )
        .leftJoinAndSelect('productItem.stock', 'stock')
        .where('product.slug != :slug', { slug: product.slug })
        .andWhere('merchant.id = :id', { id: merchant.id })
        .take(5)
        .getMany();

      products = getAllWithTranslationWithData({
        parentRepoClass: this.productRepo,
        parentDtoClass: ProductDto,
        childRepoClass: this.productTranslateRepo,
        parentKeyForGetChild: 'product',
        locale: this.contextService.currentLang,
        parents: result,
        meta: {},
        relations: [],
        nestedParentChildWithTranslation: [
          {
            parentRepoClass: this.productCategoryRepo,
            childRepoClass: this.productCategoryTranslationRepo,
            parentKey: 'productCategory',
          },
          {
            parentRepoClass: this.productBrandRepo,
            childRepoClass: this.productBrandTranslationRepo,
            parentKey: 'productBrand',
          },
        ],
      });
    } else {
      const result = await this.productRepo.find({
        where: { id: In(ids) },
        relations: [
          'productTranslates',
          'productCategory',
          'productCategory.productCategoryTranslations',
          'productBrand',
          'productBrand.productBrandTranslations',
          'productImages',
          'productImages.imageUpload',
          'productItems',
          'productItems.productDiscount',
          'productItems.productBigUnitDiscount',
          'productItems.stock',
          'productItems.imageUpload',
          'package',
          'package.packageProducts',
          'package.packageProducts.product',
        ],
      });

      products = getAllWithTranslationWithData({
        parentRepoClass: this.productRepo,
        parentDtoClass: ProductDto,
        childRepoClass: this.productTranslateRepo,
        parentKeyForGetChild: 'product',
        locale: this.contextService.currentLang,
        parents: result,
        meta: {},
        relations: [],
        nestedParentChildWithTranslation: [
          {
            parentRepoClass: this.productCategoryRepo,
            childRepoClass: this.productCategoryTranslationRepo,
            parentKey: 'productCategory',
          },
          {
            parentRepoClass: this.productBrandRepo,
            childRepoClass: this.productBrandTranslationRepo,
            parentKey: 'productBrand',
          },
        ],
      });
    }

    await this.cacheManager.set(cacheKey, products, 60 * 1000 * 1); // cache 1 min

    return products;
  }

  ////////////////////////
  /// Helper Method
  ////////////////////////

  private async search(products, search) {
    if (search !== '') {
      return await products.andWhere(
        'LOWER(productTranslation.name) like LOWER(:name)',
        { name: `%${search}%`, frontName: `${search}%` },
      );
    } else {
      return products;
    }
  }

  private async filter(
    products,
    productCategoryIds,
    productBrandIds,
    productCatalogIds,
  ) {
    if (productCategoryIds?.length > 0) {
      products = await products.andWhere(
        'productCategory.id IN(:...productCategoryIds)',
        { productCategoryIds: productCategoryIds },
      );
    }

    if (productBrandIds?.length > 0) {
      products = await products.andWhere(
        'productBrand.id IN(:...productBrandIds)',
        { productBrandIds: productBrandIds },
      );
    }

    if (productCatalogIds?.length > 0) {
      products.andWhere('productProductCatalog.id IN(:...productCatalogIds)', {
        productCatalogIds: productCatalogIds,
      });
    }

    return products;
  }

  private async orderBy(products, orderBy, search) {
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

  public compareProductDiscount(a, b) {
    let discountA = 0;
    let discountB = 0;

    if (a?.productDiscount) {
      if (a?.productDiscount?.type === 'remain') {
        if (a?.productDiscount?.unitType === 'bath') {
          discountA = a?.price - a?.productDiscount?.value;
        }
        if (a?.productDiscount?.unitType === 'percent') {
          discountA = a?.price * ((100 - a?.productDiscount?.value) / 100);
        }
      }
      if (a?.productDiscount?.type === 'decrease') {
        if (a?.productDiscount?.unitType === 'bath') {
          discountA = a?.productDiscount?.value;
        }
        if (a?.productDiscount?.unitType === 'percent') {
          discountA = a?.price * (a?.productDiscount?.value / 100);
        }
      }
    }

    if (b?.productDiscount) {
      if (b?.productDiscount?.type === 'remain') {
        if (b?.productDiscount?.unitType === 'bath') {
          discountB = b?.price - b?.productDiscount?.value;
        }
        if (b?.productDiscount?.unitType === 'percent') {
          discountB = b?.price * ((100 - b?.productDiscount?.value) / 100);
        }
      }
      if (b?.productDiscount?.type === 'decrease') {
        if (b?.productDiscount?.unitType === 'bath') {
          discountB = b?.productDiscount?.value;
        }
        if (b?.productDiscount?.unitType === 'percent') {
          discountB = b?.price * (b?.productDiscount?.value / 100);
        }
      }
    }

    if (discountA / a?.price < discountB / b?.price) {
      return -1;
    }
    if (discountA / a?.price > discountB / b?.price) {
      return 1;
    }
    return 0;
  }
}
