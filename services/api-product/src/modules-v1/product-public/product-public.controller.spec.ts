import { Test, TestingModule } from '@nestjs/testing';
import { ProductPublicController } from './product-public.controller';
import { ProductPublicService } from './product-public.service';

describe('ProductPublicController', () => {
  let controller: ProductPublicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPublicController],
      providers: [ProductPublicService],
    }).compile();

    controller = module.get<ProductPublicController>(ProductPublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
