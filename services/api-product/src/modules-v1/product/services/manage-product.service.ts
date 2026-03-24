import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Merchant, MerchantBranchType } from '@/model/merchant.entity';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { User } from '@/model/user.entity';
import { AuthUser } from '@/types/request.types';
import { S3Service } from '@/modules-v1/s3/s3.service';
import { mapMerchantProductRawToDto } from '../mappers/merchant-product.mapper';
import { MerchantProductDetailResponseDto } from '../dto/merchant-product-detail.dto';
import { MerchantProductQueryRow } from '../interfaces/merchant-product-raw.interface';
import {
  CheckPriceMerchantResponseDto,
  PriceMerchantItemDto,
} from '../dto/check-price-merchant.dto';
import {
  UpdateMerchantProductItemDto,
  UpdateMerchantProductResponseDto,
} from '../dto/update-merchant-product.dto';
import {
  UpdateMerchantProductImagesResponseDto,
  MAX_MERCHANT_IMAGES,
  ALLOWED_MIME_TYPES,
  S3_MERCHANT_IMAGE_FOLDER,
} from '../dto/merchant-product-images.dto';
import { resolveUpdatedByStamp } from '@/utils/utils';

// ─── Cache helpers ────────────────────────────────────────────────────────────
/** 10-minute TTL for the product detail cache */
const DETAIL_CACHE_TTL = 600;
const detailCacheKey = (merchantId: number, productVariantId: number): string =>
  `merchant_product_detail:${merchantId}:${productVariantId}`;

@Injectable()
export class ManageProductService {
  private readonly logger = new Logger(ManageProductService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // GET DETAIL
  // ══════════════════════════════════════════════════════════════════════════

  async getMerchantProductDetail(
    merchantId: number,
    productVariantId: number,
  ): Promise<MerchantProductDetailResponseDto> {
    const cacheKey = detailCacheKey(merchantId, productVariantId);

    const cached =
      await this.cacheManager.get<MerchantProductDetailResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const rows: MerchantProductQueryRow[] = await this.dataSource.query(
      MERCHANT_PRODUCT_DETAIL_SQL,
      [merchantId, productVariantId],
    );

    if (!rows?.length || !rows[0]?.result) {
      throw new NotFoundException(
        `Merchant product not found for productVariantId=${productVariantId}`,
      );
    }

    const dto = mapMerchantProductRawToDto(rows[0].result);

    await this.cacheManager.set(cacheKey, dto, DETAIL_CACHE_TTL);

    return dto;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UPDATE MERCHANT PRODUCT IMAGES
  // ══════════════════════════════════════════════════════════════════════════

  async updateMerchantProductImages(
    merchantId: number,
    productVariantId: number,
    useCustomCoverImage: boolean,
    useCustomMerchantImage: boolean,
    coverImageFile?: Express.Multer.File,
    merchantImageFiles?: Express.Multer.File[],
    keepOrderNumbers?: number[],
    removeCoverImage?: boolean,
  ): Promise<UpdateMerchantProductImagesResponseDto> {
    this.validateImageFiles(
      coverImageFile,
      merchantImageFiles,
      keepOrderNumbers,
      removeCoverImage,
    );

    const merchantProduct = await this.merchantProductRepo.findOne({
      where: {
        merchantId,
        productVariantId,
      },
      select: ['id'],
    });
    if (!merchantProduct) {
      throw new NotFoundException(
        `Merchant product not found: merchantId=${merchantId}, productVariantId=${productVariantId}`,
      );
    }

    type S3Uploaded = {
      url: string;
      key: string;
      isCover: boolean;
      file: Express.Multer.File;
    };

    const filesToUpload = [
      ...(coverImageFile ? [{ file: coverImageFile, isCover: true }] : []),
      ...(merchantImageFiles ?? []).map((f) => ({ file: f, isCover: false })),
    ];

    const s3Settled = await Promise.allSettled(
      filesToUpload.map(async ({ file, isCover }): Promise<S3Uploaded> => {
        const r = await this.s3Service.uploadS3(
          file.buffer,
          process.env.AWS_S3_BUCKET,
          file.originalname,
          S3_MERCHANT_IMAGE_FOLDER,
          file.mimetype,
          true,
        );
        return { url: r.Location, key: r.key, isCover, file };
      }),
    );

    const s3Succeeded = s3Settled
      .filter(
        (r): r is PromiseFulfilledResult<S3Uploaded> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);

    const s3Failed = s3Settled.find(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (s3Failed) {
      await this.s3Service.deleteS3Files(s3Succeeded.map((s) => s.key));
      throw new BadRequestException(
        `S3 upload failed: ${(s3Failed.reason as Error)?.message}`,
      );
    }

    const coverS3 = s3Succeeded.find((s) => s.isCover) ?? null;
    const merchantS3 = s3Succeeded.filter((s) => !s.isCover);
    const uploadedKeys = s3Succeeded.map((s) => s.key);

    let coverImageId: number | null = null;
    let coverImageUrl: string | null = null;
    const merchantImageRows: { id: number; url: string; order: number }[] = [];

    try {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        if (coverS3) {
          const [row] = await manager.query<{ id: number; url: string }[]>(
            `INSERT INTO image_upload (url, name, "imageName", size, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, url`,
            [
              coverS3.url,
              coverS3.key,
              coverS3.file.originalname,
              String(coverS3.file.size),
            ],
          );
          coverImageId = row.id;
          coverImageUrl = row.url;
        }

        const merchantUploadRows: { id: number; url: string }[] = [];
        for (const s3 of merchantS3) {
          const [row] = await manager.query<{ id: number; url: string }[]>(
            `INSERT INTO image_upload (url, name, "imageName", size, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, url`,
            [s3.url, s3.key, s3.file.originalname, String(s3.file.size)],
          );
          merchantUploadRows.push(row);
        }

        const keepOrders = (keepOrderNumbers ?? []).filter(
          (o) => o >= 1 && o <= MAX_MERCHANT_IMAGES,
        );
        const ALL_SLOTS = [1, 2, 3, 4];
        const hasKeepOrders = keepOrders.length > 0;

        if (hasKeepOrders) {
          await manager.query(
            `DELETE FROM merchant_image
             WHERE "merchantProductId" = $1
             AND ("order" IS NULL OR NOT ("order" = ANY($2::int[])))`,
            [merchantProduct.id, keepOrders],
          );

          if (merchantUploadRows.length > 0) {
            const freedSlots = ALL_SLOTS.filter(
              (s) => !keepOrders.includes(s),
            ).sort((a, b) => a - b);
            if (merchantUploadRows.length > freedSlots.length) {
              await this.s3Service.deleteS3Files(uploadedKeys);
              throw new BadRequestException(
                `Keeping orders [${keepOrders.join(', ')}] frees ${freedSlots.length} slot(s) (${freedSlots.join(', ')}). Send at most ${freedSlots.length} new image(s).`,
              );
            }
            for (let i = 0; i < merchantUploadRows.length; i++) {
              const order = freedSlots[i];
              const [mi] = await manager.query<{ order: number }[]>(
                `INSERT INTO merchant_image
                   ("merchantProductId", "imageUploadId", "order", "isSearchDirty", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, 1, NOW(), NOW()) RETURNING "order"`,
                [merchantProduct.id, merchantUploadRows[i].id, order],
              );
              merchantImageRows.push({
                id: merchantUploadRows[i].id,
                url: merchantUploadRows[i].url,
                order: mi.order,
              });
            }
          } else {
            await manager.query(
              `UPDATE merchant_image mi SET "order" = t.rn
               FROM (
                 SELECT id, ROW_NUMBER() OVER (ORDER BY "order" ASC NULLS LAST, "createdAt" ASC)::int AS rn
                 FROM merchant_image
                 WHERE "merchantProductId" = $1
               ) t
               WHERE mi.id = t.id AND mi."merchantProductId" = $1`,
              [merchantProduct.id],
            );
          }
        } else if (merchantUploadRows.length > 0) {
          const [{ count: existingCount }] = await manager.query<
            { count: string }[]
          >(
            `SELECT COUNT(*)::text AS count FROM merchant_image WHERE "merchantProductId" = $1`,
            [merchantProduct.id],
          );
          const existing = parseInt(existingCount, 10) || 0;
          const totalAfterAdd = existing + merchantUploadRows.length;

          if (totalAfterAdd > MAX_MERCHANT_IMAGES) {
            const toRemove = totalAfterAdd - MAX_MERCHANT_IMAGES;
            await manager.query(
              `DELETE FROM merchant_image WHERE id IN (
                  SELECT id FROM merchant_image m
                  WHERE m."merchantProductId" = $1
                  ORDER BY m."createdAt" ASC
                  LIMIT $2
                )`,
              [merchantProduct.id, toRemove],
            );
          }

          await manager.query(
            `UPDATE merchant_image mi SET "order" = t.rn
               FROM (
                 SELECT id, ROW_NUMBER() OVER (ORDER BY "order" ASC NULLS LAST, "createdAt" ASC)::int AS rn
                 FROM merchant_image
                 WHERE "merchantProductId" = $1
               ) t
               WHERE mi.id = t.id AND mi."merchantProductId" = $1`,
            [merchantProduct.id],
          );

          const [{ max_order: maxOrder }] = await manager.query<
            { max_order: number | null }[]
          >(
            `SELECT COALESCE(MAX("order"), 0)::int AS max_order FROM merchant_image WHERE "merchantProductId" = $1`,
            [merchantProduct.id],
          );
          const nextOrder = Math.min(
            MAX_MERCHANT_IMAGES,
            Number(maxOrder ?? 0) + 1,
          );

          for (let i = 0; i < merchantUploadRows.length; i++) {
            const order = Math.min(MAX_MERCHANT_IMAGES, nextOrder + i);
            const [mi] = await manager.query<{ order: number }[]>(
              `INSERT INTO merchant_image
                   ("merchantProductId", "imageUploadId", "order", "isSearchDirty", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, 1, NOW(), NOW()) RETURNING "order"`,
              [merchantProduct.id, merchantUploadRows[i].id, order],
            );
            merchantImageRows.push({
              id: merchantUploadRows[i].id,
              url: merchantUploadRows[i].url,
              order: mi.order,
            });
          }
        } else {
          await manager.query(
            `DELETE FROM merchant_image WHERE "merchantProductId" = $1`,
            [merchantProduct.id],
          );
        }

        await manager.query(
          `UPDATE merchant_product
              SET "productCoverImage"      = CASE WHEN $5::boolean THEN NULL ELSE COALESCE($1, "productCoverImage") END,
                  "useCustomCoverImage"    = $2,
                  "useCustomMerchantImage" = $3,
                  "updatedAt"              = NOW()
            WHERE id = $4`,
          [
            coverImageId,
            useCustomCoverImage,
            useCustomMerchantImage,
            merchantProduct.id,
            removeCoverImage === true,
          ],
        );
      });
    } catch (dbErr) {
      this.logger.error(
        `DB transaction failed: ${dbErr?.message}`,
        dbErr?.stack,
      );
      await this.s3Service.deleteS3Files(uploadedKeys);
      throw new BadRequestException(
        `Database operation failed: ${dbErr?.message}`,
      );
    }

    await this.cacheManager.del(detailCacheKey(merchantId, productVariantId));

    return {
      success: true,
      coverImage: coverImageId
        ? { id: coverImageId, url: coverImageUrl }
        : null,
      merchantImages: merchantImageRows,
    };
  }

  private validateImageFiles(
    coverImageFile?: Express.Multer.File,
    merchantImageFiles?: Express.Multer.File[],
    _keepOrderNumbers?: number[],
    _removeCoverImage?: boolean,
  ): void {
    const allFiles = [
      ...(coverImageFile ? [coverImageFile] : []),
      ...(merchantImageFiles ?? []),
    ];
    if ((merchantImageFiles?.length ?? 0) > MAX_MERCHANT_IMAGES) {
      throw new BadRequestException(
        `Maximum ${MAX_MERCHANT_IMAGES} merchant images allowed, got ${merchantImageFiles.length}`,
      );
    }
    for (const file of allFiles) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK HEAD-OFFICE PRICES
  // ══════════════════════════════════════════════════════════════════════════

  async checkHeadOfficePrices(
    merchantId: number,
    productVariantIds: number[],
  ): Promise<CheckPriceMerchantResponseDto> {
    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const isHeadOffice =
      merchant.merchantBranchType === MerchantBranchType.HEAD_OFFICE;

    if (isHeadOffice) {
      return { isHeadOffice: true, items: [] };
    }

    const headOfficeMerchant = await this.findHeadOfficeMerchant(merchant);

    if (!headOfficeMerchant) {
      return { isHeadOffice: false, items: [] };
    }

    const merchantProducts = await this.merchantProductRepo.find({
      where: {
        merchantId: headOfficeMerchant.id,
        productVariantId: In(productVariantIds),
      },
      select: [
        'productVariantId',
        'priceExcludeVat',
        'priceIncludeVat',
        'specialPriceIncludeVat',
        'specialPriceExcludeVat',
      ],
    });

    const items: PriceMerchantItemDto[] = merchantProducts.map((mp) => ({
      productVariantId: mp.productVariantId,
      priceExcludeVat: mp.priceExcludeVat,
      priceIncludeVat: mp.priceIncludeVat,
      specialPriceIncludeVat: mp.specialPriceIncludeVat,
      specialPriceExcludeVat: mp.specialPriceExcludeVat,
    }));

    return { isHeadOffice: false, items };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UPDATE MERCHANT PRODUCTS
  // ══════════════════════════════════════════════════════════════════════════

  async updateMerchantProducts(
    merchantId: number,
    products: UpdateMerchantProductItemDto[],
    user?: AuthUser,
  ): Promise<UpdateMerchantProductResponseDto> {
    const userNameFromDb = user?.uuid
      ? (
          await this.userRepo.findOne({
            where: { uuid: user.uuid },
            select: ['name'],
          })
        )?.name
      : undefined;
    const updatedBy = resolveUpdatedByStamp(user, userNameFromDb);
    const startTime = Date.now();

    if (!products || products.length === 0) {
      return this.createEmptyUpdateResponse();
    }

    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
      select: ['id', 'merchantBranchType', 'organizeId'],
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const validProducts = await this.getValidProductsForUpdate(
      merchantId,
      products,
    );

    if (validProducts.length === 0) {
      return {
        successCount: 0,
        failedCount: products.length,
        totalRequested: products.length,
        updatedAt: new Date(),
      };
    }

    let successCount = 0;
    let failedCount = 0;

    if (merchant.merchantBranchType === MerchantBranchType.HEAD_OFFICE) {
      const result = await this.processHeadOfficeUpdate(
        merchantId,
        validProducts,
        updatedBy,
      );
      successCount = result.successCount;
      failedCount = result.failedCount;
    } else {
      const result = await this.processBranchUpdate(
        merchant,
        validProducts,
        updatedBy,
      );
      successCount = result.successCount;
      failedCount = result.failedCount;
    }

    const duration = Date.now() - startTime;
    console.log(
      `Bulk update completed: ${successCount} updated, ${failedCount} failed, took ${duration}ms`,
    );

    return {
      successCount,
      failedCount: failedCount + (products.length - validProducts.length),
      totalRequested: products.length,
      updatedAt: new Date(),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════════════

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

  private async processHeadOfficeUpdate(
    merchantId: number,
    products: UpdateMerchantProductItemDto[],
    updatedBy?: string,
  ): Promise<{ successCount: number; failedCount: number }> {
    return this.processBulkUpdateInBatches(merchantId, products, updatedBy);
  }

  private async processBranchUpdate(
    branchMerchant: Merchant,
    products: UpdateMerchantProductItemDto[],
    updatedBy?: string,
  ): Promise<{ successCount: number; failedCount: number }> {
    const headOfficeMerchant =
      await this.findHeadOfficeMerchant(branchMerchant);

    if (!headOfficeMerchant) {
      return this.processBulkUpdateInBatches(
        branchMerchant.id,
        products,
        updatedBy,
      );
    }

    const productVariantIds = products.map((p) => p.productVariantId);

    const headOfficeProducts = await this.merchantProductRepo.find({
      where: {
        merchantId: headOfficeMerchant.id,
        productVariantId: In(productVariantIds),
      },
      select: [
        'productVariantId',
        'priceVat',
        'priceExcludeVat',
        'priceVatPercent',
        'priceIncludeVat',
      ],
    });

    const headOfficeProductMap = new Map(
      headOfficeProducts.map((p) => [
        p.productVariantId,
        {
          exists: true,
          hasRegularPrice:
            p.priceIncludeVat !== null ||
            p.priceExcludeVat !== null ||
            p.priceVat !== null,
        },
      ]),
    );

    const productsToUpdateHeadOffice: UpdateMerchantProductItemDto[] = [];
    const productsToUpdateBranch: UpdateMerchantProductItemDto[] = [];

    products.forEach((product) => {
      const headOfficeInfo = headOfficeProductMap.get(product.productVariantId);
      const branchHasRegularPrice =
        (product.priceIncludeVat !== null &&
          product.priceIncludeVat !== undefined) ||
        (product.priceExcludeVat !== null &&
          product.priceExcludeVat !== undefined) ||
        (product.priceVat !== null && product.priceVat !== undefined);

      if (
        headOfficeInfo?.exists &&
        !headOfficeInfo.hasRegularPrice &&
        branchHasRegularPrice
      ) {
        productsToUpdateHeadOffice.push({
          productVariantId: product.productVariantId,
          priceVat: product.priceVat,
          priceExcludeVat: product.priceExcludeVat,
          priceVatPercent: product.priceVatPercent,
          priceIncludeVat: product.priceIncludeVat,
        });
      }

      productsToUpdateBranch.push(product);
    });

    const [headOfficeResult, branchResult] = await Promise.all([
      productsToUpdateHeadOffice.length > 0
        ? this.processBulkUpdateInBatches(
            headOfficeMerchant.id,
            productsToUpdateHeadOffice,
            updatedBy,
          )
        : Promise.resolve({ successCount: 0, failedCount: 0 }),
      this.processBulkUpdateInBatches(
        branchMerchant.id,
        productsToUpdateBranch,
        updatedBy,
      ),
    ]);

    return {
      successCount: headOfficeResult.successCount + branchResult.successCount,
      failedCount: headOfficeResult.failedCount + branchResult.failedCount,
    };
  }

  private async getValidProductsForUpdate(
    merchantId: number,
    products: UpdateMerchantProductItemDto[],
  ): Promise<UpdateMerchantProductItemDto[]> {
    const productVariantIds = products.map((p) => p.productVariantId);

    const existingProducts = await this.merchantProductRepo.find({
      where: {
        merchantId,
        productVariantId: In(productVariantIds),
      },
      select: ['id', 'productVariantId'],
    });

    const existingProductMap = new Map(
      existingProducts.map((p) => [p.productVariantId, p.id]),
    );

    return products.filter((p) => existingProductMap.has(p.productVariantId));
  }

  private async processBulkUpdateInBatches(
    merchantId: number,
    validProducts: UpdateMerchantProductItemDto[],
    updatedBy?: string,
  ): Promise<{ successCount: number; failedCount: number }> {
    const BATCH_SIZE = 500;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
      const batch = validProducts.slice(i, i + BATCH_SIZE);

      try {
        const batchSuccessCount = await this.processBatchUpdate(
          merchantId,
          batch,
          updatedBy,
        );
        successCount += batchSuccessCount;
      } catch (error) {
        console.error(`Error updating batch ${i}-${i + batch.length}:`, error);
        failedCount += batch.length;
      }
    }

    return { successCount, failedCount };
  }

  private async processBatchUpdate(
    merchantId: number,
    batch: UpdateMerchantProductItemDto[],
    updatedBy?: string,
  ): Promise<number> {
    const batchVariantIds = batch.map((p) => p.productVariantId);

    const existingBatchProducts = await this.merchantProductRepo.find({
      where: {
        merchantId,
        productVariantId: In(batchVariantIds),
      },
    });

    const productMap = new Map(batch.map((p) => [p.productVariantId, p]));

    const productsToSave = existingBatchProducts
      .map((existingProduct) => {
        const updateData = productMap.get(existingProduct.productVariantId);
        if (!updateData) return null;
        this.updateMerchantProductEntity(
          existingProduct,
          updateData,
          updatedBy,
        );
        return existingProduct;
      })
      .filter((p): p is MerchantProduct => p !== null);

    if (productsToSave.length > 0) {
      await this.merchantProductRepo.save(productsToSave);

      await Promise.all(
        productsToSave.map((p) =>
          this.cacheManager.del(detailCacheKey(merchantId, p.productVariantId)),
        ),
      );

      return productsToSave.length;
    }

    return 0;
  }

  private updateMerchantProductEntity(
    existingProduct: MerchantProduct,
    updateData: UpdateMerchantProductItemDto,
    updatedBy?: string,
  ): void {
    const fieldMapping: Array<
      [keyof UpdateMerchantProductItemDto, keyof MerchantProduct]
    > = [
      ['priceVat', 'priceVat'],
      ['priceExcludeVat', 'priceExcludeVat'],
      ['priceVatPercent', 'priceVatPercent'],
      ['priceIncludeVat', 'priceIncludeVat'],
      ['specialPriceVat', 'specialPriceVat'],
      ['specialPriceIncludeVat', 'specialPriceIncludeVat'],
      ['specialPriceExcludeVat', 'specialPriceExcludeVat'],
      ['specialPriceVatPercent', 'specialPriceVatPercent'],
      ['productTypeId', 'productTypeId'],
      ['prepareDays', 'prepareDays'],
      ['requirePriceInquiry', 'requirePriceInquiry'],
      ['useCustomDetails', 'useCustomDetails'],
      ['merchantCustomName', 'merchantCustomName'],
      ['description', 'description'],
      ['merchantProductStatus', 'merchantProductStatus'],
      ['status', 'status'],
    ];

    fieldMapping.forEach(([dtoField, entityField]) => {
      if (updateData[dtoField] !== undefined) {
        (existingProduct as any)[entityField] = updateData[dtoField];
      }
    });

    if (updateData.startDate !== undefined) {
      existingProduct.startDate = updateData.startDate
        ? new Date(updateData.startDate)
        : null;
    }
    if (updateData.endDate !== undefined) {
      existingProduct.endDate = updateData.endDate
        ? new Date(updateData.endDate)
        : null;
    }

    existingProduct.updatedAt = new Date();
    if (updatedBy !== undefined) {
      existingProduct.updatedBy = updatedBy;
    }
  }

  private createEmptyUpdateResponse(): UpdateMerchantProductResponseDto {
    return {
      successCount: 0,
      failedCount: 0,
      totalRequested: 0,
      updatedAt: new Date(),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DELETE MERCHANT PRODUCTS (Soft Delete)
  // ══════════════════════════════════════════════════════════════════════════

  async deleteMerchantProducts(
    merchantId: number,
    productVariantIds: number[],
    deletedBy: string,
  ): Promise<{
    totalRequested: number;
    successCount: number;
    failedCount: number;
  }> {
    if (!productVariantIds || productVariantIds.length === 0) {
      return { totalRequested: 0, successCount: 0, failedCount: 0 };
    }

    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
      select: ['id', 'merchantBranchType', 'organizeId'],
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Resolve the list of merchantIds to delete from
    let targetMerchantIds: number[] = [merchantId];

    if (
      merchant.merchantBranchType === MerchantBranchType.HEAD_OFFICE &&
      merchant.organizeId
    ) {
      // Cascade: delete from HO and all branches in the same organization
      const allOrgMerchants = await this.merchantRepo.find({
        where: { organizeId: merchant.organizeId },
        select: ['id'],
      });
      targetMerchantIds = allOrgMerchants.map((m) => m.id);
    }

    const now = new Date();
    let successCount = 0;
    let failedCount = 0;

    try {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        for (const targetMerchantId of targetMerchantIds) {
          const products = await manager.find(MerchantProduct, {
            where: {
              merchantId: targetMerchantId,
              productVariantId: In(productVariantIds),
            },
            select: ['id', 'productVariantId'],
          });

          if (products.length === 0) continue;

          // Set deletedBy before soft-removing
          await manager.update(
            MerchantProduct,
            { id: In(products.map((p) => p.id)) },
            {
              deletedBy,
              updatedAt: now,
            },
          );

          // TypeORM soft delete (sets deleted_at)
          await manager.softDelete(MerchantProduct, {
            id: In(products.map((p) => p.id)),
          });

          successCount += products.length;
        }

        // Count variants that were not found in any target merchant
        failedCount =
          productVariantIds.length -
          Math.min(
            productVariantIds.length,
            successCount > 0 ? productVariantIds.length : 0,
          );
      });
    } catch (error) {
      this.logger.error(
        `deleteMerchantProducts failed: ${error?.message}`,
        error?.stack,
      );
      throw new BadRequestException(
        `Failed to delete products: ${error?.message}`,
      );
    }

    // Invalidate cache for all affected products
    await Promise.all(
      productVariantIds.map((pvId) =>
        this.cacheManager.del(detailCacheKey(merchantId, pvId)),
      ),
    );

    return {
      totalRequested: productVariantIds.length,
      successCount,
      failedCount,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Single CTE query – one DB round-trip, O(log n) index lookups
// ═══════════════════════════════════════════════════════════════════════════

const MERCHANT_PRODUCT_DETAIL_SQL = `
WITH mp AS (
    SELECT
        id,
        "merchantCustomName",
        description,
        "prepareDays",
        "requirePriceInquiry",
        "productTypeId",
        "merchantProductStatus",
        "priceVat",
        "priceExcludeVat",
        "priceIncludeVat",
        "priceVatPercent",
        "specialPriceVat",
        "specialPriceExcludeVat",
        "specialPriceIncludeVat",
        "specialPriceVatPercent",
        "startDate",
        "endDate",
        "useCustomDetails",
        "useCustomCoverImage",
        "useCustomMerchantImage",
        "productCoverImage",
        "status",
        "updatedAt",
        "updatedBy"
    FROM merchant_product
    WHERE "productVariantId" = $2
      AND "merchantId" = $1
),

base AS (
    SELECT
        pv.id,
        pv.barcode,
        pv."internalBarcode",
        pv."salesUnit",
        pv.sku,
        pv.alias                    AS "productName",
        pv."urlVideo",
        pv.description,
        pv.series,
        pv.model,
        pv."tIS",
        pv.material,
        pv.guarantee,
        pv."packageShape",
        pv."packageWidth",
        pv."packageWidthUnit",
        pv."packageHeight",
        pv."packageHeightUnit",
        pv."packageDepth",
        pv."packageDepthUnit",
        pv."productWidth",
        pv."productWidthUnit",
        pv."productHeight",
        pv."productHeightUnit",
        pv."productDepth",
        pv."productDepthUnit",
        pv."netWeight",
        pv."netWeightUnit",
        pv."howToUseText",
        pv."suggestionText",
        pv."cautionText",
        mp."merchantCustomName"     AS "customName",
        mp.description              AS "customDescription",
        mp."useCustomDetails",
        mp."useCustomCoverImage",
        mp."useCustomMerchantImage",
        mp."status",

        mp."prepareDays",
        mp."requirePriceInquiry",
        mp."productTypeId",
        mp."merchantProductStatus",

        mp."priceVat",
        mp."priceExcludeVat",
        mp."priceIncludeVat",
        mp."priceVatPercent",
        mp."specialPriceVat",
        mp."specialPriceExcludeVat",
        mp."specialPriceIncludeVat",
        mp."specialPriceVatPercent",
        mp."startDate",
        mp."endDate",
        mp."updatedAt",
        mp."updatedBy",

        b.name                      AS "brandName",
        p."categoryId",
        p."name"                    AS "productGroupName",

        CASE
            WHEN mp."productCoverImage" IS NOT NULL THEN
                jsonb_build_object(
                    'id',   ci.id,
                    'url',  ci.url,
                    'name', ci."name"
                )
            ELSE NULL
        END                         AS "productCoverImage"
    FROM product_variant pv
    JOIN mp ON true
    JOIN product p ON p.id = pv."productId"
    LEFT JOIN brand b ON b.id = p."brandId"
    LEFT JOIN image_upload ci ON ci.id = mp."productCoverImage"
    WHERE pv.id = $2
),

images AS (
    SELECT jsonb_build_object(
        'merchant', COALESCE(merchant_images, '[]'::jsonb),
        'system',   COALESCE(system_images,   '[]'::jsonb)
    ) AS images
    FROM (
        SELECT
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id',    iu.id,
                        'url',   iu.url,
                        'name',  iu."name",
                        'order', mi."order"
                    )
                    ORDER BY mi."order"
                )
                FROM merchant_image mi
                JOIN mp ON mp.id = mi."merchantProductId"
                JOIN image_upload iu ON iu.id = mi."imageUploadId"
            ) AS merchant_images,

            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id',   iu.id,
                        'url',  iu.url,
                        'name', iu."name"
                    )
                )
                FROM product_variant_image pvi
                JOIN image_upload iu ON iu.id = pvi."imageUploadId"
                WHERE pvi."productVariantId" = $2
            ) AS system_images
    ) t
),

tags AS (
    SELECT COALESCE(
        jsonb_agg(pvt."tagName"),
        '[]'::jsonb
    ) AS tags
    FROM product_variant_tag pvt
    WHERE pvt."productVariantId" = $2
),

categories AS (
    WITH cat AS (
        SELECT c.id, c.name, c."parentCategoryId"
        FROM category c
        WHERE c.id = (SELECT "categoryId" FROM base)
    ),
    all_ids AS (
        SELECT unnest(string_to_array("parentCategoryId", '.'))::int AS cid
        FROM cat
        UNION ALL
        SELECT id FROM cat
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',   c.id,
                'name', c.name
            )
            ORDER BY c.id
        ),
        '[]'::jsonb
    ) AS categories
    FROM category c
    JOIN all_ids a ON a.cid = c.id
),

documents AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'url',  iu.url,
                'name', iu."imageName",
                'type', pvd."documentType"
            )
        ),
        '[]'::jsonb
    ) AS documents
    FROM product_variant_document pvd
    JOIN image_upload iu ON iu.id = pvd."imageUploadId"
    WHERE pvd."productVariantId" = $2
),

product_dimensions AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'value', pvd.value,
                'productDimensionMasterName', pdm.name
            )
            ORDER BY pdm.name
        ),
        '[]'::jsonb
    ) AS product_dimensions
    FROM product_variant pv
    INNER JOIN product_variant_dimension pvd ON pvd."productVariantId" = pv.id
    INNER JOIN product_dimension pd ON pd.id = pvd."productDimensionId"
    INNER JOIN product_dimension_master pdm ON pdm.id = pd."productDimensionMasterId"
    WHERE pv.id = $2
),

product_attributes AS (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'stringValue',  pva."stringValue",
                'numberValue',  pva."numberValue",
                'name',        pam."name",
                'attributeType', pam."attributeType"
            )
            ORDER BY pam."name"
        ),
        '[]'::jsonb
    ) AS attributes
    FROM product_variant pv
    INNER JOIN product_variant_attribute pva ON pva."productVariantId" = pv.id
    INNER JOIN product_attribute_master pam ON pam.id = pva."productAttributeMasterId"
    WHERE pv.id = $2
)

SELECT jsonb_build_object(
    'id',                base.id,
    'barcode',           base.barcode,
    'internalBarcode',   base."internalBarcode",
    'salesUnit',         base."salesUnit",
    'sku',               base.sku,
    'productName',       base."productName",
    'videoUrl',          base."urlVideo",
    'description',       base.description,

    'customName',              base."customName",
    'customDescription',       base."customDescription",
    'useCustomDetails',        base."useCustomDetails",
    'useCustomCoverImage',     base."useCustomCoverImage",
    'useCustomMerchantImage',  base."useCustomMerchantImage",

    'prepareDays',             base."prepareDays",
    'requirePriceInquiry',     base."requirePriceInquiry",
    'productTypeId',           base."productTypeId",
    'merchantProductStatus',   base."merchantProductStatus",

    'specification', jsonb_build_object(
        'series',    base.series,
        'model',     base.model,
        'tIS',       base."tIS",
        'material',  base.material,
        'guarantee', base.guarantee
    ),

    'package', jsonb_build_object(
        'shape',  base."packageShape",
        'width',  CASE WHEN base."packageWidth"  IS NOT NULL THEN base."packageWidth"::text  || COALESCE(' ' || base."packageWidthUnit",  '') ELSE NULL END,
        'height', CASE WHEN base."packageHeight" IS NOT NULL THEN base."packageHeight"::text || COALESCE(' ' || base."packageHeightUnit", '') ELSE NULL END,
        'depth',  CASE WHEN base."packageDepth"  IS NOT NULL THEN base."packageDepth"::text  || COALESCE(' ' || base."packageDepthUnit",  '') ELSE NULL END
    ),

    'usage', jsonb_build_object(
        'howToUse',    base."howToUseText",
        'suggestion',  base."suggestionText",
        'caution',     base."cautionText"
    ),

    'brand', base."brandName",
    'productGroupName', base."productGroupName",

    'price', jsonb_build_object(
        'priceVat',                base."priceVat",
        'priceExcludeVat',         base."priceExcludeVat",
        'priceIncludeVat',         base."priceIncludeVat",
        'priceVatPercent',         base."priceVatPercent",
        'specialPriceVat',         base."specialPriceVat",
        'specialPriceExcludeVat',  base."specialPriceExcludeVat",
        'specialPriceIncludeVat',  base."specialPriceIncludeVat",
        'specialPriceVatPercent',  base."specialPriceVatPercent",
        'startDate',               base."startDate",
        'endDate',                 base."endDate"
    ),

    'productCoverImage', base."productCoverImage",
    'status',            base."status",
    'userModify',        jsonb_build_object('updatedAt', base."updatedAt", 'updatedBy', base."updatedBy"),
    'images',            images.images,
    'tags',              tags.tags,
    'categories',        categories.categories,
    'documents',         documents.documents,
    'productDimensions', COALESCE(product_dimensions.product_dimensions, '[]'::jsonb),
    'attributes',       COALESCE(product_attributes.attributes, '[]'::jsonb)

) AS result
FROM base
LEFT JOIN images             ON true
LEFT JOIN tags               ON true
LEFT JOIN categories         ON true
LEFT JOIN documents          ON true
LEFT JOIN product_dimensions ON true
LEFT JOIN product_attributes ON true;
`;
