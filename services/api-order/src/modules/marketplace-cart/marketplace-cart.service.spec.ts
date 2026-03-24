import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceCartService } from './marketplace-cart.service';
import { ActivityLogService } from '@/modules/activity-log/activity-log.service';
import { getQueueToken } from '@nestjs/bull';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from '@/model/cart.entity';
import { CartItem } from '@/model/cart-item.entity';
import { Product } from '@/model/product.entity';
import { ProductItem } from '@/model/product-item.entity';
import { ProductTranslation } from '@/model/product-translation.entity';
import { RequestContextService } from '../request-context/request-context.service';
import { Repository } from 'typeorm';
import { MerchantPerformanceMode } from '@/model/merchant.entity';

describe('MarketplaceCartService', () => {
  let service: MarketplaceCartService;
  let cartRepo: Repository<Cart>;
  let cartItemRepo: Repository<CartItem>;
  let cartQueue: any;
  let requestContextService: RequestContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceCartService,
        {
          provide: ActivityLogService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getQueueToken('cart-queue'),
          useValue: {
            add: jest.fn(),
            getWaitingCount: jest.fn(),
            getActiveCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            count: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductItem),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductTranslation),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            currentOrganization: jest.fn(),
            currentMerchantOnSlug: jest.fn(),
            currentMerchant: jest.fn(),
            currentCustomer: jest.fn(),
            currentLang: 'th',
          },
        },
      ],
    }).compile();

    service = module.get<MarketplaceCartService>(MarketplaceCartService);
    cartRepo = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepo = module.get<Repository<CartItem>>(
      getRepositoryToken(CartItem),
    );
    cartQueue = module.get(getQueueToken('cart-queue'));
    requestContextService = module.get<RequestContextService>(
      RequestContextService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCount', () => {
    it('should return 0 if no cart', async () => {
      (
        requestContextService.currentOrganization as jest.Mock
      ).mockResolvedValue({ id: 1 });
      cartRepo.find = jest.fn().mockResolvedValue(null);
      const result = await service.getCount();
      expect(result.data).toBe(0);
    });

    it('should return count', async () => {
      (
        requestContextService.currentOrganization as jest.Mock
      ).mockResolvedValue({ id: 1 });
      cartRepo.find = jest.fn().mockResolvedValue([{ id: 1 }]);
      cartItemRepo.count = jest.fn().mockResolvedValue(5);
      const result = await service.getCount();
      expect(result.data).toBe(5);
    });
  });

  describe('getCarts', () => {
    it('should return carts', async () => {
      (
        requestContextService.currentOrganization as jest.Mock
      ).mockResolvedValue({ id: 1 });
      cartRepo.find = jest.fn().mockResolvedValue([{ id: 1, merchant: {} }]);

      // getCartItemsByCartId calls
      cartRepo.findOne = jest.fn().mockResolvedValue({ id: 1 });
      cartItemRepo.findAndCount = jest.fn().mockResolvedValue([[], 0]);

      const result = await service.getCarts({ page: 1, limit: 10 });
      expect(result).toHaveLength(1);
    });
  });

  describe('getCartItemsByCartId', () => {
    it('should return empty if cart not found', async () => {
      cartRepo.findOne = jest.fn().mockResolvedValue(null);
      const result = await service.getCartItemsByCartId({ cartId: 1 });
      expect(result).toEqual([]);
    });

    it('should return cart items', async () => {
      cartRepo.findOne = jest.fn().mockResolvedValue({ id: 1 });
      cartItemRepo.findAndCount = jest
        .fn()
        .mockResolvedValue([[{ id: 1, productItem: { product: {} } }], 1]);
      const result = await service.getCartItemsByCartId({ cartId: 1 });
      expect(result).toBeDefined();
    });
  });

  describe('updateCartItem', () => {
    const dto: any = { quantity: 1, productItemId: 1 };
    const i18n: any = { t: jest.fn() };

    it('should update cart item', async () => {
      const cartItem = {
        id: 1,
        cart: { merchant: { performanceMode: MerchantPerformanceMode.NORMAL } },
      };
      cartItemRepo.findOne = jest
        .fn()
        .mockResolvedValueOnce(cartItem) // first call (check merchant)
        .mockResolvedValueOnce(cartItem); // second call (inside else)
      // Actually code calls findOne twice. First with relations cart..., second with relations productItem...

      const productItem = { id: 1 };
      (service as any).productItemRepo = {
        findOne: jest.fn().mockResolvedValue(productItem),
      };
      // Need to set findOne for the injected repo not usage of any, but I have reference module.get

      // Let's rely on standard mocks

      // 1. findOne with cart relation
      cartItemRepo.findOne = jest
        .fn()
        .mockResolvedValueOnce({
          id: 1,
          cart: {
            merchant: { performanceMode: MerchantPerformanceMode.NORMAL },
            organization: {},
          },
        })
        // 2. findOne with productItem relations
        .mockResolvedValueOnce({ id: 1, productItem: { id: 1 } });

      cartRepo.findOne = jest.fn().mockResolvedValue({ id: 1 });
      cartItemRepo.save = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.updateCartItem({
        id: 1,
        dto,
        userId: 1,
        i18n,
      });
      expect(cartItemRepo.save).toHaveBeenCalled();
    });

    it('should add to queue if performance mode', async () => {
      cartItemRepo.findOne = jest.fn().mockResolvedValueOnce({
        id: 1,
        cart: {
          merchant: { performanceMode: MerchantPerformanceMode.PERFORMANCE },
          organization: {},
        },
      });

      (requestContextService.currentMerchant as jest.Mock).mockResolvedValue(
        {},
      );
      (requestContextService.currentCustomer as jest.Mock).mockResolvedValue(
        {},
      );

      await service.updateCartItem({
        id: 1,
        dto,
        userId: 1,
        i18n,
        fromQueue: true,
      });
      expect(cartQueue.add).toHaveBeenCalled();
    });
  });

  describe('deleteCartItems', () => {
    it('should delete cart items and empty carts', async () => {
      cartItemRepo.find = jest
        .fn()
        .mockResolvedValue([{ id: 1, cart: { id: 1 } }]);
      cartItemRepo.softDelete = jest.fn();
      cartItemRepo.count = jest.fn().mockResolvedValue(0); // remaining items
      cartRepo.softDelete = jest.fn();

      await service.deleteCartItems([1]);
      expect(cartRepo.softDelete).toHaveBeenCalled();
    });
  });
});
