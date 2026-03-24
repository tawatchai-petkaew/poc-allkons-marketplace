import { Test, TestingModule } from '@nestjs/testing';
import { PhoneWhiteListService } from './phone-white-list.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PhoneWhiteList } from '@/model/phone-white-list.entity';
import { Organization } from '@/model/organization.entity';
import { User } from '@/model';
import { getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getConnection: jest.fn(),
  };
});

describe('PhoneWhiteListService', () => {
  let service: PhoneWhiteListService;
  let phoneRepo: any;
  let userRepo: any;
  let mockQueryRunner: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    };

    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    (getConnection as jest.Mock).mockReturnValue({
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneWhiteListService,
        {
          provide: getRepositoryToken(PhoneWhiteList),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PhoneWhiteListService>(PhoneWhiteListService);
    phoneRepo = module.get(getRepositoryToken(PhoneWhiteList));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPhoneWhiteList', () => {
    it('should return paginated list', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ phoneNumber: '123' }]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      userRepo.findOne.mockResolvedValue({ id: 1 }); // User exists

      const result = await service.getPhoneWhiteList(1, { page: 1, limit: 10 });
      expect(result.phoneLists).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should mark inactive if user not found', async () => {
      const phone = { phoneNumber: '123', isActive: true, countryCode: '66' };
      mockQueryBuilder.getMany.mockResolvedValue([phone]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.getPhoneWhiteList(1, { page: 1, limit: 10 });
      expect(result.phoneLists).toHaveLength(1);
      expect(result.phoneLists[0].isActive).toBe(false);
    });

    it('should filter by search and isActive', async () => {
      await service.getPhoneWhiteList(1, {
        page: 1,
        limit: 10,
        search: '123',
        isActive: true,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPhoneWhiteListById', () => {
    it('should return item', async () => {
      phoneRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.getPhoneWhiteListById(1, 1);
      expect(result.id).toBe(1);
    });

    it('should throw if not found', async () => {
      phoneRepo.findOne.mockResolvedValue(null);
      await expect(service.getPhoneWhiteListById(1, 1)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findMany', () => {
    it('should return list', async () => {
      phoneRepo.find.mockResolvedValue([]);
      expect(await service.findMany({})).toEqual([]);
    });
  });

  describe('createPhoneWhiteList', () => {
    it('should create phones successfully', async () => {
      const dto = [{ phoneNumber: '123', countryCode: '66' }];
      jest
        .spyOn(service, 'isPhoneNumberWhitelisted')
        .mockResolvedValue({ isValid: true });

      const result = await service.createPhoneWhiteList(1, dto);
      expect(result).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    });

    it('should fail if validation fails', async () => {
      const dto = [{ phoneNumber: '123', countryCode: '66' }];
      jest
        .spyOn(service, 'isPhoneNumberWhitelisted')
        .mockResolvedValue({ isValid: false, message: 'Invalid', code: 'ERR' });

      await expect(service.createPhoneWhiteList(1, dto)).rejects.toThrow(
        HttpException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle generic errors', async () => {
      const dto = [{ phoneNumber: '123', countryCode: '66' }];
      jest
        .spyOn(service, 'isPhoneNumberWhitelisted')
        .mockRejectedValue(new Error('Unknown'));

      await expect(service.createPhoneWhiteList(1, dto)).rejects.toThrow(
        HttpException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('updatePhoneWhiteList', () => {
    it('should update phone', async () => {
      const existing = { id: 1, phoneNumber: '123', organizationId: 1 };
      phoneRepo.findOne.mockResolvedValue(existing);
      phoneRepo.save.mockResolvedValue({ ...existing, phoneNumber: '456' });

      const result = await service.updatePhoneWhiteList(1, 1, {
        phoneNumber: '456',
      });
      expect(result.phoneNumber).toBe('456');
    });

    it('should throw if phone not found', async () => {
      phoneRepo.findOne.mockResolvedValue(null);
      await expect(service.updatePhoneWhiteList(1, 1, {})).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if duplicate exists', async () => {
      const existing = { id: 1, phoneNumber: '123', organizationId: 1 };
      phoneRepo.findOne.mockResolvedValueOnce(existing); // find target
      phoneRepo.findOne.mockResolvedValueOnce({ id: 2, phoneNumber: '456' }); // find duplicate

      await expect(
        service.updatePhoneWhiteList(1, 1, { phoneNumber: '456' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deletePhoneWhiteList', () => {
    it('should delete phone', async () => {
      phoneRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.deletePhoneWhiteList(1, 1);
      expect(result.success).toBe(true);
      expect(phoneRepo.remove).toHaveBeenCalled();
    });

    it('should throw if not found', async () => {
      phoneRepo.findOne.mockResolvedValue(null);
      await expect(service.deletePhoneWhiteList(1, 1)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('isPhoneNumberWhitelisted', () => {
    it('should return invalid if duplicate in org', async () => {
      phoneRepo.findOne.mockResolvedValue({ organizationId: 1 });
      const result = await service.isPhoneNumberWhitelisted(1, '123');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('PHONE_DUP_WHITE_ORG');
    });

    it('should return invalid if duplicate in global', async () => {
      phoneRepo.findOne.mockResolvedValue({ organizationId: 2 });
      const result = await service.isPhoneNumberWhitelisted(1, '123');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('PHONE_DUP_WHITE');
    });

    it('should return invalid if user already in another org', async () => {
      phoneRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue({
        userOrganizations: [{ organizeId: 2 }],
      });
      const result = await service.isPhoneNumberWhitelisted(1, '123');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('PHONE_DUP_ORG');
    });

    it('should return valid if no conflicts', async () => {
      phoneRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.isPhoneNumberWhitelisted(1, '123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('isPhoneNumberExistsGlobally', () => {
    it('should return true if exists', async () => {
      phoneRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.isPhoneNumberExistsGlobally('123');
      expect(result.exists).toBe(true);
    });
  });

  describe('getActivePhoneNumbers', () => {
    it('should return array of formatted numbers', async () => {
      phoneRepo.find.mockResolvedValue([
        { phoneNumber: '0123', countryCode: '66' },
      ]);
      const result = await service.getActivePhoneNumbers(1);
      expect(result).toEqual(['66123']);
    });
  });
});
