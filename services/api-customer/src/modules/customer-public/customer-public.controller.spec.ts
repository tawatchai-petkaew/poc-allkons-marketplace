import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPublicController } from './customer-public.controller';
import { CustomerPublicService } from './customer-public.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpException } from '@nestjs/common';

describe('CustomerPublicController', () => {
  let controller: CustomerPublicController;
  let service: any;

  beforeEach(async () => {
    const mockService = {
      get: jest.fn(),
      update: jest.fn(),
      setTelCustomer: jest.fn(),
      getCustomerAddresses: jest.fn(),
      getCustomerAddress: jest.fn(),
      createCustomerAddress: jest.fn(),
      updateCustomerAddress: jest.fn(),
      deleteCustomerAddress: jest.fn(),
      getCustomerCreditCards: jest.fn(),
      getCustomerCreditCard: jest.fn(),
      createCustomerCreditCard: jest.fn(),
      updateCustomerCreditCard: jest.fn(),
      deleteCustomerCreditCard: jest.fn(),
      getCustomerWallet: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerPublicController],
      providers: [
        {
          provide: CustomerPublicService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomerPublicController>(CustomerPublicController);
    service = module.get<CustomerPublicService>(CustomerPublicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return customer profile', async () => {
      service.get.mockResolvedValue({});
      await controller.get();
      expect(service.get).toHaveBeenCalled();
    });
  });

  describe('getCustomerAddresses', () => {
    it('should return addresses', async () => {
      service.getCustomerAddresses.mockResolvedValue({});
      await controller.getCustomerAddresses();
      expect(service.getCustomerAddresses).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update profile', async () => {
      const dto: any = { fullName: 'Test' };
      const file = {};
      service.update.mockResolvedValue({});
      await controller.update(dto, file, {} as any);
      expect(service.update).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      service.update.mockRejectedValue(new Error('Test error'));
      const dto: any = { fullName: 'Test' };
      await expect(controller.update(dto, {}, {} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
