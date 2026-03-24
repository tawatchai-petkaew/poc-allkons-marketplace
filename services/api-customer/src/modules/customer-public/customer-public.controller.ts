import {
  Controller,
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
  UseInterceptors,
  UploadedFile,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateResult } from 'typeorm';
import { I18n, I18nContext } from 'nestjs-i18n';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { CustomerPublicService } from './customer-public.service';
import { CustomerAddressDto } from './dto/customer-address.dto';
import { CustomerDto } from './dto/customer.dto';
import { SetTelCustomerDto } from './dto/set-tel-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';

@Controller('customer-public')
export class CustomerPublicController {
  constructor(private readonly customerPublicService: CustomerPublicService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  get(): Promise<any> {
    return this.customerPublicService.get().catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new HttpExceptionFilter())
  update(
    @Body() dto: UpdateCustomerDto,
    @UploadedFile() file,
    @I18n() i18n: I18nContext,
  ): Promise<CustomerDto> {
    return this.customerPublicService.update(dto, file, i18n).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('setTelCustomer')
  @UseFilters(new HttpExceptionFilter())
  setTelCustomer(
    @Body() dto: SetTelCustomerDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return this.customerPublicService.setTelCustomer(dto, i18n).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('customerAddress')
  @UseFilters(new HttpExceptionFilter())
  getCustomerAddresses(): Promise<any> {
    return this.customerPublicService.getCustomerAddresses().catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('deleteCustomer')
  @UseFilters(new HttpExceptionFilter())
  deleteCustomer(): Promise<any> {
    return this.customerPublicService.deleteAccount().catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('customerWallet')
  @UseFilters(new HttpExceptionFilter())
  getCustomerWallet(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('type') type: string,
  ) {
    return this.customerPublicService
      .getCustomerWallet(
        {
          page,
          limit,
        },
        withPagination,
        type,
      )
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get('customerAddress/:id')
  @UseFilters(new HttpExceptionFilter())
  getCustomerAddress(@Param('id') id: string): Promise<any> {
    return this.customerPublicService.getCustomerAddress(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('customerAddress')
  @UseFilters(new HttpExceptionFilter())
  createCustomerAddress(
    @Body() dto: CreateCustomerAddressDto,
  ): Promise<CustomerDto> {
    return this.customerPublicService
      .createCustomerAddress(dto)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Put('customerAddress/:id')
  @UseFilters(new HttpExceptionFilter())
  updateCustomerAddress(
    @Param('id') id: string,
    @Body() dto: CustomerAddressDto,
  ): Promise<CustomerDto> {
    return this.customerPublicService
      .updateCustomerAddress(+id, dto)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('customerAddress/:id')
  delete(@Param('id') id: string): Promise<UpdateResult> {
    return this.customerPublicService.deleteCustomerAddress(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customerCreditCard')
  @UseFilters(new HttpExceptionFilter())
  getCustomerCreditCards(): Promise<any> {
    return this.customerPublicService.getCustomerCreditCards().catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('customerCreditCard/:id')
  @UseFilters(new HttpExceptionFilter())
  getCustomerCreditCard(@Param('id') id: string): Promise<any> {
    return this.customerPublicService
      .getCustomerCreditCard(+id)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post('customerCreditCard')
  @UseFilters(new HttpExceptionFilter())
  createCustomerCreditCard(
    @Body() dto: string,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return this.customerPublicService
      .createCustomerCreditCard(dto, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Put('customerCreditCard/:id')
  @UseFilters(new HttpExceptionFilter())
  updateCustomerCreditCard(
    @Param('id') id: string,
    @Body() dto: string,
  ): Promise<CustomerDto> {
    return this.customerPublicService
      .updateCustomerCreditCard(+id, dto)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('customerCreditCard/:id')
  deleteCustomerCreditCard(@Param('id') id: string): Promise<string> {
    return this.customerPublicService.deleteCustomerCreditCard(+id);
  }
}
