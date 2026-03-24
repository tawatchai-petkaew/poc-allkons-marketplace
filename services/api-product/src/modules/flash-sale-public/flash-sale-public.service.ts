import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';

import { FlashSale, FlashSaleStatus } from '../../model/flash-sale.entity';
import { Product } from '../../model/product.entity';
import { Merchant } from '../../model/merchant.entity';
import { ProductTranslation } from '../../model/product-translation.entity';

import { RequestContextService } from '../request-context/request-context.service';

import { getByIdWithTranslation } from '../../utils';

import { ProductDto } from '../product/dto/product.dto';
import { FlashSaleDto } from './dto/flash-sale.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FlashSalePublicService {
  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepo: Repository<FlashSale>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslationRepo: Repository<ProductTranslation>,
    private readonly contextService: RequestContextService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    withPagination: string = 'true',
    name: string = '',
  ): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();

    let flashSales = this.flashSaleRepo
      .createQueryBuilder('flashSale')
      .leftJoinAndSelect('flashSale.merchant', 'merchant')
      .leftJoinAndSelect('flashSale.productFlashSales', 'productFlashSale')
      .leftJoinAndSelect('productFlashSale.product', 'product')
      .leftJoinAndSelect(
        'productFlashSale.productFlashSaleItems',
        'productFlashSaleItem',
      )
      .leftJoinAndSelect('productFlashSaleItem.productItem', 'flashSaleItem')
      .leftJoinAndSelect(
        'flashSaleItem.productDiscount',
        'flashSaleItemDiscount',
      )
      .leftJoinAndSelect(
        'flashSaleItem.productBigUnitDiscount',
        'flashSaleItemBigUnitDiscount',
      )
      .leftJoinAndSelect('flashSaleItem.stock', 'flashSaleItemStock')
      .leftJoinAndSelect('product.productTranslations', 'productTranslations')
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('product.productItems', 'productItem')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .where('merchant.id = :merchantId', { merchantId: merchant.id });

    if (name !== '') {
      flashSales = await flashSales.andWhere('flashSale.name like :name', {
        name: `%${name}%`,
      });
    }

    flashSales = await flashSales.orderBy('flashSale.id', 'DESC');

    const data: any =
      withPagination === 'true'
        ? await paginate<FlashSale>(flashSales, options)
        : await flashSales.getMany();

    const flashSaleData = data.items || data;

    const resultData = flashSaleData?.map(async (e) => {
      const productFlashSalesData = e?.productFlashSales?.map(
        async (productFlashSale) => {
          return {
            ...productFlashSale,
            product: productFlashSale?.product
              ? await getByIdWithTranslation({
                  id: productFlashSale?.product?.id,
                  parent: productFlashSale?.product,
                  parentRepoClass: this.productRepo,
                  parentDtoClass: ProductDto,
                  childRepoClass: this.productTranslationRepo,
                  parentKeyForGetChild: 'product',
                  locale: this.contextService.currentLang,
                  relations: ['productImages', 'productImages.imageUpload'],
                  nestedParentChildWithTranslation: [],
                })
              : null,
          };
        },
      );

      const productFlashSales = await Promise.all(productFlashSalesData).then(
        (values) => {
          return values;
        },
      );

      const data = {
        ...e,
        productFlashSales,
      };

      return FlashSaleDto.fromEntity(data);
    });

    const resultFlashSaleData = await Promise.all(resultData).then((values) => {
      return values;
    });

    const result = {
      data: resultFlashSaleData,
      meta: data?.meta,
    };
    return result;
  }

  public async showById(id: number): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();

    const flashSale: FlashSale = await this.flashSaleRepo.findOne({
      where: {
        id,
      },
      relations: [
        'merchant',
        'productFlashSales',
        'productFlashSales.product',
        'productFlashSales.product.productTranslations',
        'productFlashSales.product.productItems',
        'productFlashSales.product.productItems.productDiscount',
        'productFlashSales.product.productItems.stock',
        'productFlashSales.product.productImages',
        'productFlashSales.product.productImages.imageUpload',
        'productFlashSales.productFlashSaleItems',
        'productFlashSales.productFlashSaleItems.productItem',
        'productFlashSales.productFlashSaleItems.productItem.productDiscount',
        'productFlashSales.productFlashSaleItems.productItem.productBigUnitDiscount',
        'productFlashSales.productFlashSaleItems.productItem.stock',
        'productFlashSales.productFlashSaleItems.productItem.imageUpload',
      ],
    });

    const productFlashSalesData = flashSale?.productFlashSales?.map(
      async (productFlashSale) => {
        return {
          ...productFlashSale,
          product: productFlashSale?.product
            ? await getByIdWithTranslation({
                id: productFlashSale?.product?.id,
                parent: productFlashSale?.product,
                parentRepoClass: this.productRepo,
                parentDtoClass: ProductDto,
                childRepoClass: this.productTranslationRepo,
                parentKeyForGetChild: 'product',
                locale: this.contextService.currentLang,
                relations: ['productImages', 'productImages.imageUpload'],
                nestedParentChildWithTranslation: [],
              })
            : null,
        };
      },
    );

    const productFlashSales = await Promise.all(productFlashSalesData).then(
      (values) => {
        return values;
      },
    );

    const data = {
      ...flashSale,
      productFlashSales,
    };

    const flashSaleData = FlashSaleDto.fromEntity(data);

    return {
      data: flashSaleData,
    };
  }

  public async getActiveFlashSale(m?: Merchant): Promise<FlashSale> {
    const merchant: Merchant = m
      ? m
      : await this.contextService.currentMerchantOnSlug();
    const currentDate = new Date();

    return await this.flashSaleRepo.findOne({
      where: {
        status: FlashSaleStatus.ACTIVE,
        startDate: LessThan(
          new Date(
            currentDate.getTime() +
              currentDate.getTimezoneOffset() * 60 * 1000 * -1,
          ),
        ),
        endDate: MoreThan(
          new Date(
            currentDate.getTime() +
              currentDate.getTimezoneOffset() * 60 * 1000 * -1,
          ),
        ),
      },
      relations: [
        'productFlashSales',
        'productFlashSales.product',
        'productFlashSales.productFlashSaleItems',
        'productFlashSales.productFlashSaleItems.productItem',
        'productFlashSales.productFlashSaleItems.productItem.productDiscount',
        'productFlashSales.productFlashSaleItems.productItem.productBigUnitDiscount',
      ],
    });
  }

  public async activeFlashSale(fsPage: string = 'yes'): Promise<any> {
    const merchant: Merchant =
      await this.contextService.currentMerchantOnSlug();
    const cacheKey = `flashSale:${merchant.id}`;

    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) return { data: cached };
    const currentDate = new Date();

    const activeFlashSale = await this.flashSaleRepo.findOne({
      where: {
        status: FlashSaleStatus.ACTIVE,
        startDate: LessThan(
          new Date(
            currentDate.getTime() +
              currentDate.getTimezoneOffset() * 60 * 1000 * -1,
          ),
        ),
        endDate: MoreThan(
          new Date(
            currentDate.getTime() +
              currentDate.getTimezoneOffset() * 60 * 1000 * -1,
          ),
        ),
      },
      relations: [
        'merchant',
        'productFlashSales',
        'productFlashSales.product',
        'productFlashSales.product.productTranslations',
        'productFlashSales.product.productImages',
        'productFlashSales.product.productImages.imageUpload',
        'productFlashSales.product.productItems',
        'productFlashSales.product.productItems.productDiscount',
        'productFlashSales.product.productItems.productBigUnitDiscount',
        'productFlashSales.product.productItems.stock',
        'productFlashSales.productFlashSaleItems',
        'productFlashSales.productFlashSaleItems.productItem',
        'productFlashSales.productFlashSaleItems.productItem.productDiscount',
        'productFlashSales.productFlashSaleItems.productItem.productBigUnitDiscount',
      ],
    });

    if (activeFlashSale) {
      const productFlashSalesData = activeFlashSale?.productFlashSales?.map(
        async (productFlashSale) => {
          return {
            ...productFlashSale,
            product: productFlashSale?.product
              ? await getByIdWithTranslation({
                  id: productFlashSale?.product?.id,
                  parent: productFlashSale?.product,
                  parentRepoClass: this.productRepo,
                  parentDtoClass: ProductDto,
                  childRepoClass: this.productTranslationRepo,
                  parentKeyForGetChild: 'product',
                  locale: this.contextService.currentLang,
                  relations: ['productImages', 'productImages.imageUpload'],
                  nestedParentChildWithTranslation: [],
                })
              : null,
          };
        },
      );

      const productFlashSales = await Promise.all(productFlashSalesData).then(
        (values) => {
          return values;
        },
      );

      const flashSaleItems = [];
      productFlashSales?.map((productFlashSale) => {
        return productFlashSale.productFlashSaleItems.map((item) => {
          flashSaleItems.push({
            ...item,
          });
        });
      });

      let newData = {};
      const customProdData = [];
      if (fsPage === 'yes') {
        productFlashSales?.map((productFlashSale) => {
          let soldQuantity = 0;
          const newDataItem = productFlashSale.product.productItems.map(
            (item) => {
              const checkFlashSale = flashSaleItems.find(
                (productFlashSaleItem) =>
                  productFlashSaleItem.productItem?.id === item?.id,
              );

              if (checkFlashSale) {
                soldQuantity +=
                  checkFlashSale?.soldQuantity +
                  checkFlashSale?.bigUnitSoldQuantity *
                    productFlashSale.product.piecePerBigUnit;
                if (checkFlashSale.bigUnitPrice) {
                  if (checkFlashSale.price) {
                    return {
                      ...item,
                      productDiscount: {
                        ...item.productDiscount,
                        id: item.productDiscount?.id
                          ? item.productDiscount?.id
                          : 999,
                        unitType: 'bath',
                        type: 'remain',
                        value: checkFlashSale.price,
                      },
                      productBigUnitDiscount: {
                        ...item.productBigUnitDiscount,
                        id: item.productBigUnitDiscount?.id
                          ? item.productBigUnitDiscount?.id
                          : 999,
                        unitType: 'bath',
                        type: 'remain',
                        value: checkFlashSale.bigUnitPrice,
                      },
                      flashSaleSmallUnit: 'yes',
                      flashSaleBigUnit: 'yes',
                    };
                  } else {
                    return {
                      ...item,
                      productBigUnitDiscount: {
                        ...item.productBigUnitDiscount,
                        id: item.productBigUnitDiscount?.id
                          ? item.productBigUnitDiscount?.id
                          : 999,
                        unitType: 'bath',
                        type: 'remain',
                        value: checkFlashSale.bigUnitPrice,
                      },
                      flashSaleSmallUnit: 'no',
                      flashSaleBigUnit: 'yes',
                    };
                  }
                } else {
                  return {
                    ...item,
                    productDiscount: {
                      ...item.productDiscount,
                      id: item.productDiscount?.id
                        ? item.productDiscount?.id
                        : 999,
                      unitType: 'bath',
                      type: 'remain',
                      value: checkFlashSale.price,
                    },
                    flashSaleSmallUnit: 'yes',
                    flashSaleBigUnit: 'no',
                  };
                }
              } else {
                return {
                  ...item,
                };
              }
            },
          );
          newData = {
            ...productFlashSale,
            product: {
              ...productFlashSale.product,
              productItems: newDataItem,
            },
            soldQuantity: soldQuantity,
          };
          customProdData.push(newData);
        });
      }

      const data = {
        ...activeFlashSale,
        productFlashSales: fsPage === 'no' ? productFlashSales : customProdData,
      };

      const flashSaleData = FlashSaleDto.fromEntity(data);

      await this.cacheManager.set(cacheKey, flashSaleData, 60 * 1000 * 1); // cache 1 min

      return {
        data: flashSaleData,
      };
    } else {
      await this.cacheManager.set(cacheKey, 'null', 60 * 1000 * 1); // cache 1 min
      return {
        data: null,
      };
    }
  }

  public transformProductPrice(getActiveFlashSale: FlashSale, result: any) {
    let products = result.items || result;

    if (getActiveFlashSale) {
      products = products?.map((product: Product) => {
        return this.transformProduct(getActiveFlashSale, product);
      });
    }

    return products;
  }

  public transformProduct(getActiveFlashSale: FlashSale, product: Product) {
    const getProductActiveFlashSale =
      getActiveFlashSale?.productFlashSales?.find(
        (productFlashSale) => productFlashSale.product?.id === product.id,
      );

    if (getProductActiveFlashSale) {
      const newDataItem = product.productItems?.map((item) => {
        const checkFlashSale =
          getProductActiveFlashSale.productFlashSaleItems.find(
            (productFlashSaleItem) =>
              productFlashSaleItem.productItem?.id === item.id,
          );

        return {
          ...item,
          productDiscount: item?.productDiscount
            ? {
                ...item?.productDiscount,
                id: item.productDiscount?.id,
                unitType: checkFlashSale?.price
                  ? 'bath'
                  : item?.productDiscount?.unitType,
                type: checkFlashSale?.price
                  ? 'remain'
                  : item?.productDiscount?.type,
                value: checkFlashSale?.price || item?.productDiscount?.value,
              }
            : {
                id: 999,
                unitType: 'bath',
                type: 'remain',
                value: checkFlashSale?.price || item?.price,
              },
          productBigUnitDiscount: item?.productBigUnitDiscount
            ? {
                ...item?.productBigUnitDiscount,
                id: item.productBigUnitDiscount?.id,
                unitType: checkFlashSale?.bigUnitPrice
                  ? 'bath'
                  : item?.productBigUnitDiscount?.unitType,
                type: checkFlashSale?.bigUnitPrice
                  ? 'remain'
                  : item?.productBigUnitDiscount?.type,
                value:
                  checkFlashSale?.bigUnitPrice ||
                  item?.productBigUnitDiscount?.value,
              }
            : item?.bigUnitPrice
              ? {
                  id: 999,
                  unitType: 'bath',
                  type: 'remain',
                  value: checkFlashSale?.bigUnitPrice || item?.bigUnitPrice,
                }
              : undefined,
          flashSaleSmallUnit: checkFlashSale?.bigUnitPrice ? 'yes' : 'no',
          flashSaleBigUnit: checkFlashSale?.bigUnitPrice ? 'yes' : 'no',
        };
      });

      return {
        ...product,
        productItems: newDataItem,
      };
    } else {
      return {
        ...product,
      };
    }
  }
}
