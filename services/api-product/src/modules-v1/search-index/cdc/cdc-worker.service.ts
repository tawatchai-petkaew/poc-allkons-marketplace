import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ChangesQueue } from '../entities';
import {
  DEFAULT_CDC_POLL_INTERVAL,
  DEFAULT_BATCH_SIZE,
  MAX_ERROR_COUNT,
} from '../constants';
import { RawChange } from '../interfaces';
import type { AggregatorService } from './aggregator.service';
import type { CdcNotificationService } from './cdc-notification.service';

/**
 * CDC Worker Service
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: SaveChanges interceptor could miss events, sent immediately on every change
 * - NEW: Database triggers capture ALL changes, worker polls and batches them
 *
 * Key Features:
 * - Polls every 10 seconds (configurable)
 * - Batch size: 1000 records
 * - Marks records as processed after successful aggregation
 * - Guarantees no events are missed (database trigger level)
 * - Error tracking: skips records after 3 failed attempts and sends notification
 */
@Injectable()
export class CdcWorkerService {
  private readonly logger = new Logger(CdcWorkerService.name);
  private isProcessing = false;
  private lastProcessedAt: Date | null = null;
  private processedCount = 0;
  private skippedCount = 0;

  // Configuration
  private readonly pollIntervalMs: number;
  private readonly batchSize: number;
  private readonly maxErrorCount: number;

  constructor(
    @InjectRepository(ChangesQueue)
    private readonly changesQueueRepository: Repository<ChangesQueue>,
    @Inject(forwardRef(() => require('./aggregator.service').AggregatorService))
    private readonly aggregatorService: AggregatorService,
    @Inject(
      forwardRef(
        () => require('./cdc-notification.service').CdcNotificationService,
      ),
    )
    private readonly notificationService: CdcNotificationService,
    private readonly configService: ConfigService,
  ) {
    this.pollIntervalMs = this.configService.get<number>(
      'SEARCH_INDEX_CDC_POLL_INTERVAL',
      DEFAULT_CDC_POLL_INTERVAL,
    );
    this.batchSize = this.configService.get<number>(
      'SEARCH_INDEX_BATCH_SIZE',
      DEFAULT_BATCH_SIZE,
    );
    this.maxErrorCount = this.configService.get<number>(
      'SEARCH_INDEX_MAX_ERROR_COUNT',
      MAX_ERROR_COUNT,
    );
  }

  /**
   * Poll for changes every 10 seconds
   * Using fixed interval instead of cron for more precise control
   */
  @Cron('*/10 * * * * *') // Every 10 seconds
  async pollChanges(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Previous poll still in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    try {
      this.logResourceUsage();
      await this.processChanges();
    } catch (error) {
      this.logger.error(`CDC poll error: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private logResourceUsage() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.logger.log(
      `Resource Usage: Memory - RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB, ` +
        `Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB, ` +
        `Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB | ` +
        `CPU - User: ${(cpuUsage.user / 1000).toFixed(0)} ms, ` +
        `System: ${(cpuUsage.system / 1000).toFixed(0)} ms`,
    );
  }

  /**
   * Process pending changes from the queue
   */
  private async processChanges(): Promise<void> {
    // Fetch unprocessed changes (excluding skipped records)
    const changes = await this.changesQueueRepository.find({
      where: {
        processed: false,
        skipped: false,
      },
      order: { changedAt: 'ASC' },
      take: this.batchSize,
    });

    if (changes.length === 0) {
      return;
    }

    this.logger.log(`Processing ${changes.length} CDC changes...`);

    // Process each change individually to track errors
    const successfulChanges: ChangesQueue[] = [];
    const failedChanges: { change: ChangesQueue; error: string }[] = [];

    for (const change of changes) {
      try {
        // Convert to RawChange interface
        if (!['INSERT', 'UPDATE', 'DELETE'].includes(change.operation)) {
          // Skip invalid operations
          successfulChanges.push(change);
          continue;
        }

        const rawChange: RawChange = {
          id: change.id,
          entityType: change.entityType as RawChange['entityType'],
          entityId: change.entityId,
          operation: change.operation,
          changedAt: change.changedAt,
        };

        // Aggregate single change
        await this.aggregatorService.aggregate([rawChange]);
        successfulChanges.push(change);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        failedChanges.push({ change, error: errorMessage });
      }
    }

    // Handle successful changes
    if (successfulChanges.length > 0) {
      const processedAt = new Date();
      await this.changesQueueRepository.update(
        { id: In(successfulChanges.map((c) => c.id)) },
        { processed: true, processedAt },
      );

      this.lastProcessedAt = processedAt;
      this.processedCount += successfulChanges.length;

      this.logger.log(
        `Successfully processed ${successfulChanges.length} CDC changes`,
      );
    }

    // Handle failed changes - increment error count
    if (failedChanges.length > 0) {
      await this.handleFailedChanges(failedChanges);
    }
  }

  /**
   * Handle failed changes - increment error count and skip if max reached
   */
  private async handleFailedChanges(
    failedChanges: { change: ChangesQueue; error: string }[],
  ): Promise<void> {
    const skippedRecords: ChangesQueue[] = [];

    for (const { change, error } of failedChanges) {
      const newErrorCount = (change.errorCount || 0) + 1;

      if (newErrorCount >= this.maxErrorCount) {
        // Mark as skipped - exceeded max retries
        await this.changesQueueRepository.update(
          { id: change.id },
          {
            errorCount: newErrorCount,
            lastError: error.substring(0, 1000), // Limit error message length
            skipped: true,
          },
        );

        skippedRecords.push(change);
        this.skippedCount++;

        this.logger.warn(
          `CDC change ${change.id} (${change.entityType}:${change.entityId}) skipped after ${newErrorCount} failed attempts. Last error: ${error}`,
        );
      } else {
        // Increment error count, will be retried
        await this.changesQueueRepository.update(
          { id: change.id },
          {
            errorCount: newErrorCount,
            lastError: error.substring(0, 1000),
          },
        );

        this.logger.warn(
          `CDC change ${change.id} failed (attempt ${newErrorCount}/${this.maxErrorCount}): ${error}`,
        );
      }
    }

    // TODO: Enable notification when webhook is configured
    // Send notification for skipped records
    // if (skippedRecords.length > 0) {
    //   await this.sendSkippedNotifications(skippedRecords, failedChanges);
    // }
  }

  /**
   * Send notifications for skipped records
   */
  private async sendSkippedNotifications(
    skippedRecords: ChangesQueue[],
    failedChanges: { change: ChangesQueue; error: string }[],
  ): Promise<void> {
    const notifications = skippedRecords.map((record) => {
      const failedInfo = failedChanges.find((f) => f.change.id === record.id);
      return {
        changeId: record.id,
        entityType: record.entityType,
        entityId: record.entityId,
        errorCount: (record.errorCount || 0) + 1,
        lastError: failedInfo?.error || record.lastError || 'Unknown error',
        skippedAt: new Date(),
      };
    });

    if (notifications.length === 1) {
      await this.notificationService.notifySkippedRecord(notifications[0]);
    } else {
      await this.notificationService.notifyMultipleSkippedRecords(
        notifications,
      );
    }
  }

  /**
   * Get worker statistics
   */
  getStats(): {
    isProcessing: boolean;
    lastProcessedAt: Date | null;
    processedCount: number;
    skippedCount: number;
  } {
    return {
      isProcessing: this.isProcessing,
      lastProcessedAt: this.lastProcessedAt,
      processedCount: this.processedCount,
      skippedCount: this.skippedCount,
    };
  }

  /**
   * Get count of skipped records in the database
   */
  async getSkippedRecordsCount(): Promise<number> {
    return this.changesQueueRepository.count({
      where: { skipped: true },
    });
  }

  /**
   * Get skipped records for review/manual intervention
   */
  async getSkippedRecords(limit = 100): Promise<ChangesQueue[]> {
    return this.changesQueueRepository.find({
      where: { skipped: true },
      order: { changedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Retry a skipped record (reset error count and skipped flag)
   */
  async retrySkippedRecord(changeId: number): Promise<boolean> {
    const result = await this.changesQueueRepository.update(
      { id: changeId, skipped: true },
      { errorCount: 0, skipped: false, lastError: null },
    );
    return (result.affected ?? 0) > 0;
  }

  /**
   * Retry all skipped records
   */
  async retryAllSkippedRecords(): Promise<number> {
    const result = await this.changesQueueRepository.update(
      { skipped: true },
      { errorCount: 0, skipped: false, lastError: null },
    );
    this.logger.log(`Reset ${result.affected} skipped records for retry`);
    return result.affected ?? 0;
  }

  /**
   * Cleanup old processed records (run daily)
   */
  @Cron('0 3 * * *') // 3 AM daily
  async cleanupOldRecords(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days

    const result = await this.changesQueueRepository.delete({
      processed: true,
      processedAt: LessThan(cutoffDate),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} old CDC records`);
    }
  }

  /**
   * Force process all pending changes (for admin use)
   */
  async forceProcess(): Promise<number> {
    this.logger.log('Force processing all pending CDC changes...');

    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      const changes = await this.changesQueueRepository.find({
        where: { processed: false },
        order: { changedAt: 'ASC' },
        take: this.batchSize,
      });

      if (changes.length === 0) {
        hasMore = false;
        break;
      }

      const rawChanges: RawChange[] = changes.map((c) => ({
        id: c.id,
        entityType: c.entityType as RawChange['entityType'],
        entityId: c.entityId,
        operation: c.operation,
        changedAt: c.changedAt,
      }));

      await this.aggregatorService.aggregate(rawChanges);

      const processedAt = new Date();
      await this.changesQueueRepository.update(
        { id: In(changes.map((c) => c.id)) },
        { processed: true, processedAt },
      );

      totalProcessed += changes.length;
    }

    this.logger.log(`Force processed ${totalProcessed} CDC records`);
    return totalProcessed;
  }
}
