import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from './elasticsearch.service';
import { ConfigService } from '@nestjs/config';

// Mock Client properly
const mockClient = {
  indices: {
    create: jest.fn(),
    delete: jest.fn(),
    putAlias: jest.fn(),
    updateAliases: jest.fn(),
    getAlias: jest.fn(),
    putSettings: jest.fn(),
    deleteAlias: jest.fn(),
    refresh: jest.fn(),
    stats: jest.fn(),
  },
  cluster: {
    health: jest.fn(),
  },
  bulk: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  ping: jest.fn(),
};

// Mock Constructor
jest.mock('@elastic/elasticsearch', () => {
  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const configServiceMock = {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<ElasticsearchService>(ElasticsearchService);
    configService = module.get<ConfigService>(ConfigService);

    // Manually init client since onModuleInit handles it
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkIndex', () => {
    it('should process documents in chunks', async () => {
      const docs = Array.from({ length: 1200 }, (_, i) => ({
        id: i,
        name: `Product ${i}`,
      })) as any[];

      mockClient.bulk.mockResolvedValue({
        took: 100,
        errors: false,
        items: [],
      });

      // Need current index set (usually happens via ensureAliasExists or reindex)
      // Mock ensureAliasExists behavior via casting or just rely on manual setup?
      // Since we can't easily access private currentIndex, we can spy on bulk?
      // Or we can mock indices.getAlias to return something so onModuleInit sets it.

      // But onModuleInit already ran in beforeEach with empty mocks.
      // Let's force currentIndex via 'any' hack for testing
      (service as any).currentIndex = 'test_index_1';

      await service.bulkIndex(docs);

      expect(mockClient.bulk).toHaveBeenCalledTimes(3);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete documents', async () => {
      const ids = [1, 2, 3];

      mockClient.bulk.mockResolvedValue({
        took: 50,
        errors: false,
        items: [],
      });

      (service as any).currentIndex = 'test_index_1';

      await service.bulkDelete(ids);

      expect(mockClient.bulk).toHaveBeenCalledWith(
        expect.objectContaining({
          operations: expect.arrayContaining([
            expect.objectContaining({
              delete: { _index: 'test_index_1', _id: '1' },
            }),
          ]),
        }),
      );
    });
  });

  describe('reindex', () => {
    it('should perform blue-green deployment', async () => {
      mockClient.indices.create.mockResolvedValue({ acknowledged: true });
      mockClient.indices.putSettings.mockResolvedValue({ acknowledged: true });
      mockClient.indices.refresh.mockResolvedValue({ acknowledged: true });
      mockClient.indices.putAlias.mockResolvedValue({ acknowledged: true });
      mockClient.indices.deleteAlias.mockResolvedValue({ acknowledged: true });

      // Setup old index
      (service as any).currentIndex = 'old_index';
      (service as any).aliasName = 'products';

      const indexAllMock = jest.fn().mockResolvedValue(undefined);

      await service.reindex(indexAllMock);

      // 1. Create new index
      expect(mockClient.indices.create).toHaveBeenCalled();

      // 2. Settings optimized
      expect(mockClient.indices.putSettings).toHaveBeenCalled();

      // 3. Callback called
      expect(indexAllMock).toHaveBeenCalled();

      // 4. Settings restored
      expect(mockClient.indices.putSettings).toHaveBeenCalledTimes(2); // disable + enable

      // 5. Alias switch
      expect(mockClient.indices.putAlias).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'products',
        }),
      );
      expect(mockClient.indices.deleteAlias).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'old_index',
          name: 'products',
        }),
      );

      // 6. Delete old index (setTimeout mock required if we want to verify this, but typically skipped in unit test unless using fake timers)
      // Jest uses real timers by default. We won't wait 30s.
    });
  });
  describe('search', () => {
    it('should filter by merchantId via merchantIds field', async () => {
      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 1, relation: 'eq' },
          hits: [{ _source: { id: 1, name: 'Product 1' } }],
        },
        aggregations: {},
      });

      (service as any).currentIndex = 'test_index_1';

      await service.search({
        searchText: 'test',
        merchantId: 123,
      });

      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            query: expect.objectContaining({
              function_score: expect.objectContaining({
                query: expect.objectContaining({
                  bool: expect.objectContaining({
                    filter: expect.arrayContaining([
                      expect.objectContaining({
                        term: { merchantIds: 123 },
                      }),
                    ]),
                  }),
                }),
              }),
            }),
          }),
        }),
      );
    });
  });
});
