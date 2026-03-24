import { Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository, DataSource, In } from 'typeorm';
import { Queue } from 'bull';
import { ErrorHandler } from 'allkons-api-helper';
import { S3Service } from '@/modules-v1/s3/s3.service';
import {
  ImportProductBatch,
  ImportProductBatchStatus,
} from '@/model/import-product-batch.entity';
import {
  ImportProductItem,
  PriceType,
  SaleStatus,
  MatchStatus,
  ImportStatus,
  ImportType,
} from '@/model/import-product-item.entity';
import { DataSheet } from '../dto/extract-excel-response.dto';
import {
  StorageValidationData,
  StorageValidationRow,
  ImportItemData,
} from '../dto/storage-validation-data.dto';
import { ProductMatchingAdapterService } from './product-matching-adapter.service';
import { ImportMerchantProductService } from './import-merchant-product.service';
import { MasterSkuService } from './master-sku.service';
import { generateThailandTimestamp, formatThaiDate } from '@/utils/utils';
import { ProductMatchingJobData } from '../consumer/product-matching.consumer';
import { ImportItemJobData } from '../consumer/product-import.consumer';
import { PriceType as MerchantPriceType } from '../dto/add-products-to-merchant.dto';
import { Merchant } from '@/model/merchant.entity';

@Injectable()
export class ImportProductBatchService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
    private readonly matchingService: ProductMatchingAdapterService,
    private readonly importMerchantProductService: ImportMerchantProductService,
    @InjectRepository(ImportProductBatch)
    private readonly batchRepository: Repository<ImportProductBatch>,
    @InjectRepository(ImportProductItem)
    private readonly itemRepository: Repository<ImportProductItem>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectQueue('product-matching-queue')
    private readonly matchingQueue: Queue<ProductMatchingJobData>,
    @InjectQueue('product-import-queue')
    private readonly importQueue: Queue<ImportItemJobData>,
    private readonly masterSkuService: MasterSkuService,
  ) {}

  private readonly logger = new Logger(ImportProductBatchService.name);

  /**
   * Format Date object to DD/MM/YYYY (Buddhist Era) string
   * Uses utility formatThaiDate and converts empty string to null for backward compatibility
   */
  private formatThaiDateOnly(date: Date | null): string | null {
    const result = formatThaiDate(date);
    return result === '' ? null : result;
  }

  /**
   * Parse Thai date format (DD/MM/YYYY) with Buddhist Era year
   * Converts to JavaScript Date object with Gregorian calendar year
   * Note: Always converts Buddhist Era (พ.ศ.) to Gregorian (ค.ศ.) by subtracting 543
   */
  private parseThaiDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }

    // Handle Excel serial date (numeric value)
    if (!isNaN(Number(dateStr))) {
      const excelEpoch = new Date(1899, 11, 30);
      const days = Number(dateStr);
      const date = new Date(excelEpoch.getTime() + days * 86400000);
      return isNaN(date.getTime()) ? null : date;
    }

    // Parse DD/MM/YYYY format
    const parts = dateStr.trim().split('/');
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    // Validate parsed values
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    // Convert Buddhist Era (พ.ศ.) to Gregorian (ค.ศ.) - always subtract 543
    year = year - 543;

    // Create date (month is 0-indexed in JavaScript)
    const date = new Date(year, month - 1, day);

    // Validate the date is valid
    if (
      isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  }

  /**
   * Transform DataSheet to optimized storage format
   */
  private transformDataSheetToStorageFormat(
    dataSheets: DataSheet[],
  ): StorageValidationData {
    const rows: StorageValidationRow[] = [];

    // Assuming we only process the first sheet
    const sheet = dataSheets[0];
    if (!sheet || !sheet.rows) {
      return { rows: [] };
    }

    for (const row of sheet.rows) {
      // Create a map for quick column lookup
      const columnMap = new Map<string, any>();
      for (const col of row.columns) {
        columnMap.set(col.key, col.value);
      }

      // Helper to get column value
      const getColumnValue = (key: string): any => {
        const value = columnMap.get(key);
        return value === '' || value === undefined ? null : value;
      };

      // Parse and convert values to appropriate types
      const barcode = getColumnValue('ProductBarcode');
      const brand = getColumnValue('Brand');
      const productName = getColumnValue('ProductName');

      // Parse price type
      let priceType: PriceType | null = null;
      const priceTypeValue = getColumnValue('PricingTypes');
      if (priceTypeValue === 'InVAT' || priceTypeValue === 'INVAT') {
        priceType = PriceType.INVAT;
      } else if (priceTypeValue === 'ExVAT' || priceTypeValue === 'EXVAT') {
        priceType = PriceType.EXVAT;
      }

      // Parse prices
      const regularPriceStr = getColumnValue('RegularPrice');
      const regularPrice = regularPriceStr ? parseFloat(regularPriceStr) : null;

      const specialPriceStr = getColumnValue('SpecialPrice');
      const specialPrice = specialPriceStr ? parseFloat(specialPriceStr) : null;

      // Parse VAT
      const vatStr = getColumnValue('Vat');
      let vatPercent: number | null = null;

      if (vatStr !== null && vatStr !== undefined) {
        const vatStrTrimmed = String(vatStr).trim();

        // Handle "NonVat" case - set to null
        if (vatStrTrimmed.toLowerCase() === 'nonvat') {
          vatPercent = null;
        } else {
          // Try to parse as number (handles "7", "0", etc.)
          const parsedVat = parseFloat(vatStrTrimmed);
          vatPercent = isNaN(parsedVat) ? null : parsedVat;
        }
      }

      // Parse dates (Excel date or Thai date format DD/MM/YYYY)
      // Only parse dates if specialPrice is provided
      let specialPriceStartDate: Date | null = null;
      let specialPriceEndDate: Date | null = null;

      if (specialPrice !== null) {
        const specialPriceStartDateStr = getColumnValue(
          'SpecialPriceStartDate',
        );
        specialPriceStartDate = specialPriceStartDateStr
          ? this.parseThaiDate(specialPriceStartDateStr)
          : null;

        const specialPriceEndDateStr = getColumnValue('SpecialPriceEndDate');
        specialPriceEndDate = specialPriceEndDateStr
          ? this.parseThaiDate(specialPriceEndDateStr)
          : null;
      }

      // Parse boolean for require price inquiry
      const requirePriceInquiryStr = getColumnValue('CustomersRequiredInquire');
      const requirePriceInquiry =
        requirePriceInquiryStr === 'Y' || requirePriceInquiryStr === 'y';

      // Parse sale status
      let saleStatus: SaleStatus | null = null;
      const saleStatusValue = getColumnValue('ProductStatus');
      if (saleStatusValue === 'Selling' || saleStatusValue === 'SELLING') {
        saleStatus = SaleStatus.SELLING;
      } else if (saleStatusValue === 'Hidden' || saleStatusValue === 'HIDDEN') {
        saleStatus = SaleStatus.HIDDEN;
      }

      const data: ImportItemData = {
        barcode,
        brand,
        productName,
        priceType,
        regularPrice,
        specialPrice,
        vatPercent,
        specialPriceStartDate,
        specialPriceEndDate,
        requirePriceInquiry,
        saleStatus,
      };

      rows.push({
        rowNo: row.rowNo,
        isValid: row.isValid,
        data,
      });
    }

    return { rows };
  }

  async createBatchWithS3Upload(
    file: Express.Multer.File,
    resultExcel: Buffer,
    dataSheets: DataSheet[],
    result: any,
    merchantId: number,
    userId: number,
  ): Promise<{
    batchUuid: string;
    resultFileName: string;
    resultFileUrl: string;
    expiresIn: number;
  }> {
    try {
      const originalFilename = file.originalname;
      const isDisableAutoTimestamp = true;
      const timestamp = generateThailandTimestamp();
      const storedFilename = `${originalFilename.replace('.xlsx', '')}_${timestamp}.xlsx`;
      const resultFileName = `ResultImportProduct_${timestamp}.xlsx`;
      const validationFileName = `${storedFilename.replace('.xlsx', '_validation.json')}`;

      const s3Bucket = process.env.AWS_S3_BUCKET || 's3-apse1-allkons-dev';
      const s3Folder = `allkons_m/product-imports/${merchantId}`;

      // Transform and prepare validation JSON (optimized storage format)
      const storageData = this.transformDataSheetToStorageFormat(dataSheets);
      const validationJson = JSON.stringify(storageData);

      // Upload all files to S3 in parallel
      this.logger.log('Starting parallel S3 uploads...');
      const [originalUploadResult, resultUploadResult, validationUploadResult] =
        await Promise.all([
          this.s3Service.uploadS3(
            file.buffer,
            s3Bucket,
            storedFilename,
            s3Folder,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            false,
            isDisableAutoTimestamp,
          ),
          this.s3Service.uploadS3(
            resultExcel,
            s3Bucket,
            resultFileName,
            s3Folder,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            false,
            isDisableAutoTimestamp,
          ),
          this.s3Service.uploadS3(
            Buffer.from(validationJson),
            s3Bucket,
            validationFileName,
            s3Folder,
            'application/json',
            false,
            isDisableAutoTimestamp,
          ),
        ]);
      this.logger.log(`Uploads complete!`);

      // Create batch record in database
      const batch = this.batchRepository.create({
        merchantId,
        createdBy: userId,
        originalFilename,
        storedFilename,
        s3OriginalKey: originalUploadResult.key,
        s3ResultKey: resultUploadResult.key,
        s3ValidationKey: validationUploadResult.key,
        totalRows: result.all || 0,
        validationPassCount: result.pass || 0,
        validationFailCount: result.fail || 0,
        status: ImportProductBatchStatus.VALIDATED,
      });

      await this.batchRepository.save(batch);

      this.logger.log(`Batch record created!`);

      // Get presigned URL for result file
      const resultFileUrl = await this.s3Service.getPresignedUrl(
        resultUploadResult.key,
      );

      return {
        batchUuid: batch.uuid,
        resultFileName,
        resultFileUrl,
        expiresIn: 60 * 60 * 24 * 7,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create batch with S3 upload: ${errorMessage}`,
      );
      throw new Error(`Failed to store import batch: ${errorMessage}`);
    }
  }

  /**
   * List import batches with pagination and filters
   */
  async listBatches(
    merchantId: number,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: ImportProductBatchStatus,
  ) {
    try {
      // Build base query for counting
      const countQuery = this.batchRepository
        .createQueryBuilder('batch')
        .where('batch.merchantId = :merchantId', { merchantId })
        .andWhere('batch.status != :validatedStatus', {
          validatedStatus: ImportProductBatchStatus.VALIDATED,
        });

      // Search filter by stored filename
      if (search && search.trim()) {
        countQuery.andWhere('batch.storedFilename ILIKE :search', {
          search: `%${search.trim()}%`,
        });
      }

      // Status filter
      if (status) {
        countQuery.andWhere('batch.status = :status', { status });
      }

      // Get total count
      const total = await countQuery.getCount();

      // Get count by status
      const statusCountQuery = this.batchRepository
        .createQueryBuilder('batch')
        .select('batch.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('batch.merchantId = :merchantId', { merchantId })
        .andWhere('batch.status != :validatedStatus', {
          validatedStatus: ImportProductBatchStatus.VALIDATED,
        })
        .groupBy('batch.status');

      // Apply search filter to status count if exists
      if (search && search.trim()) {
        statusCountQuery.andWhere('batch.storedFilename ILIKE :search', {
          search: `%${search.trim()}%`,
        });
      }

      const statusCountsRaw = await statusCountQuery.getRawMany();

      // Map status counts to object
      const statusCounts: Record<string, number> = {};
      for (const row of statusCountsRaw) {
        statusCounts[row.status] = parseInt(row.count, 10);
      }

      // Ensure all statuses exist in the object (even if count is 0)
      const allStatuses = [
        ImportProductBatchStatus.MATCHING,
        ImportProductBatchStatus.PENDING_REVIEW,
        ImportProductBatchStatus.COMPLETED,
        ImportProductBatchStatus.CANCELLED,
      ];
      for (const status of allStatuses) {
        if (!statusCounts[status]) {
          statusCounts[status] = 0;
        }
      }

      // Calculate total count from all statuses (for 'all' filter)
      statusCounts['ALL'] = allStatuses.reduce(
        (sum, status) => sum + (statusCounts[status] || 0),
        0,
      );

      // Build query with joins for data
      const dataQuery = this.batchRepository
        .createQueryBuilder('batch')
        .select('batch.uuid', 'uuid')
        .addSelect('batch.storedFilename', 'storedFilename')
        .addSelect('batch.totalRows', 'totalRows')
        .addSelect('batch.validationPassCount', 'validationPassCount')
        .addSelect('batch.validationFailCount', 'validationFailCount')
        .addSelect('batch.matchedCount', 'matchedCount')
        .addSelect('batch.similarCount', 'similarCount')
        .addSelect('batch.notFoundCount', 'notFoundCount')
        .addSelect('batch.status', 'status')
        .addSelect('batch.createdAt', 'createdAt')
        .addSelect('batch.updatedAt', 'updatedAt')
        .addSelect('createdByUser.name', 'createdBy')
        .addSelect('updatedByUser.name', 'updatedBy')
        .addSelect(
          (subQuery) =>
            subQuery
              .select('COUNT(*)', 'count')
              .from('import_product_item', 'item')
              .where('item.batch_id = batch.id')
              .andWhere('item.import_status = :completedStatus', {
                completedStatus: ImportStatus.COMPLETED,
              }),
          'importedCount',
        )
        .addSelect(
          (subQuery) =>
            subQuery
              .select('COUNT(*)', 'count')
              .from('import_product_item', 'item')
              .where('item.batch_id = batch.id')
              .andWhere('item.import_status != :completedStatus', {
                completedStatus: ImportStatus.COMPLETED,
              }),
          'notImportedCount',
        )
        .leftJoin(
          'user',
          'createdByUser',
          'createdByUser.id = batch.created_by',
        )
        .leftJoin(
          'user',
          'updatedByUser',
          'updatedByUser.id = batch.updated_by',
        )
        .where('batch.merchantId = :merchantId', { merchantId })
        .andWhere('batch.status != :validatedStatus', {
          validatedStatus: ImportProductBatchStatus.VALIDATED,
        });

      // Apply same filters to data query
      if (search && search.trim()) {
        dataQuery.andWhere('batch.storedFilename ILIKE :search', {
          search: `%${search.trim()}%`,
        });
      }

      if (status) {
        dataQuery.andWhere('batch.status = :status', { status });
      }

      // Order by most recent first
      dataQuery.orderBy('batch.createdAt', 'DESC');

      // Pagination
      const offset = (page - 1) * limit;
      dataQuery.offset(offset).limit(limit);

      // Execute data query and map results
      const rawItems = await dataQuery.getRawMany();

      // Map raw results to proper format
      const items = rawItems.map((raw) => ({
        uuid: raw.uuid,
        filename: raw.storedFilename,
        totalRows: raw.totalRows,
        validationPassCount: raw.validationPassCount,
        validationFailCount: raw.validationFailCount,
        matchedCount: raw.matchedCount,
        similarCount: raw.similarCount,
        notFoundCount: raw.notFoundCount,
        importedCount: parseInt(raw.importedCount, 10) || 0,
        notImportedCount: parseInt(raw.notImportedCount, 10) || 0,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy || null,
        updatedBy: raw.updatedBy || null,
      }));

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusCounts,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list batches: ${errorMessage}`);
      throw new Error(`Failed to list import batches: ${errorMessage}`);
    }
  }

  async listBatchItems(
    batchUuid: string,
    merchantId: number,
    page: number = 1,
    limit: number = 20,
    matchStatus?: MatchStatus,
    importStatus?: ImportStatus[],
    search?: string,
  ) {
    try {
      // Verify batch exists and belongs to merchant (with user info)
      const batchQuery = await this.batchRepository
        .createQueryBuilder('batch')
        .select('batch.id', 'id')
        .addSelect('batch.uuid', 'uuid')
        .addSelect('batch.storedFilename', 'storedFilename')
        .addSelect('batch.totalRows', 'totalRows')
        .addSelect('batch.validationPassCount', 'validationPassCount')
        .addSelect('batch.validationFailCount', 'validationFailCount')
        .addSelect('batch.matchedCount', 'matchedCount')
        .addSelect('batch.similarCount', 'similarCount')
        .addSelect('batch.notFoundCount', 'notFoundCount')
        .addSelect('batch.status', 'status')
        .addSelect('batch.createdAt', 'createdAt')
        .addSelect('batch.updatedAt', 'updatedAt')
        .addSelect('createdByUser.name', 'createdBy')
        .addSelect('updatedByUser.name', 'updatedBy')
        .leftJoin(
          'user',
          'createdByUser',
          'createdByUser.id = batch.created_by',
        )
        .leftJoin(
          'user',
          'updatedByUser',
          'updatedByUser.id = batch.updated_by',
        )
        .where('batch.uuid = :batchUuid', { batchUuid })
        .andWhere('batch.merchantId = :merchantId', { merchantId })
        .getRawOne();

      if (!batchQuery) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      const batchId = batchQuery.id;

      // Build count query
      const countQuery = this.itemRepository
        .createQueryBuilder('item')
        .where('item.batchId = :batchId', { batchId });

      // Apply match status filter
      if (matchStatus) {
        countQuery.andWhere('item.matchStatus = :matchStatus', { matchStatus });
      }

      // Apply import status filter
      if (importStatus && importStatus.length > 0) {
        countQuery.andWhere('item.importStatus IN (:...importStatus)', {
          importStatus,
        });
      }

      // Apply search filter (search in product name, barcode, or brand)
      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        countQuery.andWhere(
          '(item.productName ILIKE :search OR item.barcode ILIKE :search OR item.brand ILIKE :search)',
          { search: searchPattern },
        );
      }

      // Get total count
      const total = await countQuery.getCount();

      // Build data query with product join
      const dataQuery = this.itemRepository
        .createQueryBuilder('item')
        .select('item.id', 'id')
        .addSelect('item.rowNo', 'rowNo')
        .addSelect('item.productName', 'productName')
        .addSelect('item.barcode', 'barcode')
        .addSelect('item.brand', 'brand')
        .addSelect('item.priceType', 'priceType')
        .addSelect('item.regularPrice', 'regularPrice')
        .addSelect('item.specialPrice', 'specialPrice')
        .addSelect('item.vatPercent', 'vatPercent')
        .addSelect('item.specialPriceStartDate', 'specialPriceStartDate')
        .addSelect('item.specialPriceEndDate', 'specialPriceEndDate')
        .addSelect('item.requirePriceInquiry', 'requirePriceInquiry')
        .addSelect('item.saleStatus', 'saleStatus')
        .addSelect('item.matchStatus', 'matchStatus')
        .addSelect('item.matchedProductVariantId', 'matchedProductVariantId')
        .addSelect('item.importStatus', 'importStatus')
        .addSelect('item.importType', 'importType')
        .where('item.batchId = :batchId', { batchId });

      // Apply match status filter
      if (matchStatus) {
        dataQuery.andWhere('item.matchStatus = :matchStatus', { matchStatus });
        // Only include suggestedProducts JSONB when filtering by status
        // This reduces payload size significantly when status is not specified
        dataQuery.addSelect('item.suggestedProducts', 'suggestedProducts');
      }

      // Apply import status filter
      if (importStatus && importStatus.length > 0) {
        dataQuery.andWhere('item.importStatus IN (:...importStatus)', {
          importStatus,
        });
      }

      // Apply search filter (search in product name, barcode, or brand)
      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        dataQuery.andWhere(
          '(item.productName ILIKE :search OR item.barcode ILIKE :search OR item.brand ILIKE :search)',
          { search: searchPattern },
        );
      }

      // Order by row number
      dataQuery.orderBy('item.rowNo', 'ASC');

      // Pagination
      const offset = (page - 1) * limit;
      dataQuery.offset(offset).limit(limit);

      // Execute data query
      const rawItems = await dataQuery.getRawMany();

      // Map raw results
      const items = rawItems.map((raw) => ({
        id: raw.id,
        rowNo: raw.rowNo,
        productName: raw.productName,
        barcode: raw.barcode,
        brand: raw.brand,
        priceType: raw.priceType,
        regularPrice: raw.regularPrice ? parseFloat(raw.regularPrice) : null,
        specialPrice: raw.specialPrice ? parseFloat(raw.specialPrice) : null,
        vatPercent: raw.vatPercent ? parseFloat(raw.vatPercent) : null,
        specialPriceStartDate: this.formatThaiDateOnly(
          raw.specialPriceStartDate,
        ),
        specialPriceEndDate: this.formatThaiDateOnly(raw.specialPriceEndDate),
        requirePriceInquiry: raw.requirePriceInquiry,
        saleStatus: raw.saleStatus,
        matchStatus: raw.matchStatus,
        matchedProductVariantId: raw.matchedProductVariantId,
        suggestedProducts: raw.suggestedProducts,
        importStatus: raw.importStatus,
        importType: raw.importType,
      }));

      // Batch info
      const batchInfo = {
        uuid: batchQuery.uuid,
        filename: batchQuery.storedFilename,
        totalRows: batchQuery.totalRows,
        validationPassCount: batchQuery.validationPassCount,
        validationFailCount: batchQuery.validationFailCount,
        matchedCount: batchQuery.matchedCount,
        similarCount: batchQuery.similarCount,
        notFoundCount: batchQuery.notFoundCount,
        status: batchQuery.status,
        createdAt: batchQuery.createdAt,
        createdBy: batchQuery.createdBy || null,
        updatedAt: batchQuery.updatedAt,
        updatedBy: batchQuery.updatedBy || null,
      };

      return {
        batch: batchInfo,
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list batch items: ${errorMessage}`);
      throw new Error(`Failed to list batch items: ${errorMessage}`);
    }
  }

  /**
   * Get presigned URL for original file download
   */
  async getOriginalFileUrl(batchUuid: string, merchantId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      // Get presigned URL for original file (expires in 7 days)
      const originalFileUrl = await this.s3Service.getPresignedUrl(
        batch.s3OriginalKey,
      );

      return {
        filename: batch.originalFilename,
        url: originalFileUrl,
        expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get original file URL: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to get original file URL',
        errorMessage,
      );
    }
  }

  /**
   * Cancel import batch
   * Can only cancel batches in MATCHING status to stop background job
   */
  async cancelBatch(batchUuid: string, merchantId: number, userId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      // Can only cancel if status is MATCHING
      if (batch.status !== ImportProductBatchStatus.MATCHING) {
        ErrorHandler.handleBadRequestError(
          `Cannot cancel batch. Current status: ${batch.status}. Only MATCHING batches can be cancelled.`,
        );
      }

      // Update status to CANCELLED
      batch.status = ImportProductBatchStatus.CANCELLED;
      batch.updatedBy = userId;
      await this.batchRepository.save(batch);

      this.logger.log(
        `Batch ${batchUuid} cancelled by user ${userId} (stopped background job)`,
      );

      return {
        batchUuid: batch.uuid,
        status: batch.status,
        message:
          'Batch cancelled successfully. Background job will be stopped.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cancel batch: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to cancel batch',
        errorMessage,
      );
    }
  }

  /**
   * Manually complete import batch
   * Can only complete batches in PENDING_REVIEW status
   */
  async completeBatch(batchUuid: string, merchantId: number, userId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      // Can only complete if status is PENDING_REVIEW
      if (batch.status !== ImportProductBatchStatus.PENDING_REVIEW) {
        ErrorHandler.handleBadRequestError(
          `Cannot complete batch. Current status: ${batch.status}. Only PENDING_REVIEW batches can be completed.`,
        );
      }

      // Update status to COMPLETED
      batch.status = ImportProductBatchStatus.COMPLETED;
      batch.updatedBy = userId;
      await this.batchRepository.save(batch);

      this.logger.log(
        `Batch ${batchUuid} manually completed by user ${userId}`,
      );

      return {
        batchUuid: batch.uuid,
        status: batch.status,
        message: 'Batch completed successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to complete batch: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to complete batch',
        errorMessage,
      );
    }
  }

  /**
   * Delete import batch and all related data
   * Deletes batch items, S3 files, and batch record
   */
  async deleteBatch(batchUuid: string, merchantId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      if (
        batch.status !== ImportProductBatchStatus.COMPLETED &&
        batch.status !== ImportProductBatchStatus.CANCELLED &&
        batch.status !== ImportProductBatchStatus.VALIDATED
      ) {
        ErrorHandler.handleBadRequestError(
          'Cannot delete import batch in current status',
        );
      }

      // Delete import_product_item records
      const itemsDeleteResult = await this.itemRepository.delete({
        batchId: batch.id,
      });
      const itemsDeleted = itemsDeleteResult.affected || 0;

      // Delete S3 files (parallel, don't wait for all to complete)
      await Promise.allSettled([
        this.s3Service.deleteS3File(batch.s3OriginalKey),
        this.s3Service.deleteS3File(batch.s3ResultKey),
        this.s3Service.deleteS3File(batch.s3ValidationKey),
      ]);

      // Delete batch record
      await this.batchRepository.remove(batch);

      this.logger.log(
        `Batch ${batchUuid} deleted successfully (${itemsDeleted} items deleted)`,
      );

      return {
        batchUuid,
        deletedItems: itemsDeleted,
        message: 'Batch deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete batch: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to delete batch',
        errorMessage,
      );
    }
  }

  /**
   * Cleanup existing batch items (for retry)
   */
  async cleanupBatchItems(batchUuid: string, merchantId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        return; // Batch not found, nothing to cleanup
      }

      const existingItemsCount = await this.itemRepository.count({
        where: { batchId: batch.id },
      });

      if (existingItemsCount > 0) {
        this.logger.warn(
          `Found ${existingItemsCount} existing items for batch ${batchUuid}, cleaning up before retry...`,
        );
        await this.itemRepository.delete({ batchId: batch.id });
        this.logger.log(`Cleaned up ${existingItemsCount} existing items`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup batch items: ${errorMessage}`);
      // Don't throw, just log the error
    }
  }

  async cleanupBatch(merchantId: number, batchUuid?: string) {
    try {
      let batches: ImportProductBatch[];

      if (batchUuid) {
        // ล้างเฉพาะ batch ที่ระบุ
        const batch = await this.batchRepository.findOne({
          where: { uuid: batchUuid, merchantId },
        });

        if (!batch) {
          ErrorHandler.handleNotFoundError(
            'Import batch not found',
            `UUID: ${batchUuid}`,
          );
        }

        batches = [batch];
      } else {
        // ล้างทั้งหมดที่เป็น VALIDATED
        batches = await this.batchRepository.find({
          where: {
            merchantId,
            status: ImportProductBatchStatus.VALIDATED,
          },
        });
      }

      if (batches.length === 0) {
        return {
          deleted: 0,
          message: 'No batches to cleanup',
        };
      }

      let deletedCount = 0;
      let deletedItemsCount = 0;
      const errors: string[] = [];

      for (const batch of batches) {
        try {
          // ลบ import_product_item records ที่เกี่ยวข้อง
          const itemsDeleteResult = await this.itemRepository.delete({
            batchId: batch.id,
          });
          const itemsDeleted = itemsDeleteResult.affected || 0;
          deletedItemsCount += itemsDeleted;

          // ลบไฟล์ใน S3 (parallel)
          await Promise.allSettled([
            this.s3Service.deleteS3File(batch.s3OriginalKey),
            this.s3Service.deleteS3File(batch.s3ResultKey),
            this.s3Service.deleteS3File(batch.s3ValidationKey),
          ]);

          // ลบ batch record จาก database
          await this.batchRepository.remove(batch);

          deletedCount++;
          this.logger.log(
            `Batch ${batch.uuid} cleaned up successfully (${itemsDeleted} items deleted)`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to cleanup batch ${batch.uuid}: ${errorMessage}`,
          );
          errors.push(`${batch.uuid}: ${errorMessage}`);
        }
      }

      return {
        deleted: deletedCount,
        deletedItems: deletedItemsCount,
        total: batches.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Cleaned up ${deletedCount} of ${batches.length} batches (${deletedItemsCount} items deleted)`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup batches: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to cleanup batches',
        errorMessage,
      );
    }
  }

  /**
   * Start product matching by adding job to queue (non-blocking)
   */
  async startMatching(batchUuid: string, merchantId: number, userId: number) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { uuid: batchUuid, merchantId },
      });

      if (!batch) {
        ErrorHandler.handleNotFoundError(
          'Import batch not found',
          `UUID: ${batchUuid}`,
        );
      }

      if (batch.status !== ImportProductBatchStatus.VALIDATED) {
        ErrorHandler.handleBadRequestError(
          `Cannot start matching. Current status: ${batch.status}`,
        );
      }

      // Update status to MATCHING immediately (before queueing)
      batch.status = ImportProductBatchStatus.MATCHING;
      batch.updatedBy = userId;
      await this.batchRepository.save(batch);

      // Add job to queue (non-blocking)
      await this.matchingQueue.add('start-matching', {
        batchUuid,
        merchantId,
        userId,
      });

      this.logger.log(
        `Product matching job queued for batch ${batchUuid}, status updated to MATCHING`,
      );

      return {
        message: 'Product matching started',
        batchUuid,
        status: batch.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start matching: ${errorMessage}`);
      ErrorHandler.handleInternalServerError(
        'Failed to start matching',
        errorMessage,
      );
    }
  }

  /**
   * Process product matching (called by consumer)
   */
  async processMatching(batchUuid: string, merchantId: number, userId: number) {
    const CHUNK_SIZE = 20;

    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid, merchantId },
    });

    if (!batch) {
      throw new Error(`Import batch not found: ${batchUuid}`);
    }

    // Verify status is MATCHING (should be set by startMatching())
    if (batch.status !== ImportProductBatchStatus.MATCHING) {
      throw new Error(
        `Invalid batch status for matching: ${batch.status}. Expected: MATCHING`,
      );
    }

    const validationBuffer = await this.s3Service.getObject(
      batch.s3ValidationKey,
    );
    const storageData: StorageValidationData = JSON.parse(
      validationBuffer.toString(),
    );

    if (!storageData.rows || !Array.isArray(storageData.rows)) {
      throw new Error('Invalid validation data');
    }

    const validRows = storageData.rows.filter((row) => row.isValid);
    const totalValidRows = validRows.length;

    if (totalValidRows === 0) {
      throw new Error('No valid rows to match');
    }

    this.logger.log(
      `Processing matching for ${totalValidRows} valid rows in chunks of ${CHUNK_SIZE}...`,
    );

    // Split into chunks
    const chunks: StorageValidationRow[][] = [];
    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      chunks.push(validRows.slice(i, i + CHUNK_SIZE));
    }

    this.logger.log(`Total chunks: ${chunks.length}`);

    // Get merchant and HEAD_OFFICE info once (for product existence check)
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error(`Merchant ${merchantId} not found`);
    }

    let matchedCount = 0;
    let similarCount = 0;
    let notFoundCount = 0;
    let processedItems = 0;

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      // Check if batch has been cancelled before processing next chunk
      const currentBatch = await this.batchRepository.findOne({
        where: { uuid: batchUuid },
        select: ['id', 'status'],
      });

      if (
        currentBatch &&
        currentBatch.status === ImportProductBatchStatus.CANCELLED
      ) {
        this.logger.warn(
          `Batch ${batchUuid} was cancelled. Stopping matching process at chunk ${chunkIndex + 1}/${chunks.length}`,
        );
        // Exit early - batch remains CANCELLED, items processed so far are saved
        return {
          batchUuid: batch.uuid,
          totalValidRows,
          matchedCount,
          similarCount,
          notFoundCount,
          status: ImportProductBatchStatus.CANCELLED,
          message: `Matching cancelled by user after processing ${processedItems}/${totalValidRows} items`,
        };
      }

      const chunk = chunks[chunkIndex];
      const chunkNumber = chunkIndex + 1;

      this.logger.log(
        `Processing chunk ${chunkNumber}/${chunks.length} (${chunk.length} items)...`,
      );

      try {
        // Prepare batch input for External API
        const batchInputs = chunk.map((row) => ({
          rowNo: row.rowNo,
          productName: row.data.productName,
          brand: row.data.brand,
          barcode: row.data.barcode,
        }));

        // Call External API for batch matching (outside transaction)
        const matchResults =
          await this.matchingService.matchProductsBatch(batchInputs);

        // Save chunk results in transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // Create ImportProductItem records from match results
          const savedItems: ImportProductItem[] = [];

          for (const matchResult of matchResults) {
            // Find corresponding row data
            const row = chunk.find((r) => r.rowNo === matchResult.rowNo);
            if (!row) {
              this.logger.warn(
                `No matching row found for rowNo: ${matchResult.rowNo}`,
              );
              continue;
            }

            const { data } = row;

            // Count by match status
            if (matchResult.matchStatus === MatchStatus.FOUND) {
              matchedCount++;
            } else if (matchResult.matchStatus === MatchStatus.SIMILAR) {
              similarCount++;
            } else {
              notFoundCount++;
            }

            // If specialPrice exists but no specialPriceStartDate, set to current date
            let specialPriceStartDate = data.specialPriceStartDate;
            if (data.specialPrice !== null && specialPriceStartDate === null) {
              specialPriceStartDate = new Date();
            }

            // Create ImportProductItem record
            const item = this.itemRepository.create({
              batchId: batch.id,
              rowNo: row.rowNo,
              // Product data from Excel
              productName: data.productName,
              barcode: data.barcode,
              brand: data.brand,
              priceType: data.priceType,
              vatPercent: data.vatPercent,
              regularPrice: data.regularPrice,
              specialPrice: data.specialPrice,
              specialPriceStartDate: specialPriceStartDate,
              specialPriceEndDate: data.specialPriceEndDate,
              requirePriceInquiry: data.requirePriceInquiry,
              saleStatus: data.saleStatus,
              // Matching results
              matchStatus: matchResult.matchStatus,
              matchedProductVariantId: matchResult.matchedProductVariantId,
              suggestedProducts: matchResult.suggestedProducts,
              // Import status - NOT_FOUND goes directly to admin
              importStatus:
                matchResult.matchStatus === MatchStatus.NOT_FOUND
                  ? ImportStatus.PENDING_ADMIN
                  : ImportStatus.PENDING,
            });

            const saved = await queryRunner.manager.save(item);
            savedItems.push(saved);
          }

          await queryRunner.commitTransaction();

          // Send NOT_FOUND items to MASTER_SKU for admin review
          const notFoundItems = savedItems.filter(
            (item) => item.matchStatus === MatchStatus.NOT_FOUND,
          );

          if (notFoundItems.length > 0) {
            // Fire and forget - don't block main flow
            this.masterSkuService
              .sendNotFoundItems(
                notFoundItems.map((item) => ({
                  itemId: item.id,
                  batchUuid: batch.uuid,
                  productName: item.productName || null,
                  barcode: item.barcode || null,
                  brand: item.brand || null,
                })),
              )
              .catch((error) => {
                this.logger.error(
                  `Failed to notify MASTER_SKU for batch ${batch.uuid}: ${error.message}`,
                );
              });
          }

          processedItems += chunk.length;
          this.logger.log(
            `Chunk ${chunkNumber}/${chunks.length} completed. Progress: ${processedItems}/${totalValidRows} (${Math.round((processedItems / totalValidRows) * 100)}%)`,
          );
        } catch (error: unknown) {
          await queryRunner.rollbackTransaction();
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to save chunk ${chunkNumber}/${chunks.length}: ${errorMessage}`,
          );
          throw error;
        } finally {
          await queryRunner.release();
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to process chunk ${chunkNumber}/${chunks.length}: ${errorMessage}`,
        );
        throw error;
      }
    }

    // Update batch with final matching statistics
    // Use atomic update to prevent race condition with cancel
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Only update if status is still MATCHING (prevent overwriting CANCELLED)
      const updateResult = await queryRunner.manager.update(
        ImportProductBatch,
        {
          id: batch.id,
          status: ImportProductBatchStatus.MATCHING,
        },
        {
          matchedCount,
          similarCount,
          notFoundCount,
          status: ImportProductBatchStatus.PENDING_REVIEW,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      );

      await queryRunner.commitTransaction();

      // Check if update was successful
      if (updateResult.affected === 0) {
        this.logger.warn(
          `Batch ${batchUuid} status was changed during processing (likely cancelled). Not updating to PENDING_REVIEW.`,
        );
        // Return current state without overwriting
        return {
          batchUuid: batch.uuid,
          totalValidRows,
          matchedCount,
          similarCount,
          notFoundCount,
          status: ImportProductBatchStatus.CANCELLED,
          message: `Matching cancelled during final update. Processed ${totalValidRows} items.`,
        };
      }

      this.logger.log(
        `Matching completed! Found: ${matchedCount}, Similar: ${similarCount}, Not Found: ${notFoundCount}`,
      );

      // Auto-import FOUND products to merchant (background job)
      if (matchedCount > 0) {
        try {
          const importResult = await this.autoImportFoundProducts(
            batch.id,
            merchantId,
            userId,
          );

          this.logger.log(
            `Auto-import completed: Queued ${matchedCount} FOUND items. ` +
              `Import will continue in background. ` +
              `(Immediate result: ${importResult.importedCount} imported, ${importResult.failedCount} failed)`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to queue auto-import job: ${errorMessage}. ` +
              `${matchedCount} items will remain in PENDING status. ` +
              `Stack trace: ${error instanceof Error ? error.stack : 'N/A'}`,
          );

          // Don't throw - matching was successful, queue failure shouldn't fail the whole process
        }
      }

      // TODO: Auto send NOT_FOUND item to MASTER_SKU

      return {
        batchUuid: batch.uuid,
        totalValidRows,
        matchedCount,
        similarCount,
        notFoundCount,
        status: batch.status,
        message: `Matching completed for ${totalValidRows} products`,
      };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update batch final status: ${errorMessage}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Auto-import FOUND products to merchant after matching completes
   * Flow: PENDING → IMPORTING (queued) → COMPLETED/FAILED (background)
   * Queues background job for actual import with chunking support
   *
   * Uses transaction to ensure atomicity:
   * - Query items with pessimistic lock
   * - Update status to IMPORTING
   * - Commit transaction
   * - Queue jobs (outside transaction to avoid holding locks)
   */
  private async autoImportFoundProducts(
    batchId: number,
    merchantId: number,
    userId: number,
  ): Promise<{ importedCount: number; failedCount: number }> {
    // 1. Get batch to access UUID (outside transaction)
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      select: ['id', 'uuid'],
    });

    if (!batch) {
      this.logger.error(`Batch ${batchId} not found for auto-import`);
      return { importedCount: 0, failedCount: 0 };
    }

    // 2. Start transaction for atomic status update
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let itemsWithVariant: ImportProductItem[] = [];

    try {
      // 3. Query FOUND items with PENDING status using pessimistic lock
      const foundItems = await queryRunner.manager.find(ImportProductItem, {
        where: {
          batchId,
          matchStatus: MatchStatus.FOUND,
          importStatus: ImportStatus.PENDING,
        },
        select: ['id', 'matchedProductVariantId'],
        lock: { mode: 'pessimistic_write' },
      });

      // Filter items that have matchedProductVariantId
      itemsWithVariant = foundItems.filter(
        (item) => item.matchedProductVariantId !== null,
      );

      if (itemsWithVariant.length === 0) {
        await queryRunner.commitTransaction();
        return { importedCount: 0, failedCount: 0 };
      }

      this.logger.log(
        `Auto-importing ${itemsWithVariant.length} FOUND products for batch ${batch.uuid}`,
      );

      // 4. Mark ALL items as IMPORTING (efficient bulk update within transaction)
      const itemIds = itemsWithVariant.map((item) => item.id);
      await queryRunner.manager
        .createQueryBuilder()
        .update(ImportProductItem)
        .set({ importStatus: ImportStatus.IMPORTING })
        .where('id IN (:...ids)', { ids: itemIds })
        .andWhere('importStatus = :status', { status: ImportStatus.PENDING })
        .execute();

      // 5. Commit transaction before queueing jobs
      await queryRunner.commitTransaction();

      this.logger.log(`Marked ${itemIds.length} items as IMPORTING`);
    } catch (error: unknown) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update items status for auto-import: ${errorMessage}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 6. Queue jobs AFTER transaction commits (don't hold DB locks during queue operations)
    try {
      for (const item of itemsWithVariant) {
        await this.importQueue.add('import-item', {
          batchUuid: batch.uuid,
          merchantId,
          userId,
          itemId: item.id,
          source: 'FOUND' as const,
        });
      }

      this.logger.log(
        `Queued ${itemsWithVariant.length} import jobs for FOUND items. Processing will continue in background with concurrency.`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to queue import jobs: ${errorMessage}. Items are marked as IMPORTING but jobs not queued.`,
      );
      throw error;
    }

    // Return 0 for now - actual counts will be updated by background job
    // Caller should not rely on these counts for FOUND auto-import
    return {
      importedCount: 0,
      failedCount: 0,
    };
  }

  /**
   * Match SIMILAR items - User can select product or send to admin
   * This method only updates status and queues background job for import
   *
   * @param batchUuid - Batch UUID
   * @param merchantId - Merchant ID
   * @param userId - User ID
   * @param items - Array of items with optional productVariantId
   *   - If productVariantId is provided: set status to IMPORTING, queue import job
   *   - If productVariantId is null/undefined: set status to PENDING_ADMIN
   */
  async matchingSimilarItems(
    batchUuid: string,
    merchantId: number,
    userId: number,
    items: Array<{
      itemId: number;
      productVariantId?: number | null;
      reason?: string;
    }>,
  ): Promise<{
    importingCount: number;
    pendingAdminCount: number;
    rejectedCount: number;
    failedCount: number;
    items: Array<{
      itemId: number;
      status: 'IMPORTING' | 'PENDING_ADMIN' | 'REJECTED';
      error?: string;
    }>;
  }> {
    // 1. Verify batch exists and belongs to merchant
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid, merchantId },
    });

    if (!batch) {
      ErrorHandler.handleNotFoundError(
        'Import batch not found',
        `UUID: ${batchUuid}`,
      );
    }

    // 2. Validate batch status
    if (
      batch.status !== ImportProductBatchStatus.PENDING_REVIEW &&
      batch.status !== ImportProductBatchStatus.MATCHING
    ) {
      ErrorHandler.handleBadRequestError(
        `Cannot review items. Current batch status: ${batch.status}`,
      );
    }

    // 3. Query existing items (SIMILAR or NOT_FOUND with PENDING import status)
    // SIMILAR items can be imported, NOT_FOUND items can be rejected
    const existingItems = await this.itemRepository.find({
      where: {
        batchId: batch.id,
        matchStatus: In([MatchStatus.SIMILAR, MatchStatus.NOT_FOUND]),
        importStatus: ImportStatus.PENDING,
      },
      select: ['id', 'matchStatus', 'suggestedProducts'],
    });

    // 4. Create map for quick lookup (convert bigint id to number for consistent lookup)
    const existingItemsMap = new Map(
      existingItems.map((item) => [Number(item.id), item]),
    );

    // 5. Separate items into three groups and validate
    const itemIdsToImport: number[] = [];
    const itemsToSendToAdmin: Array<{ itemId: number; reason?: string }> = [];
    const itemsToReject: Array<{ itemId: number; reason?: string }> = [];
    const results: Array<{
      itemId: number;
      status: 'IMPORTING' | 'PENDING_ADMIN' | 'REJECTED';
      error?: string;
    }> = [];

    for (const requestItem of items) {
      const existingItem = existingItemsMap.get(requestItem.itemId);
      if (!existingItem) {
        results.push({
          itemId: requestItem.itemId,
          status: 'PENDING_ADMIN',
          error:
            'Item not found or not in SIMILAR/NOT_FOUND and PENDING status',
        });
        continue;
      }

      if (requestItem.productVariantId != null) {
        // User selected a product - validate and import (both SIMILAR and NOT_FOUND)
        const suggestedIds = (existingItem.suggestedProducts || []).map(
          (p) => p.id,
        );
        if (!suggestedIds.includes(requestItem.productVariantId)) {
          results.push({
            itemId: requestItem.itemId,
            status: 'PENDING_ADMIN',
            error: 'Selected productVariantId not in suggested products',
          });
          continue;
        }

        itemIdsToImport.push(requestItem.itemId);
        results.push({
          itemId: requestItem.itemId,
          status: 'IMPORTING',
        });
      } else {
        // User didn't select a product
        if (existingItem.matchStatus === MatchStatus.SIMILAR) {
          // SIMILAR: Send to admin for more review
          itemsToSendToAdmin.push({
            itemId: requestItem.itemId,
            reason: requestItem.reason,
          });
          results.push({
            itemId: requestItem.itemId,
            status: 'PENDING_ADMIN',
          });
        } else if (existingItem.matchStatus === MatchStatus.NOT_FOUND) {
          // NOT_FOUND: Admin already reviewed and couldn't find match → Reject
          itemsToReject.push({
            itemId: requestItem.itemId,
            reason: requestItem.reason,
          });
          results.push({
            itemId: requestItem.itemId,
            status: 'REJECTED',
          });
        }
      }
    }

    this.logger.log(
      `Match SIMILAR items: ${itemIdsToImport.length} to import, ${itemsToSendToAdmin.length} to send to admin`,
    );

    // 6. Update items to send to admin (bulk update)
    if (itemsToSendToAdmin.length > 0) {
      // Update each item with reason
      for (const { itemId, reason } of itemsToSendToAdmin) {
        await this.itemRepository.update(itemId, {
          matchStatus: MatchStatus.NOT_FOUND,
          importStatus: ImportStatus.PENDING_ADMIN,
          reason: reason || null,
          suggestedProducts: null,
        });
      }

      this.logger.log(
        `Updated ${itemsToSendToAdmin.length} items to PENDING_ADMIN`,
      );

      // Update batch counts: SIMILAR → NOT_FOUND
      const movedCount = itemsToSendToAdmin.length;
      batch.similarCount = Math.max(0, batch.similarCount - movedCount);
      batch.notFoundCount = batch.notFoundCount + movedCount;
      await this.batchRepository.save(batch);

      this.logger.log(
        `Updated batch counts: similarCount -${movedCount}, notFoundCount +${movedCount}`,
      );

      // Notify MASTER_SKU about items moved to NOT_FOUND
      const itemIdsToNotify = itemsToSendToAdmin.map((i) => i.itemId);
      const fullItems = await this.itemRepository.find({
        where: { id: In(itemIdsToNotify) },
        select: [
          'id',
          'productName',
          'barcode',
          'brand',
          'regularPrice',
          'priceType',
        ],
      });

      // Fire and forget
      this.masterSkuService
        .sendNotFoundItems(
          fullItems.map((item) => ({
            itemId: item.id,
            batchUuid: batch.uuid,
            productName: item.productName || null,
            barcode: item.barcode || null,
            brand: item.brand || null,
            reason: itemsToSendToAdmin.find((i) => i.itemId === item.id)
              ?.reason,
          })),
        )
        .catch((error) => {
          this.logger.error(
            `Failed to notify MASTER_SKU for batch ${batch.uuid}: ${error.message}`,
          );
        });
    }

    // 7. Update items to import and queue per-item background jobs
    if (itemIdsToImport.length > 0) {
      // Build update map: itemId -> productVariantId
      const itemProductMap: Record<number, number> = {};
      for (const requestItem of items) {
        if (
          requestItem.productVariantId != null &&
          itemIdsToImport.includes(requestItem.itemId)
        ) {
          itemProductMap[requestItem.itemId] = requestItem.productVariantId;
        }
      }

      // Update each item with matchedProductVariantId and IMPORTING status
      for (const itemId of itemIdsToImport) {
        await this.itemRepository.update(itemId, {
          matchedProductVariantId: itemProductMap[itemId],
          importStatus: ImportStatus.IMPORTING,
        });
      }

      this.logger.log(
        `Marked ${itemIdsToImport.length} items as IMPORTING, queueing ${itemIdsToImport.length} jobs...`,
      );

      // Queue one job per item (item data will be queried fresh in consumer)
      for (const itemId of itemIdsToImport) {
        await this.importQueue.add('import-item', {
          batchUuid,
          merchantId,
          userId,
          itemId,
          source: 'SIMILAR' as const,
        });
      }

      this.logger.log(
        `Queued ${itemIdsToImport.length} import jobs for SIMILAR items. Processing will continue in background with concurrency.`,
      );
    }

    // 8. Handle rejected items (NOT_FOUND items that admin couldn't match)
    if (itemsToReject.length > 0) {
      for (const { itemId, reason } of itemsToReject) {
        await this.itemRepository.update(itemId, {
          importStatus: ImportStatus.REJECTED,
          reason: reason ?? 'Admin could not find suitable matching product',
          suggestedProducts: null, // Clear suggest product from admin
        });
      }

      this.logger.log(
        `Rejected ${itemsToReject.length} NOT_FOUND items (admin could not find matches)`,
      );

      // Check if batch should be completed
      await this.checkAndCompleteBatch(batchUuid);
    }

    // 9. Calculate final counts
    const importingCount = itemIdsToImport.length;
    const pendingAdminCount = itemsToSendToAdmin.length;
    const rejectedCount = itemsToReject.length;
    const failedCount = results.filter((r) => r.error).length;

    return {
      importingCount,
      pendingAdminCount,
      rejectedCount,
      failedCount,
      items: results,
    };
  }

  /**
   * Process single item import (queue consumer method)
   * Queries fresh data from DB and imports to merchant
   * Throws errors for Bull queue to retry - does NOT catch errors
   * Final FAILED status is handled by consumer's handleFailed()
   */
  async processImportItem(
    batchUuid: string,
    merchantId: number,
    userId: number,
    itemId: number,
  ): Promise<{
    itemId: number;
    status: ImportStatus;
    importType: ImportType | null;
  }> {
    this.logger.log(
      `Processing import for item ${itemId} in batch ${batchUuid}`,
    );

    // Query item with all needed fields (fresh data from DB)
    const item = await this.itemRepository.findOne({
      where: { id: itemId, importStatus: ImportStatus.IMPORTING },
      select: [
        'id',
        'importStatus',
        'matchedProductVariantId',
        'priceType',
        'regularPrice',
        'specialPrice',
        'vatPercent',
        'specialPriceStartDate',
        'specialPriceEndDate',
        'requirePriceInquiry',
        'saleStatus',
      ],
    });

    if (!item) {
      const message = `Item ${itemId} not found or not in IMPORTING status`;
      this.logger.warn(message);
      throw new Error(message);
    }

    if (!item.matchedProductVariantId) {
      const message = `Item ${itemId} has no matched product variant`;
      this.logger.warn(message);
      throw new Error(message);
    }

    // Call optimized single product import (no bulk overhead!)
    // Service throws on failure, so reaching here = SUCCESS
    // Let exceptions bubble up for Bull to retry
    const result =
      await this.importMerchantProductService.addSingleProductToMerchant(
        merchantId,
        {
          productVariantId: item.matchedProductVariantId,
          priceType: item.priceType as unknown as MerchantPriceType,
          regularPrice: item.regularPrice,
          specialPrice: item.specialPrice,
          vatPercent: item.vatPercent,
          specialPriceStartDate: item.specialPriceStartDate,
          specialPriceEndDate: item.specialPriceEndDate,
          requirePriceInquiry: item.requirePriceInquiry,
          saleStatus: item.saleStatus,
        },
        String(userId),
      );

    // Update item with SUCCESS status
    item.importStatus = ImportStatus.COMPLETED;
    item.importedAt = new Date();
    item.importType =
      result.importType === 'UPDATED' ? ImportType.UPDATE : ImportType.CREATE;

    await this.itemRepository.save(item);

    this.logger.log(
      `Item ${itemId} import SUCCESS: ${item.importType || 'N/A'}`,
    );

    // Check if all items are completed and update batch status
    await this.checkAndCompleteBatch(batchUuid);

    return {
      itemId,
      status: item.importStatus,
      importType: item.importType,
    };
  }

  /**
   * Check if all items in batch are completed (COMPLETED or REJECTED only)
   * If so, update batch status to COMPLETED
   * Note: FAILED items do NOT count towards batch completion
   * Call this after updating any item's importStatus
   */
  async checkAndCompleteBatch(batchUuid: string): Promise<void> {
    // Get batch ID
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
      select: ['id', 'status'],
    });

    if (!batch) {
      this.logger.warn(`Batch ${batchUuid} not found for completion check`);
      return;
    }

    // Skip if already completed or cancelled
    if (
      batch.status === ImportProductBatchStatus.COMPLETED ||
      batch.status === ImportProductBatchStatus.CANCELLED
    ) {
      return;
    }

    // Count total items and successfully processed items (COMPLETED or REJECTED)
    const [totalItems, processedItems] = await Promise.all([
      this.itemRepository.count({
        where: { batchId: batch.id },
      }),
      this.itemRepository.count({
        where: {
          batchId: batch.id,
          importStatus: In([ImportStatus.COMPLETED, ImportStatus.REJECTED]),
        },
      }),
    ]);

    // If all items are either COMPLETED or REJECTED, mark batch as COMPLETED
    if (totalItems > 0 && totalItems === processedItems) {
      await this.batchRepository.update(
        { id: batch.id },
        {
          status: ImportProductBatchStatus.COMPLETED,
          updatedAt: new Date(),
        },
      );

      this.logger.log(
        `Batch ${batchUuid} marked as COMPLETED - all ${totalItems} items processed (COMPLETED or REJECTED)`,
      );
    }
  }

  /**
   * Import a single item (internal synchronous method)
   * This is a reusable method for single item import operations
   * Used by: retry API (synchronous import)
   */
  async importSingleItem(
    item: ImportProductItem,
    merchantId: number,
    userId: number,
  ): Promise<{
    itemId: number;
    status: ImportStatus;
    importType: ImportType | null;
    error?: string;
  }> {
    if (!item.matchedProductVariantId) {
      return {
        itemId: item.id,
        status: ImportStatus.FAILED,
        importType: null,
        error: 'No matched product variant ID',
      };
    }

    // Mark as IMPORTING
    item.importStatus = ImportStatus.IMPORTING;
    await this.itemRepository.save(item);

    try {
      // Service throws on failure, so reaching here = SUCCESS
      const result =
        await this.importMerchantProductService.addSingleProductToMerchant(
          merchantId,
          {
            productVariantId: item.matchedProductVariantId,
            priceType: item.priceType as unknown as MerchantPriceType,
            regularPrice: item.regularPrice,
            specialPrice: item.specialPrice,
            vatPercent: item.vatPercent,
            specialPriceStartDate: item.specialPriceStartDate,
            specialPriceEndDate: item.specialPriceEndDate,
            requirePriceInquiry: item.requirePriceInquiry,
            saleStatus: item.saleStatus,
          },
          String(userId),
        );

      // Update with SUCCESS status
      item.importStatus = ImportStatus.COMPLETED;
      item.importedAt = new Date();
      item.importType =
        result.importType === 'UPDATED' ? ImportType.UPDATE : ImportType.CREATE;

      await this.itemRepository.save(item);

      return {
        itemId: item.id,
        status: item.importStatus,
        importType: item.importType,
      };
    } catch (error) {
      // Mark as failed and return error
      item.importStatus = ImportStatus.FAILED;
      await this.itemRepository.save(item);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        itemId: item.id,
        status: ImportStatus.FAILED,
        importType: null,
        error: errorMessage,
      };
    }
  }
}
