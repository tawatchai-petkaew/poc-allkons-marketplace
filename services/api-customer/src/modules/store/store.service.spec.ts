import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from '@/model/store.entity';

describe('StoreService', () => {
  let service: StoreService;
  let repo: any;

  beforeEach(async () => {
    const mockRepo = {
      manager: {
        query: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    repo = module.get(getRepositoryToken(Store));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllStoreMemberCountPage', () => {
    it('should return stores and total', async () => {
      const mockStoreData = [{ name: 'Store A' }];
      const mockTotal = [{ total: 1 }];
      repo.manager.query
        .mockResolvedValueOnce(mockStoreData) // First query
        .mockResolvedValueOnce(mockTotal); // Second query

      const result = await service.findAllStoreMemberCountPage(1, 1, 10);

      expect(result).toEqual({ store: mockStoreData, total: mockTotal });
      expect(repo.manager.query).toHaveBeenCalledTimes(2);
    });
  });
});
