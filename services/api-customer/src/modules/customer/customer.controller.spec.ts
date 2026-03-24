import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { I18nContext } from 'nestjs-i18n';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: any;

  const mockService = {
    getAll: jest.fn(),
    create: jest.fn(),
    createCustomerCart: jest.fn(),
    updateUserCustomer: jest.fn(),
    showById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manaulCreateCustomerWallet: jest.fn(),
    getCustomerWallet: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showAll', () => {
    it('should return all customers', async () => {
      mockService.getAll.mockResolvedValue({ data: [], meta: {} });
      const req = { user: { userId: 1 } };
      const result = await controller.showAll(
        {},
        1,
        10,
        'true',
        '',
        '',
        'slug',
        req,
      );
      expect(service.getAll).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create customer', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      const req = { user: { userId: 1 } };
      const i18n = {} as I18nContext;
      const result = await controller.create(req, 'slug', {} as any, i18n);
      expect(service.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('createCustomerCart', () => {
    it('should create cart', async () => {
      mockService.createCustomerCart.mockResolvedValue({});
      await controller.createCustomerCart('1');
      expect(service.createCustomerCart).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserCustomer', () => {
    it('should update user customer', async () => {
      mockService.updateUserCustomer.mockResolvedValue({});
      await controller.updateUserCustomer('1', { userId: 2 });
      expect(service.updateUserCustomer).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('show', () => {
    it('should show by id', async () => {
      mockService.showById.mockResolvedValue({ id: 1 });
      await controller.show('1');
      expect(service.showById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update customer', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      const req = { user: { userId: 1 } };
      const i18n = {} as I18nContext;
      await controller.update(req, '1', 'slug', {} as any, i18n);
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete customer', async () => {
      mockService.delete.mockResolvedValue({
        generatedMaps: [],
        raw: [],
        affected: 1,
      });
      await controller.delete('1');
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('manual wallet', () => {
    it('should manual create wallet', async () => {
      mockService.manaulCreateCustomerWallet.mockResolvedValue([]);
      await controller.manaulCreateCustomerWallet();
      expect(service.manaulCreateCustomerWallet).toHaveBeenCalled();
    });
  });

  describe('getWallet', () => {
    it('should get wallet', async () => {
      mockService.getCustomerWallet.mockResolvedValue({});
      await controller.getCustomerWallet('1');
      expect(service.getCustomerWallet).toHaveBeenCalledWith(1);
    });
  });
});
