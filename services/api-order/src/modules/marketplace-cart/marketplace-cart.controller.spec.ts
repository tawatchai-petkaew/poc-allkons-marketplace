import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceCartController } from './marketplace-cart.controller';
import { MarketplaceCartService } from './marketplace-cart.service';

describe('MarketplaceCartController', () => {
  let controller: MarketplaceCartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceCartController],
      providers: [
        {
          provide: MarketplaceCartService,
          useValue: {
            getCount: jest.fn(),
            getCarts: jest.fn(),
            updateCartItem: jest.fn(),
            deleteCartItems: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketplaceCartController>(
      MarketplaceCartController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
