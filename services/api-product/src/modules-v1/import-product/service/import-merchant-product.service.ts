import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  MerchantProduct,
  MerchantProductStatus,
  MerchantProductEntityStatus,
} from '@/model/merchant-product.entity';
import { Merchant, MerchantBranchType } from '@/model/merchant.entity';
import {
  AddProductsToMerchantDto,
  AddProductsToMerchantResultDto,
  ProductAddResultDto,
  PriceType,
} from '../dto/add-products-to-merchant.dto';

interface CalculatedPriceFields {
  priceVat: number | null;
  priceExcludeVat: number | null;
  priceIncludeVat: number | null;
  priceVatPercent: number | null;
  specialPriceVat: number | null;
  specialPriceExcludeVat: number | null;
  specialPriceIncludeVat: number | null;
  specialPriceVatPercent: number | null;
}

@Injectable()
export class ImportMerchantProductService {
  private readonly logger = new Logger(ImportMerchantProductService.name);

  constructor(
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
  ) {}

  /**
   * Add multiple products to merchant in a batch operation
   * Implements business rules:
   * - Rule 1: Product must exist at HEAD_OFFICE first (for BRANCH)
   * - Rule 2: Use regularPrice from request if provided, else use HEAD_OFFICE price as default
   * - Rule 3: Special price is branch-specific and must be <= regularPrice
   */
  async addProductsToMerchant(
    dto: AddProductsToMerchantDto,
  ): Promise<AddProductsToMerchantResultDto> {
    const { merchantId, products, createdBy } = dto;

    if (!products || products.length === 0) {
      return {
        totalRequested: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        results: [],
      };
    }

    const productVariantIds = products.map((p) => p.productVariantId);

    // 1. Get merchant with branch type
    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      return {
        totalRequested: products.length,
        successCount: 0,
        failedCount: products.length,
        skippedCount: 0,
        results: products.map((p) => ({
          productVariantId: p.productVariantId,
          status: 'FAILED' as const,
          reason: 'MERCHANT_NOT_FOUND',
        })),
      };
    }

    // 2. Get HEAD_OFFICE if merchant is BRANCH
    let headOfficeProductMap = new Map<number, MerchantProduct>();
    let headOfficeMerchant: Merchant | null = null;

    if (merchant.merchantBranchType === MerchantBranchType.BRANCH) {
      headOfficeMerchant = await this.findHeadOfficeMerchant(merchant);

      // Fail early if BRANCH has no HEAD_OFFICE
      if (!headOfficeMerchant) {
        return {
          totalRequested: products.length,
          successCount: 0,
          failedCount: products.length,
          skippedCount: 0,
          results: products.map((p) => ({
            productVariantId: p.productVariantId,
            status: 'FAILED' as const,
            reason: 'HEAD_OFFICE_NOT_FOUND',
          })),
        };
      }

      headOfficeProductMap = await this.getHeadOfficeProductMap(
        headOfficeMerchant.id,
        productVariantIds,
      );
    }

    // 3. Get existing products at target merchant (for update or insert)
    const existingProductMap = await this.getExistingProductMap(
      merchantId,
      productVariantIds,
    );

    // 4. Process products one by one with error isolation
    const results: ProductAddResultDto[] = [];

    for (const product of products) {
      try {
        let regularPriceToUse = product.regularPrice;

        // For BRANCH: handle HEAD_OFFICE product check
        if (merchant.merchantBranchType === MerchantBranchType.BRANCH) {
          const headOfficeProduct = headOfficeProductMap.get(
            product.productVariantId,
          );

          // If product not in HEAD_OFFICE, create it there first
          if (!headOfficeProduct) {
            // Calculate price fields for HEAD_OFFICE (uses regularPrice from request)
            const headOfficePriceFields = this.calculatePriceFields({
              priceType: product.priceType,
              regularPrice: product.regularPrice,
              specialPrice: null, // HEAD_OFFICE doesn't get special price from BRANCH request
              vatPercent: product.vatPercent,
            });

            const headOfficeNewProduct = this.merchantProductRepo.create({
              merchantId: headOfficeMerchant!.id,
              productVariantId: product.productVariantId,
              ...headOfficePriceFields,
              startDate: null,
              endDate: null,
              merchantProductStatus: MerchantProductStatus.NOT_APPROVED,
              status: MerchantProductEntityStatus.ACTIVE,
              productTypeId: 1,
              isAcceptCash: false,
              isAcceptCredit: false,
              isAcceptCreditCard: false,
              isAcceptCod: false,
              isAcceptPledge: false,
              createdBy: createdBy || null,
            });

            // Save HEAD_OFFICE product first (with error isolation)
            await this.merchantProductRepo.save(headOfficeNewProduct);

            this.logger.log(
              `Product ${product.productVariantId} created in HEAD_OFFICE (merchant ${headOfficeMerchant!.id})`,
            );

            // Use the same regularPrice for BRANCH
            regularPriceToUse = product.regularPrice;
          } else {
            // Rule 2: Use regularPrice from request if provided, else use HEAD_OFFICE price as default
            if (
              product.regularPrice !== null &&
              product.regularPrice !== undefined
            ) {
              regularPriceToUse = product.regularPrice;
            } else {
              // No regularPrice provided, use HEAD_OFFICE as default
              if (product.priceType === PriceType.INVAT) {
                regularPriceToUse = headOfficeProduct.priceIncludeVat;
              } else {
                regularPriceToUse = headOfficeProduct.priceExcludeVat;
              }
            }
          }
        }

        // Validate special price <= regular price (Rule 3)
        const specialPriceValidation = this.validateSpecialPrice(
          product.specialPrice,
          regularPriceToUse,
        );

        if (!specialPriceValidation.valid) {
          results.push({
            productVariantId: product.productVariantId,
            status: 'FAILED' as const,
            reason: specialPriceValidation.reason,
          });
          continue;
        }

        // Calculate price fields
        const priceFields = this.calculatePriceFields({
          priceType: product.priceType,
          regularPrice: regularPriceToUse,
          specialPrice: product.specialPrice,
          vatPercent: product.vatPercent,
        });

        // Check if product already exists → update, else → insert
        const existingProduct = existingProductMap.get(
          product.productVariantId,
        );

        if (existingProduct) {
          // Update existing product prices
          Object.assign(existingProduct, {
            ...priceFields,
            startDate:
              product.specialPriceStartDate || existingProduct.startDate,
            endDate: product.specialPriceEndDate || existingProduct.endDate,
            requirePriceInquiry:
              product.requirePriceInquiry ??
              existingProduct.requirePriceInquiry,
            merchantProductStatus: this.mapSaleStatusToMerchantProductStatus(
              product.saleStatus,
              existingProduct.merchantProductStatus,
            ),
            updatedBy: createdBy || existingProduct.updatedBy,
          });

          // Save update (with error isolation)
          await this.merchantProductRepo.save(existingProduct);

          results.push({
            productVariantId: product.productVariantId,
            status: 'SUCCESS',
            reason: 'UPDATED',
            merchantProductId: existingProduct.id,
          });

          this.logger.log(
            `Updated merchant product ${existingProduct.id} for variant ${product.productVariantId}`,
          );
          continue;
        }

        // Create new merchant product entity
        const merchantProduct = this.merchantProductRepo.create({
          merchantId,
          productVariantId: product.productVariantId,
          ...priceFields,
          startDate: product.specialPriceStartDate || null,
          endDate: product.specialPriceEndDate || null,
          requirePriceInquiry: product.requirePriceInquiry ?? false,
          merchantProductStatus: this.mapSaleStatusToMerchantProductStatus(
            product.saleStatus,
            MerchantProductStatus.NOT_APPROVED,
          ),
          status: MerchantProductEntityStatus.ACTIVE,
          productTypeId: 1, // Default product type
          isAcceptCash: false,
          isAcceptCredit: false,
          isAcceptCreditCard: false,
          isAcceptCod: false,
          isAcceptPledge: false,
          createdBy: createdBy || null,
        });

        // Save new product (with error isolation)
        const saved = await this.merchantProductRepo.save(merchantProduct);

        results.push({
          productVariantId: product.productVariantId,
          status: 'SUCCESS',
          merchantProductId: saved.id,
        });

        this.logger.log(
          `Created merchant product ${saved.id} for variant ${product.productVariantId}`,
        );
      } catch (error) {
        // Error isolation: only this product fails, others continue
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to save product ${product.productVariantId}: ${errorMessage}`,
        );

        results.push({
          productVariantId: product.productVariantId,
          status: 'FAILED',
          reason: 'SAVE_FAILED',
        });
      }
    }

    return {
      totalRequested: products.length,
      successCount: results.filter((r) => r.status === 'SUCCESS').length,
      failedCount: results.filter((r) => r.status === 'FAILED').length,
      skippedCount: results.filter((r) => r.status === 'SKIPPED').length,
      results,
    };
  }

  /**
   * Add single product to merchant (optimized for per-item processing)
   * Same business logic as addProductsToMerchant but optimized for 1 item
   * Uses direct queries instead of bulk Map operations
   * Throws errors on failure - caller should handle exceptions
   */
  async addSingleProductToMerchant(
    merchantId: number,
    productData: {
      productVariantId: number;
      priceType: PriceType;
      regularPrice: number;
      specialPrice?: number | null;
      vatPercent: number | null;
      specialPriceStartDate?: Date | null;
      specialPriceEndDate?: Date | null;
      requirePriceInquiry?: boolean;
      saleStatus?: string;
    },
    createdBy: string,
  ): Promise<{
    merchantProductId: number;
    importType: 'CREATED' | 'UPDATED';
  }> {
    const { productVariantId } = productData;

    // 1. Get merchant with branch type
    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error(`Merchant ${merchantId} not found`);
    }

    // 2. Handle HEAD_OFFICE logic for BRANCH merchants
    let regularPriceToUse = productData.regularPrice;
    let headOfficeMerchant: Merchant | null = null;

    if (merchant.merchantBranchType === MerchantBranchType.BRANCH) {
      headOfficeMerchant = await this.findHeadOfficeMerchant(merchant);

      if (!headOfficeMerchant) {
        throw new Error(
          `HEAD_OFFICE not found for branch merchant ${merchantId}`,
        );
      }

      // Direct query for HEAD_OFFICE product (not using Map)
      const headOfficeProduct = await this.merchantProductRepo.findOne({
        where: {
          merchantId: headOfficeMerchant.id,
          productVariantId,
          status: MerchantProductEntityStatus.ACTIVE,
        },
      });

      // If product not in HEAD_OFFICE, create it first
      if (!headOfficeProduct) {
        const headOfficePriceFields = this.calculatePriceFields({
          priceType: productData.priceType,
          regularPrice: productData.regularPrice,
          specialPrice: null,
          vatPercent: productData.vatPercent,
        });

        const headOfficeNewProduct = this.merchantProductRepo.create({
          merchantId: headOfficeMerchant.id,
          productVariantId,
          ...headOfficePriceFields,
          startDate: null,
          endDate: null,
          merchantProductStatus: MerchantProductStatus.NOT_APPROVED,
          status: MerchantProductEntityStatus.ACTIVE,
          productTypeId: 1,
          isAcceptCash: false,
          isAcceptCredit: false,
          isAcceptCreditCard: false,
          isAcceptCod: false,
          isAcceptPledge: false,
          createdBy: createdBy || null,
        });

        await this.merchantProductRepo.save(headOfficeNewProduct);

        this.logger.log(
          `Product ${productVariantId} created in HEAD_OFFICE (merchant ${headOfficeMerchant.id})`,
        );

        regularPriceToUse = productData.regularPrice;
      } else {
        // Use provided regularPrice or fallback to HEAD_OFFICE price
        if (
          productData.regularPrice !== null &&
          productData.regularPrice !== undefined
        ) {
          regularPriceToUse = productData.regularPrice;
        } else {
          if (productData.priceType === PriceType.INVAT) {
            regularPriceToUse = headOfficeProduct.priceIncludeVat;
          } else {
            regularPriceToUse = headOfficeProduct.priceExcludeVat;
          }
        }
      }
    }

    // 3. Validate special price
    const specialPriceValidation = this.validateSpecialPrice(
      productData.specialPrice,
      regularPriceToUse,
    );

    if (!specialPriceValidation.valid) {
      throw new Error(
        `Special price validation failed: ${specialPriceValidation.reason}`,
      );
    }

    // 4. Calculate price fields
    const priceFields = this.calculatePriceFields({
      priceType: productData.priceType,
      regularPrice: regularPriceToUse,
      specialPrice: productData.specialPrice,
      vatPercent: productData.vatPercent,
    });

    // 5. Direct query for existing product (not using Map)
    const existingProduct = await this.merchantProductRepo.findOne({
      where: {
        merchantId,
        productVariantId,
        status: MerchantProductEntityStatus.ACTIVE,
      },
    });

    if (existingProduct) {
      // Update existing product
      Object.assign(existingProduct, {
        ...priceFields,
        startDate:
          productData.specialPriceStartDate || existingProduct.startDate,
        endDate: productData.specialPriceEndDate || existingProduct.endDate,
        requirePriceInquiry:
          productData.requirePriceInquiry ??
          existingProduct.requirePriceInquiry,
        merchantProductStatus: this.mapSaleStatusToMerchantProductStatus(
          productData.saleStatus,
          existingProduct.merchantProductStatus,
        ),
        updatedBy: createdBy || existingProduct.updatedBy,
      });

      await this.merchantProductRepo.save(existingProduct);

      this.logger.log(
        `Updated merchant product ${existingProduct.id} for variant ${productVariantId}`,
      );

      return {
        merchantProductId: existingProduct.id,
        importType: 'UPDATED',
      };
    }

    // Create new merchant product
    const merchantProduct = this.merchantProductRepo.create({
      merchantId,
      productVariantId,
      ...priceFields,
      startDate: productData.specialPriceStartDate || null,
      endDate: productData.specialPriceEndDate || null,
      requirePriceInquiry: productData.requirePriceInquiry ?? false,
      merchantProductStatus: this.mapSaleStatusToMerchantProductStatus(
        productData.saleStatus,
        MerchantProductStatus.NOT_APPROVED,
      ),
      status: MerchantProductEntityStatus.ACTIVE,
      productTypeId: 1,
      isAcceptCash: false,
      isAcceptCredit: false,
      isAcceptCreditCard: false,
      isAcceptCod: false,
      isAcceptPledge: false,
      createdBy: createdBy || null,
    });

    const saved = await this.merchantProductRepo.save(merchantProduct);

    this.logger.log(
      `Created merchant product ${saved.id} for variant ${productVariantId}`,
    );

    return {
      merchantProductId: saved.id,
      importType: 'CREATED',
    };
  }

  /**
   * Find HEAD_OFFICE merchant for a BRANCH merchant
   * Finds merchant with same organizeId but merchantBranchType = HEAD_OFFICE
   */
  private async findHeadOfficeMerchant(
    branchMerchant: Merchant,
  ): Promise<Merchant | null> {
    if (!branchMerchant.organizeId) {
      this.logger.warn(
        `Branch merchant ${branchMerchant.id} has no organizeId`,
      );
      return null;
    }

    // Find HEAD_OFFICE merchant with same organizeId
    const headOfficeMerchant = await this.merchantRepo.findOne({
      where: {
        organizeId: branchMerchant.organizeId,
        merchantBranchType: MerchantBranchType.HEAD_OFFICE,
      },
    });

    if (!headOfficeMerchant) {
      this.logger.warn(
        `HEAD_OFFICE merchant not found for organizeId ${branchMerchant.organizeId}`,
      );
    }

    return headOfficeMerchant;
  }

  /**
   * Get products from HEAD_OFFICE as a Map for O(1) lookup
   */
  private async getHeadOfficeProductMap(
    headOfficeMerchantId: number,
    productVariantIds: number[],
  ): Promise<Map<number, MerchantProduct>> {
    if (productVariantIds.length === 0) {
      return new Map();
    }

    const products = await this.merchantProductRepo.find({
      where: {
        merchantId: headOfficeMerchantId,
        productVariantId: In(productVariantIds),
        status: MerchantProductEntityStatus.ACTIVE,
      },
    });

    return new Map(products.map((p) => [p.productVariantId, p]));
  }

  /**
   * Get existing products at merchant as Map for O(1) lookup
   * Used to determine if product should be updated or inserted
   */
  private async getExistingProductMap(
    merchantId: number,
    productVariantIds: number[],
  ): Promise<Map<number, MerchantProduct>> {
    if (productVariantIds.length === 0) {
      return new Map();
    }

    const existing = await this.merchantProductRepo.find({
      where: {
        merchantId,
        productVariantId: In(productVariantIds),
        status: MerchantProductEntityStatus.ACTIVE,
      },
    });

    return new Map(existing.map((p) => [p.productVariantId, p]));
  }

  /**
   * Validate that special price does not exceed regular price
   * Rule 3: specialPrice must be <= regularPrice
   */
  private validateSpecialPrice(
    specialPrice: number | undefined | null,
    regularPrice: number | undefined | null,
  ): { valid: boolean; reason?: string } {
    if (specialPrice === null || specialPrice === undefined) {
      return { valid: true };
    }
    if (regularPrice === null || regularPrice === undefined) {
      return { valid: true }; // Cannot validate without regular price
    }

    if (specialPrice > regularPrice) {
      return {
        valid: false,
        reason: 'SPECIAL_PRICE_EXCEEDS_REGULAR',
      };
    }
    return { valid: true };
  }

  /**
   * Calculate all price fields based on price type and VAT percentage
   */
  private calculatePriceFields(data: {
    priceType?: PriceType;
    regularPrice?: number;
    specialPrice?: number;
    vatPercent?: number | null;
  }): CalculatedPriceFields {
    const { priceType, regularPrice, specialPrice, vatPercent } = data;

    // Handle NonVat case (vatPercent = null)
    if (vatPercent === null) {
      return {
        priceVat: null,
        priceExcludeVat: regularPrice ?? null,
        priceIncludeVat: regularPrice ?? null,
        priceVatPercent: null,
        specialPriceVat: null,
        specialPriceExcludeVat: specialPrice ?? null,
        specialPriceIncludeVat: specialPrice ?? null,
        specialPriceVatPercent: null,
      };
    }

    const vat = vatPercent ?? 7;
    const vatMultiplier = 1 + vat / 100;

    const result: CalculatedPriceFields = {
      priceVat: null,
      priceExcludeVat: null,
      priceIncludeVat: null,
      priceVatPercent: vat,
      specialPriceVat: null,
      specialPriceExcludeVat: null,
      specialPriceIncludeVat: null,
      specialPriceVatPercent: null,
    };

    // Calculate regular price fields
    if (regularPrice !== null && regularPrice !== undefined) {
      if (priceType === PriceType.INVAT) {
        // Price given is INCLUSIVE of VAT
        result.priceIncludeVat = regularPrice;
        result.priceExcludeVat = regularPrice / vatMultiplier;
        result.priceVat = regularPrice - result.priceExcludeVat;
      } else {
        // Price given is EXCLUSIVE of VAT (default)
        result.priceExcludeVat = regularPrice;
        result.priceIncludeVat = regularPrice * vatMultiplier;
        result.priceVat = result.priceIncludeVat - regularPrice;
      }
    }

    // Calculate special price fields (Rule 3: Branch-specific)
    if (specialPrice !== null && specialPrice !== undefined) {
      result.specialPriceVatPercent = vat;

      if (priceType === PriceType.INVAT) {
        // Special price is INCLUSIVE of VAT
        result.specialPriceIncludeVat = specialPrice;
        result.specialPriceExcludeVat = specialPrice / vatMultiplier;
        result.specialPriceVat = specialPrice - result.specialPriceExcludeVat;
      } else {
        // Special price is EXCLUSIVE of VAT (default)
        result.specialPriceExcludeVat = specialPrice;
        result.specialPriceIncludeVat = specialPrice * vatMultiplier;
        result.specialPriceVat = result.specialPriceIncludeVat - specialPrice;
      }
    }

    return result;
  }

  /**
   * Map sale status from Excel to MerchantProductStatus
   * @param saleStatus - Value from Excel (e.g., 'Selling', 'Hidden', 'SELLING', 'HIDDEN')
   * @param defaultStatus - Default status if saleStatus is not provided or invalid
   */
  private mapSaleStatusToMerchantProductStatus(
    saleStatus: string | undefined,
    defaultStatus: MerchantProductStatus,
  ): MerchantProductStatus {
    if (!saleStatus) {
      return defaultStatus;
    }

    const normalizedStatus = saleStatus.toUpperCase();

    switch (normalizedStatus) {
      case 'SELLING':
        return MerchantProductStatus.SELLING;
      case 'HIDDEN':
        return MerchantProductStatus.HIDDEN;
      case 'OUTOFSTOCK':
      case 'OUT_OF_STOCK':
        return MerchantProductStatus.OUT_OF_STOCK;
      case 'NOTAPPROVED':
      case 'NOT_APPROVED':
        return MerchantProductStatus.NOT_APPROVED;
      default:
        this.logger.warn(
          `Unknown sale status: ${saleStatus}, using default: ${defaultStatus}`,
        );
        return defaultStatus;
    }
  }
}
