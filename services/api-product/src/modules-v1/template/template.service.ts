import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TemplateService {
  constructor() {}
  /**
   * Returns a StreamableFile for the product import template.
   * Path resolution works for both source (src/) and build (dist/)
   * assuming 'assets' are configured in nest-cli.json.
   */
  async getImportProductTemplateStream(): Promise<StreamableFile> {
    const fileName = 'Template_import_product.xlsx';
    // Navigate up from modules-v1/template to src (or dist) root, then to assets/templates
    const filePath = join(__dirname, '../../assets/templates', fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `Template file "${fileName}" not found at ${filePath}`,
      );
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }
}
