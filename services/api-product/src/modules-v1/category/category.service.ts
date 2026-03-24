import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Category, CategoryStatus } from '../../model/category.entity';
import { ProductVariantCategory } from '../../model/product-variant-category.entity';
import {
  CategoryTreeNode,
  CategoryHierarchyResult,
} from './interfaces/category-hierarchy.interface';

type CategoryWithSubCategories = Category & { subCategories?: Category[] };

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductVariantCategory)
    private readonly productVariantCategoryRepository: Repository<ProductVariantCategory>,
  ) {}

  async findAll(): Promise<Category[]> {
    const where: any = {
      parentCategoryId: IsNull(), // Always get root categories
    };

    const rootCategories = await this.categoryRepository.find({
      where: {
        status: CategoryStatus.ACTIVE,
        ...where,
      },
      relations: ['imageUpload'],
      order: {
        createdAt: 'ASC',
      },
    });

    // Load all categories once for efficiency
    const allCategories = await this.categoryRepository.find({
      relations: ['imageUpload'],
      where: {
        status: CategoryStatus.ACTIVE,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // Build nested structure for each root category
    for (const category of rootCategories) {
      this.buildNestedChildren(category, allCategories);
    }

    return rootCategories;
  }

  async findSubCategoriesAll(): Promise<Category[]> {
    const where: any = {
      parentCategoryId: IsNull(), // Always get root categories
    };

    const rootCategories = await this.categoryRepository.find({
      where: {
        status: CategoryStatus.ACTIVE,
        ...where,
      },
      relations: ['imageUpload'],
      order: {
        createdAt: 'ASC',
      },
    });

    const parentCategoryIds = await this.categoryRepository.find({
      select: ['parentCategoryId'],
      where: {
        status: CategoryStatus.ACTIVE,
        parentCategoryId: Not(IsNull()),
      },
    });

    const rootIdsWithChildren = new Set<number>();
    for (const category of parentCategoryIds) {
      if (!category.parentCategoryId) continue;
      const rootId = parseInt(category.parentCategoryId.split('.')[0], 10);
      if (!Number.isNaN(rootId)) {
        rootIdsWithChildren.add(rootId);
      }
    }
    for (const category of rootCategories) {
      if ('children' in category) {
        delete (category as { children?: unknown }).children;
      }
      (category as { isChildren?: boolean }).isChildren =
        rootIdsWithChildren.has(category.id);
    }

    return rootCategories;
  }

  async findChildrenById(categoryId: number): Promise<Category[]> {
    if (!categoryId || Number.isNaN(categoryId)) {
      return [];
    }

    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        status: CategoryStatus.ACTIVE,
      },
      relations: ['imageUpload'],
    });

    if (!category) {
      return [];
    }

    const allCategories = await this.categoryRepository.find({
      relations: ['imageUpload'],
      where: {
        status: CategoryStatus.ACTIVE,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    this.buildNestedChildren(category, allCategories);

    return (category as CategoryWithSubCategories).subCategories ?? [];
  }

  private buildNestedChildren(
    category: Category,
    allCategories: Category[],
  ): void {
    let currentPath: string | number = category.id;

    if (category.parentCategoryId) {
      currentPath = `${category.parentCategoryId}.${category.id}`;
    }

    // Find direct children
    const directChildren = allCategories.filter((cat) => {
      // Compare as both string and number to handle type mismatches
      return (
        cat.parentCategoryId == currentPath ||
        cat.parentCategoryId === currentPath ||
        String(cat.parentCategoryId) === String(currentPath)
      );
    });

    // Always set children array, even if empty
    (category as CategoryWithSubCategories).subCategories = directChildren;

    // Recursively build children for each child
    if (directChildren.length > 0) {
      for (const child of directChildren) {
        this.buildNestedChildren(child, allCategories);
      }
    }
  }

  private parseParentPath(parentCategoryId?: string): number[] {
    if (!parentCategoryId) return [];

    return parentCategoryId
      .split('.')
      .map(Number)
      .filter((id) => !Number.isNaN(id));
  }

  private buildCategoryTree(
    path: number[],
    categoryMap: Map<number, Category>,
  ): CategoryTreeNode | null {
    if (path.length === 0) return null;

    let root: CategoryTreeNode | null = null;
    let current: CategoryTreeNode | null = null;

    for (const id of path) {
      const category = categoryMap.get(id);
      if (!category) {
        console.warn(
          `Category ${id} not found in map - possible data integrity issue`,
        );
        continue;
      }

      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        child: null,
      };

      if (!root) {
        root = node;
        current = node;
      } else {
        current!.child = node;
        current = node;
      }
    }

    return root;
  }

  async getCategoryHierarchies(
    productVariantIds: number[],
  ): Promise<{ items: CategoryHierarchyResult[] }> {
    if (productVariantIds.length === 0) {
      return { items: [] };
    }

    // Query product_variant, join with product and category in one query
    const productVariants = await this.categoryRepository.manager
      .createQueryBuilder()
      .select([
        'pv.id as pv_id',
        'pv.productId as pv_productId',
        'product.categoryId as product_categoryId',
        'category.id as category_id',
        'category.name as category_name',
        'category.parentCategoryId',
      ])
      .from('product_variant', 'pv')
      .leftJoin('product', 'product', 'product.id = pv.productId')
      .leftJoin('category', 'category', 'category.id = product.categoryId')
      .where('pv.id IN (:...productVariantIds)', { productVariantIds })
      .andWhere('(category.status = :status OR category.status IS NULL)', {
        status: CategoryStatus.ACTIVE,
      })
      .getRawMany<{
        pv_id: number;
        pv_productId: number;
        product_categoryId: number;
        category_id: number;
        category_name: string;
        category_parentCategoryId: string; // lowercase because PostgreSQL returns lowercase
      }>();

    // 1. Map productVariantId -> category and collect parent ids
    const variantCategoryMap = new Map<number, Category>();
    const parentIds = new Set<number>();

    productVariants.forEach((pv) => {
      if (pv.category_id) {
        const category: Category = {
          id: pv.category_id,
          name: pv.category_name,
          parentCategoryId: pv.category_parentCategoryId, // use lowercase field name
        } as Category;

        variantCategoryMap.set(pv.pv_id, category);

        const parsedParents = this.parseParentPath(category.parentCategoryId);

        parsedParents.forEach((id) => parentIds.add(id));
      }
    });

    if (variantCategoryMap.size === 0) {
      return {
        items: productVariantIds.map((id) => ({
          productVariantId: id,
          categoryTree: null,
        })),
      };
    }

    // 2. Build category map for already fetched categories
    const categoryMap = new Map<number, Category>();
    variantCategoryMap.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    // 3. Fetch parent categories (once)
    if (parentIds.size > 0) {
      const parents = await this.categoryRepository
        .createQueryBuilder('category')
        .select(['category.id', 'category.name', 'category.parentCategoryId'])
        .where('category.id IN (:...ids)', {
          ids: [...parentIds],
        })
        .andWhere('category.status = :status', {
          status: CategoryStatus.ACTIVE,
        })
        .getMany();

      parents.forEach((cat) => {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
        }
      });
    }

    // 4. Build result (1 record per productVariantId)
    const items: CategoryHierarchyResult[] = productVariantIds.map(
      (productVariantId) => {
        const category = variantCategoryMap.get(productVariantId);

        if (!category) {
          return {
            productVariantId,
            categoryTree: null,
          };
        }

        const parentPath = this.parseParentPath(category.parentCategoryId);
        const fullPath = [...parentPath, category.id];

        return {
          productVariantId,
          categoryTree: this.buildCategoryTree(fullPath, categoryMap),
        };
      },
    );

    return { items };
  }

  async getCurrentCategoryTree(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: Number(categoryId),
        status: CategoryStatus.ACTIVE,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const splitedPath = category.parentCategoryId
      ? category.parentCategoryId.split('.').map((id) => Number(id))
      : [category.id];

    // Fetch parent categories and the current category
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.imageUpload', 'imageUpload')
      .addSelect(['imageUpload.id', 'imageUpload.url'])
      .where('category.id IN (:...ids)', {
        ids: [...splitedPath, Number(categoryId)],
      })
      .andWhere('category.status = :status', {
        status: CategoryStatus.ACTIVE,
      })
      .getMany();

    if (!categories || categories.length === 0) {
      throw new Error('Category not found');
    }

    // Fetch direct children of the selected category (only one level)
    const categoryPath = category.parentCategoryId
      ? `${category.parentCategoryId}.${category.id}`
      : category.id.toString();

    const children = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.imageUpload', 'imageUpload')
      .addSelect(['imageUpload.id', 'imageUpload.url'])
      .where('category.parentCategoryId = :parentPath', {
        parentPath: categoryPath,
      })
      .andWhere('category.status = :status', {
        status: CategoryStatus.ACTIVE,
      })
      .getMany();

    // Build the tree with parents
    let result: Category;
    if (categories.length > 1) {
      result = this.buildCurrentCategoryTree(categories);
    } else {
      result = categories[0];
    }

    // Find the target category in the tree and attach children
    const targetCategory = this.findCategoryInTree(result, Number(categoryId));
    if (targetCategory && children.length > 0) {
      targetCategory.subCategories = children;
    }

    return result;
  }

  private findCategoryInTree(
    category: Category,
    targetId: number,
  ): Category | null {
    if (category.id === targetId) {
      return category;
    }

    if (category.subCategories && category.subCategories.length > 0) {
      for (const child of category.subCategories) {
        const found = this.findCategoryInTree(child, targetId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  private buildCurrentCategoryTree(categories: Category[]): Category {
    const map: { [key: string]: Category } = {};
    let root: Category = null;

    // Initialize subCategories array for all categories and build map
    categories.forEach((category) => {
      if (!category.subCategories) {
        category.subCategories = [];
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
          if (!parent.subCategories) {
            parent.subCategories = [];
          }
          parent.subCategories.push(category);
        }
      } else {
        // This is the root category (no parent)
        root = category;
      }
    });

    return root;
  }
}
