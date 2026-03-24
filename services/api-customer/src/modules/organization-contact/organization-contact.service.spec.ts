import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationContactService } from './organization-contact.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationContact } from '@/model/organization-contact.entity';

const createMockRepository = <T>() => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});
type MockRepo<T> = ReturnType<typeof createMockRepository<T>>;

let service: OrganizationContactService;
let repo: MockRepo<any>;

beforeEach(async () => {
  repo = createMockRepository<any>();
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrganizationContactService,
      { provide: getRepositoryToken(OrganizationContact), useValue: repo },
    ],
  }).compile();

  service = module.get<OrganizationContactService>(OrganizationContactService);
});

describe('OrganizationContactService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganizationContact', () => {
    it('should create contact', async () => {
      const dto = {
        userId: 1,
        contactType: 'email',
        contact: 'test@example.com',
      } as any;
      const expected = { id: 1, ...dto };
      repo.save.mockResolvedValue(expected);
      const result = await service.createOrganizationContact(dto);
      expect(result).toEqual(expected);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('deleteOrganizationContactByIds', () => {
    it('should delete contacts', async () => {
      const ids = [1, 2];
      repo.delete.mockResolvedValue({ affected: 2 });
      await service.deleteOrganizationContactByIds(ids);
      expect(repo.delete).toHaveBeenCalledWith(ids);
    });
  });

  describe('find methods', () => {
    const mockResult = [{ id: 1 }];

    it('should find by user id', async () => {
      repo.find.mockResolvedValue(mockResult);
      const result = await service.findOrganizationContactByUserId(1);
      expect(result).toEqual(mockResult);
      expect(repo.find).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('should find by merchant id', async () => {
      repo.find.mockResolvedValue(mockResult);
      const result = await service.findOrganizationContactByMerchantId(1);
      expect(result).toEqual(mockResult);
      expect(repo.find).toHaveBeenCalledWith({ where: { merchantId: 1 } });
    });

    it('should find by store id', async () => {
      repo.find.mockResolvedValue(mockResult);
      const result = await service.findOrganizationContactByStoreId(1);
      expect(result).toEqual(mockResult);
      expect(repo.find).toHaveBeenCalledWith({ where: { storeId: 1 } });
    });

    it('should find by org branch id', async () => {
      repo.find.mockResolvedValue(mockResult);
      const result = await service.findOrganizationContactByOrgBranchId(1);
      expect(result).toEqual(mockResult);
      expect(repo.find).toHaveBeenCalledWith({
        where: { organizeBranchId: 1 },
      });
    });

    it('should find by org id', async () => {
      repo.find.mockResolvedValue(mockResult);
      const result = await service.findOrganizationContactByOrgId(1);
      expect(result).toEqual(mockResult);
      expect(repo.find).toHaveBeenCalledWith({ where: { organizeId: 1 } });
    });
  });
});
