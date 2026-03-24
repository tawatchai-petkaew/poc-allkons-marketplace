import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { ImportProductBatchService } from '../service/import-product-batch.service';
import {
  ImportProductItem,
  ImportStatus,
} from '@/model/import-product-item.entity';

/**
 * Job data for single item import
 * Used by: FOUND auto-import, SIMILAR review, ADMIN response
 * Item data is queried fresh from DB in processImportItem()
 */
export interface ImportItemJobData {
  batchUuid: string;
  merchantId: number;
  userId: number;
  itemId: number;
  source: 'FOUND' | 'SIMILAR' | 'ADMIN_RESPONSE';
}

@Processor('product-import-queue')
export class ProductImportConsumer {
  private readonly logger = new Logger(ProductImportConsumer.name);

  constructor(
    private readonly batchService: ImportProductBatchService,
    @InjectRepository(ImportProductItem)
    private readonly itemRepository: Repository<ImportProductItem>,
  ) {}

  /**
   * Process single item import
   * This job is queued by:
   * - autoImportFoundProducts() - FOUND items (one job per item)
   * - matchingSimilarItems() - SIMILAR items after user selection (one job per item)
   * - (Future) Admin response with selected products (one job per item)
   *
   * Item data is queried fresh from DB in service layer
   * Concurrency: 5 jobs can run in parallel
   */
  @Process({ name: 'import-item', concurrency: 5 })
  async processImportItem(job: Job<ImportItemJobData>) {
    const jobData = job.data;

    this.logger.log(
      `[Job ${job.id}] Importing item ${jobData.itemId} from ${jobData.source} in batch ${jobData.batchUuid}`,
    );

    try {
      // Call service (item data will be queried fresh from DB)
      const result = await this.batchService.processImportItem(
        jobData.batchUuid,
        jobData.merchantId,
        jobData.userId,
        jobData.itemId, // Contains: itemId, source
      );

      this.logger.log(
        `[Job ${job.id}] Item ${jobData.itemId} import ${result.status}`,
      );

      return {
        success: true,
        batchUuid: jobData.batchUuid,
        source: jobData.source,
        itemId: jobData.itemId,
        status: result.status,
        importType: result.importType,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[Job ${job.id}] Failed to import item ${jobData.itemId} for batch ${jobData.batchUuid}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  /**
   * Handle failed jobs after all retries exhausted
   * Mark single item as FAILED in database
   * This is called ONLY after Bull has exhausted all retry attempts
   */
  @OnQueueFailed()
  async handleFailed(job: Job<ImportItemJobData>, error: Error) {
    const { itemId, batchUuid } = job.data;

    this.logger.error(
      `[Job ${job.id}] Item ${itemId} failed after ${job.attemptsMade} attempts in batch ${batchUuid}`,
      error.stack,
    );

    try {
      // Safety check: only mark as FAILED if all retries exhausted (attemptsMade >= 3)
      // This prevents premature FAILED marking if OnQueueFailed is called unexpectedly
      if (job.attemptsMade >= 3) {
        await this.itemRepository.update(
          { id: itemId },
          { importStatus: ImportStatus.FAILED },
        );

        this.logger.log(
          `[Job ${job.id}] Item ${itemId} marked as FAILED in database after ${job.attemptsMade} attempts`,
        );
      } else {
        this.logger.warn(
          `[Job ${job.id}] OnQueueFailed called prematurely for item ${itemId} (attempt ${job.attemptsMade}/3), skipping FAILED mark`,
        );
      }
    } catch (updateError) {
      this.logger.error(
        `[Job ${job.id}] Failed to update item ${itemId} status: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
      );
    }
  }
}
