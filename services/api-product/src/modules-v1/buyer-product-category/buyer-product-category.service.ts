import { Merchant } from '@/model';
import {
  ProductCategory,
  ProductCategoryStatus,
} from '@/model/product-category.entity';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import {
  HttpException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BuyerProductCategoryDto,
  BuyerProductCategoryDtoV1,
} from './dto/buyer-product-category.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Category, CategoryStatus } from '@/model/category.entity';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { MerchantCategoryView } from '@/model/merchant-category-view.entity';
import { BuyerCategoryNode } from './interface/merchant-product-category.interface';
import { buildTree } from '@/utils/category.util';

@Injectable()
export class BuyerProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
    private readonly contextService: RequestContextService,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(MerchantCategoryView)
    private readonly merchantCategoryViewRepo: Repository<MerchantCategoryView>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private toDto(category: ProductCategory): BuyerProductCategoryDto {
    return new BuyerProductCategoryDto({
      id: category.id,
      name: category.productCategoryTranslations?.[0]?.name,
      order: category.order,
      status: category.status,
      path: category.path,
      imageUpload: category.imageUpload,
      skuId: category.skuId,
      subCategories: [],
    });
  }

  private buildCategoryTree(
    categories: BuyerProductCategoryDto[],
  ): BuyerProductCategoryDto[] {
    const tree: BuyerProductCategoryDto[] = [];
    const map: { [key: string]: BuyerProductCategoryDto } = {};

    categories.forEach((category) => {
      map[category.id] = category;
    });

    categories.forEach((category) => {
      if (!category.path) {
        tree.push(category);
      } else {
        const pathParts = category.path.split('.');
        const parentId = pathParts[pathParts.length - 1];
        const parent = map[parentId];

        if (parent) {
          parent.subCategories.push(category);
        }
      }
    });

    return tree;
  }

  async getAll(): Promise<{ data: BuyerProductCategoryDto[] }> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `categories:${merchant.id}`;

    try {
      const cached: any = await this.cacheManager.get(cacheKey);
      if (cached) return { data: cached };
      const allCategories = await this.productCategoryRepo
        .createQueryBuilder('productCategory')
        .leftJoinAndSelect(
          'productCategory.productCategoryTranslations',
          'productCategoryTranslation',
        )
        .leftJoinAndSelect('productCategory.imageUpload', 'imageUpload')
        .leftJoinAndSelect('productCategory.merchant', 'merchant')
        .where('merchant.id = :id', { id: merchant.id })
        .andWhere('productCategory.status = :status', {
          status: ProductCategoryStatus.ACTIVE,
        })
        .orderBy('productCategory.order', 'ASC')
        .limit(30)
        .getMany();

      if (allCategories.length === 0) {
        return { data: [] };
      }

      const allCategoriesToDto = allCategories.map((category) =>
        this.toDto(category),
      );

      const result = this.buildCategoryTree(allCategoriesToDto);

      await this.cacheManager.set(cacheKey, result, 60 * 1000 * 1); // cache 1 min

      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          error: error,
        },
        500,
      );
    }
  }

  async getCurrentCategoryTree(
    categoryId: string,
  ): Promise<BuyerProductCategoryDtoV1> {
    const [merchant, category] = await Promise.all([
      this.contextService.currentMerchantOnSlug(),
      this.categoryRepo.findOne({
        where: {
          id: Number(categoryId),
        },
      }),
    ]);

    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        code: ErrorCode.CATEGORY_NOT_FOUND,
      });
    }
    const splitedPath = category.parentCategoryId
      ? category.parentCategoryId.split('.').map((id) => Number(id))
      : [category.id];

    try {
      const categories = await this.categoryRepo
        .createQueryBuilder('category')
        .leftJoin('category.imageUpload', 'imageUpload')
        .addSelect(['imageUpload.id', 'imageUpload.url'])
        .andWhere('category.id IN (:...ids)', {
          ids: [...splitedPath, Number(categoryId)],
        })
        .andWhere('category.status = :status', {
          status: CategoryStatus.ACTIVE,
        })
        .getMany();

      if (!categories || categories.length === 0) {
        throw new HttpException(
          {
            message: 'Category not found',
            code: ErrorCode.CATEGORY_NOT_FOUND,
          },
          404,
        );
      }

      if (categories.length > 1) {
        return this.buildCurrentCategoryTree(categories);
      }

      return categories[0] as BuyerProductCategoryDtoV1;
    } catch (error) {
      throw new HttpException(
        {
          data: error.response?.data || null,
          error: {
            message: error?.message || error.response?.message,
            code: error.response?.code || ErrorCode.INTERNAL_SERVER_ERROR,
          },
        },
        error?.status || 500,
      );
    }
  }

  async getSubCategories(id: number): Promise<Category[]> {
    try {
      const category = await this.categoryRepo
        .createQueryBuilder('category')
        .where('category.id = :id', { id })
        .andWhere('category.status = :status', {
          status: CategoryStatus.ACTIVE,
        })
        .getOne();

      if (!category) {
        throw new NotFoundException({
          message: 'Category not found',
          code: ErrorCode.CATEGORY_NOT_FOUND,
        });
      }

      const subCategories = await this.categoryRepo
        .createQueryBuilder('category')
        .leftJoin('category.imageUpload', 'imageUpload')
        .addSelect(['imageUpload.id', 'imageUpload.url'])
        .where(
          '(category.parentCategoryId LIKE :categoryId OR category.parentCategoryId = :exactId)',
          {
            categoryId: `%.${category.id}`,
            exactId: category.id.toString(),
          },
        )
        .andWhere('category.status = :status', {
          status: CategoryStatus.ACTIVE,
        })
        .getMany();

      return subCategories;
    } catch (error) {
      throw new HttpException(
        {
          data: error.response?.data || null,
          error: {
            message: error?.message || error.response?.message,
            code: error.response?.code || ErrorCode.INTERNAL_SERVER_ERROR,
          },
        },
        error?.status || 500,
      );
    }
  }

  private buildCurrentCategoryTree(
    categories: Category[],
  ): BuyerProductCategoryDtoV1 {
    const map: { [key: string]: Category } = {};
    let root: Category = null;

    // Initialize children array for all categories and build map
    categories.forEach((category) => {
      if (!category.children) {
        category.children = [];
      }
      map[category.id] = category;
    });

    // Build tree structure and identify root
    categories.forEach((category) => {
      if (category.parentCategoryId) {
        const pathParts = category.parentCategoryId.split('.');
        const parentId = pathParts[pathParts.length - 1];
        const parent = map[parentId];

        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category);
        }
      } else {
        // This is the root category (no parent)
        root = category;
      }
    });

    return root as BuyerProductCategoryDtoV1;
  }

  /**
   * Prunes the category tree by removing branches that don't contain active categories.
   * A category is kept if:
   * 1. It's an active category (has products assigned to merchant)
   * 2. It has at least one active descendant (child/grandchild with products)
   * This ensures the tree only shows paths leading to categories with actual products.
   *
   * @param nodes - The tree nodes to prune
   * @param activeCategoryIds - Set of category IDs that have products (from merchantCategoryView)
   * @returns Pruned tree with only relevant branches
   */
  private pruneCategoryTree(
    nodes: BuyerCategoryNode[],
    activeCategoryIds: Set<number>,
  ): BuyerCategoryNode[] {
    return nodes
      .map((node) => {
        // Recursively prune children first
        const prunedChildren = this.pruneCategoryTree(
          node.subCategories || [],
          activeCategoryIds,
        );

        const isActive = activeCategoryIds.has(node.id);
        const hasActiveDescendant = prunedChildren.length > 0;

        // Keep node if it's active OR has active descendants
        if (isActive || hasActiveDescendant) {
          // Sort children alphabetically
          prunedChildren.sort((a, b) => a.name.localeCompare(b.name, 'th'));

          return {
            ...node,
            subCategories: prunedChildren,
          };
        }

        // Remove this node (no products in this branch)
        return null;
      })
      .filter(Boolean) as BuyerCategoryNode[];
  }

  private parseParentPath(parentCategoryId?: string): number[] {
    if (!parentCategoryId) return [];

    return parentCategoryId
      .split('.')
      .map(Number)
      .filter((id) => !Number.isNaN(id));
  }

  private getDirectParentId(parentCategoryId?: string): number | null {
    const path = this.parseParentPath(parentCategoryId);
    if (path.length === 0) return null;
    return path[path.length - 1];
  }

  /**
   * Converts MerchantCategoryView and Category entities into flat BuyerCategoryNode array.
   * Uses Map to prevent duplicate categories when a category appears in both lists.
   * Result: Flat list with unique categories ready for buildTree()
   *
   * @param merchantCategoryViews - Categories with products (from view)
   * @param parentCategories - Ancestor categories for tree structure context
   * @returns Flat array of unique BuyerCategoryNode
   */
  private buildFlatCategoryNodes(
    merchantCategoryViews: MerchantCategoryView[],
    parentCategories: Category[],
  ): BuyerCategoryNode[] {
    const map = new Map<number, BuyerCategoryNode>();

    // 1. Add parent categories first (context only - no products)
    parentCategories.forEach((category) => {
      map.set(category.id, {
        id: category.id,
        parentCategoryId: this.getDirectParentId(category.parentCategoryId),
        name: category.name,
        imageUploadId: category.imageUploadId,
        imageUrl: category.imageUpload?.url || null,
        subCategories: [],
      });
    });

    // 2. Add categories from view (has products) - overwrites if duplicate
    merchantCategoryViews.forEach((viewRow) => {
      map.set(viewRow.categoryId, {
        id: viewRow.categoryId,
        parentCategoryId: this.getDirectParentId(viewRow.parentCategoryId),
        name: viewRow.categoryName,
        imageUploadId: viewRow.imageUploadId,
        imageUrl: viewRow.imageUrl,
        subCategories: [],
      });
    });

    return Array.from(map.values());
  }

  async getMerchantCategoryTree(): Promise<{ data: BuyerCategoryNode[] }> {
    const merchant = await this.contextService.currentMerchantOnSlug();

    // 1. Fetch merchant categories from view (already filtered by active status)
    const merchantCategoryViews = await this.merchantCategoryViewRepo.find({
      where: { merchantId: merchant.id },
    });

    if (merchantCategoryViews.length === 0) {
      return { data: [] };
    }

    // 2. Collect all ancestor IDs (for context)
    const parentCategoryIds = new Set<number>();
    merchantCategoryViews.forEach((mcv) => {
      const ids = this.parseParentPath(mcv.parentCategoryId);
      ids.forEach((id) => parentCategoryIds.add(id));
    });

    // 3. Fetch parent categories
    const parentCategories = parentCategoryIds.size
      ? await this.categoryRepo
          .createQueryBuilder('category')
          .leftJoinAndSelect('category.imageUpload', 'imageUpload')
          .where('category.id IN (:...ids)', {
            ids: Array.from(parentCategoryIds),
          })
          .andWhere('category.status = :status', {
            status: CategoryStatus.ACTIVE,
          })
          .getMany()
      : [];

    // 4. Build active category set (has product)
    const activeCategoryIds = new Set<number>(
      merchantCategoryViews.map((mcv) => mcv.categoryId),
    );

    // 5. Normalize to flat nodes
    const flatNodes = this.buildFlatCategoryNodes(
      merchantCategoryViews,
      parentCategories,
    );

    // 6. Build full tree
    const fullTree = buildTree<BuyerCategoryNode>({
      items: flatNodes,
      getId: (item) => item.id,
      getParentId: (item) => item.parentCategoryId,
      createNode: (item) => ({
        ...item,
        subCategories: [],
      }),
    });

    // 7. Prune empty branches
    const prunedTree = this.pruneCategoryTree(fullTree, activeCategoryIds);

    // 8. Sort root categories alphabetically by name
    prunedTree.sort((a, b) => a.name.localeCompare(b.name, 'th'));

    return { data: prunedTree };
  }
}
