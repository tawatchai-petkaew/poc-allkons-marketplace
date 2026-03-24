import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { Merchant } from '@/model/merchant.entity';
import { Product } from '@/model/product.entity';
import { ProductVariant } from '@/model/product-variant.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { MerchantGuard } from '@/guard/merchant.guard';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockRequestContextService = {
      getMerchantId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(MerchantProduct),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockRepository,
        },
        {
          provide: RequestContextService,
          useValue: mockRequestContextService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(MerchantGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
