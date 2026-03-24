import { Test, TestingModule } from '@nestjs/testing';
import { AggregatorService } from './aggregator.service';
import { QueueProducerService } from '../core/queue-producer.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductVariant } from '../../../model/product-variant.entity';
import { MerchantProduct } from '../../../model/merchant-product.entity';
import { RawChange } from '../interfaces';

describe('AggregatorService', () => {
  let service: AggregatorService;
  let queueProducerService: QueueProducerService;
  let redisMock: any;
  let productVariantRepository: any;
  let merchantProductRepository: any;

  beforeEach(async () => {
    redisMock = {
      pipeline: jest.fn().mockReturnThis(),
      sadd: jest.fn(),
      exec: jest.fn(),
      expire: jest.fn(),
      srem: jest.fn(),
      scard: jest.fn(),
    };

    const queueProducerServiceMock = {
      addSyncJobs: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue(30000), // 30s window
    };

    productVariantRepository = {
      find: jest.fn(),
    };

    merchantProductRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregatorService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisMock,
        },
        {
          provide: QueueProducerService,
          useValue: queueProducerServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: productVariantRepository,
        },
        {
          provide: getRepositoryToken(MerchantProduct),
          useValue: merchantProductRepository,
        },
      ],
    }).compile();

    service = module.get<AggregatorService>(AggregatorService);
    queueProducerService =
      module.get<QueueProducerService>(QueueProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('aggregate', () => {
    it('should aggregate changes and queue unique product variant IDs', async () => {
      const changes: RawChange[] = [
        {
          id: 1,
          entityType: 'product_variant',
          entityId: 101,
          operation: 'UPDATE',
          changedAt: new Date(),
        },
        {
          id: 2,
          entityType: 'product_variant',
          entityId: 101, // Duplicate ID
          operation: 'UPDATE',
          changedAt: new Date(),
        },
        {
          id: 3,
          entityType: 'product_variant',
          entityId: 102,
          operation: 'UPDATE',
          changedAt: new Date(),
        },
      ];

      // Mock Redis deduplication to return correct number of results matching unique input
      redisMock.exec.mockResolvedValue([
        [null, 1], // 101 added (new)
        [null, 1], // 102 added (new)
      ]);

      await service.aggregate(changes);

      expect(queueProducerService.addSyncJobs).toHaveBeenCalledWith(
        [101, 102],
        'cdc',
      );
    });

    it('should resolve product changes to variant IDs', async () => {
      const changes: RawChange[] = [
        {
          id: 1,
          entityType: 'product',
          entityId: 555,
          operation: 'UPDATE',
          changedAt: new Date(),
        },
      ];

      productVariantRepository.find.mockResolvedValue([
        { id: 1001 },
        { id: 1002 },
      ]);

      // Mock Redis to accept both
      redisMock.exec.mockResolvedValue([
        [null, 1],
        [null, 1],
      ]);

      await service.aggregate(changes);

      expect(productVariantRepository.find).toHaveBeenCalledWith({
        where: { product: { id: 555 } },
        select: { id: true },
      });
      expect(queueProducerService.addSyncJobs).toHaveBeenCalledWith(
        [1001, 1002],
        'cdc',
      );
    });

    it('should resolve merchant product changes to variant IDs', async () => {
      const changes: RawChange[] = [
        {
          id: 1,
          entityType: 'merchant_product',
          entityId: 999,
          operation: 'UPDATE',
          changedAt: new Date(),
        },
      ];

      merchantProductRepository.findOne.mockResolvedValue({
        id: 999,
        productVariant: { id: 2005 },
      });

      redisMock.exec.mockResolvedValue([[null, 1]]);

      await service.aggregate(changes);

      expect(merchantProductRepository.findOne).toHaveBeenCalled();
      expect(queueProducerService.addSyncJobs).toHaveBeenCalledWith(
        [2005],
        'cdc',
      );
    });

    it('should handle redis failure gracefully by processing all IDs', async () => {
      const changes: RawChange[] = [
        {
          id: 1,
          entityType: 'product_variant',
          entityId: 101,
          operation: 'UPDATE',
          changedAt: new Date(),
        },
      ];

      // Simulate Redis error
      redisMock.pipeline.mockImplementation(() => {
        throw new Error('Redis connection failed');
      });

      await service.aggregate(changes);

      // Should still process the job even if deduplication fails
      expect(queueProducerService.addSyncJobs).toHaveBeenCalledWith(
        [101],
        'cdc',
      );
    });
  });
});
