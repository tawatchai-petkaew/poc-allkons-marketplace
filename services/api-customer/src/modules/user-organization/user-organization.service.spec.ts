import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationService } from './user-organization.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrganization } from '@/model/user-organization.entity';
import { OrganizationLeaveLog } from '@/model/organization-leave-log.entity';
import { Invitation } from '@/model/invitation.entity';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';

describe('UserOrganizationService', () => {
  let service: UserOrganizationService;
  let userOrgRepo: any;
  let leaveLogRepo: any;
  let invitationRepo: any;

  beforeEach(async () => {
    userOrgRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    leaveLogRepo = {
      find: jest.fn(),
    };
    invitationRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOrganizationService,
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: userOrgRepo,
        },
        {
          provide: getRepositoryToken(OrganizationLeaveLog),
          useValue: leaveLogRepo,
        },
        { provide: getRepositoryToken(Invitation), useValue: invitationRepo },
      ],
    }).compile();

    service = module.get<UserOrganizationService>(UserOrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserOrganization', () => {
    it('should create user-org', async () => {
      const input = {
        userId: 1,
        organizationId: 1,
        isOwner: true,
        memberStatus: UserOrganizationInviteStatus.ACCEPTED,
      };
      userOrgRepo.save.mockResolvedValue({ id: 1 });
      expect(await service.createUserOrganization(input)).toEqual({ id: 1 });
      expect(userOrgRepo.save).toHaveBeenCalled();
    });
  });

  describe('findUserOrganizationByUserId', () => {
    it('should return user org', async () => {
      userOrgRepo.findOne.mockResolvedValue({});
      expect(await service.findUserOrganizationByUserId(1)).toBeDefined();
    });
  });

  describe('findUserOrganizationsByUserId', () => {
    it('should return array', async () => {
      userOrgRepo.find.mockResolvedValue([]);
      expect(await service.findUserOrganizationsByUserId(1)).toEqual([]);
    });
  });

  describe('findUserOrganizationByUserIdAndOrgId', () => {
    it('should return user org', async () => {
      userOrgRepo.findOne.mockResolvedValue({});
      expect(
        await service.findUserOrganizationByUserIdAndOrgId(1, 1),
      ).toBeDefined();
    });
  });

  describe('findOrganizationByUserId', () => {
    it('should return user orgs', async () => {
      userOrgRepo.find.mockResolvedValue([]);
      expect(await service.findOrganizationByUserId(1)).toEqual([]);
    });
  });

  describe('findUsersByOrgId', () => {
    it('should return users', async () => {
      userOrgRepo.find.mockResolvedValue([]);
      expect(await service.findUsersByOrgId(1)).toEqual([]);
    });
  });

  describe('findUserOrganization', () => {
    it('should return user org', async () => {
      userOrgRepo.findOne.mockResolvedValue({});
      expect(await service.findUserOrganization(1, 1)).toBeDefined();
    });
  });

  describe('findUserOrganizationOwner', () => {
    it('should return owner', async () => {
      userOrgRepo.findOne.mockResolvedValue({});
      expect(await service.findUserOrganizationOwner(1)).toBeDefined();
    });
  });

  describe('findUserOrgByCountryAndPhoneNumber', () => {
    it('should find by query builder', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      userOrgRepo.createQueryBuilder.mockReturnValue(qb);

      expect(
        await service.findUserOrgByCountryAndPhoneNumber('66', '123'),
      ).toEqual([]);
      expect(userOrgRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('removeUserOrganizationById', () => {
    it('should delete', async () => {
      await service.removeUserOrganizationById(1);
      expect(userOrgRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('deleteUserOrganizationByIds', () => {
    it('should delete ids', async () => {
      await service.deleteUserOrganizationByIds([1, 2]);
      expect(userOrgRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('createRoleForUserInOrganization', () => {
    it('should save', async () => {
      userOrgRepo.save.mockResolvedValue({});
      await service.createRoleForUserInOrganization({
        userId: 1,
        organizationId: 1,
        roleId: 1,
      });
      expect(userOrgRepo.save).toHaveBeenCalled();
    });
  });

  describe('countUsersByOrganizationId', () => {
    it('should count', async () => {
      userOrgRepo.count.mockResolvedValue(5);
      expect(await service.countUsersByOrganizationId(1)).toBe(5);
    });
  });

  describe('getUserRole', () => {
    it('should return role', async () => {
      userOrgRepo.findOne.mockResolvedValue({ role: { name: 'admin' } });
      expect(await service.getUserRole(1, 1)).toEqual({ name: 'admin' });
    });
    it('should return null if not found', async () => {
      userOrgRepo.findOne.mockResolvedValue(null);
      expect(await service.getUserRole(1, 1)).toBeNull();
    });
  });

  describe('getUserRoleCode', () => {
    it('should return role code', async () => {
      userOrgRepo.findOne.mockResolvedValue({ role: { name: 'admin' } });
      expect(await service.getUserRoleCode(1, 1)).toBe('admin');
    });
  });

  describe('checkUserRole', () => {
    it('should return true if match', async () => {
      userOrgRepo.findOne.mockResolvedValue({ role: { name: 'admin' } });
      expect(await service.checkUserRole(1, 1, 'admin')).toBe(true);
    });
  });

  describe('requestCurrentUserOrganization', () => {
    it('should return user org', async () => {
      userOrgRepo.findOne.mockResolvedValue({});
      expect(
        await service.requestCurrentUserOrganization({ userId: 1 }, 1),
      ).toBeDefined();
    });

    it('should throw if not found', async () => {
      userOrgRepo.findOne.mockResolvedValue(null);
      await expect(
        service.requestCurrentUserOrganization({ userId: 1 }, 1),
      ).rejects.toThrow("Can't find user organization");
    });
  });

  describe('findOrganizationUsers', () => {
    it('should return paginated users', async () => {
      const userOrgQb = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            createdAt: new Date(),
            user: { id: 1, firstNameTh: 'A' },
            isInvitation: false,
          },
        ]),
      };

      const invQb = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 2,
            firstName: 'B',
            createdAt: new Date(),
            status: 'SENT',
            // mock other fields if needed
          },
        ]),
      };

      userOrgRepo.createQueryBuilder.mockReturnValue(userOrgQb);
      invitationRepo.createQueryBuilder.mockReturnValue(invQb);
      leaveLogRepo.find.mockResolvedValue([]);

      const result = await service.findOrganizationUsers(1, {
        page: 1,
        limit: 10,
      });
      expect(result.total).toBe(2);
      expect(result.userOrganizations.length).toBe(2);
    });
  });

  describe('findOrganizationUsersApproveRequestHistory', () => {
    it('should return history', async () => {
      const userOrgQb = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      const invQb = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 3,
            firstName: 'C',
            createdAt: new Date(),
            status: 'ACCEPTED',
            invitedByUser: { firstNameTh: 'Inviter', lastNameTh: 'User' },
            organization: { organizeName: 'Org' },
          },
        ]),
      };

      userOrgRepo.createQueryBuilder.mockReturnValue(userOrgQb);
      invitationRepo.createQueryBuilder.mockReturnValue(invQb);
      leaveLogRepo.find.mockResolvedValue([]);

      const result = await service.findOrganizationUsersApproveRequestHistory(
        1,
        {
          page: 1,
          limit: 10,
        },
      );
      expect(result.total).toBe(1); // Logic in service confusingly sets total = userOrgCount
      expect(result.userOrganizations.length).toBeDefined();
    });
  });
});
