import {
  Injectable,
  NotFoundException,
  StreamableFile,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync } from 'fs';
import { ImportProductBatch } from '@/model/import-product-batch.entity';
import {
  ImportProductItem,
  MatchStatus,
  ImportStatus,
  SaleStatus,
  ImportType,
  PriceType,
} from '@/model/import-product-item.entity';
import { generateThailandTimestamp, formatThaiDate } from '@/utils/utils';

@Injectable()
export class ExportMatchingResultService {
  private readonly logger = new Logger(ExportMatchingResultService.name);

  constructor(
    @InjectRepository(ImportProductBatch)
    private readonly batchRepository: Repository<ImportProductBatch>,
  ) {}

  /**
   * Export matching results to Excel file
   * Returns StreamableFile with Thai filename
   */
  async exportMatchingResultsToExcel(
    batchUuid: string,
    merchantId: number,
  ): Promise<{ file: StreamableFile; filename: string }> {
    const startTime = Date.now();

    // 1. Fetch batch with ownership verification
    const batch = await this.fetchBatchWithItems(batchUuid, merchantId);

    if (!batch) {
      throw new NotFoundException('Import batch not found');
    }

    if (batch.merchantId !== merchantId) {
      throw new ForbiddenException('Access denied to this batch');
    }

    // 2. Load template
    const templatePath = join(
      __dirname,
      '../../../assets/templates/Template_result_product_matching.xlsx',
    );

    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Template file not found at ${templatePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // 3. Populate all sheets
    this.populateProductImportSheet(workbook, batch.items);
    this.populateProductMatchedSheet(workbook, batch.items);
    this.populateProductSuggestSheet(workbook, batch.items);
    this.populateProductNotFoundSheet(workbook, batch.items);

    // 4. Generate buffer
    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;

    // 5. Generate filename
    const filename = this.generateExportFilename();

    const duration = Date.now() - startTime;
    this.logger.log(
      `Export completed for batch ${batchUuid}: ${batch.items.length} items in ${duration}ms`,
    );

    return {
      file: new StreamableFile(buffer),
      filename,
    };
  }

  /**
   * Fetch batch with all items and related data using eager loading
   */
  private async fetchBatchWithItems(
    batchUuid: string,
    merchantId: number,
  ): Promise<ImportProductBatch | null> {
    return await this.batchRepository.findOne({
      where: { uuid: batchUuid, merchantId },
      relations: [
        'items',
        'items.matchedProductVariant',
        'items.matchedProductVariant.product',
        'items.matchedProductVariant.product.brand',
      ],
      order: {
        items: {
          rowNo: 'ASC', // Maintain original order from Excel
        },
      },
    });
  }

  /**
   * Populate Sheet 1: Product Import (ALL items)
   */
  private populateProductImportSheet(
    workbook: ExcelJS.Workbook,
    items: ImportProductItem[],
  ): void {
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Sheet 1 (Product Import) not found in template');
    }

    // Freeze first 3 rows (headers)
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

    let rowIndex = 4; // Row 1-3 are headers
    let useWhiteBg = true; // Alternating colors start with white

    for (const item of items) {
      const row = worksheet.getRow(rowIndex);

      // Calculate price components for regular and special prices
      const regularPrices = this.calculatePriceComponents(
        item.priceType,
        item.regularPrice,
        item.vatPercent,
      );
      const specialPrices = this.calculatePriceComponents(
        item.priceType,
        item.specialPrice,
        item.vatPercent,
      );

      // Columns A-P (16 columns)
      row.values = [
        item.barcode || '', // A: Barcode
        item.brand || '', // B: Brand
        item.productName || '', // C: Product Name
        regularPrices.includeVat, // D: Price Include VAT
        regularPrices.excludeVat, // E: Price Exclude VAT
        regularPrices.vat, // F: Price VAT
        specialPrices.includeVat, // G: Special Price Include VAT
        specialPrices.excludeVat, // H: Special Price Exclude VAT
        specialPrices.vat, // I: Special Price VAT
        this.formatVat(item.vatPercent), // J: VAT Percent
        formatThaiDate(item.specialPriceStartDate), // K: Start Date
        this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // L: End Date
        this.formatRequirePriceInquiry(item.requirePriceInquiry), // M: Require Price Inquiry
        this.mapSaleStatusToThai(item.saleStatus), // N: Sale Status
        this.mapImportStatusToThai(item.importStatus), // O: Import Status
        this.mapImportTypeToThai(item.importType), // P: Import Type
      ];

      // Apply alternating row colors and borders
      this.applyRowStyling(row, useWhiteBg, 1, 16);
      this.applyCellBorders(row, 1, 16);

      rowIndex++;
      useWhiteBg = !useWhiteBg; // Toggle color
    }
  }

  /**
   * Populate Sheet 2: Product Matched (FOUND items only)
   */
  private populateProductMatchedSheet(
    workbook: ExcelJS.Workbook,
    items: ImportProductItem[],
  ): void {
    const worksheet = workbook.getWorksheet(2);
    if (!worksheet) {
      throw new Error('Sheet 2 (Product Matched) not found in template');
    }

    // Freeze first 3 rows (headers)
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

    const foundItems = items.filter(
      (item) => item.matchStatus === MatchStatus.FOUND,
    );

    let rowIndex = 4; // Row 1-3 are headers
    let useWhiteBg = true;

    for (const item of foundItems) {
      const row = worksheet.getRow(rowIndex);

      // Extract matched product data
      const matchedBarcode = item.matchedProductVariant?.barcode || '';
      const matchedBrand =
        item.matchedProductVariant?.product?.brand?.name || '';
      const matchedName = item.matchedProductVariant?.alias || '';

      // Calculate price components
      const regularPrices = this.calculatePriceComponents(
        item.priceType,
        item.regularPrice,
        item.vatPercent,
      );
      const specialPrices = this.calculatePriceComponents(
        item.priceType,
        item.specialPrice,
        item.vatPercent,
      );

      // Columns A-S (19 columns)
      row.values = [
        // User Input (A-C)
        item.barcode || '', // A
        item.brand || '', // B
        item.productName || '', // C
        // Matched Product (D-F)
        matchedBarcode, // D
        matchedBrand, // E
        matchedName, // F
        // Pricing & Status (G-S)
        regularPrices.includeVat, // G
        regularPrices.excludeVat, // H
        regularPrices.vat, // I
        specialPrices.includeVat, // J
        specialPrices.excludeVat, // K
        specialPrices.vat, // L
        this.formatVat(item.vatPercent), // M
        formatThaiDate(item.specialPriceStartDate), // N
        this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // O
        this.formatRequirePriceInquiry(item.requirePriceInquiry), // P
        this.mapSaleStatusToThai(item.saleStatus), // Q
        this.mapImportStatusToThai(item.importStatus), // R
        this.mapImportTypeToThai(item.importType), // S
      ];

      this.applyRowStyling(row, useWhiteBg, 1, 19);
      this.applyCellBorders(row, 1, 19);

      rowIndex++;
      useWhiteBg = !useWhiteBg;
    }
  }

  /**
   * Populate Sheet 3: Product Suggest (SIMILAR items with multiple rows per suggestion)
   */
  private populateProductSuggestSheet(
    workbook: ExcelJS.Workbook,
    items: ImportProductItem[],
  ): void {
    const worksheet = workbook.getWorksheet(3);
    if (!worksheet) {
      throw new Error('Sheet 3 (Product Suggest) not found in template');
    }

    // Freeze first 3 rows (headers)
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

    const similarItems = items.filter(
      (item) => item.matchStatus === MatchStatus.SIMILAR,
    );

    let rowIndex = 4; // Row 1-3 are headers
    let useWhiteBg = true;

    for (const item of similarItems) {
      // Calculate price components (same for all rows)
      const regularPrices = this.calculatePriceComponents(
        item.priceType,
        item.regularPrice,
        item.vatPercent,
      );
      const specialPrices = this.calculatePriceComponents(
        item.priceType,
        item.specialPrice,
        item.vatPercent,
      );

      // Check if user has already selected a product to import
      if (item.matchedProductVariant) {
        // SINGLE ROW: Show only the selected product
        const selectedProduct = item.matchedProductVariant;
        const row = worksheet.getRow(rowIndex);
        row.values = [
          item.barcode || '', // A: User barcode
          item.brand || '', // B: User brand
          item.productName || '', // C: User product name
          selectedProduct.barcode || '', // D: Selected product barcode
          selectedProduct.product?.brand?.name || '', // E: Selected product brand
          selectedProduct.alias || selectedProduct.product?.name || '', // F: Selected product name
          regularPrices.includeVat, // G
          regularPrices.excludeVat, // H
          regularPrices.vat, // I
          specialPrices.includeVat, // J
          specialPrices.excludeVat, // K
          specialPrices.vat, // L
          this.formatVat(item.vatPercent), // M
          formatThaiDate(item.specialPriceStartDate), // N
          this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // O
          this.formatRequirePriceInquiry(item.requirePriceInquiry), // P
          this.mapSaleStatusToThai(item.saleStatus), // Q
          this.mapImportStatusToThai(item.importStatus), // R
          this.mapImportTypeToThai(item.importType), // S
        ];

        this.applyRowStyling(row, useWhiteBg, 1, 19);
        this.applyCellBorders(row, 1, 19);
        rowIndex++;
        useWhiteBg = !useWhiteBg;
      } else {
        // No selected product - show suggestions
        const suggestions = item.suggestedProducts || [];

        if (suggestions.length === 0) {
          // No suggestions: create one row with empty suggestion columns
          const row = worksheet.getRow(rowIndex);
          row.values = [
            item.barcode || '', // A
            item.brand || '', // B
            item.productName || '', // C
            '', // D: Empty suggestion barcode
            '', // E: Empty suggestion brand
            '', // F: Empty suggestion name
            regularPrices.includeVat, // G
            regularPrices.excludeVat, // H
            regularPrices.vat, // I
            specialPrices.includeVat, // J
            specialPrices.excludeVat, // K
            specialPrices.vat, // L
            this.formatVat(item.vatPercent), // M
            formatThaiDate(item.specialPriceStartDate), // N
            this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // O
            this.formatRequirePriceInquiry(item.requirePriceInquiry), // P
            this.mapSaleStatusToThai(item.saleStatus), // Q
            this.mapImportStatusToThai(item.importStatus), // R
            this.mapImportTypeToThai(item.importType), // S
          ];

          this.applyRowStyling(row, useWhiteBg, 1, 19);
          this.applyCellBorders(row, 1, 19);
          rowIndex++;
          useWhiteBg = !useWhiteBg; // Toggle color for next item
        } else {
          // MULTIPLE ROWS: One row per suggestion
          // All rows for the same item get the SAME color
          for (const suggestion of suggestions) {
            const row = worksheet.getRow(rowIndex);
            row.values = [
              // User Input (A-C) - Same for all suggestion rows
              item.barcode || '', // A
              item.brand || '', // B
              item.productName || '', // C
              // Suggested Product (D-F) - Different per row
              suggestion.barcode || '', // D
              suggestion.brand || '', // E
              suggestion.name || '', // F
              // Pricing & Status (G-S) - Same for all suggestion rows
              regularPrices.includeVat, // G
              regularPrices.excludeVat, // H
              regularPrices.vat, // I
              specialPrices.includeVat, // J
              specialPrices.excludeVat, // K
              specialPrices.vat, // L
              this.formatVat(item.vatPercent), // M
              formatThaiDate(item.specialPriceStartDate), // N
              this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // O
              this.formatRequirePriceInquiry(item.requirePriceInquiry), // P
              this.mapSaleStatusToThai(item.saleStatus), // Q
              this.mapImportStatusToThai(item.importStatus), // R
              this.mapImportTypeToThai(item.importType), // S
            ];

            // Apply same color to all rows of this item
            this.applyRowStyling(row, useWhiteBg, 1, 19);
            this.applyCellBorders(row, 1, 19);
            rowIndex++;
          }
          // Toggle color only AFTER all suggestion rows for this item
          useWhiteBg = !useWhiteBg;
        }
      }
    }
  }

  /**
   * Populate Sheet 4: Product Not Found (NOT_FOUND items)
   */
  private populateProductNotFoundSheet(
    workbook: ExcelJS.Workbook,
    items: ImportProductItem[],
  ): void {
    const worksheet = workbook.getWorksheet(4);
    if (!worksheet) {
      throw new Error('Sheet 4 (Product Not Found) not found in template');
    }

    // Freeze first 3 rows (headers)
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];

    const notFoundItems = items.filter(
      (item) => item.matchStatus === MatchStatus.NOT_FOUND,
    );

    let rowIndex = 4; // Row 1-3 are headers
    let useWhiteBg = true;

    for (const item of notFoundItems) {
      // Calculate price components (same for all rows)
      const regularPrices = this.calculatePriceComponents(
        item.priceType,
        item.regularPrice,
        item.vatPercent,
      );
      const specialPrices = this.calculatePriceComponents(
        item.priceType,
        item.specialPrice,
        item.vatPercent,
      );

      // Check if user has selected a product from admin suggestions
      if (item.matchedProductVariant) {
        // CASE 3: SINGLE ROW - Show only the selected product
        const selectedProduct = item.matchedProductVariant;
        const row = worksheet.getRow(rowIndex);
        row.values = [
          // User Input (A-C)
          item.barcode || '', // A
          item.brand || '', // B
          item.productName || '', // C
          // Reason (D)
          item.reason || '', // D
          // Admin suggested product (E-G)
          selectedProduct.barcode || '', // E
          selectedProduct.product?.brand?.name || '', // F
          selectedProduct.alias || selectedProduct.product?.name || '', // G
          // Pricing & Status (H-T)
          regularPrices.includeVat, // H
          regularPrices.excludeVat, // I
          regularPrices.vat, // J
          specialPrices.includeVat, // K
          specialPrices.excludeVat, // L
          specialPrices.vat, // M
          this.formatVat(item.vatPercent), // N
          formatThaiDate(item.specialPriceStartDate), // O
          this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // P
          this.formatRequirePriceInquiry(item.requirePriceInquiry), // Q
          this.mapSaleStatusToThai(item.saleStatus), // R
          this.mapImportStatusToThai(item.importStatus), // S
          this.mapImportTypeToThai(item.importType), // T
        ];

        this.applyRowStyling(row, useWhiteBg, 1, 20);
        this.applyCellBorders(row, 1, 20);
        rowIndex++;
        useWhiteBg = !useWhiteBg;
      } else {
        // No selected product - check for admin suggestions
        const suggestions = item.suggestedProducts || [];

        if (suggestions.length === 0) {
          // CASE 1: No suggestions from admin - show 1 row with empty admin columns
          const row = worksheet.getRow(rowIndex);
          row.values = [
            // User Input (A-C)
            item.barcode || '', // A
            item.brand || '', // B
            item.productName || '', // C
            // Reason (D)
            item.reason || '', // D
            // Empty admin columns (E-G)
            '', // E
            '', // F
            '', // G
            // Pricing & Status (H-T)
            regularPrices.includeVat, // H
            regularPrices.excludeVat, // I
            regularPrices.vat, // J
            specialPrices.includeVat, // K
            specialPrices.excludeVat, // L
            specialPrices.vat, // M
            this.formatVat(item.vatPercent), // N
            formatThaiDate(item.specialPriceStartDate), // O
            this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // P
            this.formatRequirePriceInquiry(item.requirePriceInquiry), // Q
            this.mapSaleStatusToThai(item.saleStatus), // R
            this.mapImportStatusToThai(item.importStatus), // S
            this.mapImportTypeToThai(item.importType), // T
          ];

          this.applyRowStyling(row, useWhiteBg, 1, 20);
          this.applyCellBorders(row, 1, 20);
          rowIndex++;
          useWhiteBg = !useWhiteBg;
        } else {
          // CASE 2: MULTIPLE ROWS - One row per admin suggestion
          // All rows for the same item get the SAME color
          for (const suggestion of suggestions) {
            const row = worksheet.getRow(rowIndex);
            row.values = [
              // User Input (A-C) - Same for all suggestion rows
              item.barcode || '', // A
              item.brand || '', // B
              item.productName || '', // C
              // Reason (D) - Same for all rows
              item.reason || '', // D
              // Admin Suggested Product (E-G) - Different per row
              suggestion.barcode || '', // E
              suggestion.brand || '', // F
              suggestion.name || '', // G
              // Pricing & Status (H-T) - Same for all suggestion rows
              regularPrices.includeVat, // H
              regularPrices.excludeVat, // I
              regularPrices.vat, // J
              specialPrices.includeVat, // K
              specialPrices.excludeVat, // L
              specialPrices.vat, // M
              this.formatVat(item.vatPercent), // N
              formatThaiDate(item.specialPriceStartDate), // O
              this.formatSpecialPriceEndDate(item.specialPriceStartDate, item.specialPriceEndDate), // P
              this.formatRequirePriceInquiry(item.requirePriceInquiry), // Q
              this.mapSaleStatusToThai(item.saleStatus), // R
              this.mapImportStatusToThai(item.importStatus), // S
              this.mapImportTypeToThai(item.importType), // T
            ];

            // Apply same color to all rows of this item
            this.applyRowStyling(row, useWhiteBg, 1, 20);
            this.applyCellBorders(row, 1, 20);
            rowIndex++;
          }
          // Toggle color only AFTER all suggestion rows for this item
          useWhiteBg = !useWhiteBg;
        }
      }
    }
  }

  /**
   * Calculate price components (includeVat, excludeVat, vat) from stored price
   * Based on logic from import-merchant-product.service.ts lines 605-674
   */
  private calculatePriceComponents(
    priceType: PriceType | null,
    price: number | null,
    vatPercent: number | null,
  ): { includeVat: string; excludeVat: string; vat: string } {
    if (price === null || price === undefined) {
      return { includeVat: '', excludeVat: '', vat: '' };
    }

    // NonVat case
    if (vatPercent === null || vatPercent === undefined) {
      const formatted = price.toFixed(2);
      return {
        includeVat: formatted,
        excludeVat: formatted,
        vat: '', // VAT is 0 for non-VAT items
      };
    }

    const vatMultiplier = 1 + vatPercent / 100;

    if (priceType === PriceType.INVAT) {
      // Price given is INCLUSIVE of VAT
      const includeVat = price;
      const excludeVat = price / vatMultiplier;
      const vat = includeVat - excludeVat;
      return {
        includeVat: includeVat.toFixed(2),
        excludeVat: excludeVat.toFixed(2),
        vat: vat.toFixed(2),
      };
    } else {
      // Price given is EXCLUSIVE of VAT (default)
      const excludeVat = price;
      const includeVat = price * vatMultiplier;
      const vat = includeVat - excludeVat;
      return {
        includeVat: includeVat.toFixed(2),
        excludeVat: excludeVat.toFixed(2),
        vat: vat.toFixed(2),
      };
    }
  }

  /**
   * Map ImportStatus enum to Thai text
   */
  private mapImportStatusToThai(status: ImportStatus | null): string {
    if (!status) return '';

    const statusMap: Record<ImportStatus, string> = {
      [ImportStatus.PENDING]: 'รอนำเข้า',
      [ImportStatus.PENDING_ADMIN]: 'รอแอดมินตรวจสอบ',
      [ImportStatus.IMPORTING]: 'ระบบกำลังนำเข้า',
      [ImportStatus.COMPLETED]: 'นำเข้าสำเร็จ',
      [ImportStatus.FAILED]: 'นำเข้าไม่สำเร็จ',
      [ImportStatus.REJECTED]: 'ปฏิเสธ',
    };

    return statusMap[status] || '';
  }

  /**
   * Map SaleStatus enum to Thai text
   */
  private mapSaleStatusToThai(status: SaleStatus | null): string {
    if (!status) return '';

    const statusMap: Record<SaleStatus, string> = {
      [SaleStatus.SELLING]: 'ขายอยู่',
      [SaleStatus.HIDDEN]: 'ไม่แสดง',
    };

    return statusMap[status] || '';
  }

  /**
   * Map ImportType enum to Thai text
   */
  private mapImportTypeToThai(type: ImportType | null): string {
    if (!type) return '';

    const typeMap: Record<ImportType, string> = {
      [ImportType.CREATE]: 'เพิ่มใหม่',
      [ImportType.UPDATE]: 'แก้ไข',
    };

    return typeMap[type] || '';
  }

  /**
   * Format VAT percentage to Thai text or number string
   */
  private formatVat(vatPercent: number | null | undefined): string {
    if (vatPercent === null || vatPercent === undefined) {
      return 'ยกเว้นภาษี';
    }
    return String(Math.round(vatPercent));
  }

  /**
   * Format boolean requirePriceInquiry to Y/N
   */
  private formatRequirePriceInquiry(value: boolean | null | undefined): string {
    return value ? 'Y' : 'N';
  }

  /**
   * Format special price end date
   * If start date exists but end date is null, return 'ไม่มีวันที่สิ้นสุด' (no end date)
   * Otherwise return formatted date or empty string
   */
  private formatSpecialPriceEndDate(
    startDate: Date | null | undefined,
    endDate: Date | null | undefined,
  ): string {
    // If there's a start date but no end date, it means indefinite
    if (startDate && !endDate) {
      return 'ไม่มีวันที่สิ้นสุด';
    }
    // Otherwise format the end date normally
    return formatThaiDate(endDate);
  }

  /**
   * Apply alternating row background colors (white or light blue) and vertical alignment
   */
  private applyRowStyling(
    row: ExcelJS.Row,
    useWhiteBg: boolean,
    startCol: number,
    endCol: number,
  ): void {
    const bgColor = useWhiteBg ? 'FFFFFFFF' : 'FFDDEBF7';

    for (let col = startCol; col <= endCol; col++) {
      const cell = row.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      // Set vertical alignment to bottom
      cell.alignment = {
        vertical: 'bottom',
      };
    }
  }

  /**
   * Apply consistent borders to all cells in a row
   */
  private applyCellBorders(
    row: ExcelJS.Row,
    startCol: number,
    endCol: number,
  ): void {
    for (let col = startCol; col <= endCol; col++) {
      const cell = row.getCell(col);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    }
  }

  /**
   * Generate export filename with format: SummaryProductMatching_YYMMDDHHMMSS.xlsx
   */
  private generateExportFilename(): string {
    const timestamp = generateThailandTimestamp();
    return `SummaryProductMatching_${timestamp}.xlsx`;
  }
}
