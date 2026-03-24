import { Test, TestingModule } from '@nestjs/testing';
import { OpenApiMerchantController } from './open-api-merchant.controller';
import { OpenApiMerchantService } from './open-api-merchant.service';
import { ApiKeyGuard } from '@/auth/api-key.guard';

const mockService = {
  getCurrentMerchant: jest.fn(),
};

describe('OpenApiMerchantController', () => {
  let controller: OpenApiMerchantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenApiMerchantController],
      providers: [
        { provide: OpenApiMerchantService, useValue: mockService },
      ],
    })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<OpenApiMerchantController>(OpenApiMerchantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentMerchant', () => {
    it('should return current merchant', async () => {
      mockService.getCurrentMerchant.mockResolvedValue({ id: 1 });
      await expect(controller.getCurrentMerchant()).resolves.toBeDefined();
    });
  });
});
