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

import { BannerPromotionService } from './banner-promotion.service';
import { BannerPromotionDto } from './dto/banner-promotion.dto';
import { BatchUpdateBannerPromotionDto } from './dto/batch-update-banner-promotion.dto';
import { CreateBannerPromotionDto } from './dto/create-banner-promotion.dto';
import { UpdateBannerPromotionDto } from './dto/update-banner-promotion.dto';

@Controller('banner-promotion')
export class BannerPromotionController {
  constructor(
    private readonly bannerPromotionService: BannerPromotionService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  showAll(): Promise<any> {
    return this.bannerPromotionService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseFilters(new HttpExceptionFilter())
  create(@Request() req, @Body() dto: CreateBannerPromotionDto): Promise<any> {
    return this.bannerPromotionService
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
    @Body() dto: BatchUpdateBannerPromotionDto
  ): Promise<any> {
    return this.bannerPromotionService
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
  show(@Param('id') id: string): Promise<BannerPromotionDto> {
    return this.bannerPromotionService.showById(+id).catch((err) => {
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
    @Body() dto: UpdateBannerPromotionDto
  ): Promise<BannerPromotionDto> {
    return this.bannerPromotionService
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
    return this.bannerPromotionService.delete(+id);
  }
}
