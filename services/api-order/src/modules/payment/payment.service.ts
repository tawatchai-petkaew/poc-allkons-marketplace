import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderPayment, PaymentStatus } from '@/model/order-payment.entity';
import { SubOrderPayment } from '@/model/sub-order-payment.entity';
import { OrderPaymentSlip } from '@/model/order-payment-slip.entity';
import { DataSource, In, Repository } from 'typeorm';
import { OrderPaymentDto } from './dto/order-payment-dto';
import { Order, OrderStatus } from '@/model/order.entity';
import { SubOrder, SubOrderStatus } from '@/model/sub-order.entity';
import { UpdateOrderPaymentDto } from './dto/update-order-payment.dto';
import { CreatePaymentSlipDto } from './dto/create-payment-slip.dto';
import { FileUploadService } from '@/modules-share/file-upload/file-upload.service';
import {
  OrderPaymentResponseDto,
  OrderPaymentSlipResponseDto,
  SubOrderPaymentResponseDto,
  UpdateOrderPaymentResponseDto,
} from './dto/order-payment-response-dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { roundToTwo } from '@/utils/price.utils';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepo: Repository<OrderPayment>,
    @InjectRepository(SubOrderPayment)
    private readonly subOrderPaymentRepo: Repository<SubOrderPayment>,
    @InjectRepository(OrderPaymentSlip)
    private readonly orderPaymentSlipRepo: Repository<OrderPaymentSlip>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(SubOrder)
    private readonly subOrderRepo: Repository<SubOrder>,
    private readonly fileUploadService: FileUploadService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrderPayment(orderPaymentDto: OrderPaymentDto) {
    const [order, subOrders] = await Promise.all([
      this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItems')
        .where('order.id = :orderId', { orderId: orderPaymentDto.orderId })
        .andWhere('orderItems.subOrderId IN (:...ids)', {
          ids: orderPaymentDto.subOrderIds,
        })
        .getOne(),
      this.subOrderRepo.find({
        where: {
          id: In(orderPaymentDto?.subOrderIds),
          orderId: orderPaymentDto.orderId,
        },
      }),
    ]);

    const sumOrderItemsPrice = order.orderItems.reduce(
      (acc, orderItem) =>
        acc + roundToTwo(orderItem.price * orderItem.quantity),
      0,
    );

    if (roundToTwo(sumOrderItemsPrice) !== roundToTwo(orderPaymentDto.amount)) {
      throw new BadRequestException(
        'Order items price not match the pay amount',
      );
    }

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (subOrders.length !== orderPaymentDto.subOrderIds.length) {
      throw new NotFoundException('Some sub orders not found');
    }

    const { orderPayment, subOrderPayments } =
      await this.dataSource.transaction(async (manager) => {
        /// Create order payment
        const createOrderPaymentInput = this.orderPaymentRepo.create({
          orderId: orderPaymentDto.orderId,
          status: PaymentStatus.NEW,
          payAmount: orderPaymentDto.amount,
        });
        const orderPayment = await manager.save(createOrderPaymentInput);

        /// Update Order Status
        const updateOrderInput = this.orderRepo.create({
          ...order,
          status: OrderStatus.INPROGRESS,
        });
        await manager.save(updateOrderInput);

        /// Create Sub Order Payments
        const subOrderPaymentsInput = subOrders.map((subOrder) => {
          return this.subOrderPaymentRepo.create({
            subOrder: { id: subOrder.id },
            orderPaymentId: orderPayment.id,
          });
        });
        const subOrderPayments = await manager.save(subOrderPaymentsInput);

        /// Update Sub Order Statuses
        const updateSubOrdersInput = subOrders.map((subOrder) => {
          return this.subOrderRepo.create({
            ...subOrder,
            status: SubOrderStatus.PENDING_PAYMENT,
          });
        });
        await manager.save(updateSubOrdersInput);

        return { orderPayment, subOrderPayments };
      });

    const result = Object.assign(orderPayment, {
      subOrderPayments: subOrderPayments.map((subOrderPayment) =>
        plainToClass(SubOrderPaymentResponseDto, subOrderPayment),
      ),
    });

    return { data: plainToInstance(OrderPaymentResponseDto, result) };
  }

  async updateOrderPayment(
    updateOrderPaymentDto: UpdateOrderPaymentDto,
    id: number,
  ) {
    const orderPayment = await this.orderPaymentRepo.findOne({ where: { id } });

    if (!orderPayment) {
      throw new NotFoundException('Order payment not found');
    }

    const updateOrderPaymentInput = this.orderPaymentRepo.create({
      ...orderPayment,
      ...updateOrderPaymentDto,
    });

    const updatedOrderPayment = await this.orderPaymentRepo.save(
      updateOrderPaymentInput,
    );
    return {
      data: plainToInstance(UpdateOrderPaymentResponseDto, updatedOrderPayment),
    };
  }

  async createPaymentSlip(
    createPaymentSlipDto: CreatePaymentSlipDto,
  ): Promise<{ data: OrderPaymentSlipResponseDto[] }> {
    const { orderPaymentId, fileIds } = createPaymentSlipDto;
    if (fileIds.length === 0) {
      throw new BadRequestException('No slips to save');
    }

    const [files, orderPayment] = await Promise.all([
      this.fileUploadService.getFiles(fileIds),
      this.orderPaymentRepo.findOne({
        where: { id: orderPaymentId },
        relations: ['subOrderPayments'],
      }),
    ]);

    if (files.length !== fileIds.length) {
      throw new NotFoundException('Some files not found');
    }

    if (!orderPayment) {
      throw new NotFoundException('Order payment not found');
    }
    const orderPaymentSlips = await this.dataSource.transaction(
      async (manager) => {
        /// Create Order Payment Slips
        const orderPaymentSlipsInput = fileIds.map((fileId) => {
          return this.orderPaymentSlipRepo.create({
            orderPaymentId: orderPayment.id,
            fileUploadId: fileId,
          });
        });
        const createdSlips = await manager.save(orderPaymentSlipsInput);

        /// Update Order Payment Status
        const updateOrderPaymentInput = this.orderPaymentRepo.create({
          ...orderPayment,
          status: PaymentStatus.PENDING,
          payTime: new Date(),
        });
        await manager.save(updateOrderPaymentInput);

        /// Update Sub Order Statuses
        const updateSubOrdersInput = orderPayment.subOrderPayments.map(
          (subOrderPayment) => {
            return this.subOrderRepo.create({
              id: subOrderPayment.subOrderId,
              status: SubOrderStatus.PENDING_VERIFY,
            });
          },
        );
        await manager.save(updateSubOrdersInput);
        return createdSlips;
      },
    );

    return {
      data: plainToInstance(OrderPaymentSlipResponseDto, orderPaymentSlips),
    };
  }

  async findOne(id: number) {
    const orderPayment = await this.orderPaymentRepo.findOne({ where: { id } });
    if (!orderPayment) {
      throw new NotFoundException('Order payment not found');
    }
    return { data: plainToInstance(OrderPaymentResponseDto, orderPayment) };
  }
}
