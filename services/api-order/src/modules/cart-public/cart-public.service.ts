import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { CartItem } from '../../model/cart-item.entity';
import { Cart } from '../../model/cart.entity';
import { Customer } from '../../model/customer.entity';
import {
  Merchant,
  MerchantStatus,
} from '../../model/merchant.entity';
import { ProductItem } from '../../model/product-item.entity';
import { ProductTranslation } from '../../model/product-translation.entity';
import { Product, status } from '../../model/product.entity';

import { CartDto } from './dto/cart.dto';

import { Organization } from '@/model/organiztion.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { I18nContext } from 'nestjs-i18n';
import { getByIdWithTranslation } from '../../utils';

import { CartItemDto } from './dto/cart-item.dto';
import { GetCartQueryDto } from './dto/get-cart-query.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { RequestContextService } from '../request-context/request-context.service';
import { ProductDto } from './dto/product.dto';
import { FlashSale, FlashSaleStatus } from '@/model/flash-sale.entity';

@Injectable()
export class CartPublicService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductItem)
    private readonly productItemRepo: Repository<ProductItem>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslationRepo: Repository<ProductTranslation>,
    private contextService: RequestContextService,
    @InjectRepository(FlashSale)
    private readonly flashSaleRepo: Repository<FlashSale>,
    @InjectQueue('cart-queue') private cartQueue: Queue,
    private dataSource: DataSource,
  ) {}

  public async get(
    { page, limit }: GetCartQueryDto,
    userId: number,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const take = limit;

    const organization = await this.contextService.currentOrganization();

    const carts = await this.cartRepo.find({
      where: {
        organization: { id: organization.id },
        user: { id: userId },
      },
      relations: ['merchant'],
    });

    if (!carts.length) {
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

    const cartIds = carts.map((c) => c.id);

    const [items, count] = await this.cartItemRepo
      .createQueryBuilder('cartItem')
      .leftJoinAndSelect('cartItem.cart', 'cart')
      .leftJoinAndSelect('cart.merchant', 'cartMerchant')
      .leftJoinAndSelect('cartMerchant.merchantLogo', 'merchantLogo')
      .leftJoinAndSelect('merchantLogo.imageUpload', 'logoImage')
      .leftJoinAndSelect('cartItem.productItem', 'productItem')
      .leftJoinAndSelect('productItem.product', 'product')
      .leftJoinAndSelect('product.productTranslations', 'productTranslations')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect(
        'productItem.productBigUnitDiscount',
        'productBigUnitDiscount',
      )
      .leftJoinAndSelect('productItem.stock', 'stock')
      .leftJoinAndSelect('product.productImages', 'productImages')
      .leftJoinAndSelect('productImages.imageUpload', 'imageUpload')
      .leftJoinAndSelect('cartItem.merchantProduct', 'merchantProduct')
      .leftJoinAndSelect('merchantProduct.productVariant', 'productVariant')
      // .leftJoinAndSelect('product.productPrimaryOption', 'productPrimaryOption')
      // .leftJoinAndSelect(
      //   'product.productSecondaryOption',
      //   'productSecondaryOption',
      // )
      // .leftJoinAndSelect('product.productItems', 'productItems')
      // .leftJoinAndSelect('productItems.productDiscount', 'itemsProductDiscount')
      // .leftJoinAndSelect(
      //   'productItems.productBigUnitDiscount',
      //   'itemsProductBigUnitDiscount',
      // )
      // .leftJoinAndSelect('productItems.stock', 'itemsStock')
      // .leftJoinAndSelect('productItems.imageUpload', 'itemsImageUpload')
      .where('cartItem.cart IN (:...cartIds)', { cartIds })
      .orderBy('cartItem.createdAt', 'DESC')
      .select([
        'cart.id',
        'cartMerchant.id',
        'cartItem.id',
        'cartItem.quantity',
        'cartItem.unit',
        'cartItem.merchantProductId',
        'merchantProduct',
        'productVariant',
        'cartItem.createdAt',
        'productItem.id',
        'productItem.slug',
        'productItem.price',
        'productItem.soldQuantity',
        'productItem.createdAt',
        'productItem.primaryOptionsValue',
        'productItem.secondaryOptionsValue',
        'productItem.price',
        'productItem.soldQuantity',
        'productItem.createdAt',
        'product.id',
        'product.slug',
        'product.createdAt',
        'productDiscount.type',
        'productDiscount.value',
        'stock.id',
        'stock.remaining',
        'productImages.id',
        'productImages.imageUpload',
        'imageUpload.id',
        'imageUpload.url',
        'imageUpload.name',
        'productTranslations',
      ])
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const merchantIds = [...new Set(items.map((i) => i.cart.merchant.id))];

    const merchants = await this.dataSource.getRepository(Merchant).find({
      where: { id: In(merchantIds) },
      relations: ['merchantLogo', 'merchantLogo.imageUpload'],
    });

    const activeFlashSales = await Promise.all(
      merchants.map((m) => this.getActiveFlashSale(m)),
    );

    const groupedItems = await Promise.all(
      merchants.map(async (merchant, index) => {
        const merchantItems = items.filter(
          (i) => i.cart.merchant.id === merchant.id,
        );
        const flashSale = activeFlashSales[index];

        const enrichedItems = await Promise.all(
          merchantItems.map(async (cartItem) => {
            const product = await getByIdWithTranslation({
              id: cartItem.productItem.product.id,
              parent: cartItem.productItem.product,
              parentRepoClass: this.productRepo,
              parentDtoClass: ProductDto,
              childRepoClass: this.productTranslationRepo,
              parentKeyForGetChild: 'product',
              locale: this.contextService.currentLang,
              relations: ['productImages', 'productImages.imageUpload'],
              nestedParentChildWithTranslation: [],
            });

            const enrichedItem = {
              ...cartItem,
              productItem: {
                ...cartItem.productItem,
                product,
              },
              merchantProduct: {
                ...cartItem.merchantProduct,
              },
            };

            if (flashSale) {
              let flashSaleItems = [];
              (flashSale.productFlashSales || []).forEach((pfs) => {
                pfs.productFlashSaleItems.forEach((item) => {
                  flashSaleItems.push({ ...item });
                });
              });

              const checkFlashSale = flashSaleItems.find(
                (fsi) => fsi?.productItem?.id === enrichedItem.productItem.id,
              );

              if (checkFlashSale) {
                return {
                  ...enrichedItem,
                  productItem: {
                    ...enrichedItem.productItem,
                    productDiscount: enrichedItem.productItem.productDiscount
                      ? {
                          ...enrichedItem.productItem.productDiscount,
                          unitType: checkFlashSale.price
                            ? 'bath'
                            : enrichedItem.productItem.productDiscount.unitType,
                          type: checkFlashSale.price
                            ? 'remain'
                            : enrichedItem.productItem.productDiscount.type,
                          value:
                            checkFlashSale.price ||
                            enrichedItem.productItem.productDiscount.value,
                        }
                      : {
                          id: 999,
                          unitType: 'bath',
                          type: 'remain',
                          value:
                            checkFlashSale.price ||
                            enrichedItem.productItem.price,
                        },
                    productBigUnitDiscount: enrichedItem.productItem
                      .productBigUnitDiscount
                      ? {
                          ...enrichedItem.productItem.productBigUnitDiscount,
                          unitType: checkFlashSale.bigUnitPrice
                            ? 'bath'
                            : enrichedItem.productItem.productBigUnitDiscount
                                .unitType,
                          type: checkFlashSale.bigUnitPrice
                            ? 'remain'
                            : enrichedItem.productItem.productBigUnitDiscount
                                .type,
                          value:
                            checkFlashSale.bigUnitPrice ||
                            enrichedItem.productItem.productBigUnitDiscount
                              .value,
                        }
                      : enrichedItem.productItem.bigUnitPrice
                      ? {
                          id: 999,
                          unitType: 'bath',
                          type: 'remain',
                          value:
                            checkFlashSale.bigUnitPrice ||
                            enrichedItem.productItem.bigUnitPrice,
                        }
                      : undefined,
                    flashSaleSmallUnit: checkFlashSale.bigUnitPrice
                      ? 'yes'
                      : 'no',
                    flashSaleBigUnit: checkFlashSale.bigUnitPrice
                      ? 'yes'
                      : 'no',
                  },
                };
              }
            }
            return enrichedItem;
          }),
        );

        return {
          merchant,
          items: await Promise.all(
            enrichedItems.map((item) =>
              CartItemDto.fromEntity(item as unknown as CartItem),
            ),
          ),
        };
      }),
    );

    return {
      data: groupedItems,
      meta: {
        currentPage: page,
        itemCount: items.length,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async update(
    id: number,
    dto: UpdateCartDto,
    userId: any,
    i18n: I18nContext,
  ): Promise<CartDto> {
    const cart = await this.cartRepo.findOne({
      where: {
        id,
      },
      relations: [
        'cartItems',
        'cartItems.productItem',
        'cartItems.productItem.product',
        'cartItems.productItem.product.productTranslations',
        'cartItems.productItem.productDiscount',
        'cartItems.productItem.productBigUnitDiscount',
        'cartItems.productItem.stock',
        'cartItems.productItem.product.productImages',
        'cartItems.productItem.product.productImages.imageUpload',
        'cartItems.productItem.product.productPrimaryOption',
        'cartItems.productItem.product.productSecondaryOption',
        'cartItems.productItem.product.productItems',
        'cartItems.productItem.product.productItems.productDiscount',
        'cartItems.productItem.product.productItems.productBigUnitDiscount',
        'cartItems.productItem.product.productItems.stock',
        'cartItems.productItem.product.productItems.imageUpload',
      ],
    });

    const parentDto = {
      ...dto,
    };

    const cartEntity = UpdateCartDto.toEntity(parentDto);

    const cartUpdated = this.cartRepo
      .save({ ...cart, ...cartEntity })
      .then(async (e) => {
        await Promise.all(
          cart?.cartItems?.map(async (item) => {
            const ids = dto.cartItemAttributes?.map(
              (atr) => atr?.productItemId || atr?.productItem?.id,
            );
            const units = dto.cartItemAttributes?.map((atr) => atr?.unit);
            if (ids && !ids.includes(item?.productItem?.id)) {
              await this.cartItemRepo.softDelete(item.id);
            }

            await Promise.all(
              ids?.map(async (id, index) => {
                if (id === item.productItem?.id && units[index] !== item.unit) {
                  await this.cartItemRepo.softDelete(item.id);
                }
              }),
            );
          }),
        );

        await Promise.all(
          dto.cartItemAttributes?.map(async (attribute) => {
            if (attribute.quantity <= 0) {
              throw new Error(i18n.t('errors.QUANTITY_MORE_THAN_ZERO'));
            }

            const productItem: ProductItem = await this.productItemRepo.findOne(
              {
                where: {
                  id: attribute?.productItemId,
                },
                relations: ['stock', 'product'],
              },
            );

            if (
              productItem?.stock?.onValidateStock &&
              productItem?.stock?.remaining <= 0
            ) {
              throw new Error(
                `[${productItem?.slug || productItem?.product?.slug}] ${i18n.t(
                  'errors.PRODUCT_OUT_OF_STOCK',
                )}`,
              );
            }

            const cart = await this.cartRepo.findOne({
              where: {
                id,
              },
              relations: ['cartItems', 'cartItems.productItem'],
            });
            const existCartItem = cart.cartItems.find(
              (cartItem) =>
                cartItem?.unit === attribute?.unit &&
                (cartItem?.productItem?.id === attribute?.productItemId ||
                  cartItem.id === attribute?.productItem?.id),
            );
            if (existCartItem) {
              const cartItem = await this.cartItemRepo.findOne({
                where: {
                  id: existCartItem.id,
                },
              });
              const productItem: ProductItem =
                await this.productItemRepo.findOne({
                  where: {
                    id: attribute?.productItemId,
                  },
                });

              const dto = {
                ...attribute,
                productItem,
                cart,
              };

              const cartItemEntity = await CartItemDto.toEntity(dto);

              await this.cartItemRepo.save(
                Object.assign(cartItem, cartItemEntity),
              );
            } else {
              const productItem: ProductItem =
                await this.productItemRepo.findOne({
                  where: {
                    id: attribute?.productItemId,
                  },
                });

              const dto = {
                ...attribute,
                productItem,
                cart,
              };

              await this.cartItemRepo.save(CartItemDto.toEntity(dto));
            }
          }),
        );

        return e;
      });

    return cartUpdated;
  }

  public async createCartItem(
    dto: CartItemDto,
    userId: any,
    i18n: I18nContext,
    m?: Merchant,
    c?: Customer,
    fromQueue: boolean = false,
  ) {
    const merchant = m ? m : await this.contextService.currentMerchantOnSlug();
    const organization = await this.contextService.currentOrganization();

    // if (
    //   merchant.performanceMode === MerchantPerformanceMode.PERFORMANCE &&
    //   fromQueue
    // ) {
    //   return await this.createCartItemToQueue(dto, userId, i18n);
    // } else {
      return await this.dataSource.transaction(async (manager) => {
        if (dto.quantity <= 0) {
          throw new Error(i18n.t('errors.QUANTITY_MORE_THAN_ZERO'));
        }

        // const getStock = await manager.findOne(Stock, {
        //   where: {
        //     productItem: {
        //       id: dto?.productItemId
        //     }
        //   },
        //   relations: []
        // });

        // if (getStock?.onValidateStock && getStock?.remaining <= 0) {
        //   throw new Error(`${i18n.t('errors.PRODUCT_OUT_OF_STOCK')}`);
        // }

        let cart: Cart;
        cart = await manager.findOne(Cart, {
          where: {
            organization: { id: organization.id },
            merchant: { id: merchant.id },
            user: { id: userId },
          },
        });

        if (!cart) {
          const newCart = manager.create(Cart, {
            organization: { id: organization.id },
            merchant: { id: merchant.id },
            user: { id: userId },
          });
          cart = await manager.save(newCart);
        }

        const productItem = await manager.findOne(ProductItem, {
          where: {
            id: dto?.productItemId,
          },
        });

        const existingCartItem = await manager.findOne(CartItem, {
          where: {
            cart: { id: cart.id },
            productItem: { id: productItem.id },
          },
        });

        if (existingCartItem) {
          const updateDto = {
            ...existingCartItem,
            quantity: existingCartItem.quantity + dto.quantity,
          };

          const updatedCartItem = await manager.save(CartItem, updateDto);

          const fullCartItem = await manager.findOne(CartItem, {
            where: { id: updatedCartItem.id },
            relations: [
              'productItem',
              'productItem.stock',
              'productItem.product',
              'merchantProduct',
              'merchantProduct.productVariant',
            ],
          });

          return CartItemDto.fromEntity(fullCartItem);
        }

        const cartItemDto = {
          ...dto,
          productItem,
          cart,
        };

        const cartItem = await manager.save(CartItem, cartItemDto);

        const fullCartItem = await manager.findOne(CartItem, {
          where: { id: cartItem.id },
          relations: [
            'productItem',
            'productItem.stock',
            'productItem.product',
            'merchantProduct',
            'merchantProduct.productVariant',
          ],
        });

        return CartItemDto.fromEntity(fullCartItem);
      });
    // }
  }

  public async updateCartItem(
    id: number,
    dto: CartItemDto,
    userId: any,
    i18n: I18nContext,
    m?: Merchant,
    c?: Customer,
    fromQueue: boolean = false,
  ) {
    const merchant: Merchant = m
      ? m
      : await this.contextService.currentMerchantOnSlug();

    const organization: Organization =
      await this.contextService.currentOrganization();

    // if (
    //   merchant.performanceMode === MerchantPerformanceMode.PERFORMANCE &&
    //   fromQueue
    // ) {
    //   return await this.updateCartItemToQueue(id, dto, userId, i18n);
    // } else {
      if (dto.quantity <= 0) {
        throw new Error(i18n.t('errors.QUANTITY_MORE_THAN_ZERO'));
      }

      const cartItem = await this.cartItemRepo.findOne({
        where: {
          id,
        },
        relations: ['productItem', 'productItem.stock', 'productItem.product'],
      });

      if (!cartItem) {
        throw new Error('Cart item does not exist');
      }

      const productItem: ProductItem = await this.productItemRepo.findOne({
        where: {
          id: dto?.productItemId,
        },
      });

      if (!productItem) {
        throw new Error('Product item does not exist');
      }

      const cart = await this.cartRepo.findOne({
        where: {
          organization: { id: organization.id },
          merchant: { id: merchant.id },
        },
      });

      const cartDto = {
        ...dto,
        productItem,
        cart,
      };

      if (
        productItem &&
        cartItem?.productItem?.stock?.onValidateStock &&
        cartItem?.productItem?.stock?.remaining <= 0
      ) {
        if (
          productItem?.stock?.onValidateStock &&
          productItem?.stock?.remaining <= 0
        ) {
          throw new Error(
            `[${productItem?.slug || productItem?.product?.slug}] ${i18n.t(
              'errors.PRODUCT_OUT_OF_STOCK',
            )}`,
          );
        }
      } else {
        if (
          cartItem?.productItem?.stock?.onValidateStock &&
          cartItem?.productItem?.stock?.remaining <= 0
        ) {
          throw new Error(
            `[${
              cartItem?.productItem?.slug ||
              cartItem?.productItem?.product?.slug
            }] ${i18n.t('errors.PRODUCT_OUT_OF_STOCK')}`,
          );
        }
      }

      const cartItemEntity = CartItemDto.toEntity(cartDto);
      const cartItemUpdated = await this.cartItemRepo.save(
        Object.assign(cartItem, cartItemEntity),
      );

      const fullCartItem = await this.cartItemRepo.findOne({
        where: { id: cartItemUpdated.id },
        relations: [
          'productItem',
          'productItem.stock',
          'productItem.product',
          'merchantProduct',
          'merchantProduct.productVariant',
        ],
      });

      return CartItemDto.fromEntity(fullCartItem);
    // }
  }

  public async deleteCartItem(ids: number[]) {
    await this.cartItemRepo.softDelete(ids);
    return { data: { deletedIds: ids } };
  }

  public async createCartItemToQueue(
    dto: CartItemDto,
    userId: any,
    i18n: I18nContext,
  ) {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const customer: Customer = await this.contextService.currentCustomer();
    const orderQueueUuid = uuidv4();
    const waitingCount = await this.cartQueue.getWaitingCount();
    const activeCount = await this.cartQueue.getActiveCount();

    await this.cartQueue.add(
      'create-cart-item-job',
      {
        dto: JSON.stringify(dto),
        userId,
        merchant,
        customer,
        mode: 'create',
      },
      {
        jobId: orderQueueUuid,
      },
    );

    return {
      orderQueueUuid,
      waitingQueue: waitingCount + activeCount,
    };
  }

  public async updateCartItemToQueue(
    id: number,
    dto: CartItemDto,
    userId: any,
    i18n: I18nContext,
  ) {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const customer: Customer = await this.contextService.currentCustomer();
    const orderQueueUuid = uuidv4();
    const waitingCount = await this.cartQueue.getWaitingCount();
    const activeCount = await this.cartQueue.getActiveCount();

    await this.cartQueue.add(
      'create-cart-item-job',
      {
        id,
        dto: JSON.stringify(dto),
        userId,
        merchant,
        customer,
        mode: 'update',
      },
      {
        jobId: orderQueueUuid,
      },
    );

    return {
      orderQueueUuid,
      waitingQueue: waitingCount + activeCount,
    };
  }

  async getCount() {
    const [merchant, organization] = await Promise.all([
      this.contextService.currentMerchantOnSlug(),
      this.contextService.currentOrganization(),
    ]);

    // Optimized: Single query with INNER JOIN instead of 2 separate queries
    // Uses indexes: idx_cart (merchantId, organizationId) + idx_cart_count (cartId)
    const count = await this.cartItemRepo
      .createQueryBuilder('cartItem')
      .innerJoin('cartItem.cart', 'cart')
      .where('cart.merchantId = :merchantId', { merchantId: merchant.id })
      .andWhere('cart.organizationId = :organizationId', {
        organizationId: organization.id,
      })
      .getCount();

    return { data: count };
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
        // merchant: { id: merchant.id },
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
}
