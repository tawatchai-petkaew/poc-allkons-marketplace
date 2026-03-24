import { Test, TestingModule } from '@nestjs/testing';
import { RetailApiService } from './retail-api.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

// Mock Google Cloud Retail clients
jest.mock('@google-cloud/retail', () => ({
  CatalogServiceClient: jest.fn().mockImplementation(() => ({
    listCatalogs: jest.fn().mockResolvedValue([]),
  })),
  PredictionServiceClient: jest.fn().mockImplementation(() => ({
    predict: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('@google-cloud/retail/build/src/v2alpha', () => ({
  SearchServiceClient: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue([]),
  })),
}));

const createMockRepository = <T>() => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});
type MockRepo<T> = ReturnType<typeof createMockRepository<T>>;

const mockConfigService = { get: jest.fn().mockReturnValue('project-id') } as any;
const mockCache = { get: jest.fn(), set: jest.fn() } as unknown as Cache;
const mockQueue = { add: jest.fn() } as unknown as Queue;

let service: RetailApiService;
let repo: MockRepo<any>;

beforeEach(async () => {
  repo = createMockRepository<any>();
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      RetailApiService,
      { provide: getRepositoryToken('MockRepository' as any), useValue: repo },
      { provide: ConfigService, useValue: mockConfigService },
      { provide: CACHE_MANAGER, useValue: mockCache },
      { provide: 'SomeQueue', useValue: mockQueue },
    ],
  }).compile();

  service = module.get<RetailApiService>(RetailApiService);
});

describe('RetailApiService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCatalogs', () => {
    it('should return catalogs', async () => {
      await expect(service.listCatalogs()).resolves.toBeDefined();
    });
  });

  describe('callPredict', () => {
    it('should call predict', async () => {
      const dto = {
        servingConfigsId: 'test-config',
        userEvent: {
          eventType: 'view',
          visitorId: 'visitor-1',
          productDetails: []
        },
        pageSize: 10,
        pageToken: '',
        filter: '',
        validateOnly: false,
        params: {},
        labels: {}
      } as any;
      await expect(service.callPredict(dto)).resolves.toBeDefined();
    });
  });

  describe('callSearch', () => {
    it('should call search', async () => {
      const dto = {
        visitorId: 'visitor-1',
        query: 'test',
        pageSize: 10,
        pageToken: '',
        filter: '',
        offset: 0
      } as any;
      await expect(service.callSearch(dto)).resolves.toBeDefined();
    });
  });
});
