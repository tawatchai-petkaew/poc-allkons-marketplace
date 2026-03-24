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
  Request,
  UseInterceptors
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { BannerMerchantService } from './banner-merchant.service';

import { BannerMerchantDto } from './dto/banner-merchant.dto';
import { BatchUpdateBannerMerchantDto } from './dto/batch-update-banner-merchant.dto';
import { CreateBannerMerchantDto } from './dto/create-banner-merchant.dto';
import { UpdateBannerMerchantDto } from './dto/update-banner-merchant.dto';

@Controller('banner-merchant')
export class BannerMerchantController {
  constructor(private readonly bannerMerchantService: BannerMerchantService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  showAll(): Promise<any> {
    return this.bannerMerchantService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseFilters(new HttpExceptionFilter())
  create(@Request() req, @Body() dto: CreateBannerMerchantDto): Promise<any> {
    return this.bannerMerchantService
      .create(dto, req.user.userId)
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
  @Post('batch')
  @UseFilters(new HttpExceptionFilter())
  createBatch(
    @Request() req,
    @Body() dto: BatchUpdateBannerMerchantDto
  ): Promise<any> {
    return this.bannerMerchantService
      .createBatchOrUpdate(dto, req.user.userId)
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
  show(@Param('id') id: string): Promise<BannerMerchantDto> {
    return this.bannerMerchantService.showById(+id).catch((err) => {
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
    @Body() dto: UpdateBannerMerchantDto
  ): Promise<BannerMerchantDto> {
    return this.bannerMerchantService
      .update(+id, dto, req.user.userId)
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
    return this.bannerMerchantService.delete(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
