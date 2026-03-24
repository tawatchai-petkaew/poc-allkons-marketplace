import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { Merchant, MerchantBranchType } from '@/model/merchant.entity';
import { PaginationType } from '@/types/pagination.type';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MerchantProduct,
  MerchantProductEntityStatus,
  MerchantProductStatus,
} from '@/model/merchant-product.entity';
import { In, Repository } from 'typeorm';
import {
  CheckDuplicateMerchantProductDto,
  MerchantProductValidationResult,
} from '../dto/check-duplicate-merchant-product.dto';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { ProductMatchingService } from '../../product-matching/product-matching.service';
import { ProductVariant } from '@/model/product-variant.entity';
import { Category } from '@/model/category.entity';
import { ProductMatchingInterface } from '../../product-matching/interfaces/product-matching.interface';
import { ProductStatusCount } from '../interfaces/product-status-count.interface';
import { Product } from '@/model/product.entity';
import { AddMerchantProductDto } from '../dto/merchant-product.dto';
import { ProductVariantImage } from '@/model/product-variant-image.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { AuthUser } from '@/types/request.types';
import { GetBranchesListResponseDto } from '../dto/get-branches-response.dto';
import { MerchantCategory } from '@/model/merchant-category.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly contextService: RequestContextService,
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly productMatchingService: ProductMatchingService,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantImage)
    private readonly productVariantImageRepo: Repository<ProductVariantImage>,
    @InjectRepository(UserMerchant)
    private readonly userMerchantRepo: Repository<UserMerchant>,
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoryRepo: Repository<MerchantCategory>,
  ) {}

  public async getProducts(
    merchantId: number,
    page?: number,
    pageLimit?: number,
    search?: string,
    searchType?: string,
    categoryIds?: number[],
    productTypeId?: number,
    merchantProductStatus?: string,
    productVariantIds?: number[],
  ): Promise<PaginationType<MerchantProduct>> {
    const pageNum = page && page > 0 ? page : 1;
    const limitNum = pageLimit && pageLimit > 0 ? pageLimit : 10;
    const skip = (pageNum - 1) * limitNum;

    try {
      const queryBuilder = this.merchantProductRepo
        .createQueryBuilder('mp')
        .leftJoin('mp.productVariant', 'pv')
        .leftJoin('pv.product', 'product')
        .leftJoin('mp.productType', 'productType')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.category', 'category')

        .select([
          'mp.id',
          'mp.merchantCustomName',
          'mp.thumbnail',
          'mp.quantity',
          'mp.createdAt',
          'mp.merchantProductStatus',
          'mp.priceVat',
          'mp.priceVatPercent',
          'mp.priceExcludeVat',
          'mp.priceIncludeVat',
          'mp.specialPriceExcludeVat',
          'mp.specialPriceIncludeVat',
          'mp.specialPriceVat',
          'mp.specialPriceVatPercent',
          'mp.status',
          'mp.prepareDays',
          'mp.requirePriceInquiry',
          'mp.startDate',
          'mp.endDate',
          'pv.id',
          'pv.productId',
          'pv.sku',
          'pv.barcode',
          'pv.alias',
          'pv.productId',
          'product.id',
          'product.name',
          'productType.code',
          'productType.name',
          'productType.name_th',
          'brand.id',
          'brand.name',
          'category.id',
          'category.name',
          'category.parentCategoryId',
        ])
        .where('mp.merchantId = :merchantId', { merchantId });

      // Search filter
      if (search && search.trim()) {
        const trimmedSearch = search.trim();

        switch (searchType) {
          case 'name':
            queryBuilder.andWhere('pv.alias ILIKE :searchLike', {
              searchLike: `%${trimmedSearch}%`,
            });
            break;

          case 'barcode':
            queryBuilder.andWhere('pv.barcode ILIKE :searchLike', {
              searchLike: `%${trimmedSearch}%`,
            });
            break;

          case 'all':
          default:
            queryBuilder.andWhere(
              '(pv.alias ILIKE :searchLike OR pv.sku ILIKE :searchLike OR pv.barcode ILIKE :searchLike OR brand.name ILIKE :searchLike)',
              {
                searchLike: `%${trimmedSearch}%`,
              },
            );
            break;
        }
      }

      // Category filter
      if (categoryIds && categoryIds.length > 0) {
        queryBuilder.andWhere('category.id IN (:...categoryIds)', {
          categoryIds,
        });
      }

      // Product type filter
      if (productTypeId) {
        queryBuilder.andWhere('mp.productTypeId = :productTypeId', {
          productTypeId,
        });
      }

      // Merchant product status filter
      if (merchantProductStatus && merchantProductStatus !== 'ALL') {
        queryBuilder.andWhere(
          'mp.merchantProductStatus = :merchantProductStatus',
          { merchantProductStatus },
        );
      }

      // Product variant IDs filter
      if (productVariantIds && productVariantIds.length > 0) {
        queryBuilder.andWhere('pv.id IN (:...productVariantIds)', {
          productVariantIds,
        });
      }

      queryBuilder.orderBy('mp.createdAt', 'DESC').skip(skip).take(limitNum);

      // Get raw results with all joined data
      const [results, total] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      return {
        meta: {
          page: pageNum,
          pageLimit: limitNum,
          totalItems: total,
          totalPages: Math.ceil(total / limitNum),
        },
        items: results,
      };
    } catch (error) {
      console.error('Error fetching merchant products:', error);
      throw error;
    }
  }

  public async getProductStatusCount(
    merchantId: number,
    search?: string,
    searchType?: string,
    categoryIds?: number[],
    productTypeId?: number,
    productVariantIds?: number[],
  ): Promise<ProductStatusCount> {
    try {
      const queryBuilder = this.merchantProductRepo
        .createQueryBuilder('mp')
        .leftJoin('mp.productVariant', 'pv')
        .leftJoin('pv.product', 'product')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.category', 'category')
        .select('mp.merchantProductStatus', 'status')
        .addSelect('COUNT(DISTINCT mp.id)', 'count')
        .where('mp.merchantId = :merchantId', { merchantId });

      // Search filter with search type
      if (search && search.trim()) {
        const trimmedSearch = search.trim();

        switch (searchType) {
          case 'name':
            queryBuilder.andWhere('pv.alias ILIKE :searchLike', {
              searchLike: `%${trimmedSearch}%`,
            });
            break;

          case 'barcode':
            queryBuilder.andWhere('pv.barcode ILIKE :searchLike', {
              searchLike: `%${trimmedSearch}%`,
            });
            break;

          case 'all':
          default:
            queryBuilder.andWhere(
              '(pv.alias ILIKE :searchLike OR pv.sku ILIKE :searchLike OR pv.barcode ILIKE :searchLike OR brand.name ILIKE :searchLike)',
              {
                searchLike: `%${trimmedSearch}%`,
              },
            );
            break;
        }
      }

      // Category filter
      if (categoryIds && categoryIds.length > 0) {
        queryBuilder.andWhere('category.id IN (:...categoryIds)', {
          categoryIds,
        });
      }

      // Product Type filter
      if (productTypeId) {
        queryBuilder.andWhere('mp.productTypeId = :productTypeId', {
          productTypeId,
        });
      }

      // Product variant IDs filter
      if (productVariantIds && productVariantIds.length > 0) {
        queryBuilder.andWhere('pv.id IN (:...productVariantIds)', {
          productVariantIds,
        });
      }

      const rows = await queryBuilder
        .groupBy('mp.merchantProductStatus')
        .getRawMany<{
          status: MerchantProductStatus;
          count: string;
        }>();

      const countMap = rows.reduce<Record<MerchantProductStatus, number>>(
        (acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        },
        {} as Record<MerchantProductStatus, number>,
      );

      const totalCount = Object.values(countMap).reduce(
        (sum, value) => sum + value,
        0,
      );

      return {
        ALL: totalCount,
        Selling: countMap[MerchantProductStatus.SELLING] ?? 0,
        Hidden: countMap[MerchantProductStatus.HIDDEN] ?? 0,
        OutOfStock: countMap[MerchantProductStatus.OUT_OF_STOCK] ?? 0,
        NotApproved: countMap[MerchantProductStatus.NOT_APPROVED] ?? 0,
      };
    } catch (error) {
      console.error('Error fetching product status count:', error);
      throw error;
    }
  }

  async validateMerchantProducts(
    payload: CheckDuplicateMerchantProductDto,
  ): Promise<MerchantProductValidationResult[]> {
    const { merchantUuids, productVariantSkuUuids } = payload;

    try {
      const [merchants, productVariants] = await Promise.all([
        // Get merchants
        this.merchantRepo
          .createQueryBuilder('merchant')
          .leftJoinAndSelect('merchant.merchantLogo', 'merchantLogo')
          .leftJoinAndSelect('merchantLogo.imageUpload', 'logo')
          .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
          .leftJoinAndSelect('merchantIcon.imageUpload', 'icon')
          .leftJoinAndSelect(
            'merchant.merchantTranslations',
            'merchantTranslation',
          )
          .where('merchant.uuid IN (:...merchantUuids)', { merchantUuids })
          .getMany(),

        // Get product variants
        this.productVariantRepo
          .createQueryBuilder('pv')
          .leftJoin('pv.productVariantImages', 'image')
          .addSelect(['image.id'])
          .leftJoin('image.imageUpload', 'imageUpload')
          .addSelect(['imageUpload.id', 'imageUpload.url'])
          .leftJoin('pv.product', 'p')
          .addSelect(['p.id', 'p.categoryId', 'p.brandId'])
          .leftJoin('p.category', 'category')
          .addSelect(['category.id', 'category.name'])
          .leftJoin('p.brand', 'brand')
          .addSelect(['brand.id', 'brand.name', 'brand.name_th'])
          .where('pv.skuUuid IN (:...productVariantSkuUuids)', {
            productVariantSkuUuids,
          })
          .getMany(),
      ]);

      // Get existing merchant products
      const existingMerchantProducts = await this.merchantProductRepo
        .createQueryBuilder('merchantProduct')
        .select(['merchantProduct.id', 'merchantProduct.merchantId'])
        .leftJoin('merchantProduct.productVariant', 'productVariant')
        .addSelect(['productVariant.id'])
        .leftJoin('productVariant.product', 'product')
        .addSelect(['product.id'])
        .where('merchantProduct.merchantId IN (:...merchantIds)', {
          merchantIds: merchants.map((m) => m.id),
        })
        .andWhere('merchantProduct.status = :status', {
          status: MerchantProductEntityStatus.ACTIVE,
        })
        .getMany();

      // Validate product variants for with existing merchant products
      const result = merchants.map((merchant) => {
        const { addableProducts, duplicatedProducts } = productVariants.reduce(
          (acc, variant) => {
            const isExisting = existingMerchantProducts.some(
              (product) =>
                product.merchantId === merchant.id &&
                product.productVariant.id === variant.id,
            );

            if (isExisting) {
              acc.duplicatedProducts.push(variant);
            } else {
              acc.addableProducts.push(variant);
            }

            return acc;
          },
          {
            addableProducts: [] as ProductVariant[],
            duplicatedProducts: [] as ProductVariant[],
          },
        );

        return {
          merchant,
          addableProducts,
          duplicatedProducts,
        };
      });

      return result;
    } catch (error) {
      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.INTERNAL_SERVER_ERROR,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  /**
   * Add products to merchants with business logic:
   * - Rule 1: If BRANCH, product must exist at HEAD_OFFICE first (auto-create if not)
   * - Rule 2: Skip if product already exists at merchant (using upsert with orIgnore)
   *
   * Process one merchant at a time for clarity
   */
  async addMerchantProducts(
    body: AddMerchantProductDto[],
  ): Promise<MerchantProduct[]> {
    // 1. Fetch all merchants and product variants upfront
    const merchantUuids = [...new Set(body.map((item) => item.merchantUuid))];
    const allProductVariantSkuUuids = [
      ...new Set(body.flatMap((item) => item.productVariantSkuUuids)),
    ];

    const [merchants, productVariants] = await Promise.all([
      this.merchantRepo.find({
        where: { uuid: In(merchantUuids) },
        select: ['id', 'uuid', 'merchantBranchType', 'organizeId'],
      }),
      this.productVariantRepository.find({
        where: { skuUuid: In(allProductVariantSkuUuids) },
        select: ['id', 'skuUuid'],
      }),
    ]);

    if (merchants.length === 0) {
      throw new NotFoundException({
        error: {
          code: ErrorCode.BAD_REQUEST,
          message: 'No valid merchants found for the provided UUIDs',
        },
      });
    }

    if (productVariants.length === 0) {
      throw new NotFoundException({
        error: {
          code: ErrorCode.BAD_REQUEST,
          message: 'No valid product variants found for the provided SKU UUIDs',
        },
      });
    }

    const merchantMap = new Map(merchants.map((m) => [m.uuid, m]));
    const productVariantMap = new Map(
      productVariants.map((pv) => [pv.skuUuid, pv]),
    );

    // 2. Process each merchant one at a time
    const allSavedProducts: MerchantProduct[] = [];
    const errors: { merchantUuid: string; error: string }[] = [];

    for (const item of body) {
      const merchant = merchantMap.get(item.merchantUuid);
      if (!merchant) {
        errors.push({
          merchantUuid: item.merchantUuid,
          error: 'MERCHANT_NOT_FOUND',
        });
        continue;
      }

      try {
        const savedProducts = await this.addProductsToSingleMerchant(
          merchant,
          item.productVariantSkuUuids,
          productVariantMap,
        );
        allSavedProducts.push(...savedProducts);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          merchantUuid: item.merchantUuid,
          error: errorMessage,
        });
      }
    }

    // If all merchants failed, throw error
    if (allSavedProducts.length === 0 && errors.length > 0) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'All merchant products failed to create',
            details: errors,
          },
        },
        400,
      );
    }

    // If no products were created (but no errors either - all skipped)
    if (allSavedProducts.length === 0) {
      throw new NotFoundException({
        error: {
          code: ErrorCode.BAD_REQUEST,
          message: 'No valid merchant products could be created',
        },
      });
    }

    return allSavedProducts;
  }

  /**
   * Add products to a single merchant
   * Handles HEAD_OFFICE/BRANCH logic:
   * - If BRANCH, ensures product exists at HEAD_OFFICE first
   * - If HEAD_OFFICE product has prices, copies them to BRANCH
   * Note: MerchantCategory is now auto-derived via merchant_category_view
   */
  private async addProductsToSingleMerchant(
    merchant: Merchant,
    skuUuids: string[],
    productVariantMap: Map<string, ProductVariant>,
  ): Promise<MerchantProduct[]> {
    // Get product variant IDs for this merchant's products
    const productVariantIds: number[] = [];
    for (const skuUuid of skuUuids) {
      const pv = productVariantMap.get(skuUuid);
      if (pv) productVariantIds.push(pv.id);
    }

    if (productVariantIds.length === 0) return [];

    // Get existing products at this merchant
    const existingProducts = await this.merchantProductRepo.find({
      where: {
        merchantId: merchant.id,
        productVariantId: In(productVariantIds),
        status: MerchantProductEntityStatus.ACTIVE,
      },
      select: ['productVariantId'],
    });
    const existingProductIds = new Set(
      existingProducts.map((p) => p.productVariantId),
    );

    // Find HEAD_OFFICE if merchant is BRANCH
    let headOfficeMerchant: Merchant | null = null;
    let headOfficeExistingIds = new Set<number>();
    let headOfficeProductsMap = new Map<number, MerchantProduct>();

    if (merchant.merchantBranchType === MerchantBranchType.BRANCH) {
      headOfficeMerchant = await this.findHeadOfficeMerchant(merchant);

      if (headOfficeMerchant) {
        const headOfficeProducts = await this.merchantProductRepo.find({
          where: {
            merchantId: headOfficeMerchant.id,
            productVariantId: In(productVariantIds),
            status: MerchantProductEntityStatus.ACTIVE,
          },
          select: [
            'productVariantId',
            'priceVat',
            'priceExcludeVat',
            'priceIncludeVat',
            'priceVatPercent',
          ],
        });
        headOfficeExistingIds = new Set(
          headOfficeProducts.map((p) => p.productVariantId),
        );
        // Store HEAD_OFFICE products with prices for later use
        headOfficeProductsMap = new Map(
          headOfficeProducts.map((p) => [p.productVariantId, p]),
        );
      }
    }

    // Prepare products to insert
    const toInsertHeadOffice: MerchantProduct[] = [];
    const toInsertMerchant: MerchantProduct[] = [];

    for (const skuUuid of skuUuids) {
      const productVariant = productVariantMap.get(skuUuid);
      if (!productVariant) continue;

      // Skip if already exists at this merchant
      if (existingProductIds.has(productVariant.id)) continue;

      // For BRANCH: ensure product exists at HEAD_OFFICE
      let headOfficePrices:
        | {
            priceVat?: number | null;
            priceExcludeVat?: number | null;
            priceIncludeVat?: number | null;
            priceVatPercent?: number | null;
          }
        | undefined;

      if (
        merchant.merchantBranchType === MerchantBranchType.BRANCH &&
        headOfficeMerchant
      ) {
        if (!headOfficeExistingIds.has(productVariant.id)) {
          // Create in HEAD_OFFICE first
          toInsertHeadOffice.push(
            this.createMerchantProductEntity(
              headOfficeMerchant.id,
              productVariant.id,
            ),
          );
          // Mark as added to avoid duplicate in same batch
          headOfficeExistingIds.add(productVariant.id);
        } else {
          // HEAD_OFFICE product exists, get its prices for BRANCH
          const headOfficeProduct = headOfficeProductsMap.get(
            productVariant.id,
          );
          if (headOfficeProduct) {
            headOfficePrices = {
              priceVat: headOfficeProduct.priceVat,
              priceExcludeVat: headOfficeProduct.priceExcludeVat,
              priceIncludeVat: headOfficeProduct.priceIncludeVat,
              priceVatPercent: headOfficeProduct.priceVatPercent,
            };
          }
        }
      }

      // Add to this merchant (with prices from HEAD_OFFICE if available)
      toInsertMerchant.push(
        this.createMerchantProductEntity(
          merchant.id,
          productVariant.id,
          headOfficePrices,
        ),
      );
      existingProductIds.add(productVariant.id);
    }

    // Save products using upsert with orIgnore to handle race conditions
    // Use batching to prevent query timeout on large datasets
    const savedProducts: MerchantProduct[] = [];
    const BATCH_SIZE = 500;

    // Batch insert HEAD_OFFICE products
    if (toInsertHeadOffice.length > 0) {
      for (let i = 0; i < toInsertHeadOffice.length; i += BATCH_SIZE) {
        const batch = toInsertHeadOffice.slice(i, i + BATCH_SIZE);
        await this.merchantProductRepo
          .createQueryBuilder()
          .insert()
          .into(MerchantProduct)
          .values(batch)
          .orIgnore() // Skip if duplicate (unique constraint violation)
          .execute();
      }
    }

    // Batch insert merchant products
    if (toInsertMerchant.length > 0) {
      for (let i = 0; i < toInsertMerchant.length; i += BATCH_SIZE) {
        const batch = toInsertMerchant.slice(i, i + BATCH_SIZE);
        await this.merchantProductRepo
          .createQueryBuilder()
          .insert()
          .into(MerchantProduct)
          .values(batch)
          .orIgnore() // Skip if duplicate (unique constraint violation)
          .execute();
      }

      // Fetch the actually inserted records (including those that already existed)
      // Use batching for the IN clause to prevent query size issues
      const insertedIds = toInsertMerchant.map((p) => p.productVariantId);
      for (let i = 0; i < insertedIds.length; i += BATCH_SIZE) {
        const batchIds = insertedIds.slice(i, i + BATCH_SIZE);
        const saved = await this.merchantProductRepo.find({
          where: {
            merchantId: merchant.id,
            productVariantId: In(batchIds),
            status: MerchantProductEntityStatus.ACTIVE,
          },
        });
        savedProducts.push(...saved);
      }
    }

    return savedProducts;
  }

  /**
   * Find HEAD_OFFICE merchant for a BRANCH merchant
   */
  private async findHeadOfficeMerchant(
    branchMerchant: Merchant,
  ): Promise<Merchant | null> {
    if (!branchMerchant.organizeId) return null;

    return this.merchantRepo.findOne({
      where: {
        organizeId: branchMerchant.organizeId,
        merchantBranchType: MerchantBranchType.HEAD_OFFICE,
      },
    });
  }

  /**
   * Create a MerchantProduct entity with default values
   * @param merchantId - Target merchant ID
   * @param productVariantId - Product variant ID
   * @param priceFields - Optional price fields from HEAD_OFFICE
   */
  private createMerchantProductEntity(
    merchantId: number,
    productVariantId: number,
    priceFields?: {
      priceVat?: number | null;
      priceExcludeVat?: number | null;
      priceIncludeVat?: number | null;
      priceVatPercent?: number | null;
    },
  ): MerchantProduct {
    return this.merchantProductRepo.create({
      merchantId,
      productVariantId,
      merchantProductStatus: MerchantProductStatus.NOT_APPROVED,
      productTypeId: 1,
      isAcceptCash: false,
      isAcceptCredit: false,
      isAcceptCreditCard: false,
      isAcceptCod: false,
      isAcceptPledge: false,
      status: MerchantProductEntityStatus.ACTIVE,
      // Copy price from HEAD_OFFICE if provided
      ...(priceFields && {
        priceVat: priceFields.priceVat,
        priceExcludeVat: priceFields.priceExcludeVat,
        priceIncludeVat: priceFields.priceIncludeVat,
        priceVatPercent: priceFields.priceVatPercent,
      }),
    });
  }

  public async getProductImport(
    search: string,
    page?: number,
    pageLimit?: number,
    filter?: string,
  ): Promise<
    PaginationType<
      ProductMatchingInterface & {
        categoryName?: string | null;
        image?: string | null;
      }
    >
  > {
    try {
      const pageNum = page ? Number(page) : 1;
      const pageLimitNum = pageLimit ? Number(pageLimit) : 10;

      const offset = (pageNum - 1) * pageLimitNum;
      const limit = pageLimitNum;
      const productEls = await this.productMatchingService.searchProducts({
        search,
        offset,
        limit,
        filter: filter || 'all',
      });

      const items: ProductMatchingInterface[] = productEls.items || [];
      const barcodes: string[] = items
        .map((item: ProductMatchingInterface) => item.barcode)
        .filter((code: string) => code);

      if (barcodes.length > 0) {
        const productVariants = await this.productVariantRepository
          .createQueryBuilder('pv')
          .leftJoin('pv.product', 'product')
          .addSelect([
            'product.id',
            'product.slug',
            'product.minFinalProductPrice',
            'product.maxFinalProductPrice',
            'product.barCode',
            'product.videoUrl',
            'product.model',
            'product.piecePerBigUnit',
            'product.weightSize',
            'product.widthSize',
            'product.lengthSize',
            'product.heightSize',
            'product.soldQuantity',
            'product.type',
            'product.kind',
            'product.isRecommend',
            'product.isPopular',
            'product.isNew',
            'product.isPackage',
            'product.relationStatus',
            'product.valueCustomRelationStatus',
            'product.isContactOnly',
            'product.isHideProductPrice',
            'product.telContact',
            'product.emailContact',
            'product.lineContact',
            'product.facebookContact',
            'product.instagramContact',
            'product.urlGoogleMap',
            'product.name',
            'product.description',
            'product.d365Sku',
            'product.d365ItemCode',
            'product.skuUUID',
            'product.status',
            'product.productTM',
            'product.productStatus',
            'product.createdBy',
            'product.updatedBy',
            'product.createdAt',
            'product.updatedAt',
            'product.deleted_at',
            'product.productCategoryId',
          ])
          .leftJoin('product.productCategory', 'pc')
          .addSelect([
            'pc.id',
            'pc.order',
            'pc.status',
            'pc.createdAt',
            'pc.updatedAt',
            'pc.deleted_at',
            'pc.path',
            'pc.skuId',
            'pc.merchantId',
            'pc.categoryId',
            'pc.createdBy',
            'pc.updatedBy',
          ])
          .leftJoin('product.category', 'category')
          .addSelect([
            'category.id',
            'category.name',
            'category.description',
            'category.d365CategoryCode',
            'category.status',
            'category.imageUploadId',
            'category.parentCategoryId',
            'category.createdBy',
            'category.updatedBy',
            'category.createdAt',
            'category.updatedAt',
          ])
          .leftJoin('pv.productVariantCategories', 'pvc')
          .addSelect(['pvc.id', 'pvc.categoryId', 'pvc.brandId'])
          .leftJoin('pvc.brand', 'brand')
          .addSelect(['brand.id', 'brand.name'])
          .leftJoin('pv.productVariantImages', 'image')
          .addSelect(['image.id'])
          .leftJoin('image.imageUpload', 'imageUpload')
          .addSelect(['imageUpload.id', 'imageUpload.url'])
          .where('pv.barcode IN (:...barcodes)', { barcodes })
          .withDeleted()
          .getMany();
        const barcodeToCategoryMap = new Map<string, Category>();
        const barcodeToVariantMap = new Map<string, ProductVariant>();
        productVariants.forEach((pv: ProductVariant) => {
          barcodeToVariantMap.set(pv.barcode, pv);
          if (
            pv.product &&
            pv.product.productCategory &&
            pv.product.productCategory.category
          ) {
            barcodeToCategoryMap.set(
              pv.barcode,
              pv.product.productCategory.category,
            );
          }
        });

        // Extend proper type for return items
        const enrichedItems = items.map((item: ProductMatchingInterface) => {
          const variant = barcodeToVariantMap.get(item.barcode);
          let productVariant = null;
          if (variant) {
            // Get first productVariantCategory
            const pvc = variant.productVariantCategories?.[0];
            console.log(pvc?.category?.id);
            productVariant = {
              id: variant.id,
              alias: variant.alias,
              sku: variant.sku,
              barcode: variant.barcode,
              productId: variant.productId,
              product: variant.product
                ? {
                    id: variant.product.id,
                    name: variant.product.name,
                    brand: variant.product.brand
                      ? {
                          id: variant.product.brand.id,
                          name: variant.product.brand.name,
                        }
                      : null,
                    category: variant.product.category
                      ? {
                          id: variant.product.category.id,
                          name: variant.product.category.name,
                          parentCategoryId:
                            variant.product.category.parentCategoryId,
                        }
                      : null,
                  }
                : null,
              productVariantCategory: pvc
                ? {
                    id: pvc.id,
                    brand: pvc.brand
                      ? {
                          id: pvc.brand.id,
                          name: pvc.brand.name,
                        }
                      : null,
                    category: pvc.category
                      ? {
                          id: pvc.category.id,
                          name: pvc.category.name,
                          parentCategoryId: pvc?.category?.parentCategoryId,
                        }
                      : null,
                  }
                : null,
            };
          }

          return {
            ...item,
            categoryName: barcodeToCategoryMap.get(item.barcode)?.name || null,
            image:
              productVariants.find(
                (pv: ProductVariant) => pv.barcode === item.barcode,
              )?.productVariantImages?.[0]?.imageUpload?.url || null,
            productVariant,
          };
        });

        productEls.items = enrichedItems;
      } else {
        const enrichedItems = items.map((item: ProductMatchingInterface) => ({
          ...item,
          categoryName: null,
          image: null,
        }));
        productEls.items = enrichedItems;
      }

      // Cast the final result to the expected return type as pagination itemsstructure matches
      return productEls as unknown as PaginationType<
        ProductMatchingInterface & {
          categoryName?: string | null;
          image?: string | null;
        }
      >;
    } catch (error) {
      console.log('Error in getProductImport:', error);
      throw new HttpException(
        {
          message: 'Cant get Product Import',
          error: error,
        },
        500,
      );
    }
  }

  public async getProductImagesByVariantIds(
    productVariantIds: number[],
  ): Promise<ProductVariantImage[]> {
    try {
      if (!productVariantIds || productVariantIds.length === 0) {
        return [];
      }

      const images = await this.productVariantImageRepo
        .createQueryBuilder('pvi')
        .leftJoin('pvi.imageUpload', 'imageUpload')
        .select([
          'pvi.id',
          'pvi.productVariantId',
          'pvi.imageUploadId',
          'pvi.order',
          'pvi.createdAt',
          'imageUpload.id',
          'imageUpload.url',
          'imageUpload.name',
        ])
        .where('pvi.productVariantId IN (:...productVariantIds)', {
          productVariantIds,
        })
        .orderBy('pvi.productVariantId', 'ASC')
        .addOrderBy('pvi.createdAt', 'ASC') // order by createdAt to get the oldest image
        .addOrderBy('pvi.id', 'ASC') // tie-breaker
        .distinctOn(['pvi.productVariantId'])
        .getMany();

      return images;
    } catch (error) {
      console.error('Error in getProductImagesByVariantIds:', error);
      throw new HttpException(
        {
          message: 'Cannot get product images',
          error: error,
        },
        500,
      );
    }
  }

  async getBranches(
    sku: string,
    user: AuthUser,
  ): Promise<GetBranchesListResponseDto> {
    const merchant = await this.contextService.currentMerchantOnSlug();

    // Find all merchants belonging to this user
    const userMerchants = await this.userMerchantRepo.find({
      where: { userId: user.id },
      select: ['merchantId'],
    });

    const merchantIds = userMerchants.map((um) => um.merchantId);

    if (merchantIds.length === 0) {
      return { data: [] };
    }

    const branches = await this.merchantProductRepo.find({
      relations: ['merchant', 'productVariant', 'imageUpload'],
      where: {
        merchantId: In(merchantIds),
        productVariant: {
          sku: sku,
        },
        status: MerchantProductEntityStatus.ACTIVE,
        merchantProductStatus: MerchantProductStatus.SELLING,
      },
      order: {
        quantity: 'DESC',
      },
    });

    return {
      data: branches.map((mp) => ({
        merchant: {
          id: mp.merchant.id,
          name: mp.merchant.merchantName || 'สำนักงานใหญ่',
          slug: mp.merchant.slug,
          address: '',
          subdistrict: '',
          district: '',
          province: '',
          postcode: '',
          phone: mp.merchant.tel,
          isCurrent: mp.merchant.id === merchant.id,
        },
        product: {
          sku: mp.productVariant.sku,
          quantity: mp.quantity,
          price: mp.priceIncludeVat,
          specialPrice: mp.specialPriceIncludeVat,
          image: mp.imageUpload?.url || mp.thumbnail,
        },
      })),
    };
  }

  /**
   * Check which product variant IDs exist in merchant's products
   * Only considers ACTIVE status as "existing"
   *
   * @param merchantId - Merchant ID from MerchantGuard
   * @param productVariantIds - Array of product variant IDs to check (max 500)
   * @returns Object with existingIds and notExistingIds arrays
   */
  async checkVariantExistence(
    merchantId: number,
    productVariantIds: number[],
  ): Promise<{ existingIds: number[]; notExistingIds: number[] }> {
    try {
      // Handle empty input
      if (!productVariantIds || productVariantIds.length === 0) {
        return { existingIds: [], notExistingIds: [] };
      }

      // Remove duplicates
      const uniqueIds = [...new Set(productVariantIds)];

      // Query existing merchant products
      const existingProducts = await this.merchantProductRepo.find({
        where: {
          merchantId: merchantId,
          productVariantId: In(uniqueIds),
        },
        select: ['productVariantId'],
      });

      // Extract existing IDs
      const existingIds = existingProducts.map((p) => p.productVariantId);

      // Calculate not existing IDs using Set for O(n) performance
      const existingSet = new Set(existingIds);
      const notExistingIds = uniqueIds.filter((id) => !existingSet.has(id));

      return {
        existingIds,
        notExistingIds,
      };
    } catch (error) {
      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.INTERNAL_SERVER_ERROR,
            message: error?.message || 'Failed to check variant existence',
          },
        },
        error?.status || 500,
      );
    }
  }
}
