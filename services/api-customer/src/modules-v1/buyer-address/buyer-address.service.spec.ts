import { Test, TestingModule } from '@nestjs/testing';
import { BuyerAddressService } from './buyer-address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { CisService } from '@/modules/cis/cis.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('BuyerAddressService', () => {
  let service: BuyerAddressService;
  let repo: any;
  let cisService: any;
  let queryRunner: any;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
      },
    };

    repo = {
      manager: {
        connection: {
          createQueryRunner: jest.fn().mockReturnValue(queryRunner),
        },
      },
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    cisService = {
      createCustomerAddress: jest.fn(),
      updateCustomerAddress: jest.fn(),
      deleteCustomerAddress: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyerAddressService,
        {
          provide: getRepositoryToken(UserCustomerAddressEntity),
          useValue: repo,
        },
        { provide: CisService, useValue: cisService },
      ],
    }).compile();

    service = module.get<BuyerAddressService>(BuyerAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAddress', () => {
    it('should return saved address on success', async () => {
      cisService.createCustomerAddress.mockResolvedValue({
        data: { id: 'cis_id' },
      });
      const dto = { isDefault: true, addressType: 'SHIPPING_ADDRESS' } as any;
      const saved = { id: 1 };

      queryRunner.manager.create.mockReturnValue(saved);
      queryRunner.manager.save.mockResolvedValue(saved);

      const result = await service.createAddress(1, dto);
      expect(result).toBe(saved);
      expect(cisService.createCustomerAddress).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      cisService.createCustomerAddress.mockRejectedValue(new Error('fail'));
      await expect(service.createAddress(1, {} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('updateAddress', () => {
    it('should update address', async () => {
      repo.findOne.mockResolvedValue({ id: 1, userId: 1, cisNumber: 'cis' });
      cisService.updateCustomerAddress.mockResolvedValue({
        data: { id: 'cis_id' },
      });
      repo.create.mockReturnValue({ id: 1, userId: 1 });
      repo.save.mockResolvedValue({ id: 1 });

      await service.updateAddress(1, 1, {
        addressType: 'SHIPPING_ADDRESS',
        isDefault: true,
      } as any);

      expect(cisService.updateCustomerAddress).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('removeAddress', () => {
    it('should soft delete address', async () => {
      queryRunner.manager.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        cisNumber: 'cis',
      });
      cisService.deleteCustomerAddress.mockResolvedValue({ message: 'OK' });
      queryRunner.manager.save.mockResolvedValue({});

      await service.removeAddress(1, 1);

      expect(cisService.deleteCustomerAddress).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ status: 'deleted' }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('findAllAddress', () => {
    it('should return paged items', async () => {
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllAddress(1, {});
      expect(result.items.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOneAddress', () => {
    it('should return one item', async () => {
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findOneAddress(1, 1);
      expect(result.id).toBe(1);
    });
  });
});
