import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductMatchingService } from '@/modules-v1/product-matching/product-matching.service';
import { ProductMatchingSuggestionRequest } from '@/modules-v1/product-matching/interfaces/product-matching.interface';
import {
  MatchStatus,
  SuggestedProduct,
} from '@/model/import-product-item.entity';
import { ProductVariant } from '@/model/product-variant.entity';

export interface MatchResult {
  matchStatus: MatchStatus;
  matchedProductVariantId: number | null;
  suggestedProducts: SuggestedProduct[] | null;
}

export interface BatchMatchInput {
  rowNo: number;
  productName: string | null;
  brand: string | null;
  barcode: string | null;
}

export interface BatchMatchResult extends MatchResult {
  rowNo: number;
}

/**
 * Adapter service to convert External API responses to internal format
 * Maps UUID-based products from External API to integer IDs in our database
 */
@Injectable()
export class ProductMatchingAdapterService {
  constructor(
    private readonly productMatchingService: ProductMatchingService,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  private readonly logger = new Logger(ProductMatchingAdapterService.name);

  /**
   * Batch verify and enrich product variants from database
   * Returns Map of skuUuid -> full product variant data with relations
   */
  private async verifyAndEnrichProductVariants(
    skuUuids: string[],
  ): Promise<Map<string, any>> {
    if (skuUuids.length === 0) {
      return new Map();
    }

    try {
      // Query all product variants in one go with relations
      const variants = await this.productVariantRepository
        .createQueryBuilder('pv')
        .innerJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('pv.productVariantImages', 'pvi')
        .leftJoinAndSelect('pvi.imageUpload', 'img')
        .where('pv.skuUuid IN (:...skuUuids)', { skuUuids })
        .andWhere("pv.status != 'Deleted'")
        .andWhere('p.deleted_at IS NULL')
        .orderBy('pvi.order', 'ASC') // Get images in order
        .getMany();

      // Create Map for fast lookup
      const variantMap = new Map();
      for (const variant of variants) {
        // Get first image (lowest order) or null
        const firstImage = variant.productVariantImages?.[0]?.imageUpload?.url;

        variantMap.set(variant.skuUuid, {
          id: variant.id,
          productId: variant.product?.id,
          name: variant.alias || variant.product?.name,
          brand: variant.product?.brand?.name || null,
          barcode: variant.barcode,
          imageUrl: firstImage || null,
        });
      }

      this.logger.log(
        `Verified ${variantMap.size} out of ${skuUuids.length} product variants from Matching API`,
      );

      return variantMap;
    } catch (error) {
      this.logger.error(`Failed to verify product variants: ${error.message}`);
      return new Map();
    }
  }

  /**
   * Match products using External API and convert to internal format
   */
  async matchProductsBatch(
    inputs: BatchMatchInput[],
  ): Promise<BatchMatchResult[]> {
    if (inputs.length === 0) {
      return [];
    }

    // Prepare request payload for External API
    const requests: ProductMatchingSuggestionRequest[] = inputs.map(
      (input) => ({
        barcode: input.barcode,
        name: input.productName,
        brand: input.brand,
      }),
    );

    this.logger.log(`Matching ${inputs.length} products using External API...`);

    try {
      // Call External API
      const responses = await this.productMatchingService.getSuggestions(
        requests,
        {
          offset: 0,
          limit: 10, // Top 10 suggestions per product
        },
      );

      // Step 1: Collect all unique skuUuids from responses
      const skuUuids = new Set<string>();
      for (const response of responses) {
        if (response.matchType === 'matchBarcode' && response.product) {
          skuUuids.add(response.product.id);
        }
        if (response.matchType === 'matchSuggestion' && response.suggestions) {
          for (const suggestion of response.suggestions) {
            skuUuids.add(suggestion.id);
          }
        }
      }

      this.logger.log('Enriching matched products from database...', skuUuids);

      // Step 2: Batch verify and get enriched product data from database
      const verifiedVariants = await this.verifyAndEnrichProductVariants(
        Array.from(skuUuids),
      );

      // Step 3: Map responses to internal format using verified data
      const results: BatchMatchResult[] = responses.map((response) => {
        const originalInput = inputs[response.row];

        // Handle matchBarcode - exact match
        if (response.matchType === 'matchBarcode' && response.product) {
          const variantData = verifiedVariants.get(response.product.id);

          if (!variantData) {
            // Product from External API not found in our DB
            this.logger.warn(
              `Product ${response.product.id} not found in database`,
            );
            return {
              rowNo: originalInput.rowNo,
              matchStatus: MatchStatus.NOT_FOUND,
              matchedProductVariantId: null,
              suggestedProducts: null,
            };
          }

          // Include product details in suggestedProducts for display
          const matchedProduct: SuggestedProduct = {
            id: variantData.id, // Use variant id for consistency
            name: variantData.name,
            brand: variantData.brand,
            barcode: variantData.barcode,
            imageUrl: variantData.imageUrl,
            score: 1.0,
          };

          return {
            rowNo: originalInput.rowNo,
            matchStatus: MatchStatus.FOUND,
            matchedProductVariantId: variantData.id, // Return variant id directly
            suggestedProducts: [matchedProduct], // Single product for display
          };
        }

        // Handle matchSuggestion - similar products
        if (
          response.matchType === 'matchSuggestion' &&
          response.suggestions &&
          response.suggestions.length > 0
        ) {
          // Map suggestions using verified data
          const suggestedProducts: SuggestedProduct[] = [];

          for (let index = 0; index < response.suggestions.length; index++) {
            const suggestion = response.suggestions[index];
            const variantData = verifiedVariants.get(suggestion.id);

            if (variantData) {
              // Only include verified products - use variant id
              suggestedProducts.push({
                id: variantData.id,
                name: variantData.name,
                brand: variantData.brand,
                barcode: variantData.barcode,
                imageUrl: variantData.imageUrl,
                score: Math.round((1.0 - index * 0.05) * 100) / 100,
              });
            }
          }

          if (suggestedProducts.length === 0) {
            return {
              rowNo: originalInput.rowNo,
              matchStatus: MatchStatus.NOT_FOUND,
              matchedProductVariantId: null,
              suggestedProducts: null,
            };
          }

          return {
            rowNo: originalInput.rowNo,
            matchStatus: MatchStatus.SIMILAR,
            matchedProductVariantId: null, // User must choose from suggestedProducts
            suggestedProducts,
          };
        }

        // Handle notMatch - no match found
        return {
          rowNo: originalInput.rowNo,
          matchStatus: MatchStatus.NOT_FOUND,
          matchedProductVariantId: null,
          suggestedProducts: null,
        };
      });

      return results;
    } catch (error) {
      this.logger.error(`Batch matching failed: ${error.message}`);
      throw error;
    }
  }
}
