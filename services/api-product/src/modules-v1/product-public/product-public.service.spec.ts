import { Test, TestingModule } from '@nestjs/testing';
import { ProductPublicService } from './product-public.service';

describe('ProductPublicService', () => {
  let service: ProductPublicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductPublicService],
    }).compile();

    service = module.get<ProductPublicService>(ProductPublicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
