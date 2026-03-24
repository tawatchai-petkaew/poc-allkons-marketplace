import { Test, TestingModule } from '@nestjs/testing';
import { InvitationService } from './invitation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invitation } from '../../model/invitation.entity';
import { User } from '../../model/user.entity';
import { UserOrganization } from '../../model/user-organization.entity';
import { UserMerchant } from '../../model/user-merchant.entity';
import { PhoneWhiteList } from '../../model/phone-white-list.entity';
import { Merchant } from '../../model/merchant.entity';
import { Organization } from '../../model/organization.entity';
import { JuristicType } from '../../model/juristic-type.entity';
import { CisService } from '../cis/cis.service';
import { RoleService } from '../role/role.service';
import { OrganizationService } from '../organization/organization.service';
import { Connection } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserOrganizationInviteStatus } from '../../model/enum/user-organization.enum';
import * as Utils from '../../utils';

jest.mock('../../utils', () => ({
  clearCacheByPattern: jest.fn(),
  getPlatform: jest.fn(),
  getUrlOrigin: jest.fn(),
}));

describe('InvitationService', () => {
  let service: InvitationService;
  let invitationRepo: any;
  let userRepo: any;
  let userOrgRepo: any;
  let userMerchantRepo: any;
  let phoneWhitelistRepo: any;
  let merchantRepo: any;
  let orgRepo: any;
  let cisService: any;
  let roleService: any;
  let orgService: any;
  let connection: any;
  let queue: any;
  let cacheManager: any;
  let queryBuilder: any;
  let queryRunner: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    };

    invitationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    userOrgRepo = {
      create: jest.fn(),
    };

    userMerchantRepo = {
      create: jest.fn(),
    };

    phoneWhitelistRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    merchantRepo = {
      findByIds: jest.fn(),
    };

    orgRepo = {
      findOne: jest.fn(),
    };

    cisService = {
      createRelationship: jest.fn(),
    };

    roleService = {
      validateRole: jest.fn(),
      getRoleIdAndNameById: jest.fn(),
    };

    orgService = {};

    connection = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    queue = {
      add: jest.fn(),
    };

    cacheManager = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: getRepositoryToken(Invitation), useValue: invitationRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: getRepositoryToken(UserOrganization),
          useValue: userOrgRepo,
        },
        {
          provide: getRepositoryToken(UserMerchant),
          useValue: userMerchantRepo,
        },
        {
          provide: getRepositoryToken(PhoneWhiteList),
          useValue: phoneWhitelistRepo,
        },
        { provide: getRepositoryToken(Merchant), useValue: merchantRepo },
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
        {
          provide: getRepositoryToken(JuristicType),
          useValue: { findOne: jest.fn() },
        },
        { provide: CisService, useValue: cisService },
        { provide: RoleService, useValue: roleService },
        { provide: OrganizationService, useValue: orgService },
        { provide: Connection, useValue: connection },
        { provide: getQueueToken('invite-member-consumer'), useValue: queue },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create invitation', async () => {
      const data: any = {
        email: 'test@examples.com',
        refCode: 'ref',
      };
      invitationRepo.create.mockReturnValue(data);
      invitationRepo.save.mockResolvedValue({ id: 1, ...data });

      const result = await service.create(data);
      expect(invitationRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(Utils.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return invitation', async () => {
      invitationRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw not found', async () => {
      invitationRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow();
    });
  });

  describe('findByRefCode', () => {
    it('should return invitation', async () => {
      queryBuilder.getOne.mockResolvedValue({ id: 1 });
      const result = await service.findByRefCode('ref');
      expect(result.id).toBe(1);
    });
  });

  describe('findByPhoneNumber', () => {
    it('should return invitation', async () => {
      queryBuilder.getOne.mockResolvedValue({ id: 1 });
      const result = await service.findByPhoneNumber('66', '123456789');
      expect(result.id).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      invitationRepo.findOne.mockResolvedValue({ id: 1, status: 'PENDING' });
      invitationRepo.save.mockResolvedValue({ id: 1, status: 'ACCEPTED' });

      const result = await service.updateStatus(
        1,
        UserOrganizationInviteStatus.ACCEPTED,
      );

      expect(invitationRepo.save).toHaveBeenCalled();
      expect(result.status).toBe(UserOrganizationInviteStatus.ACCEPTED);
    });
  });

  describe('checkDuplicateInvitation', () => {
    it('should return true if exists', async () => {
      invitationRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.checkDuplicateInvitation(
        '123',
        1,
        UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        '66',
      );
      expect(result).toBe(true);
    });

    it('should return false if not exists', async () => {
      invitationRepo.findOne.mockResolvedValue(null);
      const result = await service.checkDuplicateInvitation(
        '123',
        1,
        UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        '66',
      );
      expect(result).toBe(false);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel invitation', async () => {
      invitationRepo.findOne.mockResolvedValue({ id: 1 });
      invitationRepo.save.mockResolvedValue({ id: 1, status: 'CANCELLED' });

      const result = await service.cancelInvitation(1, 1);
      expect(invitationRepo.save).toHaveBeenCalled();
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('createInvitationSafe', () => {
    it('should create if no duplicate', async () => {
      jest.spyOn(service, 'checkDuplicateInvitation').mockResolvedValue(false);
      jest.spyOn(service, 'create').mockResolvedValue({ id: 1 } as any);

      await service.createInvitationSafe({} as any);
      expect(service.create).toHaveBeenCalled();
    });

    it('should throw if duplicate', async () => {
      jest.spyOn(service, 'checkDuplicateInvitation').mockResolvedValue(true);
      await expect(service.createInvitationSafe({} as any)).rejects.toThrow();
    });

    it('should replace if duplicate and allowed', async () => {
      jest.spyOn(service, 'checkDuplicateInvitation').mockResolvedValue(true);
      jest
        .spyOn(service, 'replaceInvitation')
        .mockResolvedValue({ id: 1 } as any);

      await service.createInvitationSafe({} as any, { allowReplace: true });
      expect(service.replaceInvitation).toHaveBeenCalled();
    });
  });

  describe('findByOrganization', () => {
    it('should return invitations', async () => {
      invitationRepo.findAndCount.mockResolvedValue([[{ id: 1 }], 1]);
      const result = await service.findByOrganization(1);
      expect(result.invitations).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // Note: respondToInvitation and approveInvitation tests would go here
  // based on the inferred logic from the plan, and seeing that the service file was truncated
  // I will skip them for now or write placeholders if they existed in the full file.
  // The service file view showed up to line 800 which had `handleInvitationAccept` (private).
  // `respondToInvitation` is likely using that.

  // Checking `replaceInvitation`
  describe('replaceInvitation', () => {
    it('should cancel existing and create new', async () => {
      jest
        .spyOn(service, 'findPendingInvitation')
        .mockResolvedValue({ id: 1 } as any);
      jest.spyOn(service, 'cancelInvitation').mockResolvedValue({} as any);
      jest.spyOn(service, 'create').mockResolvedValue({ id: 2 } as any);

      const result = await service.replaceInvitation({} as any);

      expect(service.cancelInvitation).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalled();
      expect(result.id).toBe(2);
    });
  });

  describe('respondToInvitation', () => {
    it('should accept invitation', async () => {
      const invitation = {
        id: 1,
        organizeId: 1,
        refCode: 'ref',
        status: UserOrganizationInviteStatus.SENT,
        roleId: 1,
        email: 'test@example.com',
        phoneNumber: '123',
        countryCode: '66',
      };

      queryRunner.manager.findOne = jest.fn().mockResolvedValue(invitation);
      // userRepo.findOne for validateUserExists
      userRepo.findOne.mockResolvedValue({ id: 1, cisNumber: 'cis1' });
      roleService.validateRole.mockResolvedValue();
      cisService.createRelationship.mockResolvedValue();

      const result = await service.respondToInvitation({
        refCode: 'ref',
        response: UserOrganizationInviteStatus.ACCEPTED,
      } as any);

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.status).toBe(UserOrganizationInviteStatus.ACCEPTED);
    });

    it('should decline invitation', async () => {
      const invitation = {
        id: 1,
        organizeId: 1,
        refCode: 'ref',
        status: UserOrganizationInviteStatus.SENT,
      };
      queryRunner.manager.findOne = jest.fn().mockResolvedValue(invitation);

      const result = await service.respondToInvitation({
        refCode: 'ref',
        response: UserOrganizationInviteStatus.DECLINED,
      } as any);

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.status).toBe(UserOrganizationInviteStatus.DECLINED);
    });
  });

  describe('approveInvitation', () => {
    it('should approve and send email', async () => {
      const invitation = {
        id: 1,
        organizeId: 1,
        refCode: 'ref',
        status: UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        email: 'test@mail.com',
        organization: { organizeName: 'Org', organizationType: 'PERSONAL' },
        role: { displayName: 'Role' },
      };
      queryRunner.manager.findOne = jest.fn().mockResolvedValue(invitation);
      orgService.genInvitationLink = jest.fn().mockReturnValue('http://link');

      const result = await service.approveInvitation(
        { refCode: 'ref', respond: 'APPROVE' } as any,
        'origin',
      );

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should reject invitation', async () => {
      const invitation = {
        id: 1,
        organizeId: 1,
        refCode: 'ref',
        status: UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        organization: { organizeName: 'Org' },
      };
      queryRunner.manager.findOne = jest.fn().mockResolvedValue(invitation);

      const result = await service.approveInvitation(
        { refCode: 'ref', respond: 'REJECTED' } as any,
        'origin',
      );

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.status).toBe(UserOrganizationInviteStatus.REJECTED);
    });
  });

  describe('updateExpiredInvitations', () => {
    it('should update expired', async () => {
      const updateQb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      invitationRepo.createQueryBuilder.mockReturnValue(updateQb);

      await service.updateExpiredInvitations(1);
      expect(updateQb.execute).toHaveBeenCalled();
    });
  });

  describe('findEmailInInvite', () => {
    it('should find email', async () => {
      invitationRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findEmailInInvite('email');
      expect(result).toBeDefined();
    });
  });
});
