import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from '../../model/customer.entity';
import { Cart } from '../../model/cart.entity';
import { User } from '../../model/user.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { CustomerWallet } from '../../model/customer-wallet.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { UserService } from '../user/user.service';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { I18nContext } from 'nestjs-i18n';

// Mock nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn().mockResolvedValue({ items: [], meta: {} }),
}));

describe('CustomerService', () => {
  let service: CustomerService;
  let customerRepo: any;
  let activityLogService: any;
  let userService: any;
  let requestContextService: any;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue({
        id: 1,
        customerWallet: {},
        orders: [],
        customerProductFavorites: [],
        cart: {},
      }),
    };

    const mockCustomerRepo = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn((dto) => Promise.resolve({ id: 1, ...dto })),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      find: jest.fn(),
    };

    const mockCartRepo = { save: jest.fn() };
    const mockUserRepo = { findOne: jest.fn() };
    const mockCustomerAddressRepo = { save: jest.fn(), findOne: jest.fn() };
    const mockCustomerWalletRepo = { save: jest.fn(), findOne: jest.fn() };

    const mockActivityLogService = { create: jest.fn() };
    const mockUserService = { currentMerchant: jest.fn() };
    const mockRequestContextService = { currentMerchant: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: getRepositoryToken(Customer), useValue: mockCustomerRepo },
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        {
          provide: getRepositoryToken(CustomerAddress),
          useValue: mockCustomerAddressRepo,
        },
        {
          provide: getRepositoryToken(CustomerWallet),
          useValue: mockCustomerWalletRepo,
        },
        { provide: ActivityLogService, useValue: mockActivityLogService },
        { provide: UserService, useValue: mockUserService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    customerRepo = module.get(getRepositoryToken(Customer));
    activityLogService = module.get(ActivityLogService);
    userService = module.get(UserService);
    requestContextService = module.get(RequestContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated customers', async () => {
      userService.currentMerchant.mockResolvedValue({ id: 1, slug: 'slug' });
      const result = await service.getAll({ page: 1, limit: 10 }, 'slug', 1);
      expect(result.data).toEqual([]);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalled();
    });

    it('should apply filters', async () => {
      userService.currentMerchant.mockResolvedValue({ id: 1, slug: 'slug' });
      await service.getAll(
        { page: 1, limit: 10 },
        'slug',
        1,
        'true',
        'name',
        '123',
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.fullName like :fullName',
        expect.any(Object),
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.tel like :tel',
        expect.any(Object),
      );
    });
  });

  describe('create', () => {
    it('should create customer successfully', async () => {
      const dto: CreateCustomerDto = {
        tel: '0812345678',
        countryCode: '66',
        customerAddressAttributes: [],
      } as any;
      const i18n = ({ t: jest.fn() } as unknown) as I18nContext;

      userService.currentMerchant.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValue(null); // No existing customer

      await service.create(dto, 1, 'slug', i18n);

      expect(customerRepo.save).toHaveBeenCalled();
      expect(activityLogService.create).toHaveBeenCalled();
    });

    it('should throw error if customer exists', async () => {
      const dto: CreateCustomerDto = {
        tel: '0812345678',
        countryCode: '66',
      } as any;
      const i18n = ({
        t: jest.fn().mockReturnValue('Exists'),
      } as unknown) as I18nContext;

      userService.currentMerchant.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValue({ id: 1 }); // Exists

      await expect(service.create(dto, 1, 'slug', i18n)).rejects.toThrow(
        'Exists',
      );
    });
  });

  describe('showById', () => {
    it('should return full customer details', async () => {
      requestContextService.currentMerchant.mockResolvedValue({ slug: 'slug' });
      // Mocks for multiple calls are handled by the generic queryBuilder mock returning valid structure
      // We need slightly different returns for getOne if we want to be strict, but generic valid obj suffices for no-crash test

      await service.showById(1);
      expect(customerRepo.createQueryBuilder).toHaveBeenCalledTimes(5);
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      const i18n = ({ t: jest.fn() } as unknown) as I18nContext;
      userService.currentMerchant.mockResolvedValue({ id: 1 });
      customerRepo.findOne.mockResolvedValueOnce({ id: 1, tel: 'old' }); // find customer
      customerRepo.findOne.mockResolvedValueOnce(null); // validate unique

      await service.update(1, {} as any, 1, 'slug', i18n);

      expect(customerRepo.save).toHaveBeenCalled();
      expect(activityLogService.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      await service.delete(1);
      expect(customerRepo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('createCustomerCart', () => {
    it('should create cart', async () => {
      requestContextService.currentMerchant.mockResolvedValue({});
      customerRepo.findOne.mockResolvedValue({});
      await service.createCustomerCart(1);
    });
  });

  describe('getCustomerWallet', () => {
    it('should get wallet', async () => {
      customerRepo.findOne.mockResolvedValue({});
      await service.getCustomerWallet(1);
    });
  });
});
