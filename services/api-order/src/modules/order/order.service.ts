import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderType, OrderStatus } from '@/model/order.entity';
import { Repository } from 'typeorm';
import { CartItem } from '@/model/cart-item.entity';
import { Merchant } from '@/model';
import dayjs from 'dayjs';
import { SubOrder, SubOrderStatus } from '@/model/sub-order.entity';
import {
  DocumentType,
  SubOrderDocument,
} from '@/model/sub-order-document.entity';
import { OrderItem } from '@/model/order-item.entity';
import { Cart } from '@/model/cart.entity';
import { OrderPayment } from '@/model/order-payment.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RequestContextService } from '../request-context/request-context.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepo: Repository<OrderPayment>,
    private readonly requestContextService: RequestContextService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const merchant = await this.requestContextService.currentMerchantOnSlug();
    if (!merchant?.id) {
      throw new BadRequestException('merchant not found.');
    }

    if (!createOrderDto.deliveries?.length) {
      throw new BadRequestException('not deliveries length');
    }
    await this.checkPriceManipulate(createOrderDto, createOrderDto.cartId);

    const runningNumber = await this.genOrderNumber(merchant.id);

    const queryRunner = this.orderRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create order
      const payloadOrder = {
        number: runningNumber,
        status: OrderStatus.NEW,
        orderedAt: new Date(),
        orderType: OrderType.ONLY_PRODUCT,
        organizationId: createOrderDto.organizeId,
        cartId: createOrderDto.cartId,
        totalPrice: createOrderDto.totalPrice,
        totalDeliveryPrice: createOrderDto.totalDeliveryPrice,
        grandTotal: createOrderDto.grandTotal,
        deliveryType: createOrderDto.deliveryType,
        deliveryReceiveType: createOrderDto.deliveryReceiveType,
        merchantId: merchant.id,
        userId: createOrderDto.userId,
      };

      const order = queryRunner.manager.create(Order, payloadOrder);
      await queryRunner.manager.save(order);

      //create subOrder
      if (order.id && createOrderDto.deliveries?.length) {
        for (const [
          index,
          subOrderDto,
        ] of createOrderDto.deliveries.entries()) {
          const payloadSubOrder = {
            subOrderNumber: `${runningNumber}-${index + 1}`,
            status: SubOrderStatus.NEW,
            orderId: order.id,
            refPONumber: subOrderDto.refPONumber,
            deliveryDate: subOrderDto.deliveryDate,
            deliveryTime: subOrderDto.deliveryTime,
            deliveryNote: subOrderDto.deliveryNote,
            deliveryBy: subOrderDto.deliveryBy,
            receiverName: subOrderDto.address.shipping.receiverName,
            receiverPhone: subOrderDto.address.shipping.receiverPhone,
            projectName: subOrderDto.address.shipping.projectName,
            addressName: subOrderDto.address.shipping.addressName,
            address: subOrderDto.address.shipping.address,
            countryId: subOrderDto.address.shipping.countryId,
            provinceId: subOrderDto.address.shipping.provinceId,
            districtId: subOrderDto.address.shipping.districtId,
            subDistrictId: subOrderDto.address.shipping.subDistrictId,
            zipcodeId: subOrderDto.address.shipping.zipCodeId,
            remark: subOrderDto.address.shipping.remark,
          };
          const subOrder = queryRunner.manager.create(
            SubOrder,
            payloadSubOrder,
          );
          await queryRunner.manager.save(subOrder);

          // create subOrder documents
          if (subOrderDto.documents.po?.length) {
            for (const PO of subOrderDto.documents.po) {
              const payloadSubOrderDocument = {
                subOrderId: subOrder.id,
                documentType: DocumentType.PO,
                fileId: PO.fileId,
              };
              const subOrderDocument = queryRunner.manager.create(
                SubOrderDocument,
                payloadSubOrderDocument,
              );
              await queryRunner.manager.save(subOrderDocument);
            }
          }

          // create order_item
          if (subOrderDto.products?.length) {
            for (const item of subOrderDto.products) {
              const payloadOrderItem = {
                quantity: item.quantity,
                unit: item.unit.toString(),
                productItemId: item.productItemId,
                productItemName: item.productItemName,
                productItemImageUrl: item.productItemImageUrl,
                price: item.price,
                orderId: order.id,
                subOrderId: subOrder.id,
              };
              const orderItem = queryRunner.manager.create(
                OrderItem,
                payloadOrderItem,
              );
              await queryRunner.manager.save(orderItem);
            }
          }
        }
      }
      const productItemIds = createOrderDto.deliveries.reduce(
        (all, delivery) => [
          ...all,
          ...delivery.products.map((p) => p.productItemId),
        ],
        [] as number[],
      );

      if (productItemIds.length > 0) {
        await queryRunner.manager
          .getRepository(CartItem)
          .createQueryBuilder()
          .softDelete()
          .where('cartId = :cartId', { cartId: createOrderDto.cartId })
          .andWhere('productItemId IN (:...productItemIds)', { productItemIds })
          .execute();

        // Check if there are any cart items left (not soft deleted)
        const remainingItems = await queryRunner.manager
          .getRepository(CartItem)
          .createQueryBuilder('cartItem')
          .where('cartItem.cartId = :cartId', {
            cartId: createOrderDto.cartId,
          })
          .andWhere('cartItem.deletedAt IS NULL')
          .getCount();

        // If no items left, soft delete the cart itself
        if (remainingItems === 0) {
          await queryRunner.manager
            .getRepository(Cart)
            .createQueryBuilder()
            .softDelete()
            .where('id = :cartId', { cartId: createOrderDto.cartId })
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return order.id;
    } catch (error) {
      // rollback if error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release connection
      await queryRunner.release();
    }
  }

  async checkPriceManipulate(orderDto, cartId: number) {
    // Helper function to normalize numbers to a fixed number of decimal places
    function formatNumber(value: number, digits = 2): number {
      return Number(value.toFixed(digits));
    }

    const cart = await this.cartRepo
      .createQueryBuilder('cart')
      .where('cart.id = :cartId', { cartId })
      .andWhere('cart.deletedAt IS NULL')
      .getOne();

    if (!cart) {
      throw new BadRequestException(
        `Cart ${cartId} not found or already deleted`,
      );
    }

    // Query all cart items with product and discount information
    const cartItems = await this.cartItemRepo
      .createQueryBuilder('cart_item')
      .leftJoin('cart_item.productItem', 'product_item')
      .leftJoin('product_item.productDiscount', 'product_discount')
      .select('cart_item.productItemId', 'productItemId')
      .addSelect('cart_item.quantity', 'quantity')
      .addSelect(
        `
        CASE 
          WHEN product_discount.type = 'decrease' 
            THEN (product_item.price - product_discount.value) * cart_item.quantity
          WHEN product_discount.type = 'remain' 
            THEN product_discount.value * cart_item.quantity
          ELSE product_item.price * cart_item.quantity
        END
      `,
        'lineTotal',
      )
      .where('cart_item.cartId = :cartId', { cartId })
      .andWhere('cart_item.deletedAt IS NULL')
      .groupBy('cart_item.id')
      .addGroupBy('cart_item.productItemId')
      .addGroupBy('cart_item.quantity')
      .addGroupBy('product_item.id')
      .addGroupBy('product_discount.id')
      .getRawMany<{
        productItemId: number;
        quantity: number;
        lineTotal: string;
      }>();

    // Flatten all products from deliveries in payload
    const payloadProducts = orderDto.deliveries.flatMap(
      (delivery) => delivery.products,
    );

    // Merge products by productItemId (sum quantities)
    const mergedProducts = payloadProducts.reduce((acc, product) => {
      const existing = acc.find(
        (p) => p.productItemId === product.productItemId,
      );
      if (existing) {
        existing.quantity += product.quantity;
      } else {
        acc.push({ ...product });
      }
      return acc;
    }, [] as { productItemId: number; quantity: number; price: number }[]);

    const payloadProductIds = payloadProducts.map((p) => p.productItemId);

    // Calculate total price from cart
    const totalFromCart = cartItems
      .filter((item) => payloadProductIds.includes(item.productItemId))
      .reduce((sum, item) => sum + Number(item.lineTotal), 0);

    // Validate total price from payload against cart
    if (formatNumber(totalFromCart) !== formatNumber(orderDto.totalPrice)) {
      throw new BadRequestException(
        `Price mismatch: payload=${orderDto.totalPrice}, cart=${formatNumber(
          totalFromCart,
        )}`,
      );
    }

    // Validate that all payload products exist in cart and do not exceed cart quantities
    for (const product of mergedProducts) {
      const match = cartItems.find(
        (c) => c.productItemId === product.productItemId,
      );
      if (!match) {
        throw new BadRequestException(
          `Product ${product.productItemId} not found in cart`,
        );
      }
      if (product.quantity !== match.quantity) {
        throw new BadRequestException(
          `Quantity exceeded for product ${product.productItemId}: payload=${product.quantity}, cart=${match.quantity}`,
        );
      }
    }

    // Recalculate total price based on payload products
    const totalFromPayload = mergedProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const formattedPayloadTotal = formatNumber(orderDto.totalPrice);
    const formattedTotalFromPayload = formatNumber(totalFromPayload);

    if (formattedPayloadTotal !== formattedTotalFromPayload) {
      throw new BadRequestException(
        `Price mismatch in payload: totalPrice=${formattedPayloadTotal}, sum(products)=${formattedTotalFromPayload}`,
      );
    }

    return formatNumber(totalFromCart);
  }

  async genOrderNumber(merchantId: number) {
    const merchantDetail = await this.merchantRepo
      .createQueryBuilder('merchant')
      .select(['merchant.id', 'merchant.storeId'])
      .where('merchant.id = :merchantId', { merchantId })
      .getOne();

    if (!merchantDetail.id || !merchantDetail.storeId) {
      throw new BadRequestException(
        `Not found : ${!merchantDetail.id ? 'merchantId' : 'storeId'}`,
      );
    }
    const agentCode = String(merchantDetail.storeId).padStart(3, '0');
    const branchCode = String(merchantDetail.id).padStart(3, '0');
    const year = dayjs().format('YY');
    const month = dayjs().format('MM');
    const startWith = `QOAG-${agentCode}${branchCode}`;
    const endWith = `${year}${month}`;

    const lastOrder = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.number LIKE :prefix', { prefix: `${startWith}%${endWith}` })
      .orderBy('order.number', 'DESC')
      .getOne();

    let runningNumber = 1;

    if (lastOrder) {
      const raw = lastOrder.number.replace(startWith, '').replace(endWith, '');
      const lastRunning = parseInt(raw, 10);
      runningNumber = lastRunning + 1;
    }

    const runningStr = String(runningNumber).padStart(5, '0');

    const newOrderNumber = `${startWith}${runningStr}${endWith}`;

    return newOrderNumber;
  }

  async findAllOrder(
    userId: number,
    organizeId: number,
    {
      page = 1,
      pageLimit = 10,
      subOrderStatus,
      groupBy,
    }: {
      page?: number;
      pageLimit?: number;
      subOrderStatus?: string;
      groupBy: 'PAYMENT' | 'ORDER';
    },
  ) {
    const merchant = await this.requestContextService.currentMerchantOnSlug();

    if (!merchant?.id) {
      throw new BadRequestException('merchant not found.');
    }
    if (groupBy === 'ORDER') {
      const query = this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.subOrders', 'subOrder')
        .leftJoin('order.merchant', 'merchant')
        .leftJoin('merchant.store', 'store')
        .addSelect(['merchant.slug', 'store.storeBranchName'])
        .leftJoinAndSelect('subOrder.documents', 'document')
        .leftJoinAndSelect('document.file', 'file')
        .leftJoin('subOrder.orderItems', 'orderItem')
        .addSelect([
          'orderItem.id',
          'orderItem.quantity',
          'orderItem.unit',
          'orderItem.price',
          'orderItem.productItemId',
          'orderItem.productItemName',
          'orderItem.productItemImageUrl',
          'orderItem.orderItemType',
          'orderItem.orderId',
          'orderItem.subOrderId',
        ])
        .leftJoin('orderItem.productItem', 'productItem')
        .addSelect([
          'productItem.id',
          'productItem.price',
          'productItem.cost',
          'productItem.soldQuantity',
        ])
        .leftJoin('productItem.productDiscount', 'productDiscount')
        .addSelect([
          'productDiscount.id',
          'productDiscount.type',
          'productDiscount.unitType',
          'productDiscount.value',
        ])
        // Optimize these joins
        .leftJoin('subOrder.country', 'country')
        .addSelect(['country.name'])
        .leftJoin('subOrder.province', 'province')
        .addSelect(['province.name_th'])
        .leftJoin('subOrder.district', 'district')
        .addSelect(['district.name_th'])
        .leftJoin('subOrder.subDistrict', 'subDistrict')
        .addSelect([
          'subDistrict.name_th',
          'subDistrict.zip_code',
          'subDistrict.zipCodeId',
        ])
        .leftJoinAndSelect('subOrder.subOrderPayments', 'subOrderPayment')
        .leftJoinAndSelect('subOrderPayment.orderPayment', 'orderPayment')
        .where('order.userId = :userId', { userId })
        .andWhere('order.merchantId = :merchantId', { merchantId: merchant.id })
        .andWhere('order.organizationId = :organizeId', { organizeId })
        .orderBy('order.createdAt', 'DESC')
        .addOrderBy('subOrder.subOrderNumber', 'ASC')
        .skip((page - 1) * pageLimit)
        .take(pageLimit);

      if (subOrderStatus) {
        query.andWhere('subOrder.status = :status', { status: subOrderStatus });
      }

      const [orders, total] = await query.getManyAndCount();
      // orders.forEach((order) => {
      //   // console.log('order.subOrders ==>', order.subOrders);
      //   order.subOrders.forEach((so) => {
      //     console.log('so.subOrderPayments ==>', so.orderItems);
      //     so.orderItems.forEach((oi) => {
      //       console.log('oi.productItem ==>', oi.productItem);
      //     });
      //   });
      // });

      return {
        total,
        page,
        pageLimit,
        data: this.formatOrderData(orders),
      };
    } else if (groupBy === 'PAYMENT') {
      const query = this.orderPaymentRepo
        .createQueryBuilder('orderPayment')
        .leftJoinAndSelect('orderPayment.order', 'order')
        .leftJoinAndSelect('orderPayment.subOrderPayments', 'subOrderPayment')
        .leftJoinAndSelect('subOrderPayment.subOrder', 'subOrder')
        .leftJoin('subOrder.orderItems', 'orderItem')
        .addSelect([
          'orderItem.id',
          'orderItem.quantity',
          'orderItem.unit',
          'orderItem.price',
          'orderItem.productItemId',
          'orderItem.productItemName',
          'orderItem.productItemImageUrl',
          'orderItem.orderItemType',
          'orderItem.orderId',
          'orderItem.subOrderId',
        ])
        .leftJoin('orderItem.productItem', 'productItem')
        .leftJoin('productItem.productDiscount', 'productDiscount')
        .addSelect([
          'productDiscount.id',
          'productDiscount.type',
          'productDiscount.unitType',
          'productDiscount.value',
        ])
        .leftJoinAndSelect('subOrder.documents', 'document')
        .leftJoinAndSelect('document.file', 'file')
        .leftJoinAndSelect('subOrder.country', 'country')
        .leftJoinAndSelect('subOrder.province', 'province')
        .leftJoinAndSelect('subOrder.district', 'district')
        .leftJoinAndSelect('subOrder.subDistrict', 'subDistrict')
        .leftJoin('order.merchant', 'merchant')
        .leftJoin('merchant.store', 'store')
        .addSelect(['merchant.slug', 'store.storeBranchName'])
        .where('order.userId = :userId', { userId })
        .andWhere('order.merchantId = :merchantId', { merchantId: merchant.id })
        .andWhere('order.organizationId = :organizeId', { organizeId });

      if (subOrderStatus) {
        query.andWhere('subOrder.status = :status', { status: subOrderStatus });
      }
      query
        .orderBy('orderPayment.createdAt', 'DESC')
        .addOrderBy('subOrder.subOrderNumber', 'ASC')
        .skip((page - 1) * pageLimit)
        .take(pageLimit);

      const [orders, total] = await query.getManyAndCount();

      return {
        total,
        page,
        pageLimit,
        data: this.formatOrderPaymentData(orders),
      };
    }
  }

  async findOrderById(
    userId: number,
    organizeId: number,
    orderId: number,
    subOrderStatus?: string,
  ) {
    const merchant = await this.requestContextService.currentMerchantOnSlug();

    if (!merchant?.id) {
      throw new BadRequestException('merchant not found.');
    }
    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.subOrders', 'subOrder')
      .leftJoin('order.merchant', 'merchant')
      .leftJoin('merchant.store', 'store')
      .addSelect(['merchant.slug', 'store.storeBranchName'])
      .leftJoinAndSelect('subOrder.documents', 'document')
      .leftJoinAndSelect('document.file', 'file')
      .leftJoin('subOrder.orderItems', 'orderItem')
      .addSelect([
        'orderItem.id',
        'orderItem.quantity',
        'orderItem.unit',
        'orderItem.price',
        'orderItem.productItemId',
        'orderItem.productItemName',
        'orderItem.productItemImageUrl',
        'orderItem.orderItemType',
        'orderItem.orderId',
        'orderItem.subOrderId',
      ])
      .leftJoin('orderItem.productItem', 'productItem')
      .addSelect([
        'productItem.id',
        'productItem.price',
        'productItem.cost',
        'productItem.soldQuantity',
      ])
      .leftJoin('productItem.productDiscount', 'productDiscount')
      .addSelect([
        'productDiscount.id',
        'productDiscount.type',
        'productDiscount.unitType',
        'productDiscount.value',
      ])
      .leftJoinAndSelect('subOrder.country', 'country')
      .leftJoinAndSelect('subOrder.province', 'province')
      .leftJoinAndSelect('subOrder.district', 'district')
      .leftJoinAndSelect('subOrder.subDistrict', 'subDistrict')
      .leftJoinAndSelect('subOrder.subOrderPayments', 'subOrderPayment')
      .leftJoinAndSelect('subOrderPayment.orderPayment', 'orderPayment')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.userId = :userId', { userId })
      .andWhere('order.merchantId = :merchantId', { merchantId: merchant.id })
      .andWhere('order.organizationId = :organizeId', { organizeId });

    if (subOrderStatus) {
      query.andWhere('subOrder.status = :status', { status: subOrderStatus });
    }

    const order = await query.getOne();

    if (!order) {
      throw new BadRequestException('order not found.');
    }

    return this.formatOrderData(order);
  }

  private formatOrderData(orderOrOrders: any | any[]): any {
    const formatDocument = (doc: any) => ({
      ...doc,
      file: undefined,
      url: doc.file?.url,
      fileName: doc.file?.fileName,
    });

    const formatSubOrder = (so: any) => ({
      countryName: so.country?.name,
      provinceName: so.province?.name_th,
      districtName: so.district?.name_th,
      subDistrictName: so.subDistrict?.name_th,
      zipCode: so.subDistrict?.zip_code,
      zipcodeId: Number(so.subDistrict?.zipCodeId),
      ...so,
      country: undefined,
      province: undefined,
      district: undefined,
      subDistrict: undefined,
      subOrderPayments: undefined,
      documents: so.documents?.map(formatDocument) || [],
      orderItems: so.orderItems?.map((item: any) => ({ ...item })) || [],
      payment: { ...so.subOrderPayments?.[0]?.orderPayment },
    });

    const formatOrder = (order: any) => ({
      storeName: order.merchant.slug,
      merchantName: order.merchant.store.storeBranchName,
      ...order,
      subOrders: order.subOrders?.map(formatSubOrder) || [],
      merchant: undefined,
    });

    if (Array.isArray(orderOrOrders)) {
      return orderOrOrders.map(formatOrder);
    }

    return formatOrder(orderOrOrders);
  }

  private formatOrderPaymentData(orderPayment: any[]): any {
    const formatDocument = (doc: any) => ({
      ...doc,
      file: undefined,
      url: doc.file?.url,
      fileName: doc.file?.fileName,
    });

    const formatSubOrder = (so: any) => {
      return {
        countryName: so.subOrder.country?.name,
        provinceName: so.subOrder.province?.name_th,
        districtName: so.subOrder.district?.name_th,
        subDistrictName: so.subOrder.subDistrict?.name_th,
        zipCode: so.subOrder.subDistrict?.zip_code,
        orderPaymentId: so.subOrder.subOrderPayments?.[0]?.orderPayment?.id,
        paymentMethod:
          so.subOrder.subOrderPayments?.[0]?.orderPayment?.paymentMethod,
        payAmount: so.subOrder.subOrderPayments?.[0]?.orderPayment?.payAmount,
        paymentStatus: so.subOrder.subOrderPayments?.[0]?.orderPayment?.status,
        payTime: so.subOrder.subOrderPayments?.[0]?.orderPayment?.payTime,
        ...so.subOrder,
        country: undefined,
        province: undefined,
        district: undefined,
        subDistrict: undefined,
        subOrderPayments: undefined,
        documents: so.subOrder.documents?.map(formatDocument) || [],
        orderItems:
          so.subOrder.orderItems?.map((item: any) => ({ ...item })) || [],
      };
    };

    const formatOrder = (payment: any) => ({
      storeName: payment.order.merchant.slug,
      merchantName: payment.order.merchant.store.storeBranchName,
      ...payment.order,
      subOrders: payment.subOrderPayments?.map(formatSubOrder) || [],
      merchant: undefined,
      order: undefined,
      payment: { ...payment, order: undefined, subOrderPayments: undefined },
    });

    return orderPayment.map(formatOrder);
  }

  async getCount() {
    const [merchant, organize] = await Promise.all([
      this.requestContextService.currentMerchantOnSlug(),
      this.requestContextService.currentOrganization(),
    ]);

    const cacheKey = `order-counts:${merchant.id}:${organize.id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // old query
    // const counts = await this.orderRepo
    //   .createQueryBuilder('order')
    //   .leftJoinAndSelect('order.subOrders', 'subOrder')
    //   .andWhere('order.merchantId = :merchantId', { merchantId: merchant.id })
    //   .andWhere('order.organizationId = :organizeId', {
    //     organizeId: organize.id,
    //   })
    //   .groupBy('subOrder.status')
    //   .select('subOrder.status', 'status')
    //   .addSelect('COUNT(order.id)', 'count')
    //   .getRawMany();

    // new query
    const counts = await this.orderRepo.query(
      `
      SELECT
        so.status AS status,
        COUNT(so.id) AS count
      FROM sub_order so
      INNER JOIN "order" o ON o.id = so."orderId"
      WHERE o."merchantId" = $1
        AND o."organizationId" = $2
      GROUP BY so.status
      ORDER BY so.status;
      `,
      [merchant.id, organize.id],
    );

    await this.cacheManager.set(cacheKey, counts, 10000); // 10 seconds
    return counts;
  }
}
