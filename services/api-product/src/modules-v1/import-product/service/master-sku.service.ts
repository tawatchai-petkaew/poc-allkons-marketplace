import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ImportProductBatch } from '@/model/import-product-batch.entity';
import {
  ImportProductItem,
  ImportStatus,
} from '@/model/import-product-item.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { MasterSkuProductSuggestionDto } from '../dto/master-sku-webhook.dto';
import { ImportProductBatchService } from './import-product-batch.service';

/**
 * Data structure for sending NOT_FOUND items to MASTER_SKU
 */
export interface NotFoundItemData {
  itemId: number;
  batchUuid: string;
  productName: string | null;
  barcode: string | null;
  brand: string | null;
  reason?: string;
}

/**
 * Internal structure for suggestedProducts JSONB field
 */
export interface SuggestedProductFromMasterSku {
  id: number;
  name: string;
  brand: string;
  barcode: string;
  imageUrl?: string | null;
}

@Injectable()
export class MasterSkuService {
  private readonly logger = new Logger(MasterSkuService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
    @InjectRepository(ImportProductBatch)
    private readonly batchRepository: Repository<ImportProductBatch>,
    @InjectRepository(ImportProductItem)
    private readonly itemRepository: Repository<ImportProductItem>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @Inject(forwardRef(() => ImportProductBatchService))
    private readonly batchService: ImportProductBatchService,
  ) {
    this.baseUrl =
      process.env.MASTER_SKU_API_URL ||
      'https://master-sku-api.allkons.com/api/v1';
    this.apiKey = process.env.MASTER_SKU_API_KEY || '';
  }

  /**
   * Send NOT_FOUND items to MASTER_SKU for admin review
   * Fire-and-forget pattern - logs errors but doesn't throw
   *
   * @param items Array of NOT_FOUND item data
   */
  async sendNotFoundItems(items: NotFoundItemData[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    this.logger.log(`Sending ${items.length} NOT_FOUND items to MASTER_SKU...`);

    return;

    //TODO: Uncomment when MASTER_SKU endpoint when it's ready
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/import-products/not-found`,
          {
            items,
            source: 'ALLKONS_MARKETPLACE',
            timestamp: new Date().toISOString(),
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `Successfully notified MASTER_SKU: ${response.data.message || 'OK'}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send NOT_FOUND items to MASTER_SKU: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Mock method to simulate MASTER_SKU webhook response (for testing)
   * Updates items from PENDING_ADMIN to PENDING with suggestions
   *
   * @param items Array of items with suggestions
   */
  async mockSuggestProductFromMasterSKU(
    items: MasterSkuProductSuggestionDto[],
  ) {
    let successCount = 0;
    let failedCount = 0;
    let rejectedCount = 0;

    // Process each item: either add suggestions or reject
    for (const requestItem of items) {
      try {
        // Find the item with batch info
        const item = await this.itemRepository.findOne({
          where: { id: requestItem.itemId },
          relations: ['batch'],
        });

        if (!item) {
          this.logger.warn(`[MOCK] Item ${requestItem.itemId} not found`);
          failedCount++;
          continue;
        }

        if (item.importStatus !== ImportStatus.PENDING_ADMIN) {
          this.logger.warn(
            `[MOCK] Item ${requestItem.itemId} has invalid status: ${item.importStatus}`,
          );
          failedCount++;
          continue;
        }

        // Check if should reject (null, undefined, or empty array)
        if (
          requestItem.suggestions === null ||
          requestItem.suggestions === undefined ||
          requestItem.suggestions.length === 0
        ) {
          // REJECTION: Mark item as REJECTED
          item.importStatus = ImportStatus.REJECTED;
          item.reason = requestItem.reason;
          item.suggestedProducts = null;

          await this.itemRepository.save(item);

          this.logger.log(
            `[MOCK] Item ${requestItem.itemId} marked as REJECTED: ${item.reason}`,
          );
          rejectedCount++;

          // Check if batch should be completed
          await this.batchService.checkAndCompleteBatch(item.batch.uuid);
        } else {
          // SUGGESTIONS: Convert suggestions to suggestedProducts format
          const suggestedProducts = requestItem.suggestions.map((s) => ({
            id: s.id,
            name: s.name,
            brand: s.brand,
            barcode: s.barcode,
            imageUrl: s.imageUrl || null,
            score: 0.9, // Mock score
          }));

          // Update item: change importStatus to PENDING, add suggestions
          item.importStatus = ImportStatus.PENDING;
          item.suggestedProducts = suggestedProducts;
          item.reason = requestItem.reason ?? null;

          await this.itemRepository.save(item);

          this.logger.log(
            `[MOCK] Updated item ${requestItem.itemId} with ${suggestedProducts.length} suggestions`,
          );
          successCount++;
        }
      } catch (error) {
        this.logger.error(
          `[MOCK] Failed to update item ${requestItem.itemId}: ${error.message}`,
        );
        failedCount++;
      }
    }

    this.logger.log(
      `[MOCK] Completed: ${successCount} suggestions, ${rejectedCount} rejected, ${failedCount} failed`,
    );

    return { successCount, failedCount, rejectedCount };
  }
}
