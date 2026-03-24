import {
  Controller,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImageUploadService } from './image-upload.service';
import { CreateImageUploadDto } from './dto/create-image-upload.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
import { UpdateImageUploadDto } from './dto/update-image-upload.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

@Controller('image-upload')
export class ImageUploadController {
  constructor(private readonly imageUploadService: ImageUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Body() dto: CreateImageUploadDto) {
    const result = await this.imageUploadService
      .upload(file, dto)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });

    return result;
  }

  @UseGuards(ActJwtGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateImageUploadDto,
    @Headers('currentmerchantslug') currentmerchantslug: string,
  ): Promise<ImageUploadDto> {
    return this.imageUploadService
      .update(+id, dto, currentmerchantslug)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(ActJwtGuard)
  @Put(':id/restore')
  restore(
    @Param('id') id: string,
    @Body() dto: UpdateImageUploadDto,
    @Headers('currentmerchantslug') currentmerchantslug: string,
  ): Promise<ImageUploadDto> {
    return this.imageUploadService
      .restore(+id, dto, currentmerchantslug)
      .catch((err) => {
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
  delete(
    @Param('id') id: string,
    @Headers('currentmerchantslug') currentmerchantslug: string,
  ) {
    return this.imageUploadService
      .delete(+id, currentmerchantslug)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(ActJwtGuard)
  @Delete(':id/destroy')
  destroy(
    @Param('id') id: string,
    @Headers('currentmerchantslug') currentmerchantslug: string,
  ) {
    return this.imageUploadService
      .destroy(+id, currentmerchantslug)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }
}
