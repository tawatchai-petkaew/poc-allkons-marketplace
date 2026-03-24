import {
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
  ParseBoolPipe,
  Res,
  UseInterceptors
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { I18n, I18nContext } from 'nestjs-i18n';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';

import { ArticleService } from './article.service';
import { ArticleDto } from './dto/article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  showAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query('name') name: string
  ): Promise<any> {
    return this.articleService.getAll(
      {
        page,
        limit
      },
      withPagination,
      name
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseFilters(new HttpExceptionFilter())
  create(
    @Request() req,
    @Body() dto: CreateArticleDto,
    @I18n() i18n: I18nContext
  ): Promise<any> {
    return this.articleService
      .create(dto, req.user.userId, i18n)
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
  show(@Param('id') id: string): Promise<ArticleDto> {
    return this.articleService.showById(+id).catch((err) => {
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
    @Body() dto: UpdateArticleDto,
    @I18n() i18n: I18nContext
  ): Promise<ArticleDto> {
    return this.articleService
      .update(+id, dto, req.user.userId, i18n)
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
    return this.articleService.delete(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message
        },
        HttpStatus.BAD_REQUEST
      );
    });
  }
}
