import { Test, TestingModule } from '@nestjs/testing';
import { BannerPromotionController } from './banner-promotion.controller';
import { BannerPromotionService } from './banner-promotion.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpException } from '@nestjs/common';
import { CreateBannerPromotionDto } from './dto/create-banner-promotion.dto';
import { UpdateBannerPromotionDto } from './dto/update-banner-promotion.dto';
import { BatchUpdateBannerPromotionDto } from './dto/batch-update-banner-promotion.dto';

describe('BannerPromotionController', () => {
  let controller: BannerPromotionController;
  let service: any;

  const mockService = {
    getAll: jest.fn(),
    create: jest.fn(),
    createBatchOrUpdate: jest.fn(),
    showById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRequest = {
    user: { userId: 123 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerPromotionController],
      providers: [
        {
          provide: BannerPromotionService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BannerPromotionController>(
      BannerPromotionController,
    );
    service = module.get<BannerPromotionService>(BannerPromotionService);
  });

  describe('showAll', () => {
    it('should return all promotions', async () => {
      mockService.getAll.mockResolvedValue([]);
      const result = await controller.showAll();
      expect(result).toEqual([]);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create promotion', async () => {
      const dto = {} as CreateBannerPromotionDto;
      mockService.create.mockResolvedValue({ id: 1 });
      const result = await controller.create(mockUserRequest, dto);
      expect(result).toEqual({ id: 1 });
      expect(service.create).toHaveBeenCalledWith(dto, 123);
    });

    it('should handle errors', async () => {
      mockService.create.mockRejectedValue(new Error('Fail'));
      await expect(
        controller.create(mockUserRequest, {} as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createBatch', () => {
    it('should batch create', async () => {
      const dto = {} as BatchUpdateBannerPromotionDto;
      mockService.createBatchOrUpdate.mockResolvedValue(true);
      const result = await controller.createBatch(mockUserRequest, dto);
      expect(result).toBe(true);
      expect(service.createBatchOrUpdate).toHaveBeenCalledWith(dto, 123);
    });

    it('should handle errors', async () => {
      mockService.createBatchOrUpdate.mockRejectedValue(new Error('Fail'));
      await expect(
        controller.createBatch(mockUserRequest, {} as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('show', () => {
    it('should return by id', async () => {
      mockService.showById.mockResolvedValue({ id: 1 });
      const result = await controller.show('1');
      expect(result.id).toBe(1);
    });

    it('should handle errors', async () => {
      mockService.showById.mockRejectedValue(new Error('Fail'));
      await expect(controller.show('1')).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update', async () => {
      const dto = {} as UpdateBannerPromotionDto;
      mockService.update.mockResolvedValue({ id: 1 });
      const result = await controller.update(mockUserRequest, '1', dto);
      expect(result.id).toBe(1);
      expect(service.update).toHaveBeenCalledWith(1, dto, 123);
    });

    it('should handle errors', async () => {
      mockService.update.mockRejectedValue(new Error('Fail'));
      await expect(
        controller.update(mockUserRequest, '1', {} as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      mockService.delete.mockResolvedValue({ affected: 1 });
      const result = await controller.delete('1');
      expect(result.affected).toBe(1);
    });
  });
});
