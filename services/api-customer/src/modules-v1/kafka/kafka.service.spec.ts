import { Test, TestingModule } from '@nestjs/testing';
import { KafkaService } from './kafka.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';
import { User } from '@/model/user.entity';
import { Merchant } from '@/model/merchant.entity';
import { CisService } from '@/modules/cis/cis.service';
import { BuyerAddressService } from '../buyer-address/buyer-address.service';
import { OrganizationService } from '../../modules/organization/organization.service';
import { SendVerifyStatusService } from '../../modules/send-verify-status/send-verify-status.service';
import { UserService } from '@/modules/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
};

const mockCisService = {
  getCustomerAddressDetailById: jest.fn(),
  findMasterDataById: jest.fn(),
};

const mockBuyerAddressService = {
  disableDefaultAllAddress: jest.fn(),
};

const mockOrganizationService = {
  findByCisNumber: jest.fn(),
  updateOrganizationFromDraft: jest.fn(),
  updateKycDraftProfile: jest.fn(),
};

const mockSendVerifyStatusService = {
  sendVerifyStatusViaSMS: jest.fn(),
};

const mockUserService = {
  findByCisNumber: jest.fn(),
  updateUserFromDraft: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  store: {
    keys: jest.fn(),
  },
};

describe('KafkaService', () => {
  let service: KafkaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaService,
        {
          provide: getRepositoryToken(UserCustomerAddressEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: mockRepository,
        },
        {
          provide: CisService,
          useValue: mockCisService,
        },
        {
          provide: BuyerAddressService,
          useValue: mockBuyerAddressService,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
        {
          provide: SendVerifyStatusService,
          useValue: mockSendVerifyStatusService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<KafkaService>(KafkaService);
  });

  describe('processAddressCreation', () => {
    it('should return if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await service.processAddressCreation({
        address_id: 1,
        cis_number: 'cis',
      } as any);
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should create address if user found and data valid', async () => {
      const user = { id: 1 };
      mockRepository.findOne.mockResolvedValue(user);
      mockCisService.getCustomerAddressDetailById.mockResolvedValue({
        data: {
          platform: 1,
          address_type: 1,
          is_default: true,
          country: 1,
          province: 1,
          district: 1,
          sub_district: 1,
        },
      });
      mockCisService.findMasterDataById
        .mockResolvedValueOnce({ code: 'REVAMP_BUYER' }) // Platform
        .mockResolvedValueOnce({ data: { code: 'S' } }); // Address Type

      // No existing address
      mockRepository.findOne.mockResolvedValueOnce(user); // User check
      mockRepository.findOne.mockResolvedValueOnce(null); // Existing address check

      mockRepository.create.mockReturnValue({ cisNumber: 1 });
      mockRepository.save.mockResolvedValue({});

      await service.processAddressCreation({
        address_id: 1,
        cis_number: 'cis',
      } as any);

      expect(
        mockBuyerAddressService.disableDefaultAllAddress,
      ).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('processAddressUpdate', () => {
    it('should update address', async () => {
      const user = { id: 1 };
      mockRepository.findOne.mockResolvedValue(user);
      mockCisService.getCustomerAddressDetailById.mockResolvedValue({
        data: {
          platform: 1,
          address_type: 1,
          id: 123,
        },
      });
      mockCisService.findMasterDataById
        .mockResolvedValueOnce({ code: 'REVAMP_BUYER' }) // Platform
        .mockResolvedValueOnce({ data: { code: 'S' } }); // Address Type

      await service.processAddressUpdate({
        address_id: 123,
        cis_number: 'cis',
      } as any);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('processAddressDelete', () => {
    it('should delete address', async () => {
      const user = { id: 1 };
      mockRepository.findOne.mockResolvedValue(user);
      mockCisService.getCustomerAddressDetailById.mockResolvedValue({
        data: {
          platform: 1,
          address_type: 1,
          id: 123,
        },
      });
      mockCisService.findMasterDataById
        .mockResolvedValueOnce({ code: 'REVAMP_BUYER' }) // Platform
        .mockResolvedValueOnce({ data: { code: 'S' } }); // Address Type

      await service.processAddressDelete({
        address_id: 123,
        cis_number: 'cis',
      } as any);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { cisNumber: 123 },
        { status: 'deleted' },
      );
    });
  });

  describe('processKycStatus', () => {
    it('should do nothing if org and user not found', async () => {
      mockOrganizationService.findByCisNumber.mockResolvedValue(null);
      mockUserService.findByCisNumber.mockResolvedValue(null);
      await service.processKycStatus({
        kyc_status: 'APPROVE',
        cis_number: 'cis',
      } as any);
      expect(mockOrganizationService.findByCisNumber).toHaveBeenCalled();
    });

    it('should update user kyc if user found', async () => {
      const user = { id: 1 };
      mockOrganizationService.findByCisNumber.mockResolvedValue(null);
      mockUserService.findByCisNumber.mockResolvedValue(user);

      await service.processKycStatus({
        kyc_status: 'APPROVE',
        cis_number: 'cis',
      } as any);

      expect(mockUserService.updateUserFromDraft).toHaveBeenCalledWith(user);
    });

    it('should update org kyc if org found', async () => {
      const org = { id: 1, cisNumber: 'cis', kycStatus: 'PENDING' };
      mockOrganizationService.findByCisNumber.mockResolvedValue(org);
      mockUserService.findByCisNumber.mockResolvedValue(null);

      await service.processKycStatus({
        kyc_status: 'APPROVE',
        cis_number: 'cis',
      } as any);

      expect(
        mockOrganizationService.updateOrganizationFromDraft,
      ).toHaveBeenCalled();
      expect(
        mockSendVerifyStatusService.sendVerifyStatusViaSMS,
      ).toHaveBeenCalled();
    });
  });
});
