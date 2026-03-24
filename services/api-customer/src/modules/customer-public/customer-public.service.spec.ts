import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPublicService } from './customer-public.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../model/user.entity';
import { Cart } from '../../model/cart.entity';
import { Customer } from '../../model/customer.entity';
import { Merchant } from '../../model/merchant.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { OmniauthIdentity } from '../../model/omniauth-identity.entity';
import { CustomerCreditCard } from '../../model/customer-credit-card.entity';
import { MerchantOmiseIntegration } from '../../model/merchant-omise-integration.entity';
import { MerchantAppleConfiguration } from '../../model/merchant-apple-configuration.entity';
import { CustomerWallet } from '../../model/customer-wallet.entity';
import { CustomerWalletTransaction } from '../../model/customer-walllet-transaction.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { RequestContextService } from '../request-context/request-context.service';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

describe('CustomerPublicService', () => {
  let service: CustomerPublicService;
  let userRepo: any;
  let cartRepo: any;
  let customerRepo: any;
  let merchantRepo: any;
  let customerAddressRepo: any;
  let imageUploadRepo: any;
  let omniauthIdentityRepo: any;
  let customerCreditCardRepo: any;
  let merchantOmiseIntegrationRepo: any;
  let merchantAppleConfigurationRepo: any;
  let customerWalletRepo: any;
  let customerWalletTransactionRepo: any;

  const mockActivityLogService = {
    create: jest.fn(),
  };

  const mockRequestContextService = {
    currentCustomer: jest.fn(),
    currentMerchant: jest.fn(),
  };

  const mockImageUploadService = {
    upload: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const createMockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  });

  beforeEach(async () => {
    userRepo = createMockRepo();
    cartRepo = createMockRepo();
    customerRepo = createMockRepo();
    merchantRepo = createMockRepo();
    customerAddressRepo = createMockRepo();
    imageUploadRepo = createMockRepo();
    omniauthIdentityRepo = createMockRepo();
    customerCreditCardRepo = createMockRepo();
    merchantOmiseIntegrationRepo = createMockRepo();
    merchantAppleConfigurationRepo = createMockRepo();
    customerWalletRepo = createMockRepo();
    customerWalletTransactionRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPublicService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(Customer), useValue: customerRepo },
        { provide: getRepositoryToken(Merchant), useValue: merchantRepo },
        {
          provide: getRepositoryToken(CustomerAddress),
          useValue: customerAddressRepo,
        },
        { provide: getRepositoryToken(ImageUpload), useValue: imageUploadRepo },
        {
          provide: getRepositoryToken(OmniauthIdentity),
          useValue: omniauthIdentityRepo,
        },
        {
          provide: getRepositoryToken(CustomerCreditCard),
          useValue: customerCreditCardRepo,
        },
        {
          provide: getRepositoryToken(MerchantOmiseIntegration),
          useValue: merchantOmiseIntegrationRepo,
        },
        {
          provide: getRepositoryToken(MerchantAppleConfiguration),
          useValue: merchantAppleConfigurationRepo,
        },
        {
          provide: getRepositoryToken(CustomerWallet),
          useValue: customerWalletRepo,
        },
        {
          provide: getRepositoryToken(CustomerWalletTransaction),
          useValue: customerWalletTransactionRepo,
        },
        { provide: ActivityLogService, useValue: mockActivityLogService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<CustomerPublicService>(CustomerPublicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return current customer', async () => {
      const mockCustomer = { id: 1, email: 'test@example.com' };
      mockRequestContextService.currentCustomer.mockResolvedValue(mockCustomer);

      const result = await service.get();
      expect(result.data).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  describe('getCustomerAddresses', () => {
    it('should return customer addresses', async () => {
      const mockCustomer = { id: 1 };
      mockRequestContextService.currentCustomer.mockResolvedValue(mockCustomer);
      customerAddressRepo.find.mockResolvedValue([
        { id: 1, address: 'Test Address' },
      ]);

      const result = await service.getCustomerAddresses();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateRegistrationToken', () => {
    it('should update token', async () => {
      const mockCustomer = { id: 1 };
      customerRepo.save.mockResolvedValue({ id: 1 });
      const result = await service.updateRegistrationToken(
        mockCustomer as any,
        'token',
      );
      expect(customerRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findCustomerByUserId', () => {
    it('should return customer', async () => {
      merchantRepo.findOne.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findCustomerByUserId(1, 'slug');
      expect(result).toBeDefined();
    });
  });

  describe('createCustomerAddress', () => {
    it('should create address', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValue({ id: 1 });
      customerAddressRepo.save.mockResolvedValue({ id: 1 });
      const result = await service.createCustomerAddress({} as any);
      expect(result).toBeDefined();
    });
  });

  describe('getCustomerCreditCards', () => {
    it('should return cards', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      customerCreditCardRepo.find.mockResolvedValue([]);
      const result = await service.getCustomerCreditCards();
      expect(result.data).toEqual([]);
    });
  });

  describe('getCustomerAddress', () => {
    it('should return address', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      customerAddressRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.getCustomerAddress(1);
      expect(result.data).toBeDefined();
    });
  });

  describe('updateCustomerAddress', () => {
    it('should update address', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      customerAddressRepo.findOne.mockResolvedValue({ id: 1 });
      customerAddressRepo.save.mockResolvedValue({ id: 1 });
      const result = await service.updateCustomerAddress(1, {} as any);
      expect(result).toBeDefined();
    });
  });

  describe('deleteCustomerAddress', () => {
    it('should delete address', async () => {
      const result = await service.deleteCustomerAddress(1);
      expect(customerAddressRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('createCustomerCreditCard', () => {
    it('should throw if omise not active', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      mockRequestContextService.currentMerchant.mockResolvedValue({ id: 1 });
      merchantOmiseIntegrationRepo.findOne.mockResolvedValue(null); // Not active
      const i18n = { t: jest.fn() } as any;
      await expect(
        service.createCustomerCreditCard({} as any, i18n),
      ).rejects.toThrow();
    });
  });

  describe('updateCustomerCreditCard', () => {
    it('should update card', async () => {
      mockRequestContextService.currentCustomer.mockResolvedValue({ id: 1 });
      customerCreditCardRepo.findOne.mockResolvedValue({ id: 1 });
      customerCreditCardRepo.save.mockResolvedValue({ id: 1 });
      const result = await service.updateCustomerCreditCard(1, {} as any);
      expect(result).toBeDefined();
    });
  });

  describe('deleteCustomerCreditCard', () => {
    it('should delete card', async () => {
      await service.deleteCustomerCreditCard(1);
      expect(customerCreditCardRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
