import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';

describe('CacheService', () => {
  let service: CacheService;
  let redisMock: any;

  beforeEach(async () => {
    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      mget: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'SEARCH_INDEX_CACHE_L1_TTL') return 300;
        if (key === 'SEARCH_INDEX_CACHE_L2_TTL') return 1800;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return value from L1 cache if present', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      // Manually set L1 cache
      (service as any).l1Cache.set(key, {
        value,
        expireAt: Date.now() + 10000,
      });

      const result = await service.get(key, async () => {
        throw new Error('Should not be called');
      });

      expect(result).toEqual(value);
      expect(redisMock.get).not.toHaveBeenCalled();
    });

    it('should return value from L2 cache if L1 miss, and populate L1', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      redisMock.get.mockResolvedValue(JSON.stringify(value));

      const result = await service.get(key, async () => {
        throw new Error('Should not be called');
      });

      expect(result).toEqual(value);
      expect(redisMock.get).toHaveBeenCalledWith('test-key');
      expect((service as any).l1Cache.get(key).value).toEqual(value); // Verified L1 population
    });

    it('should fetch from source if L1 and L2 miss, and populate both', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const fetcher = jest.fn().mockResolvedValue(value);

      redisMock.get.mockResolvedValue(null); // L2 miss

      const result = await service.get(key, fetcher);

      expect(result).toEqual(value);
      expect(fetcher).toHaveBeenCalled();

      // Verify L1 set
      expect((service as any).l1Cache.get(key).value).toEqual(value);

      // Verify L2 set
      expect(redisMock.setex).toHaveBeenCalledWith(
        'test-key',
        1800,
        JSON.stringify(value),
      );
    });
  });

  describe('evict', () => {
    it('should remove from L1 and L2', async () => {
      const key = 'test-key';

      await service.invalidate(key);

      expect((service as any).l1Cache.has(key)).toBeFalsy();
      expect(redisMock.del).toHaveBeenCalledWith('test-key');
    });
  });
});
