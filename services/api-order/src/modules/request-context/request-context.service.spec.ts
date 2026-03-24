import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from './request-context.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/model/user.entity';
import { Merchant, MerchantStatus } from '@/model/merchant.entity';
import { Customer } from '@/model/customer.entity';
import { Organization } from '@/model/organiztion.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestContext } from '@/model/request-context.model';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RequestContextService', () => {
  let service: RequestContextService;
  let userRepo: any;
  let merchantRepo: any;
  let cacheManager: any;
  let customerRepo: any;
  let organizationRepo: any;

  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestContextService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
    userRepo = module.get(getRepositoryToken(User));
    merchantRepo = module.get(getRepositoryToken(Merchant));
    cacheManager = module.get(CACHE_MANAGER);
    customerRepo = module.get(getRepositoryToken(Customer));
    organizationRepo = module.get(getRepositoryToken(Organization));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock current request context
  const mockContext = (reqData: any) => {
    jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValue({
      req: reqData,
      res: {},
      requestId: 123,
    } as any);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('currentUser', () => {
    it('should return user from req', () => {
      mockContext({ user: { id: 1 } });
      expect(service.currentUser).toEqual({ id: 1 });
    });

    it('should return null if no user', () => {
      mockContext({});
      expect(service.currentUser).toBeNull();
    });
  });

  describe('currentLang', () => {
    it('should return lang from header', () => {
      mockContext({ headers: { lang: 'en' } });
      expect(service.currentLang).toBe('en');
    });

    it('should return th by default', () => {
      mockContext({ headers: {} });
      expect(service.currentLang).toBe('th');
    });
  });

  describe('requestCurrentMerchant', () => {
    it('should return merchant', async () => {
      const user = { id: 1, merchants: [{ slug: 'slug', id: 1 }] };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.requestCurrentMerchant(
        { userId: 1 },
        'slug',
      );
      expect(result.id).toBe(1);
    });

    it('should throw error if merchant not found in user', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, merchants: [] });
      await expect(
        service.requestCurrentMerchant({ userId: 1 }, 'slug'),
      ).rejects.toThrow();
    });
  });

  describe('currentMerchant', () => {
    it('should get current merchant based on context', async () => {
      mockContext({
        user: { userId: 1 },
        headers: { currentmerchantslug: 'slug' },
      });
      jest
        .spyOn(service, 'requestCurrentMerchant')
        .mockResolvedValue({ id: 1 } as any);

      const result = await service.currentMerchant();
      expect(result.id).toBe(1);
    });
  });

  describe('currentMerchantOnSlug', () => {
    it('should get current merchant on slug based on context', async () => {
      mockContext({ headers: { currentmerchantslug: 'slug' } });
      jest
        .spyOn(service, 'requestMerchantBySlug')
        .mockResolvedValue({ id: 1 } as any);

      const result = await service.currentMerchantOnSlug();
      expect(result.id).toBe(1);
    });
  });

  describe('requestCurrentCustomer', () => {
    it('should return customer', async () => {
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      userRepo.findOne.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValue({ id: 1 });

      const result = await service.requestCurrentCustomer(
        { userId: 1 },
        'slug',
      );
      expect(result.id).toBe(1);
    });
  });

  describe('currentCustomer', () => {
    it('should get current customer based on context', async () => {
      mockContext({
        user: { userId: 1 },
        headers: { currentmerchantslug: 'slug' },
      });
      jest
        .spyOn(service, 'requestCurrentCustomer')
        .mockResolvedValue({ id: 1 } as any);

      const result = await service.currentCustomer();
      expect(result.id).toBe(1);
    });
  });

  describe('currentOrganization', () => {
    it('should get current org based on context', async () => {
      mockContext({ authPayload: { organizationId: 1 } });
      jest.spyOn(service, 'findOrgById').mockResolvedValue({ id: 1 } as any);
      const result = await service.currentOrganization();
      expect(result.id).toBe(1);
    });
  });

  describe('requestMerchantBySlug', () => {
    it('should return cached merchant if available', async () => {
      const slug = 'test-merchant';
      const cachedMerchant = { id: 1, slug };
      cacheManager.get.mockResolvedValue(cachedMerchant);

      const result = await service.requestMerchantBySlug(slug);

      expect(cacheManager.get).toHaveBeenCalledWith(`merchant:full:${slug}`);
      expect(result).toEqual(cachedMerchant);
      expect(merchantRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should query db and cache if not in cache', async () => {
      const slug = 'test-merchant';
      const merchant = {
        id: 1,
        slug,
        status: MerchantStatus.ACTIVE,
        merchantPolicy: { privacyPolicy: 'old' },
      };
      cacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue(merchant);

      const result = await service.requestMerchantBySlug(slug);

      expect(merchantRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'merchant.slug = :slug',
        {
          slug,
        },
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        `merchant:full:${slug}`,
        expect.objectContaining({ id: 1 }),
        300,
      );
      expect(result.merchantPolicy.privacyPolicy).toBe('<p></p>');
    });

    it('should throw NOT_FOUND if merchant not found', async () => {
      const slug = 'invalid';
      cacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue(undefined);

      await expect(service.requestMerchantBySlug(slug)).rejects.toThrow(
        new HttpException('errors.CANT_FIND_MERCHANT', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw MOVED_PERMANENTLY if merchant is inactive', async () => {
      const slug = 'inactive';
      const merchant = { id: 1, slug, status: MerchantStatus.INACTIVE };
      cacheManager.get.mockResolvedValue(null);
      mockQueryBuilder.getOne.mockResolvedValue(merchant);

      await expect(service.requestMerchantBySlug(slug)).rejects.toThrow(
        new HttpException(
          'errors.CANT_FIND_MERCHANT',
          HttpStatus.MOVED_PERMANENTLY,
        ),
      );
    });
  });

  describe('findOrgById', () => {
    it('should return cached organization if available', async () => {
      const id = 1;
      const cachedOrg = { id };
      cacheManager.get.mockResolvedValue(cachedOrg);

      const result = await service.findOrgById(id);

      expect(cacheManager.get).toHaveBeenCalledWith(`organization:${id}`);
      expect(result).toEqual(cachedOrg);
      expect(organizationRepo.findOne).not.toHaveBeenCalled();
    });

    it('should query db and cache if not in cache', async () => {
      const id = 1;
      const org = { id };
      cacheManager.get.mockResolvedValue(null);
      organizationRepo.findOne.mockResolvedValue(org);

      const result = await service.findOrgById(id);

      expect(organizationRepo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `organization:${id}`,
        org,
        300,
      );
      expect(result).toEqual(org);
    });

    it('should throw error if organization not found', async () => {
      const id = 999;
      cacheManager.get.mockResolvedValue(null);
      organizationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOrgById(id)).rejects.toThrow(
        'Organization not found',
      );
    });
  });
});
