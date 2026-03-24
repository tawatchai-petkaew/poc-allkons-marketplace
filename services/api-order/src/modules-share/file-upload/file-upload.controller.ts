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
import { SentryInterceptor } from '../../sentry/sentry.interceptor';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { SetTypeToPermanentDto } from './dto/set-type-to-permanent.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@UseInterceptors(SentryInterceptor)
@Controller('file-upload')
@ApiTags('File Upload')
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.fileUploadService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
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
