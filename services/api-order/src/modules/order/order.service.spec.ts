import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '@/model/order.entity';
import { CartItem } from '@/model/cart-item.entity';
import { Cart } from '@/model/cart.entity';
import { Merchant } from '@/model';
import { OrderPayment } from '@/model/order-payment.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: Repository<Order>;
  let merchantRepo: Repository<Merchant>;
  let requestContextService: RequestContextService;
  let cacheManager: any;
  let orderPaymentRepo: Repository<OrderPayment>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn(() => ({
        createQueryBuilder: jest.fn(() => ({
          softDelete: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          execute: jest.fn(),
          getCount: jest.fn(),
        })),
      })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            manager: {
              connection: {
                createQueryRunner: jest.fn(() => mockQueryRunner),
              },
            },
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(OrderPayment),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            currentMerchantOnSlug: jest.fn(),
            currentOrganization: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    merchantRepo = module.get<Repository<Merchant>>(
      getRepositoryToken(Merchant),
    );
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );
    cacheManager = module.get(CACHE_MANAGER);
    orderPaymentRepo = module.get<Repository<OrderPayment>>(
      getRepositoryToken(OrderPayment),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('genOrderNumber', () => {
    it('should generate a new order number', async () => {
      const merchantId = 1;
      const merchantDetail = { id: 1, storeId: '123' };
      mockQueryBuilder.getOne.mockResolvedValueOnce(merchantDetail);
      mockQueryBuilder.getOne.mockResolvedValueOnce(null); // No last order

      const result = await service.genOrderNumber(merchantId);

      expect(merchantRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result).toMatch(/QOAG-12300100001\d{4}/);
    });

    it('should generate next order number if last order exists', async () => {
      const merchantId = 1;
      const merchantDetail = { id: 1, storeId: '123' };
      const year = dayjs().format('YY');
      const month = dayjs().format('MM');

      mockQueryBuilder.getOne.mockResolvedValueOnce(merchantDetail);
      mockQueryBuilder.getOne.mockResolvedValueOnce({
        number: `QOAG-12300100001${year}${month}`,
      });

      const result = await service.genOrderNumber(merchantId);
      expect(result).toContain('00002');
    });

    it('should throw BadRequestException if merchant not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValueOnce({});
      await expect(service.genOrderNumber(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: any = {
        cartId: 1,
        organizeId: 1,
        totalPrice: 100,
        totalDeliveryPrice: 0,
        grandTotal: 100,
        deliveryType: 'standard',
        deliveryReceiveType: 'shipping',
        userId: 1,
        deliveries: [
          {
            refPONumber: 'PO123',
            address: { shipping: {} },
            products: [
              { productItemId: 101, quantity: 1, price: 100, unit: 1 },
            ],
            documents: {},
          },
        ],
      };

      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });

      // Mocks for checkPriceManipulate (RUNS FIRST)
      // First mock cart query
      mockQueryBuilder.getOne.mockResolvedValueOnce({ id: 1 });

      // Then mock cart items query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { productItemId: 101, quantity: 1, lineTotal: '100.00' },
      ]);

      // Mocks for genOrderNumber (RUNS SECOND)
      const merchantDetail = { id: 1, storeId: '123' };
      mockQueryBuilder.getOne.mockResolvedValueOnce(merchantDetail); // for genOrderNumber merchant query
      mockQueryBuilder.getOne.mockResolvedValueOnce(null); // for genOrderNumber last order query

      // Mocks for Transaction manager
      // Order create
      mockQueryRunner.manager.create.mockReturnValueOnce({ id: 1 });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 1 });

      // SubOrder create
      mockQueryRunner.manager.create.mockReturnValueOnce({ id: 2 });

      // Soft delete cart items
      // getCount for remaining items
      mockQueryRunner.manager
        .getRepository()
        .createQueryBuilder()
        .getCount.mockResolvedValue(0);

      const result = await service.create(createOrderDto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('getCount', () => {
    it('should return cached counts if available', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      (
        requestContextService.currentOrganization as jest.Mock
      ).mockResolvedValue({ id: 1 });
      cacheManager.get.mockResolvedValue([{ status: 'NEW', count: 1 }]);

      const result = await service.getCount();
      expect(result).toEqual([{ status: 'NEW', count: 1 }]);
      expect(orderRepo.query).not.toHaveBeenCalled();
    });

    it('should query and cache if not in cache', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      (
        requestContextService.currentOrganization as jest.Mock
      ).mockResolvedValue({ id: 1 });
      cacheManager.get.mockResolvedValue(null);
      (orderRepo.query as jest.Mock).mockResolvedValue([
        { status: 'NEW', count: 1 },
      ]);

      const result = await service.getCount();
      expect(result).toEqual([{ status: 'NEW', count: 1 }]);
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('findAllOrder', () => {
    it('should return orders grouped by ORDER', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      const orders = [{ id: 1, merchant: { store: {} }, subOrders: [] }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([orders, 1]);

      const result = await service.findAllOrder(1, 1, { groupBy: 'ORDER' });
      expect(orderRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return orders grouped by PAYMENT', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      const payments = [
        { id: 1, order: { merchant: { store: {} } }, subOrderPayments: [] },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([payments, 1]);

      const result = await service.findAllOrder(1, 1, { groupBy: 'PAYMENT' });
      expect(orderPaymentRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it('should throw error if merchant not found', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue(null);
      await expect(
        service.findAllOrder(1, 1, { groupBy: 'ORDER' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOrderById', () => {
    it('should return order details', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      const order = {
        id: 1,
        merchant: { slug: 'store', store: {} },
        subOrders: [],
      };
      mockQueryBuilder.getOne.mockResolvedValue(order);

      const result = await service.findOrderById(1, 1, 1);
      expect(orderRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.storeName).toBe('store');
    });

    it('should throw BadRequestException if order not found', async () => {
      (
        requestContextService.currentMerchantOnSlug as jest.Mock
      ).mockResolvedValue({ id: 1 });
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.findOrderById(1, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
