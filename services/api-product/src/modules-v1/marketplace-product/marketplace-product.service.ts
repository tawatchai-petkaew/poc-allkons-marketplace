import {
  MerchantProduct,
  MerchantProductStatus,
} from '@/model/merchant-product.entity';
import { ProductBrandTranslation } from '@/model/product-brand-translation.entity';
import { ProductBrand } from '@/model/product-brand.entity';
import { ProductCategoryTranslation } from '@/model/product-category-translation.entity';
import { ProductCategory } from '@/model/product-category.entity';
import { ProductTranslation } from '@/model/product-translation.entity';
import { Product } from '@/model/product.entity';
import { FlashSalePublicService } from '@/modules/flash-sale-public/flash-sale-public.service';
import { ProductOrderBy } from '@/modules/product-catalog-public/enum/product.enum';
import { ProductsDto } from '@/modules/product-public/dto/products.dto';
import { ProductDto } from '@/modules/product/dto/product.dto';
import { RequestContextService } from '@/modules/request-context/request-context.service';
import { getAllWithTranslationWithData, getByIdWithTranslation } from '@/utils';
import { getDiscountPrice, getFinalPrice } from '@/utils/price.utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

@Injectable()
export class MarketplaceProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslateRepo: Repository<ProductTranslation>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
    @InjectRepository(ProductCategoryTranslation)
    private readonly productCategoryTranslationRepo: Repository<ProductCategoryTranslation>,
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    @InjectRepository(ProductBrand)
    private readonly productBrandRepo: Repository<ProductBrand>,
    @InjectRepository(ProductBrandTranslation)
    private readonly productBrandTranslationRepo: Repository<ProductBrandTranslation>,
    private readonly flashSalePublicService: FlashSalePublicService,
    private readonly contextService: RequestContextService,
  ) {}

  async showBySlug(slug: string): Promise<any> {
    let parent: Product;
    const raw = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslations',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslations',
      )
      .leftJoinAndSelect('product.productImages', 'productImages')
      .leftJoinAndSelect('productImages.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItems')
      .leftJoinAndSelect('productItems.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItems.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItems.stock', 'stock')
      .leftJoinAndSelect('productItems.imageUpload', 'itemImageUpload')
      .leftJoinAndSelect('product.package', 'package')
      .leftJoinAndSelect('package.packageProducts', 'packageProducts')
      .leftJoinAndSelect('packageProducts.product', 'packageProduct')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .where('product.slug = :slug', { slug })
      .getMany();

    if (raw.length === 0) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    /// Find cheapest product item
    if (raw.length > 1) {
      parent = this.findCheapestProduct(raw);
    } else {
      parent = raw[0];
    }

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale(parent.merchant);

    const productData = await getByIdWithTranslation({
      id: parent.id,
      parent: parent,
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: this.contextService.currentLang,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    const finalData = this.flashSalePublicService.transformProduct(
      getActiveFlashSale,
      productData,
    );

    return {
      data: finalData,
    };
  }

  async getRelationProduct(slug: string): Promise<any> {
    const currentMerchantSlug =
      await this.contextService.currentMerchantOnSlug();
    const merchantProducts = await this.merchantProductRepo
      .createQueryBuilder('merchantProduct')
      .leftJoinAndSelect('merchantProduct.productVariant', 'productVariant')
      .leftJoinAndSelect(
        'productVariant.productVariantImages',
        'productVariantImages',
      )
      .leftJoinAndSelect(
        'productVariantImages.imageUpload',
        'variantImageUpload',
      )
      .where('merchantProduct.merchantProductStatus = :status', {
        status: MerchantProductStatus.SELLING,
      })
      .andWhere('merchantProduct.merchantId = :merchantId', {
        merchantId: currentMerchantSlug.id,
      })
      .andWhere('productVariant.sku != :slug', { slug })
      .take(15)
      .getMany();

    const transformedProducts = merchantProducts.map((merchantProduct) => ({
      slug: merchantProduct.productVariant?.sku,
      name: merchantProduct.productVariant?.alias,
      productImages: merchantProduct.productVariant?.productVariantImages.map(
        (img) => {
          return { ...img, url: img.imageUpload?.url };
        },
      ),
      ...merchantProduct,
    }));

    return transformedProducts;
  }

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    search: string = '',
    productCategoryIds: Array<number>,
    productBrandIds: Array<number>,
    productCatalogIds: Array<number>,
    orderBy: string = ProductOrderBy.LASTED,
  ): Promise<any> {
    const subQuery = this.productRepo
      .createQueryBuilder('p')
      .select('MAX(p.id)', 'id')
      .addSelect('MIN(p.minFinalProductPrice)', 'minFinalProductPrice')
      .groupBy('p.slug');

    let query = this.productRepo
      .createQueryBuilder('product')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'grouped',
        'grouped.id = product.id',
      )
      .leftJoinAndSelect('product.productTranslations', 'productTranslation')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect(
        'productCategory.productCategoryTranslations',
        'productCategoryTranslation',
      )
      .leftJoinAndSelect('product.productBrand', 'productBrand')
      .leftJoinAndSelect(
        'productBrand.productBrandTranslations',
        'productBrandTranslation',
      )
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect(
        'product.productProductCatalogs',
        'productProductCatalog',
      )
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productItem.imageUpload', 'productItemImageUpload')
      .andWhere('product.type = :type', { type: 'available' });

    query = await this.search(query, search);
    query = await this.filter(
      query,
      productCategoryIds,
      productBrandIds,
      productCatalogIds,
    );
    query = await this.orderBy(query, orderBy, search);

    const result: any =
      withPagination === 'true'
        ? await paginate<Product>(query, options)
        : await query.getMany();

    const getActiveFlashSale =
      await this.flashSalePublicService.getActiveFlashSale(
        result.items[0].merchant,
      );

    const finalData = this.flashSalePublicService.transformProductPrice(
      getActiveFlashSale,
      result,
    );

    const productData = await getAllWithTranslationWithData({
      parentRepoClass: this.productRepo,
      parentDtoClass: ProductsDto,
      childRepoClass: this.productTranslateRepo,
      parentKeyForGetChild: 'product',
      locale: this.contextService.currentLang,
      parents: finalData,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [
        {
          parentRepoClass: this.productCategoryRepo,
          childRepoClass: this.productCategoryTranslationRepo,
          parentKey: 'productCategory',
        },
        {
          parentRepoClass: this.productBrandRepo,
          childRepoClass: this.productBrandTranslationRepo,
          parentKey: 'productBrand',
        },
      ],
    });

    return productData;
  }

  private async search(products, search) {
    if (search !== '') {
      return await products.andWhere(
        'LOWER(productTranslation.name) like LOWER(:name)',
        { name: `%${search}%`, frontName: `${search}%` },
      );
    } else {
      return products;
    }
  }

  private async filter(
    products,
    productCategoryIds,
    productBrandIds,
    productCatalogIds,
  ) {
    if (productCategoryIds?.length > 0) {
      products = await products.andWhere(
        'productCategory.id IN(:...productCategoryIds)',
        { productCategoryIds: productCategoryIds },
      );
    }

    if (productBrandIds?.length > 0) {
      products = await products.andWhere(
        'productBrand.id IN(:...productBrandIds)',
        { productBrandIds: productBrandIds },
      );
    }

    if (productCatalogIds?.length > 0) {
      products.andWhere(
        'productProductCatalog.productCatalogId IN(:...productCatalogIds)',
        { productCatalogIds: productCatalogIds },
      );
    }

    return products;
  }

  private async orderBy(products, orderBy, search) {
    if (search !== '') {
      return await products
        .addSelect(
          `CASE WHEN productTranslation.name like :frontName then 1 when productTranslation.name like :name then 2 else null end`,
          '_rank',
        )
        .orderBy('_rank');
    }

    if (orderBy === ProductOrderBy.LASTED) {
      products = await products.orderBy('product.id', 'DESC');
    }

    if (orderBy === ProductOrderBy.LOW_PRICE_TO_HIGH_PRICE) {
      products = await products.orderBy('product.minFinalProductPrice', 'ASC');
    }

    if (orderBy === ProductOrderBy.HIGH_PRICE_TO_LOW_PRICE) {
      products = await products.orderBy('product.maxFinalProductPrice', 'DESC');
    }

    if (orderBy === ProductOrderBy.DEFAULT) {
      products = await products.orderBy('product.id', 'ASC');
    }

    if (orderBy === ProductOrderBy.ASC) {
      products = await products.orderBy('product.id', 'ASC');
    }

    if (orderBy === ProductOrderBy.BEST_SELLER) {
      products = await products.orderBy('product.soldQuantity', 'DESC');
    }

    return products;
  }

  async getProductMerchants(slug: string, page: number, limit: number) {
    const [rawProducts, count] = await Promise.all([
      this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.productCategory', 'productCategory')
        .leftJoinAndSelect(
          'productCategory.productCategoryTranslations',
          'productCategoryTranslations',
        )
        .leftJoinAndSelect('product.productBrand', 'productBrand')
        .leftJoinAndSelect(
          'productBrand.productBrandTranslations',
          'productBrandTranslations',
        )
        .leftJoinAndSelect('product.productImages', 'productImages')
        .leftJoinAndSelect('productImages.imageUpload', 'imageUpload')
        .leftJoinAndSelect('product.productItems', 'productItems')
        .leftJoinAndSelect('productItems.productDiscount', 'productDiscount')
        .leftJoinAndSelect(
          'productItems.productBigUnitDiscount',
          'productBigUnitDiscount',
        )
        .leftJoinAndSelect('productItems.stock', 'stock')
        .leftJoinAndSelect('productItems.imageUpload', 'itemImageUpload')
        .leftJoinAndSelect('product.package', 'package')
        .leftJoinAndSelect('package.packageProducts', 'packageProducts')
        .leftJoinAndSelect('packageProducts.product', 'packageProduct')
        .leftJoinAndSelect('product.merchant', 'merchant')
        .leftJoinAndSelect('merchant.store', 'store')
        .leftJoinAndSelect('merchant.merchantLogo', 'merchantLogo')
        .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
        .leftJoinAndSelect(
          'merchantLogo.imageUpload',
          'merchantLogoImageUpload',
        )
        .leftJoinAndSelect(
          'merchantIcon.imageUpload',
          'merchantIconImageUpload',
        )
        .leftJoinAndSelect(
          'merchant.merchantTranslations',
          'merchantTranslation',
        )
        .where('product.slug = :slug', { slug })
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      this.productRepo
        .createQueryBuilder('product')
        .where('product.slug = :slug', { slug })
        .getCount(),
    ]);

    if (rawProducts.length === 0) {
      return {
        data: [],
        meta: {
          currentPage: page,
          itemCount: 0,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    const products = await Promise.all(
      rawProducts.map(async (product) => {
        const getActiveFlashSale =
          await this.flashSalePublicService.getActiveFlashSale(
            product.merchant,
          );

        const productData = await getByIdWithTranslation({
          id: product.id,
          parent: product,
          parentRepoClass: this.productRepo,
          parentDtoClass: ProductDto,
          childRepoClass: this.productTranslateRepo,
          parentKeyForGetChild: 'product',
          locale: this.contextService.currentLang,
          relations: [],
          nestedParentChildWithTranslation: [
            {
              parentRepoClass: this.productCategoryRepo,
              childRepoClass: this.productCategoryTranslationRepo,
              parentKey: 'productCategory',
            },
            {
              parentRepoClass: this.productBrandRepo,
              childRepoClass: this.productBrandTranslationRepo,
              parentKey: 'productBrand',
            },
          ],
        });

        const finalData = this.flashSalePublicService.transformProduct(
          getActiveFlashSale,
          productData,
        );

        return finalData;
      }),
    );

    return {
      data: products,
      meta: {
        currentPage: page,
        itemCount: products.length,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  private findCheapestProduct(products: Product[]): Product {
    const allProductItems = [];
    products.forEach((parentItem) =>
      parentItem.productItems.forEach((item) =>
        allProductItems.push({ ...item, parentId: parentItem.id }),
      ),
    );
    let cheapestProductItem = allProductItems[0];
    allProductItems.forEach((item) => {
      if (
        getFinalPrice(
          item.price,
          getDiscountPrice(item.price, item.productDiscount),
        ) <
        getFinalPrice(
          cheapestProductItem.price,
          getDiscountPrice(
            cheapestProductItem.price,
            cheapestProductItem.productDiscount,
          ),
        )
      ) {
        cheapestProductItem = item;
      }
    });
    return products.find(
      (product) => cheapestProductItem.parentId === product.id,
    );
  }
}
