import { Test, TestingModule } from '@nestjs/testing';
import { CartPublicController } from './cart-public.controller';
import { CartPublicService } from './cart-public.service';

describe('CartPublicController', () => {
  let controller: CartPublicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartPublicController],
      providers: [
        {
          provide: CartPublicService,
          useValue: {
            get: jest.fn(),
            getCount: jest.fn(),
            update: jest.fn(),
            createCartItem: jest.fn(),
            updateCartItem: jest.fn(),
            deleteCartItem: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartPublicController>(CartPublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
