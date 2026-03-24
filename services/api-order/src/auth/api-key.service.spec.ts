import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from '@/model/api-key.entity';
import { Merchant } from '@/model';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let apiKeyRepo: any;
  let merchantRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    apiKeyRepo = module.get(getRepositoryToken(ApiKey));
    merchantRepo = module.get(getRepositoryToken(Merchant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByKey', () => {
    it('should return merchant if api key exists', async () => {
      const merchant = { id: 1, name: 'Test Merchant' };
      const apiKey = { key: '123', merchant };
      apiKeyRepo.findOne.mockResolvedValue(apiKey);

      const result = await service.findByKey('123');
      expect(apiKeyRepo.findOne).toHaveBeenCalledWith({
        where: { key: '123' },
        relations: ['merchant'],
      });
      expect(result).toEqual(merchant);
    });

    it('should return undefined if api key does not exist', async () => {
      apiKeyRepo.findOne.mockResolvedValue(undefined);

      const result = await service.findByKey('invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('validateKey', () => {
    it('should return true (current behavior, likely bug as it returns Promise object cast to boolean)', () => {
      // This method is synchronous but calls an async method without awaiting.
      // It returns !!Promise which is always true.
      const result = service.validateKey('any');
      expect(result).toBe(true);
    });
  });
});
