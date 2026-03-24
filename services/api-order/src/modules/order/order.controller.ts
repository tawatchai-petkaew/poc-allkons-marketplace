import {
  Controller,
  Body,
  Request,
  Post,
  UseFilters,
  UseGuards,
  Response,
  BadRequestException,
  Get,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthCenterGuard } from '@/auth/jwt-auth.guard';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/get-order-response';

@Controller('order')
@ApiTags('Order')
@UseGuards(AuthCenterGuard)
@UseFilters(new HttpExceptionFilter())
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'order created successfully',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
    @Response() res,
  ) {
    const userId = req.user.userId;
    const organizeId = req.authPayload.organizeId;
    if (
      userId != createOrderDto.userId ||
      organizeId != createOrderDto.organizeId
    ) {
      throw new BadRequestException('User not authenticated.');
    }
    const orderId = await this.orderService.create(createOrderDto);
    return res.send({
      orderId,
      message: 'Order created successfully',
    });
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of orders' })
  async getCount() {
    return this.orderService.getCount();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orders with subOrders, documents, and items',
  })
  @ApiOkResponse({ type: OrderListResponseDto })
  async findAllOrder(
    @Query('page') page = 1,
    @Query('pageLimit') pageLimit = 10,
    @Query('subOrderStatus') subOrderStatus: string,
    @Query('groupBy') groupBy: 'PAYMENT' | 'ORDER' = 'ORDER',
    @Request() req,
  ) {
    const userId = req?.user?.userId;
    const organizeId = req.authPayload.organizeId;

    if (!userId || !organizeId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return await this.orderService.findAllOrder(userId, organizeId, {
      page: Number(page),
      pageLimit: Number(pageLimit),
      subOrderStatus,
      groupBy,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID with subOrders, documents, and items',
  })
  @ApiOkResponse({ type: OrderResponseDto })
  async getOrderById(
    @Param('id') orderId: number,
    @Request() req,
    @Query('subOrderStatus') subOrderStatus?: string,
  ) {
    const userId = req?.user?.userId;
    const organizeId = req.authPayload.organizeId;

    if (!userId || !organizeId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    return await this.orderService.findOrderById(
      userId,
      organizeId,
      orderId,
      subOrderStatus,
    );
  }
}
