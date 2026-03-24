import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TemplateService } from './template.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

@Controller('v1/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get('import-product/download')
  @UseGuards(ActJwtGuard)
  async downloadProductTemplate(@Res() res: Response) {
    const streamableFile =
      await this.templateService.getImportProductTemplateStream();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="Template_import_product.xlsx"',
    });

    // Pipe the stream to the response object
    streamableFile.getStream().pipe(res);
  }
}
