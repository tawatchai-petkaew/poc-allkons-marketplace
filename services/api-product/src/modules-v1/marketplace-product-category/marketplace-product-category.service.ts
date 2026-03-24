import {
  ProductCategory,
  ProductCategoryStatus,
} from '@/model/product-category.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyerProductCategoryDto } from '../buyer-product-category/dto/buyer-product-category.dto';

@Injectable()
export class MarketplaceProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
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

  private buildArrayOrderByParent(categories: BuyerProductCategoryDto[]) {
    const parents = categories.filter((category) => !category.path);
    const children = categories
      .filter((category) => category.path)
      .sort((a, b) => a.path.length - b.path.length);

    const result = [...parents, ...children];

    return result;
  }

  async getAll(): Promise<{
    data: BuyerProductCategoryDto[];
  }> {
    try {
      const allCategories = await this.productCategoryRepo
        .createQueryBuilder('productCategory')
        .leftJoinAndSelect(
          'productCategory.productCategoryTranslations',
          'productCategoryTranslation',
        )
        .leftJoinAndSelect('productCategory.imageUpload', 'imageUpload')
        .leftJoinAndSelect('productCategory.merchant', 'merchant')
        .andWhere('productCategory.status = :status', {
          status: ProductCategoryStatus.ACTIVE,
        })
        .limit(30)
        .getMany();

      if (allCategories.length === 0) {
        return {
          data: [],
        };
      }

      const allCategoriesToDto = allCategories.map((category) =>
        this.toDto(category),
      );

      return {
        data: this.buildCategoryTree(allCategoriesToDto).sort(
          (a, b) => a.order - b.order,
        ),
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

  async getByIds(ids: number[], responseType: 'nested' | 'flat' = 'flat') {
    const category = await this.productCategoryRepo
      .createQueryBuilder('productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('productCategory.imageUpload', 'imageUpload')
      .leftJoinAndSelect('productCategory.merchant', 'merchant')
      .andWhere('productCategory.id IN (:...ids)', { ids })
      .andWhere('productCategory.status = :status', {
        status: ProductCategoryStatus.ACTIVE,
      })
      .getMany();

    const result = category.map((category) => this.toDto(category));

    return responseType === 'nested'
      ? this.buildCategoryTree(result)
      : this.buildArrayOrderByParent(result);
  }
}
