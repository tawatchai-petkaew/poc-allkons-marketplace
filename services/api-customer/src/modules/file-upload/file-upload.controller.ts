import {
  Controller,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { SetTypeToPermanentDto } from './dto/set-type-to-permanent.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Body() dto: CreateFileUploadDto) {
    const result = await this.fileUploadService.upload(
      file,
      dto.folderName,
      dto.type,
      dto.isPublic,
    );
    return result;
  }

  @UseGuards(ActJwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.fileUploadService.delete(+id);
  }

  @UseGuards(ActJwtGuard)
  @Delete(':id/destroy')
  destroy(@Param('id') id: string) {
    return this.fileUploadService.destroy(+id);
  }

  @ApiOkResponse({ description: 'Success' })
  @Put('set-type-permanent')
  async setTypeToPermanent(@Body() input: SetTypeToPermanentDto) {
    return this.fileUploadService.setTypeToPermanent(input.fileIds);
  }
}
