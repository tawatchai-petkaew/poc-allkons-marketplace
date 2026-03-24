import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RebuildIndexDto, RebuildStatusDto } from './dto';
import { DEFAULT_BATCH_SIZE } from './constants';
import {
  QueueProducerService,
  SynonymCacheService,
  CacheService,
} from './core';
import { CdcWorkerService } from './cdc';
import {
  ElasticsearchService,
  SearchIndexProcessor,
} from './indices/merchant-product';

/**
 * Search Index Controller
 *
 * Provides admin endpoints for managing the search index:
 * - Trigger full rebuild
 * - Check rebuild status
 * - View metrics and health
 * - Manual sync operations
 */
@ApiTags('Search Index')
@Controller('search-index')
export class SearchIndexController {
  constructor(
    private readonly queueProducerService: QueueProducerService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly cdcWorkerService: CdcWorkerService,
    private readonly synonymCacheService: SynonymCacheService,
    private readonly cacheService: CacheService,
    private readonly processor: SearchIndexProcessor,
  ) {}

  /**
   * Get current search index status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get search index status and metrics' })
  @ApiResponse({ status: 200, description: 'Returns index status and metrics' })
  async getStatus() {
    const [
      queueStats,
      healthStatus,
      cdcStats,
      synonymStats,
      cacheStats,
      processorMetrics,
    ] = await Promise.all([
      this.queueProducerService.getQueueStats(),
      this.elasticsearchService.getHealthStatus(),
      Promise.resolve(this.cdcWorkerService.getStats()),
      Promise.resolve(this.synonymCacheService.getStats()),
      Promise.resolve(this.cacheService.getStats()),
      Promise.resolve(this.processor.getMetrics()),
    ]);

    return {
      elasticsearch: healthStatus,
      queue: queueStats,
      cdc: cdcStats,
      synonymCache: synonymStats,
      cache: cacheStats,
      processor: processorMetrics,
    };
  }

  /**
   * Trigger a full index rebuild
   */
  @Post('rebuild')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger full index rebuild' })
  @ApiResponse({ status: 202, description: 'Rebuild job queued' })
  async triggerRebuild(@Body() dto: RebuildIndexDto) {
    const jobId = await this.queueProducerService.addBulkRebuildJob(
      dto.batchSize || DEFAULT_BATCH_SIZE,
      dto.useBlueGreen !== false,
      'admin-api',
    );

    return {
      message: 'Rebuild job queued',
      jobId,
      options: {
        batchSize: dto.batchSize || 1000,
        useBlueGreen: dto.useBlueGreen !== false,
      },
    };
  }

  /**
   * Get rebuild status
   */
  @Get('rebuild/status')
  @ApiOperation({ summary: 'Get current rebuild status' })
  @ApiResponse({ status: 200, type: RebuildStatusDto })
  async getRebuildStatus(): Promise<RebuildStatusDto> {
    const queueStats = await this.queueProducerService.getQueueStats();
    const healthStatus = await this.elasticsearchService.getHealthStatus();

    return {
      inProgress: queueStats.active > 0,
      currentIndex: healthStatus?.indexName || 'unknown',
      documentCount: healthStatus?.documentCount || 0,
      lastRebuildAt: null, // TODO: Track this
    };
  }

  /**
   * Manually sync specific product variant IDs
   */
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Manually sync specific product variants' })
  @ApiResponse({ status: 202, description: 'Sync jobs queued' })
  async syncProductVariants(@Body() body: { ids: number[] }) {
    await this.queueProducerService.addSyncJobs(body.ids, 'manual');

    return {
      message: `Queued sync for ${body.ids.length} product variants`,
      ids: body.ids,
    };
  }

  /**
   * Force process all pending CDC changes
   */
  @Post('cdc/force-process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force process all pending CDC changes' })
  @ApiResponse({
    status: 200,
    description: 'Returns number of processed records',
  })
  async forceProcessCdc() {
    const processed = await this.cdcWorkerService.forceProcess();

    return {
      message: `Processed ${processed} CDC records`,
      count: processed,
    };
  }

  /**
   * Refresh synonym cache
   */
  @Post('synonyms/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force refresh synonym cache' })
  @ApiResponse({ status: 200, description: 'Synonyms refreshed' })
  async refreshSynonyms() {
    await this.synonymCacheService.forceReload();

    return {
      message: 'Synonym cache refreshed',
      stats: this.synonymCacheService.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all search index caches' })
  @ApiResponse({ status: 200, description: 'Caches cleared' })
  async clearCaches() {
    await this.cacheService.clearAll();

    return {
      message: 'All caches cleared',
    };
  }

  /**
   * Pause the queue
   */
  @Post('queue/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause the search index queue' })
  @ApiResponse({ status: 200, description: 'Queue paused' })
  async pauseQueue() {
    await this.queueProducerService.pause();

    return {
      message: 'Queue paused',
    };
  }

  /**
   * Resume the queue
   */
  @Post('queue/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume the search index queue' })
  @ApiResponse({ status: 200, description: 'Queue resumed' })
  async resumeQueue() {
    await this.queueProducerService.resume();

    return {
      message: 'Queue resumed',
    };
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for search index system' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  async healthCheck() {
    const isEsConnected = await this.elasticsearchService.isConnected();
    const isSynonymsLoaded = this.synonymCacheService.isLoaded();

    const isHealthy = isEsConnected && isSynonymsLoaded;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks: {
        elasticsearch: isEsConnected ? 'connected' : 'disconnected',
        synonymCache: isSynonymsLoaded ? 'loaded' : 'not loaded',
      },
    };
  }
}
