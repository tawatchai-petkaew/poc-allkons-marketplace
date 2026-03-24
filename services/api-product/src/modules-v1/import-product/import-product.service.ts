import {
  Injectable,
  Logger,
  StreamableFile,
  HttpException
} from '@nestjs/common';
import {
  DataSheet,
  ExtractExcelResponseDto,
} from './dto/extract-excel-response.dto';
import { ExcelParserService } from '@/common/service/excel-parser.service';
import { ProductExcelRowProcessorService } from './service/product-excel-row-processor.service';
import { ResultCalculatorService } from './service/result-calculator.service';
import {
  KEY_COLUMNS_IMPORT_PRODUCTS_ARRAY,
  KEY_VALIDATE_COLUMNS_PRODUCT_IMPORT,
} from '@/constant/key-column';
import { existsSync } from 'fs';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
import {
  ValidationResultDataDto,
  ValidationRowDto,
  ValidationColumnDto,
} from './dto/validation-result.dto';
import { ErrorHandler } from 'allkons-api-helper';
import { DATA_START_ROW, TEMPLATE_FILENAME } from '@/constant/constants';
import {
  ERROR_FILL,
  ERROR_FONT,
  ErrorMessagesImportProduct,
} from '@/constant/error-messages';
import { ImportProductBatchService } from './service/import-product-batch.service';
import { throwTemplateFormatError } from '@/utils/helpers';

@Injectable()
export class ImportProductService {
  constructor(
    private readonly excelParser: ExcelParserService,
    private readonly rowProcessor: ProductExcelRowProcessorService,
    private readonly resultCalculator: ResultCalculatorService,
    private readonly batchService: ImportProductBatchService,
  ) { }

  private readonly logger = new Logger(ImportProductService.name);

  async importAndValidateProductsExcel(
    file: Express.Multer.File,
    merchantId: number,
    userId: number,
  ): Promise<ExtractExcelResponseDto> {
    try {
      this.logger.log(
        `Starting import and validation for merchantId=${merchantId}`,
      );
      this.validateFile(file);
      const buffer = this.convertToBuffer(file.buffer);
      const workbook = await this.excelParser.loadWorkbook(buffer);
      const worksheet = this.excelParser.getWorksheet(workbook, 1);

      this.excelParser.validateTemplateFormat(
        worksheet,
        KEY_COLUMNS_IMPORT_PRODUCTS_ARRAY.length,
        Object.values(KEY_VALIDATE_COLUMNS_PRODUCT_IMPORT),
      );
      this.logger.log('Template format validation passed');

      this.excelParser.validateDataExists(
        worksheet,
        KEY_COLUMNS_IMPORT_PRODUCTS_ARRAY.length,
        DATA_START_ROW,
      );
      this.logger.log('Data existence validation passed');

      const dataSheets = await this.processWorksheet(workbook);
      const result = this.resultCalculator.calculateResult(dataSheets);

      this.logger.log(
        `Excel processed: Total Rows=${result.all}, Pass=${result.pass}, Fail=${result.fail}`,
      );

      // Generate result Excel and create batch
      this.logger.log('Generating result Excel buffer...');
      const startGenerate = Date.now();
      const resultExcel = await this.generateResultExcelBuffer(dataSheets);
      this.logger.log(`Result Excel generated in ${Date.now() - startGenerate}ms`);

      // Upload files to S3 and create batch record
      const batchInfo = await this.batchService.createBatchWithS3Upload(
        file,
        resultExcel,
        dataSheets,
        result,
        merchantId,
        userId,
      );

      this.logger.log(`Import batch created: UUID=${batchInfo.batchUuid}`);

      return new ExtractExcelResponseDto({
        result,
        ...batchInfo,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      if (
        errorMessage.includes('Invalid or corrupted Excel file format')
      ) {
        throwTemplateFormatError();
      }

      if (errorMessage.includes('Worksheet not found')) {
        ErrorHandler.handleBadRequestError(
          ErrorMessagesImportProduct.WORKSHEET_NOT_FOUND_ERROR,
        );
      }

      if (
        errorMessage.includes('Cannot read') ||
        errorMessage.includes('corrupt') ||
        errorMessage.includes('corrupted') ||
        errorMessage.includes('sheetNo') ||
        errorMessage.includes('Cannot set properties')
      ) {
        ErrorHandler.handleBadRequestError(
          ErrorMessagesImportProduct.INVALID_FILE_FORMAT_ERROR,
        );
      }

      this.logger.error(`Failed to extract Excel: ${errorMessage}`, errorStack);
      ErrorHandler.handleInternalServerError('ระบบขัดข้อง', errorMessage);
    }
  }

  private async generateResultExcelBuffer(
    dataSheets: DataSheet[],
  ): Promise<Buffer> {
    try {
      const filePath = this.getTemplatePath();
      const workbook = new ExcelJS.Workbook();

      await workbook.xlsx.readFile(filePath);

      this.processValidationDataFromSheets(workbook, dataSheets);

      const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;

      return buffer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to generate result Excel buffer: ${errorMessage}`,
      );
      throw new Error(`Failed to generate result Excel: ${errorMessage}`);
    }
  }

  private processValidationDataFromSheets(
    workbook: ExcelJS.Workbook,
    dataSheets: DataSheet[],
  ) {
    if (!dataSheets || !Array.isArray(dataSheets)) {
      return;
    }

    for (const sheetData of dataSheets) {
      let worksheet = workbook.getWorksheet(sheetData.sheetName);
      if (!worksheet && sheetData.sheetNo) {
        worksheet = workbook.getWorksheet(sheetData.sheetNo);
      }

      if (!worksheet) {
        this.logger.warn(
          `Worksheet not found: ${sheetData.sheetName} (No: ${sheetData.sheetNo})`,
        );
        continue;
      }

      this.processSheetRows(worksheet, sheetData.rows);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      ErrorHandler.handleBadRequestError(
        ErrorMessagesImportProduct.TEMPLATE_FORMAT_ERROR,
      );
    }

    const fileName = file.originalname.trim();
    if (!fileName.includes('.xlsx')) {
      ErrorHandler.handleBadRequestError(
        ErrorMessagesImportProduct.INVALID_FILE_EXTENSION_ERROR,
      );
    }

    if (file.size === 0) {
      ErrorHandler.handleBadRequestError(
        ErrorMessagesImportProduct.EMPTY_FILE_ERROR,
      );
    }
  }

  private convertToBuffer(buffer: Buffer | Uint8Array | ArrayBuffer): Buffer {
    return buffer instanceof Buffer
      ? buffer
      : Buffer.from(new Uint8Array(buffer));
  }

  private async processWorksheet(
    workbook: ExcelJS.Workbook,
  ): Promise<DataSheet[]> {
    try {
      const worksheet = this.excelParser.getWorksheet(workbook, 1);
      const keys = this.excelParser.getColumnKeys(worksheet, [
        ...KEY_COLUMNS_IMPORT_PRODUCTS_ARRAY,
      ]);
      const rows = await this.rowProcessor.processRows(worksheet, keys, 3);

      return [
        {
          sheetNo: 1,
          sheetName: worksheet.name,
          rows,
        },
      ];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Worksheet not found')) {
        ErrorHandler.handleBadRequestError(
          ErrorMessagesImportProduct.WORKSHEET_NOT_FOUND_ERROR,
        );
      }
      throw error;
    }
  }

  async generateValidationResultExcel(
    validationResponse: ValidationResultDataDto,
  ): Promise<StreamableFile> {
    try {
      this.validateInput(validationResponse);
      const filePath = this.getTemplatePath();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      this.processValidationData(workbook, validationResponse);
      const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
      return new StreamableFile(buffer);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to generate validation result Excel: ${errorMessage}`,
        errorStack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleInternalServerError(
        'Could not generate validation result file',
        errorMessage,
      );
    }
  }

  private validateInput(validationResponse: ValidationResultDataDto) {
    if (!validationResponse || !validationResponse.dataSheets) {
      ErrorHandler.handleBadRequestError('Invalid validation result data');
    }
  }

  private getTemplatePath(): string {
    const filePath = join(
      __dirname,
      '../../assets/templates',
      TEMPLATE_FILENAME,
    );

    if (!existsSync(filePath)) {
      ErrorHandler.handleNotFoundError(
        `Template file "${TEMPLATE_FILENAME}" not found`,
        filePath,
      );
    }
    return filePath;
  }

  private processValidationData(
    workbook: ExcelJS.Workbook,
    validationResponse: ValidationResultDataDto,
  ) {
    const { dataSheets } = validationResponse;

    if (!dataSheets || !Array.isArray(dataSheets)) {
      return;
    }

    for (const sheetData of dataSheets) {
      let worksheet = workbook.getWorksheet(sheetData.sheetName);
      if (!worksheet && sheetData.sheetNo) {
        worksheet = workbook.getWorksheet(sheetData.sheetNo);
      }

      if (!worksheet) {
        this.logger.warn(
          `Worksheet not found: ${sheetData.sheetName} (No: ${sheetData.sheetNo})`,
        );
        continue;
      }

      this.processSheetRows(worksheet, sheetData.rows);
    }
  }

  private processSheetRows(
    worksheet: ExcelJS.Worksheet,
    rows: ValidationRowDto[],
  ) {
    if (!rows || !Array.isArray(rows)) return;

    let maxColumnNo = 0;
    for (const rowData of rows) {
      if (rowData.columns && Array.isArray(rowData.columns)) {
        for (const col of rowData.columns) {
          if (col.columnNo > maxColumnNo) {
            maxColumnNo = col.columnNo;
          }
        }
      }
    }
    const statusColumnNo = maxColumnNo + 1;

    for (const rowData of rows) {
      const rowNumber = rowData.rowNo;

      if (rowNumber < DATA_START_ROW) {
        this.logger.warn(
          `Skipping row ${rowNumber} as it is less than start row ${DATA_START_ROW}`,
        );
        continue;
      }

      const row = worksheet.getRow(rowNumber);
      const columns = rowData.columns;

      if (columns && Array.isArray(columns)) {
        for (const colData of columns) {
          this.updateCell(row, colData);
        }
      }

      row.commit();
      const statusCell = row.getCell(statusColumnNo);

      statusCell.style = {} as ExcelJS.Style;

      if (rowData.isValid) {
        statusCell.value = 'pass';
        statusCell.font = {
          name: 'Calibri',
          size: 11,
          color: { argb: 'FF008000' },
        };
      } else {
        statusCell.value = 'fail';
        statusCell.font = {
          name: 'Calibri',
          size: 11,
          color: { argb: 'FFFF0000' },
        };
      }
    }
  }

  private updateCell(row: ExcelJS.Row, colData: ValidationColumnDto) {
    const colNumber = colData.columnNo;
    const cell = row.getCell(colNumber);

    cell.value = colData.value;

    if (colData.isValid === false && colData.errors?.length > 0) {
      cell.note = {
        texts: [
          {
            font: ERROR_FONT,
            text: colData.errors.join(', '),
          },
        ],
      };

      cell.style = {
        ...cell.style,
        fill: ERROR_FILL,
      };
    } else {
      if (cell.note) {
        cell.note = null;
      }
      cell.style = {
        ...cell.style,
        fill: {
          type: 'pattern',
          pattern: 'none',
        },
      };
    }
  }
}
