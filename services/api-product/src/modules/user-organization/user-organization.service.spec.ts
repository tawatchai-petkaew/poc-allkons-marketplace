import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationService } from './user-organization.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrganization } from '@/model/user-organization.entity';

describe('UserOrganizationService', () => {
  let service: UserOrganizationService;
  let userOrganizationRepo: any;

  const mockUserOrganization = {
    id: 1,
    userId: 1,
    organizeId: 5,
    role: { id: 1, name: 'Admin' },
  } as UserOrganization;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOrganizationService,
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserOrganizationService>(UserOrganizationService);
    userOrganizationRepo = module.get(getRepositoryToken(UserOrganization));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestCurrentUserOrganization', () => {
    it('should return user organization when found', async () => {
      const dto = { userId: 1 };
      userOrganizationRepo.findOne.mockResolvedValue(mockUserOrganization);

      const result = await service.requestCurrentUserOrganization(dto, 5);

      expect(result).toEqual(mockUserOrganization);
      expect(userOrganizationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 1, organizeId: 5 },
        relations: ['role'],
      });
    });

    it('should throw an error when user organization is not found', async () => {
      const dto = { userId: 999 };
      userOrganizationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.requestCurrentUserOrganization(dto, 5),
      ).rejects.toThrow("Can't find user organization");

      expect(userOrganizationRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 999, organizeId: 5 },
        relations: ['role'],
      });
    });
  });
});
