import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '@/model/organization.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationRepo: any;
  let cacheManager: any;

  const mockOrganization = {
    id: 1,
    taxId: '1234567890',
  } as Organization;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    organizationRepo = module.get(getRepositoryToken(Organization));
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrgById', () => {
    it('should return cached organization if available', async () => {
      cacheManager.get.mockResolvedValue(mockOrganization);

      const result = await service.findOrgById(1);

      expect(result).toEqual(mockOrganization);
      expect(cacheManager.get).toHaveBeenCalledWith('organization:1');
      expect(organizationRepo.findOne).not.toHaveBeenCalled();
    });

    it('should fetch organization from database and cache it when not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      organizationRepo.findOne.mockResolvedValue(mockOrganization);

      const result = await service.findOrgById(1);

      expect(result).toEqual(mockOrganization);
      expect(cacheManager.get).toHaveBeenCalledWith('organization:1');
      expect(organizationRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'organization:1',
        mockOrganization,
        300,
      );
    });

    it('should throw an error when organization is not found', async () => {
      cacheManager.get.mockResolvedValue(null);
      organizationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOrgById(999)).rejects.toThrow(
        'Organization not found',
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
