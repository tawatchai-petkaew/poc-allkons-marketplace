import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrderPaymentDto } from './dto/order-payment-dto';
import { UpdateOrderPaymentDto } from './dto/update-order-payment.dto';
import { CreatePaymentSlipDto } from './dto/create-payment-slip.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import {
  OrderPaymentResponseDto,
  OrderPaymentSlipResponseDto,
  UpdateOrderPaymentResponseDto,
} from './dto/order-payment-response-dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createOrderPayment(
    @Body() orderPaymentDto: OrderPaymentDto,
  ): Promise<{ data: OrderPaymentResponseDto }> {
    return this.paymentService.createOrderPayment(orderPaymentDto);
  }

  @Put(':id')
  async updateOrderPayment(
    @Body() orderPaymentDto: UpdateOrderPaymentDto,
    @Param('id') id: number,
  ): Promise<{ data: UpdateOrderPaymentResponseDto }> {
    return this.paymentService.updateOrderPayment(orderPaymentDto, id);
  }

  @Post('slip')
  async createPaymentSlip(
    @Body() createPaymentSlipDto: CreatePaymentSlipDto,
  ): Promise<{ data: OrderPaymentSlipResponseDto[] }> {
    return this.paymentService.createPaymentSlip(createPaymentSlipDto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ data: OrderPaymentResponseDto }> {
    return this.paymentService.findOne(id);
  }
}
