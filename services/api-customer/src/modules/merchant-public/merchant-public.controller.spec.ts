import { Test, TestingModule } from '@nestjs/testing';
import { MerchantPublicController } from './merchant-public.controller';
import { MerchantPublicService } from './merchant-public.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

describe('MerchantPublicController', () => {
  let controller: MerchantPublicController;
  let service: MerchantPublicService;

  const mockService = {
    get: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key) => key),
  } as unknown as I18nContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantPublicController],
      providers: [
        {
          provide: MerchantPublicService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MerchantPublicController>(MerchantPublicController);
    service = module.get<MerchantPublicService>(MerchantPublicService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('should return merchant data on success', async () => {
      const result = { data: { id: 1, name: 'Test' } };
      mockService.get.mockResolvedValue(result);

      expect(await controller.get(mockI18n)).toBe(result);
      expect(service.get).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      const error = new Error('Some error');
      mockService.get.mockRejectedValue(error);

      await expect(controller.get(mockI18n)).rejects.toThrow(HttpException);
      await expect(controller.get(mockI18n)).rejects.toThrow(
        new HttpException({ message: 'Some error' }, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException with specific status if provided', async () => {
      const error: any = new Error('Not Found');
      error.status = HttpStatus.NOT_FOUND;
      mockService.get.mockRejectedValue(error);

      await expect(controller.get(mockI18n)).rejects.toThrow(HttpException);
      try {
        await controller.get(mockI18n);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(e.getResponse()).toEqual({ message: 'Not Found' });
      }
    });
  });
});
