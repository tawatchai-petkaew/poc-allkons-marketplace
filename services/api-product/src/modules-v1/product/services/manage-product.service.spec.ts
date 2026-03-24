import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ManageProductService } from './manage-product.service';
import { MerchantProduct } from '@/model/merchant-product.entity';
import { Merchant, MerchantBranchType } from '@/model/merchant.entity';
import { S3Service } from '@/modules-v1/s3/s3.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeManager = (overrides?: Partial<EntityManager>) =>
  ({
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    ...overrides,
  }) as unknown as EntityManager;

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('ManageProductService.deleteMerchantProducts', () => {
  let service: ManageProductService;
  let merchantRepo: jest.Mocked<any>;
  let dataSource: jest.Mocked<any>;
  let cacheManager: jest.Mocked<any>;

  const DELETED_BY = 'admin@test.com';
  const VARIANT_IDS = [10, 20];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageProductService,
        {
          provide: getRepositoryToken(MerchantProduct),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Merchant),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: { uploadS3: jest.fn(), deleteS3Files: jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ManageProductService>(ManageProductService);
    merchantRepo = module.get(getRepositoryToken(Merchant));
    dataSource = module.get(DataSource);
    cacheManager = module.get(CACHE_MANAGER);
  });

  // ─── Guard: empty input ────────────────────────────────────────────────────

  it('should return zero counts when no productVariantIds are provided', async () => {
    const result = await service.deleteMerchantProducts(1, [], DELETED_BY);
    expect(result).toEqual({
      totalRequested: 0,
      successCount: 0,
      failedCount: 0,
    });
  });

  // ─── Guard: merchant not found ─────────────────────────────────────────────

  it('should throw NotFoundException when merchant does not exist', async () => {
    merchantRepo.findOne.mockResolvedValue(null);
    await expect(
      service.deleteMerchantProducts(999, VARIANT_IDS, DELETED_BY),
    ).rejects.toThrow(NotFoundException);
  });

  // ─── Branch: deletes only its own merchant ─────────────────────────────────

  it('should soft-delete only the branch merchant when merchantBranchType is BRANCH', async () => {
    const branchMerchant: Partial<Merchant> = {
      id: 1,
      merchantBranchType: MerchantBranchType.BRANCH,
      organizeId: 99,
    };
    merchantRepo.findOne.mockResolvedValue(branchMerchant);

    const fakeProducts = [
      { id: 100, productVariantId: 10 },
      { id: 101, productVariantId: 20 },
    ];

    const manager = makeManager({
      find: jest.fn().mockResolvedValue(fakeProducts),
      update: jest.fn(),
      softDelete: jest.fn(),
    });

    dataSource.transaction.mockImplementation((cb: Function) => cb(manager));
    cacheManager.del.mockResolvedValue(undefined);

    const result = await service.deleteMerchantProducts(
      1,
      VARIANT_IDS,
      DELETED_BY,
    );

    // Should NOT fetch all org merchants (branch-only deletion)
    expect(merchantRepo.find).not.toHaveBeenCalled();

    // Should update deletedBy + status to DELETED
    expect(manager.update).toHaveBeenCalledWith(
      MerchantProduct,
      { id: In([100, 101]) },
      expect.objectContaining({
        deletedBy: DELETED_BY,
      }),
    );

    // Should call softDelete
    expect(manager.softDelete).toHaveBeenCalledWith(MerchantProduct, {
      id: In([100, 101]),
    });

    expect(result.successCount).toBe(2);
    expect(result.totalRequested).toBe(2);
  });

  // ─── HO: cascades to all branches ─────────────────────────────────────────

  it('should cascade soft-delete to all org merchants when merchantBranchType is HEAD_OFFICE', async () => {
    const hoMerchant: Partial<Merchant> = {
      id: 1,
      merchantBranchType: MerchantBranchType.HEAD_OFFICE,
      organizeId: 99,
    };
    merchantRepo.findOne.mockResolvedValue(hoMerchant);

    // All merchants in org: HO(1), Branch(2), Branch(3)
    merchantRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const manager = makeManager({
      find: jest
        .fn()
        // Called 3 times (once per merchant), each returns 2 products
        .mockResolvedValueOnce([
          { id: 100, productVariantId: 10 },
          { id: 101, productVariantId: 20 },
        ])
        .mockResolvedValueOnce([
          { id: 200, productVariantId: 10 },
          { id: 201, productVariantId: 20 },
        ])
        .mockResolvedValueOnce([
          { id: 300, productVariantId: 10 },
          { id: 301, productVariantId: 20 },
        ]),
      update: jest.fn(),
      softDelete: jest.fn(),
    });

    dataSource.transaction.mockImplementation((cb: Function) => cb(manager));
    cacheManager.del.mockResolvedValue(undefined);

    const result = await service.deleteMerchantProducts(
      1,
      VARIANT_IDS,
      DELETED_BY,
    );

    // Should call softDelete 3 times (once per merchant)
    expect(manager.softDelete).toHaveBeenCalledTimes(3);
    expect(result.successCount).toBe(6); // 2 products × 3 merchants
    expect(result.totalRequested).toBe(2);
  });

  // ─── Transaction rollback ──────────────────────────────────────────────────

  it('should throw BadRequestException and rollback when transaction fails', async () => {
    const hoMerchant: Partial<Merchant> = {
      id: 1,
      merchantBranchType: MerchantBranchType.HEAD_OFFICE,
      organizeId: 99,
    };
    merchantRepo.findOne.mockResolvedValue(hoMerchant);
    merchantRepo.find.mockResolvedValue([{ id: 1 }]);

    dataSource.transaction.mockRejectedValue(new Error('DB error'));

    await expect(
      service.deleteMerchantProducts(1, VARIANT_IDS, DELETED_BY),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── Cache invalidation ────────────────────────────────────────────────────

  it('should invalidate cache for all productVariantIds after deletion', async () => {
    const branchMerchant: Partial<Merchant> = {
      id: 1,
      merchantBranchType: MerchantBranchType.BRANCH,
      organizeId: null,
    };
    merchantRepo.findOne.mockResolvedValue(branchMerchant);

    const manager = makeManager({
      find: jest.fn().mockResolvedValue([{ id: 100, productVariantId: 10 }]),
      update: jest.fn(),
      softDelete: jest.fn(),
    });

    dataSource.transaction.mockImplementation((cb: Function) => cb(manager));
    cacheManager.del.mockResolvedValue(undefined);

    await service.deleteMerchantProducts(1, [10], DELETED_BY);

    expect(cacheManager.del).toHaveBeenCalledWith(
      expect.stringContaining('merchant_product_detail:1:10'),
    );
  });
});
