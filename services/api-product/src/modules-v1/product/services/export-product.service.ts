import {
  Injectable,
  NotFoundException,
  StreamableFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync } from 'fs';
import { MerchantProduct } from '../../../model/merchant-product.entity';
import { MerchantProductEntityStatus } from '../../../model/merchant-product.entity';
import { Merchant } from '../../../model/merchant.entity';
import { ExportProductsFilterDto } from '../dto/export-products.dto';
import { generateThailandTimestampWithFullYear } from '@/utils/utils';

// Performance configuration for export
export const MAX_EXPORT_LIMIT = 10000; // Maximum products per export
export const CHUNK_SIZE = 1000; // Fetch products in chunks of 1000

@Injectable()
export class ExportProductService {
  private readonly logger = new Logger(ExportProductService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(MerchantProduct)
    private readonly merchantProductRepo: Repository<MerchantProduct>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
  ) {}

  /**
   * Export merchant products to Excel using the import template
   * Maximum limit: 10,000 products
   */
  async exportMerchantProductsToExcel(
    merchantId: number,
    filters: ExportProductsFilterDto,
  ): Promise<StreamableFile> {
    const startTime = Date.now();

    // Check product count for logging
    const totalCount = await this.getProductCount(merchantId, filters);

    // Check export limit
    if (totalCount > MAX_EXPORT_LIMIT) {
      throw new BadRequestException(
        `Export limit exceeded. Cannot export more than ${MAX_EXPORT_LIMIT} products. Please use more specific filters to reduce the dataset size.`,
      );
    }

    // Log export start
    this.logger.log(
      `Starting export for merchant ${merchantId}: ${totalCount} products (using chunks of ${CHUNK_SIZE})`,
    );

    // Load template
    const fileName = 'Template_import_product.xlsx';
    // Navigate up from modules-v1/product/services to src (or dist) root, then to assets/templates
    const templatePath = join(__dirname, '../../../assets/templates', fileName);

    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Template file not found at ${templatePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Worksheet not found in template');
    }

    // Process products in chunks to reduce memory usage
    let rowIndex = 3; // Row 1 = headers, Row 2 = Thai descriptions
    let offset = 0;
    let processedCount = 0;

    while (offset < totalCount) {
      // Fetch chunk
      const chunk = await this.queryProductsChunk(
        merchantId,
        filters,
        offset,
        CHUNK_SIZE,
      );

      // Write chunk to Excel
      for (const product of chunk) {
        const row = worksheet.getRow(rowIndex);
        const rowData = this.mapProductToExcelRow(product, filters.priceType);

        row.values = [
          rowData.productBarcode,
          rowData.brand,
          rowData.productName,
          rowData.pricingTypes,
          rowData.regularPrice,
          rowData.specialPrice,
          rowData.vat,
          rowData.specialPriceStartDate,
          rowData.specialPriceEndDate,
          rowData.customersRequiredInquire,
          rowData.productStatus,
        ];

        // Apply borders to all cells in the row
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          };
        });

        rowIndex++;
        processedCount++;
      }

      // Log progress
      this.logger.log(
        `Processed ${processedCount}/${totalCount} products for merchant ${merchantId}`,
      );

      offset += CHUNK_SIZE;
    }

    // Generate buffer
    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;

    // Log completion time
    const duration = Date.now() - startTime;
    this.logger.log(
      `Export completed for merchant ${merchantId}: ${totalCount} products in ${duration}ms`,
    );

    return new StreamableFile(buffer);
  }

  /**
   * Generate export filename with store name, merchant name and timestamp
   * Format: สินค้าในสาขา(StoreName_BranchName)_yyyymmddhhmmss.xlsx
   */
  async generateExportFilename(merchantId: number): Promise<string> {
    // Fetch merchant name and store name
    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
      select: ['id', 'merchantName', 'storeId'],
      relations: ['store'],
    });

    const storeName = merchant?.store?.storeBranchName || 'Unknown';
    const branchName = merchant?.merchantName || 'Unknown';

    const timestamp = generateThailandTimestampWithFullYear();

    return `สินค้าในสาขา(${storeName}_${branchName})_${timestamp}.xlsx`;
  }

  /**
   * Get count of products that would be exported
   */
  private async getProductCount(
    merchantId: number,
    filters: ExportProductsFilterDto,
  ): Promise<number> {
    const queryBuilder = this.buildBaseQuery(merchantId, filters);
    return await queryBuilder.getCount();
  }

  /**
   * Build base query with filters (shared by count and fetch operations)
   */
  private buildBaseQuery(merchantId: number, filters: ExportProductsFilterDto) {
    const queryBuilder = this.merchantProductRepo
      .createQueryBuilder('mp')
      .leftJoin('mp.productVariant', 'pv')
      .leftJoin('pv.product', 'product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .where('mp.merchantId = :merchantId', { merchantId })
      .andWhere('mp.status = :status', {
        status: MerchantProductEntityStatus.ACTIVE,
      });

    // Search filter
    if (filters.search && filters.search.trim()) {
      const trimmedSearch = filters.search.trim();

      switch (filters.searchType) {
        case 'name':
          queryBuilder.andWhere('pv.alias ILIKE :searchLike', {
            searchLike: `%${trimmedSearch}%`,
          });
          break;

        case 'barcode':
          queryBuilder.andWhere('pv.barcode ILIKE :searchLike', {
            searchLike: `%${trimmedSearch}%`,
          });
          break;

        case 'all':
        default:
          queryBuilder.andWhere(
            '(pv.alias ILIKE :searchLike OR pv.sku ILIKE :searchLike OR pv.barcode ILIKE :searchLike OR brand.name ILIKE :searchLike)',
            {
              searchLike: `%${trimmedSearch}%`,
            },
          );
          break;
      }
    }

    // Category filter
    if (filters.categoryIds && filters.categoryIds.trim()) {
      const categoryIdsArray = filters.categoryIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      if (categoryIdsArray.length > 0) {
        queryBuilder.andWhere('category.id IN (:...categoryIds)', {
          categoryIds: categoryIdsArray,
        });
      }
    }

    // Product type filter
    if (filters.productTypeId) {
      queryBuilder.andWhere('mp.productTypeId = :productTypeId', {
        productTypeId: filters.productTypeId,
      });
    }

    // Merchant product status filter
    if (
      filters.merchantProductStatus &&
      filters.merchantProductStatus !== 'ALL'
    ) {
      queryBuilder.andWhere(
        'mp.merchantProductStatus = :merchantProductStatus',
        { merchantProductStatus: filters.merchantProductStatus },
      );
    }

    return queryBuilder;
  }

  /**
   * Query merchant products in chunks with filters
   * Fetches a specific chunk of products for memory-efficient processing
   */
  private async queryProductsChunk(
    merchantId: number,
    filters: ExportProductsFilterDto,
    offset: number,
    limit: number,
  ): Promise<MerchantProduct[]> {
    const queryBuilder = this.buildBaseQuery(merchantId, filters);

    // Add select for all needed fields
    queryBuilder.select([
      'mp.id',
      'mp.merchantCustomName',
      'mp.priceVat',
      'mp.priceVatPercent',
      'mp.priceExcludeVat',
      'mp.priceIncludeVat',
      'mp.specialPriceExcludeVat',
      'mp.specialPriceIncludeVat',
      'mp.specialPriceVat',
      'mp.merchantProductStatus',
      'mp.requirePriceInquiry',
      'mp.startDate',
      'mp.endDate',
      'mp.createdAt',
      'pv.id',
      'pv.barcode',
      'pv.alias',
      'product.id',
      'product.name',
      'brand.id',
      'brand.name',
      'category.id',
    ]);

    // Add ordering
    queryBuilder.orderBy('mp.createdAt', 'DESC');

    // Add pagination for chunk processing
    queryBuilder.skip(offset).take(limit);

    // Execute query
    return await queryBuilder.getMany();
  }

  /**
   * Map merchant product to Excel row data
   * @param merchantProduct The merchant product to map
   * @param queryPriceType Optional price type from query parameter ('InVAT' or 'ExVAT')
   */
  private mapProductToExcelRow(
    merchantProduct: MerchantProduct,
    queryPriceType?: string,
  ): ExcelRowData {
    // Use query price type if provided, otherwise determine from product data
    let pricingType: string = queryPriceType || 'ExVAT';

    // Get regular price based on pricing type
    const regularPrice =
      pricingType === 'InVAT'
        ? merchantProduct.priceIncludeVat
        : merchantProduct.priceExcludeVat;

    // Get special price based on pricing type
    const specialPrice =
      pricingType === 'InVAT'
        ? merchantProduct.specialPriceIncludeVat
        : merchantProduct.specialPriceExcludeVat;

    // If regularPrice is null/undefined, set pricingType to empty
    if (regularPrice === null || regularPrice === undefined) {
      pricingType = '';
    }

    // Format VAT percentage (empty if no price is set)
    const vat = pricingType
      ? this.formatVat(merchantProduct.priceVatPercent)
      : '';

    // Format dates
    const specialPriceStartDate = this.formatThaiDate(
      merchantProduct.startDate,
    );
    const specialPriceEndDate = this.formatThaiDate(merchantProduct.endDate);

    // Convert boolean to Y/N
    const customersRequiredInquire = merchantProduct.requirePriceInquiry
      ? 'Y'
      : 'N';

    // Map product status
    const productStatus = this.mapProductStatus(
      merchantProduct.merchantProductStatus,
    );

    return {
      productBarcode: merchantProduct.productVariant?.barcode?.trim() || '',
      brand: merchantProduct.productVariant?.product?.brand?.name?.trim() || '',
      productName: merchantProduct.productVariant?.alias?.trim() || '',
      pricingTypes: pricingType,
      regularPrice: regularPrice ? Number(regularPrice).toFixed(2) : '',
      specialPrice: specialPrice ? Number(specialPrice).toFixed(2) : '',
      vat,
      specialPriceStartDate: specialPriceStartDate || '',
      specialPriceEndDate: specialPriceEndDate || '',
      customersRequiredInquire,
      productStatus,
    };
  }

  /**
   * Determine pricing type based on which price field is populated
   */
  private determinePricingType(
    merchantProduct: MerchantProduct,
  ): 'InVAT' | 'ExVAT' | '' {
    // Always return 'ExVAT' if price exists, or empty string if no price set
    if (
      merchantProduct.priceExcludeVat !== null &&
      merchantProduct.priceExcludeVat !== undefined
    ) {
      return 'ExVAT';
    }
    return '';
  }

  /**
   * Format VAT percentage (0, 3, 7, or NonVat)
   * - Returns 'NonVat' if value is null/undefined
   * - Returns the number as integer string (0, 3, or 7) - removes decimals
   */
  private formatVat(vatPercent: number | null | undefined): string {
    if (vatPercent === null || vatPercent === undefined) {
      return 'NonVat';
    }
    // Return the VAT percentage as integer string (7.0000 -> "7")
    return String(Math.round(vatPercent));
  }

  /**
   * Format date to Thai date format (DD/MM/YYYY with Buddhist Era)
   * Buddhist Era = Gregorian year + 543
   */
  private formatThaiDate(date: Date | null | undefined): string | null {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // Convert to Buddhist Era

    return `${day}/${month}/${year}`;
  }

  /**
   * Map merchant product status to export format
   */
  private mapProductStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Selling';
    }
    // Return the status as-is (Selling, Hidden, OutOfStock, NotApproved)
    return status;
  }
}

/**
 * Interface for Excel row data
 */
interface ExcelRowData {
  productBarcode: string;
  brand: string;
  productName: string;
  pricingTypes: string;
  regularPrice: string;
  specialPrice: string;
  vat: string;
  specialPriceStartDate: string;
  specialPriceEndDate: string;
  customersRequiredInquire: string;
  productStatus: string;
}
