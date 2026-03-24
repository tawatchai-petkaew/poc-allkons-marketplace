import {
  Headers,
  Controller,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseFilters,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  UseInterceptors
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { I18n, I18nContext } from 'nestjs-i18n';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  showAll(
    @Query() query,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('fullName') fullName: string,
    @Query('tel') tel: string,
    @Headers('currentmerchantslug') currentmerchantslug: string,
    @Request() req
  ): Promise<any> {
    return this.customerService
      .getAll(
        {
          page,
          limit
        },
        currentmerchantslug,
        req.user.userId,
        withPagination,
        fullName,
        tel
      )
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message
          },
          HttpStatus.BAD_REQUEST
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseFilters(new HttpExceptionFilter())
  create(
    @Request() req,
    @Headers('currentmerchantslug') currentmerchantslug: string,
    @Body() dto: CreateCustomerDto,
    @I18n() i18n: I18nContext
  ): Promise<CustomerDto> {
    return this.customerService
      .create(dto, req.user.userId, currentmerchantslug, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message
          },
          HttpStatus.BAD_REQUEST
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cart')
  @UseFilters(new HttpExceptionFilter())
  createCustomerCart(@Param('id') id: string): Promise<any> {
    return this.customerService.createCustomerCart(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/user')
  @UseFilters(new HttpExceptionFilter())
  updateUserCustomer(@Param('id') id: string, @Body() dto: any): Promise<any> {
    return this.customerService
      .updateUserCustomer(+id, dto?.userId)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message
          },
          HttpStatus.BAD_REQUEST
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  show(@Param('id') id: string): Promise<CustomerDto> {
    return this.customerService.showById(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseFilters(new HttpExceptionFilter())
  update(
    @Request() req,
    @Param('id') id: string,
    @Headers('currentmerchantslug') currentmerchantslug: string,
    @Body() dto: UpdateCustomerDto,
    @I18n() i18n: I18nContext
  ): Promise<CustomerDto> {
    return this.customerService
      .update(+id, dto, req.user.userId, currentmerchantslug, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message
          },
          HttpStatus.BAD_REQUEST
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<UpdateResult> {
    return this.customerService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('manaulCreateCustomerWallet')
  @UseFilters(new HttpExceptionFilter())
  manaulCreateCustomerWallet(): Promise<any> {
    return this.customerService.manaulCreateCustomerWallet().catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/customerWallet')
  @UseFilters(new HttpExceptionFilter())
  getCustomerWallet(@Param('id') id: string) {
    return this.customerService.getCustomerWallet(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
