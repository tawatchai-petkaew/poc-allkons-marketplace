import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cart } from '@/model/cart.entity';
import { CartItem } from '@/model/cart-item.entity';
import { GetCartQueryDto } from '@/modules/cart-public/dto/get-cart-query.dto';
import { CartDto } from '@/modules/marketplace-cart/dto/cart.dto';
import { getByIdWithTranslation } from '@/utils';
import { Product } from '@/model/product.entity';
import { ProductTranslation } from '@/model/product-translation.entity';
import { CartItemDto } from '@/modules/cart-public/dto/cart-item.dto';
import { I18nContext } from 'nestjs-i18n';
import { Customer, Merchant } from '@/model';
import { ProductItem } from '@/model/product-item.entity';
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { RequestContextService } from '../request-context/request-context.service';
import { ProductDto } from '../cart-public/dto/product.dto';
import { Organization } from '@/model/organiztion.entity';

@Injectable()
export class MarketplaceCartService {
  constructor(

    @InjectQueue('cart-queue') private cartQueue: Queue,

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
  ) {}

  async getCount() {
    const organization = await this.contextService.currentOrganization();

    const cart = await this.cartRepo.find({
      where: {
        organization: { id: organization.id },
      },
    });

    if (!cart) {
      return { data: 0 };
    }

    const count = await this.cartItemRepo.count({
      where: {
        cart: { id: In(cart.map((cart) => cart.id)) },
      },
    });

    return { data: count };
  }

  // api get cart
  // make new one without merchant slug
  async getCarts({ page, limit }: GetCartQueryDto) {
    const skip = (page - 1) * limit || 0;
    const take = limit || 10;

    const organization = await this.contextService.currentOrganization();

    const allCartOfOrganization = await this.cartRepo.find({
      where: {
        organization: { id: organization.id },
      },
      relations: [
        'merchant',
        'merchant.merchantLogo',
        'merchant.merchantLogo.imageUpload',
        'merchant.organization',
      ],
      take,
      skip,
    });

    const carts = await Promise.all(
      allCartOfOrganization.map(async (cart) => {
        const cartWithCartItem = await this.getCartItemsByCartId({
          cartId: cart.id,
        });

        cartWithCartItem.merchant = {
          id: cart.merchant?.id,
          name: cart.merchant?.merchantName,
          logo: cart.merchant?.merchantLogo?.imageUpload?.url,
          organizeName: cart.merchant?.organization?.organizeName,
        };

        return cartWithCartItem;

        // return {
        //   cartId: cartItems.data.id,
        //   merchant: {
        //     name: cart.merchant?.companyName,
        //     logo: cart.merchant?.merchantLogo?.imageUpload?.url,
        //     organizeName: cart.merchant?.organization?.organizeName
        //   },
        //   cartItems: cartItems.data.cartItems,
        //   meta: cartItems.meta
        // };
      }),
    );

    // TODO: add merchant data
    // TEMP: Return item for look one result
    return carts;
  }

  public async getCartItemsByCartId({
    cartId,
    page = 1,
    limit = 5,
  }: {
    cartId: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const skip = (page - 1) * limit;
    const take = limit;

    // const [merchant, organization] = await Promise.all([this.contextService.currentMerchantOnSlug(), this.contextService.currentOrganization()]);

    // TODO: Implement later
    // const getActiveFlashSale = await this.flashSalePublicService.getActiveFlashSale();
    const getActiveFlashSale = false;

    const c = await this.cartRepo.findOne({
      where: {
        id: cartId,
      },
    });

    if (!c) {
      return [];
      // return {data: [],meta: {
      //   currentPage: page,
      //   itemCount: 0,
      //   totalItems: 0,
      //   totalPages: 0
      // }}
    }

    const [ci, count] = await this.cartItemRepo.findAndCount({
      where: {
        cart: { id: c.id },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'productItem',
        'productItem.product',
        'productItem.product.productTranslations',
        'productItem.productDiscount',
        'productItem.productBigUnitDiscount',
        'productItem.stock',
        'productItem.product.productImages',
        'productItem.product.productImages.imageUpload',
        'productItem.product.productPrimaryOption',
        'productItem.product.productSecondaryOption',
        'productItem.product.productItems',
        'productItem.product.productItems.productDiscount',
        'productItem.product.productItems.productBigUnitDiscount',
        'productItem.product.productItems.stock',
        'productItem.product.productItems.imageUpload',
      ],
      skip,
      take,
    });

    const cart = {
      ...c,
      cartItems: ci,
    };

    const cartData = cart?.cartItems?.map(async (cartItem) => {
      return {
        ...cartItem,
        productItem: {
          ...cartItem?.productItem,
          product: cartItem?.productItem?.product
            ? await getByIdWithTranslation({
                id: cartItem?.productItem?.product?.id,
                parent: cartItem?.productItem?.product,
                parentRepoClass: this.productRepo,
                parentDtoClass: ProductDto,
                childRepoClass: this.productTranslationRepo,
                parentKeyForGetChild: 'product',
                locale: this.contextService.currentLang,
                relations: ['productImages', 'productImages.imageUpload'],
                nestedParentChildWithTranslation: [],
              })
            : null,
        },
      };
    });

    const cartItems = await Promise.all(cartData).then((values) => {
      return values;
    });

    let data = {};
    if (getActiveFlashSale) {
      // TODO : Uncomment after implement flash sale above
      // let flashSaleItems = [];
      // (getActiveFlashSale?.productFlashSales || []).forEach(
      //   (productFlashSale) => {
      //     productFlashSale.productFlashSaleItems.forEach((item) => {
      //       flashSaleItems.push({ ...item });
      //     });
      //   }
      // );
      // const newCartItems = cartItems.map((item) => {
      //   const checkFlashSale = flashSaleItems.find((flashSaleItem) => {
      //     return flashSaleItem?.productItem?.id === item?.productItem?.id;
      //   });
      //   return {
      //     ...item,
      //     productItem: {
      //       ...item.productItem,
      //       productDiscount: item.productItem?.productDiscount
      //         ? {
      //             ...item.productItem.productDiscount,
      //             id: item.productItem.productDiscount?.id,
      //             unitType: checkFlashSale?.price
      //               ? 'bath'
      //               : item.productItem?.productDiscount?.unitType,
      //             type: checkFlashSale?.price
      //               ? 'remain'
      //               : item.productItem?.productDiscount?.type,
      //             value:
      //               checkFlashSale?.price ||
      //               item.productItem?.productDiscount?.value
      //           }
      //         : {
      //             id: 999,
      //             unitType: 'bath',
      //             type: 'remain',
      //             value: checkFlashSale?.price || item.productItem?.price
      //           },
      //       productBigUnitDiscount: item.productItem?.productBigUnitDiscount
      //         ? {
      //             ...item.productItem.productBigUnitDiscount,
      //             id: item.productItem.productBigUnitDiscount?.id,
      //             unitType: checkFlashSale?.bigUnitPrice
      //               ? 'bath'
      //               : item.productItem?.productBigUnitDiscount?.unitType,
      //             type: checkFlashSale?.bigUnitPrice
      //               ? 'remain'
      //               : item.productItem?.productBigUnitDiscount?.type,
      //             value:
      //               checkFlashSale?.bigUnitPrice ||
      //               item.productItem?.productBigUnitDiscount?.value
      //           }
      //         : item.productItem?.bigUnitPrice
      //         ? {
      //             id: 999,
      //             unitType: 'bath',
      //             type: 'remain',
      //             value:
      //               checkFlashSale?.bigUnitPrice ||
      //               item.productItem?.bigUnitPrice
      //           }
      //         : undefined,
      //       flashSaleSmallUnit: checkFlashSale?.bigUnitPrice ? 'yes' : 'no',
      //       flashSaleBigUnit: checkFlashSale?.bigUnitPrice ? 'yes' : 'no'
      //     }
      //   };
      // });
      // data = {
      //   ...cart,
      //   cartItems: newCartItems
      // };
    } else {
      data = {
        ...cart,
        cartItems,
      };
    }

    const cartsData = CartDto.fromEntity(data);

    return cartsData;
  }

  // api update cart
  public async updateCartItem({
    id,
    dto,
    userId,
    i18n,
    m,
    c,
    fromQueue = false,
  }: {
    id: number;
    dto: CartItemDto;
    userId: any;
    i18n: I18nContext;
    m?: Merchant;
    c?: Customer;
    fromQueue?: boolean;
  }) {
    const merchant: Merchant = m
      ? m
      : await this.contextService.currentMerchantOnSlug();

    const organization: Organization = await this.contextService.currentOrganization();

    // const cartItem = await this.cartItemRepo.findOne({
    //   where: { id },
    //   relations: ['cart', 'cart.merchant', 'cart.organization'],
    // });
    // const { merchant, organization } = cartItem.cart;

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

      return cartItemUpdated;
    // }
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

  public async deleteCartItems(ids: number[]) {
    // Get cart items to find their carts before deletion
    const cartItems = await this.cartItemRepo.find({
      where: { id: In(ids) },
      relations: ['cart'],
    });

    // Extract unique cart IDs
    const cartIds = [...new Set(cartItems.map((item) => item.cart.id))];

    // Delete cart items
    await this.cartItemRepo.softDelete(ids);

    // Check each cart and delete if empty
    for (const cartId of cartIds) {
      const remainingItems = await this.cartItemRepo.count({
        where: { cart: { id: cartId } },
      });

      if (remainingItems === 0) {
        await this.cartRepo.softDelete(cartId);
      }
    }

    return { data: { deletedIds: ids } };
  }
}
