import { HttpException, Injectable } from '@nestjs/common';
import { OrderBy, SearchProductQueryDto } from './dto/search-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  MerchantProduct,
  MerchantProductEntityStatus,
  MerchantProductStatus,
} from '@/model/merchant-product.entity';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { SearchProductResponseDto } from './dto/search-product-response.dto';
import { ProductVariant } from '@/model/product-variant.entity';
import { ProductVariantDimension } from '@/model/product-variant-dimension.entity';
import { ProductVariantImage } from '@/model/product-variant-image.entity';
import { ProductVariantDocument } from '@/model/product-variant-document.entity';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { VariantOptionsResponseDto } from './dto/variant-options-response.dto';
import { deriveTechnicalType } from '@/utils/utils';
import { Category } from '@/model/category.entity';

@Injectable()
export class ProductPublicService {
  constructor(
    @InjectRepository(MerchantProduct)
    private readonly productRepository: Repository<MerchantProduct>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantDimension)
    private readonly productVariantDimensionRepo: Repository<ProductVariantDimension>,
    @InjectRepository(ProductVariantImage)
    private readonly productVariantImageRepo: Repository<ProductVariantImage>,
    @InjectRepository(ProductVariantDocument)
    private readonly productVariantDocumentRepo: Repository<ProductVariantDocument>,
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    private readonly requestContext: RequestContextService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async search(
    query: SearchProductQueryDto,
  ): Promise<{ data: SearchProductResponseDto }> {
    const merchant = await this.requestContext.currentMerchantOnSlug();

    const getProductQuery = this.productRepository
      .createQueryBuilder('merchantProduct')
      .leftJoin('merchantProduct.productVariant', 'productVariant')
      .addSelect([
        'productVariant.id',
        'productVariant.productId',
        'productVariant.alias',
        'productVariant.sku',
        'productVariant.salesUnit',
      ])
      .leftJoin('productVariant.product', 'product')
      .addSelect(['product.id', 'product.categoryId', 'product.brandId'])
      .leftJoin('product.category', 'category')
      .addSelect(['category.id', 'category.name'])
      .leftJoin('product.brand', 'brand')
      .addSelect(['brand.id', 'brand.name', 'brand.name_th'])
      .where('merchantProduct.merchantId = :merchantId', {
        merchantId: merchant.id,
      })
      .andWhere('merchantProduct.merchantProductStatus = :status', {
        status: MerchantProductStatus.SELLING,
      });

    // Add Filters
    if (query.categoryIds?.length > 0) {
      const categoryIds = query.categoryIds?.split(',').map((id) => Number(id));
      const currentCategory = await this.categoryRepository.find({
        where: {
          id: In(categoryIds),
        },
      });

      let subCategories = [];

      const subCategoryQuery =
        this.categoryRepository.createQueryBuilder('category');

      subCategoryQuery.where('category.id IN (:...categoryIds)', {
        categoryIds,
      });

      for (const [index, cat] of currentCategory.entries()) {
        const likePrefix = `likePrefix${index}`;
        const eqId = `eqId${index}`;
        subCategoryQuery.orWhere(
          `(category.parentCategoryId LIKE :${likePrefix} OR category.parentCategoryId = :${eqId})`,
          {
            [likePrefix]: `%.${cat.id}%`,
            [eqId]: String(cat.id),
          },
        );
      }

      subCategories = await subCategoryQuery.getMany();

      if (subCategories.length > 0) {
        const subSubCategoryQuery =
          this.categoryRepository.createQueryBuilder('category');

        for (const [index, cat] of subCategories.entries()) {
          const likePrefix = `subLikePrefix${index}`;
          const eqId = `subEqId${index}`;
          subSubCategoryQuery.orWhere(
            `(category.parentCategoryId LIKE :${likePrefix} OR category.parentCategoryId = :${eqId})`,
            {
              [likePrefix]: `%.${cat.id}%`,
              [eqId]: String(cat.id),
            },
          );
        }

        const subSubCategories = await subSubCategoryQuery.getMany();
        subCategories.push(...subSubCategories);
      }

      const allCategoryIds = [
        ...new Set([...categoryIds, ...subCategories.map((cat) => cat.id)]),
      ];

      getProductQuery.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds: allCategoryIds,
      });
    }

    if (query.orderBy === OrderBy.NAME_ASC) {
      getProductQuery
        .addSelect(
          'COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias") COLLATE "th-x-icu"',
          'name_sort',
        )
        .addSelect(
          `CASE
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN '0' AND '9' THEN 0
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'A' AND 'Z' THEN 1
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'a' AND 'z' THEN 2
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'ก' AND '๏' THEN 3
            ELSE 4
          END`,
          'name_lang_sort',
        )
        .orderBy('name_lang_sort', 'ASC')
        .addOrderBy('name_sort', 'ASC');
    } else if (query.orderBy === OrderBy.NAME_DESC) {
      getProductQuery
        .addSelect(
          'COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias") COLLATE "th-x-icu"',
          'name_sort',
        )
        .addSelect(
          `CASE
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'ก' AND '๏' THEN 0
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'a' AND 'z' THEN 1
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN 'A' AND 'Z' THEN 2
            WHEN LEFT(COALESCE("merchantProduct"."merchantCustomName", "productVariant"."alias"), 1) BETWEEN '0' AND '9' THEN 3
            ELSE 4
          END`,
          'name_lang_sort',
        )
        .orderBy('name_lang_sort', 'ASC')
        .addOrderBy('name_sort', 'DESC');
    } else if (query.orderBy === OrderBy.PRICE_ASC) {
      getProductQuery
        .addSelect(
          'COALESCE("merchantProduct"."specialPriceIncludeVat", "merchantProduct"."priceIncludeVat")',
          'price_sort',
        )
        .orderBy('price_sort', 'ASC');
    } else if (query.orderBy === OrderBy.PRICE_DESC) {
      getProductQuery
        .addSelect(
          'COALESCE("merchantProduct"."specialPriceIncludeVat", "merchantProduct"."priceIncludeVat")',
          'price_sort',
        )
        .orderBy('price_sort', 'DESC');
    } else {
      getProductQuery.orderBy('merchantProduct.createdAt', 'DESC');
    }

    try {
      const [merchantProducts, count] = await Promise.all([
        getProductQuery
          .skip((query.page - 1) * query.limit)
          .take(query.limit)
          .getMany(),
        getProductQuery.getCount(),
      ]);

      return {
        data: {
          items: merchantProducts,
          meta: {
            page: query.page,
            limit: query.limit,
            itemCount: merchantProducts.length,
            total: count,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.INTERNAL_SERVER_ERROR,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  private async findProductVariantCoreBySkuOrThrow(sku: string) {
    const pv = await this.productVariantRepo
      .createQueryBuilder('pv')
      .leftJoin('pv.product', 'product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .select([
        // ===== pv core =====
        'pv.id',
        'pv.sku',
        'pv.alias',
        'pv.barcode',
        'pv.description',
        'pv.howToUseText',
        'pv.suggestionText',
        'pv.cautionText',
        'pv.salesUnit',
        'pv.urlVideo',
        'pv.series',
        'pv.model',
        'pv.material',
        'pv.guarantee',
        'pv.detailGuarantee',
        'pv.tIS',

        'pv.packageWidth',
        'pv.packageWidthUnit',
        'pv.packageHeight',
        'pv.packageHeightUnit',
        'pv.packageDepth',
        'pv.packageDepthUnit',
        'pv.packageShape',

        'pv.productWidth',
        'pv.productWidthUnit',
        'pv.productHeight',
        'pv.productHeightUnit',
        'pv.productDepth',
        'pv.productDepthUnit',

        'pv.grossWeight',
        'pv.grossWeightUnit',
        'pv.netWeight',
        'pv.netWeightUnit',

        'pv.status',
        'pv.productId',

        // ===== product =====
        'product.id',

        // ===== brand =====
        'brand.id',
        'brand.name',
        'brand.name_th',

        // ===== category =====
        'category.id',
        'category.name',
      ])
      .where('pv.sku = :sku', { sku })
      .getOne();

    if (!pv) {
      throw new HttpException(
        {
          message: `Product variant with SKU "${sku}" not found`,
          errorCode: ErrorCode.NOT_FOUND,
        },
        404,
      );
    }

    return pv;
  }

  private async findDimensionsByProductVariantId(productVariantId: number) {
    return this.productVariantDimensionRepo
      .createQueryBuilder('pvd')
      .leftJoin('pvd.productDimension', 'pd')
      .leftJoin('pd.productDimensionMaster', 'pdm')
      .select(['pvd.id', 'pvd.value', 'pd.id', 'pdm.id', 'pdm.name'])
      .where('pvd.productVariantId = :productVariantId', {
        productVariantId,
      })
      .getMany();
  }

  private async findImagesByProductVariantId(productVariantId: number) {
    return this.productVariantImageRepo
      .createQueryBuilder('pvi')
      .leftJoin('pvi.imageUpload', 'imageUpload')
      .select(['pvi.id', 'pvi.order', 'imageUpload.id', 'imageUpload.url'])
      .where('pvi.productVariantId = :productVariantId', {
        productVariantId,
      })
      .orderBy('pvi.order', 'ASC')
      .getMany();
  }

  private async findMerchantProduct(
    merchantId: number,
    productVariantId: number,
  ) {
    return this.merchantProductRepo.findOne({
      where: {
        merchantId,
        productVariantId,
        status: MerchantProductEntityStatus.ACTIVE,
      },
      select: ['id', 'priceIncludeVat', 'specialPriceIncludeVat', 'quantity'],
    });
  }

  async getProductVariantBySku(
    sku: string,
  ): Promise<ProductVariantResponseDto> {
    if (!sku) {
      throw new HttpException(
        { message: 'SKU is required', errorCode: ErrorCode.BAD_REQUEST },
        400,
      );
    }

    const merchant = await this.requestContext.currentMerchantOnSlug();

    try {
      // 1. Core
      const productVariant = await this.findProductVariantCoreBySkuOrThrow(sku);

      // 2. Parallel fetch
      const [dimensions, images, merchantProduct] = await Promise.all([
        this.findDimensionsByProductVariantId(productVariant.id),
        this.findImagesByProductVariantId(productVariant.id),
        merchant
          ? this.findMerchantProduct(merchant.id, productVariant.id)
          : Promise.resolve(null),
      ]);

      // 3. Return (no boilerplate mapping for core)
      return {
        ...productVariant,
        images: images.map((i) => i.imageUpload?.url),
        dimensions: dimensions.map((pvd) => ({
          id: pvd.productDimension?.productDimensionMaster?.id,
          name: pvd.productDimension?.productDimensionMaster?.name || '',
          value: pvd.value || '',
        })),
        merchantProductId: merchantProduct?.id,
        priceIncludeVat: merchantProduct?.priceIncludeVat || 0,
        specialPriceIncludeVat: merchantProduct?.specialPriceIncludeVat || null,
        quantity: merchantProduct?.quantity || 0,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error in getProductVariantBySku:', error);
      throw new HttpException(
        {
          message: 'Cannot get product variant',
          error: error.message,
        },
        500,
      );
    }
  }

  async getProductVariantOptions(
    productId: number,
  ): Promise<VariantOptionsResponseDto> {
    try {
      if (!productId) {
        throw new HttpException(
          {
            message: 'Product ID is required',
            errorCode: ErrorCode.BAD_REQUEST,
          },
          400,
        );
      }

      // Get all variant dimensions for this product
      const dimensions = await this.productVariantDimensionRepo
        .createQueryBuilder('pvd')
        .innerJoin('pvd.productVariant', 'pv')
        .innerJoin('pvd.productDimension', 'pd')
        .innerJoin('pd.productDimensionMaster', 'pdm')
        .select(['pvd.id', 'pvd.value', 'pd.id', 'pdm.id', 'pdm.name'])
        .where('pv.productId = :productId', { productId })
        .getMany();

      if (!dimensions || dimensions.length === 0) {
        return { variantOptions: [] };
      }

      // Group by dimension and collect unique values
      const dimensionMap = new Map<
        number,
        { name: string; values: Set<string> }
      >();

      dimensions.forEach((pvd) => {
        const dimensionId = pvd.productDimension?.productDimensionMaster?.id;
        const dimensionName =
          pvd.productDimension?.productDimensionMaster?.name || '';
        const value = pvd.value || '';

        if (dimensionId && value) {
          if (!dimensionMap.has(dimensionId)) {
            dimensionMap.set(dimensionId, {
              name: dimensionName,
              values: new Set(),
            });
          }
          dimensionMap.get(dimensionId)!.values.add(value);
        }
      });

      // Convert to response format
      const variantOptions = Array.from(dimensionMap.entries()).map(
        ([dimensionId, { name, values }]) => ({
          dimensionId,
          name,
          values: Array.from(values).sort(),
        }),
      );

      return { variantOptions };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in getProductVariantOptions:', error);
      throw new HttpException(
        {
          message: 'Cannot get product variant options',
          error: error.message,
        },
        500,
      );
    }
  }

  async getProductVariantDocuments(productVariantId: number) {
    try {
      // Verify product variant exists
      const productVariant = await this.productVariantRepo.findOne({
        where: { id: productVariantId },
        select: ['id'],
      });

      if (!productVariant) {
        throw new HttpException(
          {
            message: `Product variant with ID "${productVariantId}" not found`,
            errorCode: ErrorCode.NOT_FOUND,
          },
          404,
        );
      }

      // Get all documents for this variant
      const documents = await this.productVariantDocumentRepo
        .createQueryBuilder('pvd')
        .leftJoin('pvd.imageUpload', 'imageUpload')
        .select([
          'pvd.id',
          'pvd.documentType',
          'imageUpload.id',
          'imageUpload.imageName',
          'imageUpload.url',
        ])
        .where('pvd.productVariantId = :productVariantId', {
          productVariantId: productVariantId,
        })
        .getMany();

      // Transform to response format
      const response = documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        file: {
          name: doc.imageUpload?.imageName || '',
          url: doc.imageUpload?.url || '',
          technicalType: doc.imageUpload?.imageName
            ? deriveTechnicalType(doc.imageUpload.imageName)
            : 'OTHER',
        },
      }));

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in getProductVariantDocuments:', error);
      throw new HttpException(
        {
          message: 'Cannot get product variant documents',
          error: error.message,
        },
        500,
      );
    }
  }
}
