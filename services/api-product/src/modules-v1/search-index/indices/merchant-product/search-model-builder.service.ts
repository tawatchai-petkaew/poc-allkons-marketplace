import { Injectable, Logger } from '@nestjs/common';
import { SearchDocumentDto } from './search-document.dto';
import { ProductVariantSearchData } from '../../interfaces';
import { DataFetcherService } from './data-fetcher.service';

/**
 * Search Model Builder Service
 *
 * Transforms ProductVariantSearchData into Elasticsearch SearchDocumentDto
 *
 * Key Features:
 * - Category path building
 * - Boost score calculation
 * - Status-based isActive flag
 */
@Injectable()
export class SearchModelBuilderService {
  private readonly logger = new Logger(SearchModelBuilderService.name);

  constructor(private readonly dataFetcherService: DataFetcherService) {}

  /**
   * Build search document from product variant data
   */
  async buildDocument(
    data: ProductVariantSearchData,
  ): Promise<SearchDocumentDto> {
    // Ensure category hierarchy is loaded
    await this.dataFetcherService.ensureCategoryHierarchy();

    // Build category path
    const categoryPath = this.dataFetcherService.buildCategoryPath(
      data.categoryId,
    );

    // Calculate boost score
    const boostScore = this.calculateBoostScore(data);

    return {
      // Primary Keys
      id: data.id,
      productId: data.productId,

      // Basic Info - name uses alias if available, otherwise product name
      name: data.productVariantAlias || data.productName,
      productName: data.productName,
      productVariantName: data.productVariantAlias,
      slug: data.productSlug,
      sku: data.sku,
      barcode: data.barcode,

      // Status
      productStatus: data.productStatus,
      variantStatus: data.variantStatus,

      // Pricing
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,

      // Categories
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      categoryPath,

      // Brand
      brandId: data.brandId,
      brandName: data.brandName,

      // Search Enhancement
      boostScore,

      // Business Logic
      sellingMerchantCount: data.sellingMerchantCount,
      merchantIds: data.merchantIds,

      // Timestamps
      createdAt: (data.variantCreatedAt instanceof Date
        ? data.variantCreatedAt
        : new Date(data.variantCreatedAt)
      ).toISOString(),
      updatedAt: (data.variantUpdatedAt instanceof Date
        ? data.variantUpdatedAt
        : new Date(data.variantUpdatedAt)
      ).toISOString(),

      // Metadata - isActive based on product and variant status
      isActive:
        data.productStatus === 'Active' && data.variantStatus === 'Active',
    };
  }

  /**
   * Build documents for multiple product variants
   */
  async buildDocuments(
    dataList: ProductVariantSearchData[],
  ): Promise<SearchDocumentDto[]> {
    const docs: SearchDocumentDto[] = [];

    for (const data of dataList) {
      const doc = await this.buildDocument(data);
      docs.push(doc);
    }

    return docs;
  }

  /**
   * Calculate boost score based on various factors
   * Higher score = higher search ranking
   */
  private calculateBoostScore(data: ProductVariantSearchData): number {
    let score = 1.0;

    // Boost by selling merchant count (more merchants = more popular)
    score += Math.min(data.sellingMerchantCount / 10, 2.0);

    // Boost by having images (assumed if has main product)
    // TODO: Add image count to data if needed
    score += 0.5;

    // Boost by having brand
    if (data.brandId) {
      score += 0.3;
    }

    // Boost by recency (last updated within 30 days)
    const updatedAtTime =
      data.variantUpdatedAt instanceof Date
        ? data.variantUpdatedAt.getTime()
        : new Date(data.variantUpdatedAt).getTime();
    const daysSinceUpdate = Math.floor(
      (Date.now() - updatedAtTime) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceUpdate < 30) {
      score += 0.5 * (1 - daysSinceUpdate / 30);
    }

    return parseFloat(score.toFixed(2));
  }
}
