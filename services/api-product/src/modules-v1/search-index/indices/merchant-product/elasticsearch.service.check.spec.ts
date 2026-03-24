import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from './elasticsearch.service';
import { ConfigService } from '@nestjs/config';

// Mock Client properly
const mockClient = {
  search: jest.fn(),
  ping: jest.fn().mockResolvedValue(true),
  indices: {
    getAlias: jest.fn().mockResolvedValue({}),
  },
};

// Mock Constructor
jest.mock('@elastic/elasticsearch', () => {
  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

describe('ElasticsearchService Autocomplete Check', () => {
  let service: ElasticsearchService;

  beforeEach(async () => {
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
    await service.onModuleInit();

    (service as any).currentIndex = 'test_index';
  });

  it('should return unique name and category details', async () => {
    const hits = [
      {
        _source: {
          name: 'Product A',
          categoryId: 1,
          categoryName: 'Cat 1',
          categoryPath: 'Root > Cat 1',
        },
      },
      {
        _source: {
          name: 'Product A',
          categoryId: 1,
          categoryName: 'Cat 1',
          categoryPath: 'Root > Cat 1',
        },
      }, // Duplicate
      {
        _source: {
          name: 'Product B',
          categoryId: 2,
          categoryName: 'Cat 2',
          categoryPath: 'Root > Cat 2',
        },
      },
    ];

    mockClient.search.mockResolvedValue({
      hits: {
        hits,
      },
    });

    const result = await service.autocomplete('query');

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          name: 'Product A',
          categoryId: 1,
          categoryName: 'Cat 1',
          categoryPath: 'Root > Cat 1',
        },
        {
          name: 'Product B',
          categoryId: 2,
          categoryName: 'Cat 2',
          categoryPath: 'Root > Cat 2',
        },
      ]),
    );

    // allow any here because _source is not typed in the client mock
    const callArgs = mockClient.search.mock.calls[0][0] as any;
    expect(callArgs.body._source).toEqual([
      'name',
      'categoryId',
      'categoryName',
      'categoryPath',
    ]);
  });
  it('should return unique name and category details, handling missing data', async () => {
    const hits = [
      {
        _source: {
          name: 'Product A',
          categoryId: 1,
          categoryName: 'Cat 1',
          categoryPath: 'Root > Cat 1',
        },
      },
      {
        _source: {
          name: 'Product Missing Cat',
          // Missing category fields
        },
      } as any,
    ];

    mockClient.search.mockResolvedValue({
      hits: {
        hits,
      },
    });

    const result = await service.autocomplete('query');

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          name: 'Product A',
          categoryId: 1,
          categoryName: 'Cat 1',
          categoryPath: 'Root > Cat 1',
        },
        {
          name: 'Product Missing Cat',
          categoryId: 0,
          categoryName: '',
          categoryPath: '',
        },
      ]),
    );
  });
});
