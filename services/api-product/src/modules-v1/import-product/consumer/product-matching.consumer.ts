import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import {
  ImportProductBatch,
  ImportProductBatchStatus,
} from '@/model/import-product-batch.entity';
import { ImportProductBatchService } from '../service/import-product-batch.service';

export interface ProductMatchingJobData {
  batchUuid: string;
  merchantId: number;
  userId: number;
}

@Processor('product-matching-queue')
export class ProductMatchingConsumer {
  private readonly logger = new Logger(ProductMatchingConsumer.name);

  constructor(
    @InjectRepository(ImportProductBatch)
    private readonly batchRepository: Repository<ImportProductBatch>,
    private readonly batchService: ImportProductBatchService,
  ) {}

  @Process({ name: 'start-matching', concurrency: 1 })
  async processMatching(job: Job<ProductMatchingJobData>) {
    const { batchUuid, merchantId, userId } = job.data;

    this.logger.log(
      `[Job ${job.id}] Starting product matching for batch ${batchUuid}`,
    );

    try {
      // Delete existing items before retry
      await this.batchService.cleanupBatchItems(batchUuid, merchantId);

      // Call the actual matching logic
      await this.batchService.processMatching(batchUuid, merchantId, userId);

      // Get updated batch
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (batch) {
        this.logger.log(
          `[Job ${job.id}] Product matching completed for batch ${batchUuid}. ` +
            `Found: ${batch.matchedCount}, Similar: ${batch.similarCount}, Not Found: ${batch.notFoundCount}`,
        );
      }

      return {
        success: true,
        batchUuid,
        matchedCount: batch?.matchedCount || 0,
        similarCount: batch?.similarCount || 0,
        notFoundCount: batch?.notFoundCount || 0,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[Job ${job.id}] Failed to process matching for batch ${batchUuid}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  /**
   * Handle failed jobs after all retries exhausted
   * Set batch status to CANCELLED when matching fails permanently
   */
  @OnQueueFailed()
  async handleFailed(job: Job<ProductMatchingJobData>, error: Error) {
    const { batchUuid, merchantId, userId } = job.data;

    this.logger.error(
      `[Job ${job.id}] All retries exhausted for batch ${batchUuid}. Setting status to CANCELLED.`,
      error.stack,
    );

    try {
      // Find batch and update status to CANCELLED
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (batch) {
        batch.status = ImportProductBatchStatus.CANCELLED;
        batch.updatedBy = userId;
        await this.batchRepository.save(batch);

        this.logger.log(
          `[Job ${job.id}] Batch ${batchUuid} status updated to CANCELLED after ${job.attemptsMade} failed attempts`,
        );
      } else {
        this.logger.warn(
          `[Job ${job.id}] Batch ${batchUuid} not found for status update`,
        );
      }
    } catch (updateError) {
      this.logger.error(
        `[Job ${job.id}] Failed to update batch status to CANCELLED: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
      );
    }
  }
}
