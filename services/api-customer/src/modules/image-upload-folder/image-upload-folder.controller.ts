import {
  Controller,
  UseFilters,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
  Param,
  HttpException,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';

import { ImageUploadFolderService } from './image-upload-folder.service';
import { CreateImageUploadFolderDto } from './dto/create-image-upload-folder.dto';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { UpdateImageUploadFolderDto } from './dto/update-image-upload-folder.dto';
import { ImageUploadFolderDto } from './dto/image-upload-folder.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { MerchantGuard } from '@/guard/merchant.guard';
import { CurrentMerchant } from '@/decorators/request.decorator';
import { RequestMerchant } from '@/types/request.types';

@Controller('image-upload-folder')
export class ImageUploadFolderController {
  constructor(
    private readonly imageUploadFolderService: ImageUploadFolderService,
  ) {}

  @UseGuards(ActJwtGuard)
  @Post()
  create(@Body() dto: CreateImageUploadFolderDto) {
    return this.imageUploadFolderService.create(dto).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Get()
  @UseFilters(new HttpExceptionFilter())
  showAll(@Query() params: any) {
    return this.imageUploadFolderService.showAll(params);
  }

  @UseGuards(ActJwtGuard)
  @Get('/withDeleted')
  @UseFilters(new HttpExceptionFilter())
  showAllWithDeleted(@Query() params: any) {
    return this.imageUploadFolderService.showAllWithDeleted(params);
  }

  @UseGuards(ActJwtGuard)
  @Put(':id')
  @UseFilters(new HttpExceptionFilter())
  update(
    @Param('id') id: string,
    @Body() dto: UpdateImageUploadFolderDto,
  ): Promise<ImageUploadFolderDto> {
    return this.imageUploadFolderService.update(+id, dto).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Delete(':id')
  @UseFilters(new HttpExceptionFilter())
  delete(@Param('id') id: string) {
    return this.imageUploadFolderService.delete(+id).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('showAllFolder')
  @UseFilters(new HttpExceptionFilter())
  showAllFolder(@CurrentMerchant() merchant: RequestMerchant) {
    return this.imageUploadFolderService.showAllFolder(merchant.id);
  }

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('showAllImages')
  showAllWithFolder(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('withPagination') withPagination: string,
    @Query(
      'folderIds',
      new ParseArrayPipe({
        optional: true,
        items: Number,
        separator: ',',
      }),
    )
    folderIds: Array<number>,
    @Query('merchantId') merchantId: string,
    @CurrentMerchant() merchant: RequestMerchant,
  ): Promise<any> {
    return this.imageUploadFolderService.showAllWithFolder(
      merchant.id,
      {
        page,
        limit,
      },
      withPagination,
      folderIds,
    );
  }
}
