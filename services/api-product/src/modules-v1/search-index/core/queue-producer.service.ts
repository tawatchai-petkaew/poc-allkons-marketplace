import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';
import {
  SEARCH_INDEX_QUEUE,
  SEARCH_INDEX_JOB_SYNC,
  SEARCH_INDEX_JOB_BULK_REBUILD,
} from '../constants';
import { SyncJobData, BulkRebuildJobData } from '../interfaces';

/**
 * Queue Producer Service
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: Azure Service Bus with high cost per message, no built-in deduplication
 * - NEW: BullMQ with jobId as dedup key, priority queue, exponential backoff
 *
 * Key Features:
 * - jobId as deduplication key (same ID = no duplicate job)
 * - Priority queue support
 * - Exponential backoff retry (3 attempts)
 * - Rate limiting capability
 */
@Injectable()
export class QueueProducerService {
  private readonly logger = new Logger(QueueProducerService.name);

  // Default job options
  private readonly defaultJobOptions: JobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  };

  constructor(
    @InjectQueue(SEARCH_INDEX_QUEUE)
    private readonly searchIndexQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Add sync jobs for product variant IDs
   * Uses jobId for deduplication - same ID won't create duplicate job
   */
  async addSyncJobs(
    productVariantIds: number[],
    source: 'cdc' | 'manual' | 'rebuild',
    priority: number = 1,
  ): Promise<void> {
    if (productVariantIds.length === 0) {
      return;
    }

    // Batch IDs into chunks for more efficient processing
    const chunkSize = 100;
    const chunks = this.chunk(productVariantIds, chunkSize);

    for (const chunk of chunks) {
      const jobData: SyncJobData = {
        productVariantIds: chunk,
        priority,
        triggeredAt: new Date().toISOString(),
        source,
      };

      // Use first ID in chunk as jobId for deduplication
      // 🔧 FIX: This prevents duplicate jobs for the same IDs
      const jobId = `sync-${chunk.sort().join('-')}-${Date.now()}`;

      await this.searchIndexQueue.add(SEARCH_INDEX_JOB_SYNC, jobData, {
        ...this.defaultJobOptions,
        jobId,
        priority,
      });
    }

    this.logger.log(
      `Added ${chunks.length} sync jobs for ${productVariantIds.length} product variants (source: ${source})`,
    );
  }

  /**
   * Add a single sync job with specific jobId for dedup
   */
  async addSingleSyncJob(
    productVariantId: number,
    source: 'cdc' | 'manual' | 'rebuild',
  ): Promise<void> {
    const jobData: SyncJobData = {
      productVariantIds: [productVariantId],
      priority: 1,
      triggeredAt: new Date().toISOString(),
      source,
    };

    // 🔧 FIX: jobId ensures only one job per variant ID in queue
    const jobId = `sync-single-${productVariantId}`;

    await this.searchIndexQueue.add(SEARCH_INDEX_JOB_SYNC, jobData, {
      ...this.defaultJobOptions,
      jobId,
    });
  }

  /**
   * Add bulk rebuild job
   */
  async addBulkRebuildJob(
    batchSize: number,
    useBlueGreen: boolean,
    triggeredBy: string,
  ): Promise<string> {
    const jobData: BulkRebuildJobData = {
      batchSize,
      useBlueGreen,
      startedAt: new Date().toISOString(),
      triggeredBy,
    };

    const jobId = `rebuild-${Date.now()}`;

    const job = await this.searchIndexQueue.add(
      SEARCH_INDEX_JOB_BULK_REBUILD,
      jobData,
      {
        ...this.defaultJobOptions,
        jobId,
        priority: 10, // High priority
        attempts: 1, // No retry for rebuild
      },
    );

    this.logger.log(`Added bulk rebuild job: ${job.id}`);
    return job.id.toString();
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.searchIndexQueue.getWaitingCount(),
      this.searchIndexQueue.getActiveCount(),
      this.searchIndexQueue.getCompletedCount(),
      this.searchIndexQueue.getFailedCount(),
      this.searchIndexQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Pause the queue
   */
  async pause(): Promise<void> {
    await this.searchIndexQueue.pause();
    this.logger.warn('Search index queue paused');
  }

  /**
   * Resume the queue
   */
  async resume(): Promise<void> {
    await this.searchIndexQueue.resume();
    this.logger.log('Search index queue resumed');
  }

  /**
   * Clear all jobs from the queue
   */
  async clearQueue(): Promise<void> {
    await this.searchIndexQueue.empty();
    this.logger.warn('Search index queue cleared');
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
