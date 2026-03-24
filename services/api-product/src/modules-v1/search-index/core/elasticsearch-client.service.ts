import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IndexHealthStatus } from '../interfaces';

/**
 * Type for Elasticsearch client
 */
export type ElasticsearchClient = {
  indices: {
    exists: (params: { index: string }) => Promise<boolean>;
    create: (params: {
      index: string;
      body: Record<string, unknown>;
    }) => Promise<unknown>;
    delete: (params: { index: string }) => Promise<unknown>;
    putSettings: (params: {
      index: string;
      body: Record<string, unknown>;
    }) => Promise<unknown>;
    getAlias: (params: {
      name: string;
    }) => Promise<{ body: Record<string, unknown> }>;
    putAlias: (params: { index: string; name: string }) => Promise<unknown>;
    deleteAlias: (params: { index: string; name: string }) => Promise<unknown>;
    stats: (params: { index: string }) => Promise<{
      body: {
        indices: Record<
          string,
          {
            primaries: {
              docs: { count: number };
              store: { size_in_bytes: number };
            };
          }
        >;
      };
    }>;
    refresh: (params: { index: string }) => Promise<unknown>;
  };
  bulk: (params: { body?: unknown[]; operations?: unknown[] }) => Promise<{
    body: {
      took: number;
      errors: boolean;
      items: Array<{
        index?: { _id: string; error?: { reason: string } };
        delete?: { _id: string; error?: { reason: string } };
      }>;
    };
  }>;
  cluster: {
    health: (params: {
      index: string;
    }) => Promise<{ body: { status: string } }>;
  };
  ping: () => Promise<boolean>;
  search: (params: {
    index: string;
    body: Record<string, unknown>;
  }) => Promise<{
    body: {
      took: number;
      timed_out: boolean;
      _shards: unknown;
      hits: {
        total: { value: number; relation: string };
        max_score: number;
        hits: Array<{
          _index: string;
          _type: string;
          _id: string;
          _score: number;
          _source: unknown;
        }>;
      };
    };
  }>;
};

/**
 * Elasticsearch Client Service (Shared Core)
 *
 * Provides a shared Elasticsearch client for all index services.
 * This is the base client that handles connection and common operations.
 */
@Injectable()
export class ElasticsearchClientService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchClientService.name);

  private client: ElasticsearchClient | null = null;

  // Configuration
  private readonly esNode: string;
  private readonly esApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.esNode = this.configService.get<string>(
      'ELASTICSEARCH_URI',
      'http://localhost:9200',
    );
    this.esApiKey = this.configService.get<string>('ELASTICSEARCH_API_KEY', '');
  }

  async onModuleInit(): Promise<void> {
    await this.initializeClient();
  }

  /**
   * Get the Elasticsearch client
   */
  getClient(): ElasticsearchClient | null {
    return this.client;
  }

  /**
   * Check if connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.client) return false;
    try {
      return await this.client.ping();
    } catch {
      return false;
    }
  }

  /**
   * Initialize Elasticsearch client
   */
  private async initializeClient(): Promise<void> {
    try {
      const { Client } = await import('@elastic/elasticsearch');

      const clientOptions: Record<string, unknown> = {
        node: this.esNode,
      };

      if (this.esApiKey) {
        clientOptions.auth = {
          apiKey: this.esApiKey,
        };
      }

      this.client = new Client(clientOptions) as unknown as ElasticsearchClient;

      try {
        await this.client.ping();
        this.logger.log(`Connected to Elasticsearch at ${this.esNode}`);
      } catch (pingError) {
        this.logger.error(`Elasticsearch ping failed: ${pingError}`);
        this.client = null;
      }
    } catch (error) {
      this.logger.warn(
        `Elasticsearch client initialization failed: ${error}. ` +
          'Install @elastic/elasticsearch package to enable search indexing.',
      );
    }
  }

  /**
   * Bulk operations helper
   */
  async bulk(operations: unknown[]): Promise<{
    took: number;
    errors: boolean;
    items: Array<{
      index?: { _id: string; error?: { reason: string } };
      delete?: { _id: string; error?: { reason: string } };
    }>;
  }> {
    if (!this.client) {
      throw new Error('Elasticsearch client not initialized');
    }

    const response = await this.client.bulk({ operations });
    return response as unknown as {
      took: number;
      errors: boolean;
      items: Array<{
        index?: { _id: string; error?: { reason: string } };
        delete?: { _id: string; error?: { reason: string } };
      }>;
    };
  }

  /**
   * Get index health status
   */
  async getIndexHealth(
    indexName: string,
    aliasName: string,
  ): Promise<IndexHealthStatus | null> {
    if (!this.client) return null;

    try {
      const [healthResponse, statsResponse] = await Promise.all([
        this.client.cluster.health({ index: indexName }) as unknown as {
          status: string;
        },
        this.client.indices.stats({ index: indexName }) as unknown as {
          indices: Record<
            string,
            {
              primaries: {
                docs: { count: number };
                store: { size_in_bytes: number };
              };
            }
          >;
        },
      ]);

      const stats = statsResponse.indices?.[indexName];

      return {
        indexName,
        aliasName,
        documentCount: stats?.primaries?.docs?.count || 0,
        sizeInBytes: stats?.primaries?.store?.size_in_bytes || 0,
        health: healthResponse.status as 'green' | 'yellow' | 'red',
        isWritable: true,
      };
    } catch (error) {
      this.logger.error(`Failed to get health status: ${error}`);
      return null;
    }
  }
}
