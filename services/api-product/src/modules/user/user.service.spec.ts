import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Admin, Customer, Merchant, User } from '@/model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MerchantStatus } from '../../model/merchant.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepo: any;
  let merchantRepo: any;
  let customerRepo: any;
  let adminRepo: any;
  let cacheManager: any;

  const createMockQueryBuilder = () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getRawMany: jest.fn(),
      from: jest.fn().mockReturnThis(),
    };
    return mockQueryBuilder;
  };

  beforeEach(async () => {
    const mockUserRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn(),
      },
    };

    const mockMerchantRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockCustomerRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockAdminRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepo,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: mockMerchantRepo,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    merchantRepo = module.get(getRepositoryToken(Merchant));
    customerRepo = module.get(getRepositoryToken(Customer));
    adminRepo = module.get(getRepositoryToken(Admin));
    cacheManager = module.get(CACHE_MANAGER);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('showById', () => {
    it('should return a user without password fields', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        originalPassword: 'originalPassword',
      } as User;

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockRawData = [];
      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawData),
      };
      userRepo.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.showById(1);

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.originalPassword).toBeUndefined();
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('currentMerchant', () => {
    it('should return the current merchant for a user', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockUser = {
        id: 1,
        merchants: [mockMerchant],
      } as User;

      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.currentMerchant(1, 'test-merchant');

      expect(result).toEqual(mockMerchant);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['merchants'],
      });
    });

    it('should throw an error when merchant is not found', async () => {
      const mockUser = {
        id: 1,
        merchants: [],
      } as User;

      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.currentMerchant(1, 'non-existent')).rejects.toThrow(
        "Can't find merchant",
      );
    });

    it('should throw an error when user has no merchants', async () => {
      const mockUser = {
        id: 1,
        merchants: undefined,
      } as User;

      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.currentMerchant(1, 'test-merchant')).rejects.toThrow(
        "Can't find merchant",
      );
    });
  });

  describe('requestMerchantBySlug', () => {
    it('should return cached merchant if available', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' };
      cacheManager.get.mockResolvedValue(mockMerchant);

      const result = await service.requestMerchantBySlug('test-merchant');

      expect(result).toEqual(mockMerchant);
      expect(cacheManager.get).toHaveBeenCalledWith('merchant:full:test-merchant');
      expect(merchantRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch merchant from database and cache it when not in cache', async () => {
      const mockMerchant = {
        id: 1,
        slug: 'test-merchant',
        merchantName: 'Test Merchant',
        status: MerchantStatus.ACTIVE,
      } as Merchant;

      cacheManager.get.mockResolvedValue(null);

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockMerchant);
      merchantRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.requestMerchantBySlug('test-merchant');

      expect(result).toMatchObject(mockMerchant);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'merchant:full:test-merchant',
        expect.any(Object),
        300,
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('merchant.slug = :slug', {
        slug: 'test-merchant',
      });
    });

    it('should throw NOT_FOUND exception when merchant does not exist', async () => {
      cacheManager.get.mockResolvedValue(null);

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(null);
      merchantRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.requestMerchantBySlug('non-existent')).rejects.toThrow(
        new HttpException('errors.CANT_FIND_MERCHANT', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw MOVED_PERMANENTLY exception when merchant is inactive', async () => {
      const mockMerchant = {
        id: 1,
        slug: 'test-merchant',
        status: MerchantStatus.INACTIVE,
      } as Merchant;

      cacheManager.get.mockResolvedValue(null);

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockMerchant);
      merchantRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.requestMerchantBySlug('test-merchant')).rejects.toThrow(
        new HttpException('errors.CANT_FIND_MERCHANT', HttpStatus.MOVED_PERMANENTLY),
      );
    });
  });

  describe('requestCurrentMerchant', () => {
    it('should return the current merchant for a user with dto', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockUser = {
        id: 1,
        merchants: [mockMerchant],
      } as User;

      const dto = { userId: 1 };
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.requestCurrentMerchant(dto, 'test-merchant');

      expect(result).toEqual(mockMerchant);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['merchants'],
      });
    });

    it('should throw an error when merchant is not found in requestCurrentMerchant', async () => {
      const mockUser = {
        id: 1,
        merchants: [{ id: 2, slug: 'other-merchant' }],
      } as User;

      const dto = { userId: 1 };
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.requestCurrentMerchant(dto, 'test-merchant'),
      ).rejects.toThrow("Can't find merchant");
    });
  });

  describe('findById', () => {
    it('should return user with merchants and pivot data', async () => {
      const mockMerchant = {
        id: 1,
        slug: 'test-merchant',
        organizeId: null,
      } as Merchant;

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        merchants: [mockMerchant],
        admins: [],
      } as User;

      const mockPivotData = [
        {
          pivot_merchantId: 1,
          pivot_lastAccessedAt: new Date('2025-01-01'),
          pivot_createdAt: new Date('2024-01-01'),
          pivot_updatedAt: new Date('2025-01-01'),
        },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockPivotData),
      };
      userRepo.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.merchants).toHaveLength(1);
      expect((result.merchants[0] as any).lastAccessedAt).toEqual(
        mockPivotData[0].pivot_lastAccessedAt,
      );
      expect((result.merchants[0] as any).isOrganize).toBe(false);
    });

    it('should handle user with no merchants', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        merchants: [],
      } as User;

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.merchants).toHaveLength(0);
    });

    it('should set isOrganize to true when organizeId is not null', async () => {
      const mockMerchant = {
        id: 1,
        slug: 'test-merchant',
        organizeId: 5,
      } as Merchant;

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        merchants: [mockMerchant],
      } as User;

      const mockPivotData = [
        {
          pivot_merchantId: 1,
          pivot_lastAccessedAt: null,
        },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      userRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockPivotData),
      };
      userRepo.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.findById(1);

      expect((result.merchants[0] as any).isOrganize).toBe(true);
    });
  });

  describe('requestCurrentCustomer', () => {
    it('should return the current customer', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      const mockCustomer = {
        id: 1,
        user: mockUser,
        merchant: mockMerchant,
      } as Customer;

      const dto = { userId: 1 };
      merchantRepo.findOne.mockResolvedValue(mockMerchant);
      userRepo.findOne.mockResolvedValue(mockUser);
      customerRepo.findOne.mockResolvedValue(mockCustomer);

      const result = await service.requestCurrentCustomer(dto, 'test-merchant');

      expect(result).toEqual(mockCustomer);
      expect(merchantRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-merchant' },
      });
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(customerRepo.findOne).toHaveBeenCalledWith({
        where: { user: mockUser, merchant: mockMerchant },
        relations: expect.any(Array),
      });
    });
  });

  describe('requestCurrentAdmin', () => {
    it('should return the current admin', async () => {
      const mockMerchant = { id: 1, slug: 'test-merchant' } as Merchant;
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      const mockAdmin = {
        id: 1,
        user: mockUser,
        merchant: mockMerchant,
      } as Admin;

      const dto = { userId: 1 };
      merchantRepo.findOne.mockResolvedValue(mockMerchant);
      userRepo.findOne.mockResolvedValue(mockUser);
      adminRepo.findOne.mockResolvedValue(mockAdmin);

      const result = await service.requestCurrentAdmin(dto, 'test-merchant');

      expect(result).toEqual(mockAdmin);
      expect(merchantRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-merchant' },
      });
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(adminRepo.findOne).toHaveBeenCalledWith({
        where: { user: mockUser, merchant: mockMerchant },
        relations: ['imageUpload', 'adminPermission', 'merchant', 'user'],
      });
    });
  });
});
