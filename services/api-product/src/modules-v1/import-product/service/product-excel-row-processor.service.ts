import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DataRowStatus } from '../dto/extract-excel-response.dto';
import { ExcelParserService } from '@/common/service/excel-parser.service';
import { ImportProductValidatorService } from './import-product-validator.service';
import { ProductDuplicateDetectionService } from './product-duplicate-detection.service';
import { KeyNormalizer } from './utils/key-normalizer.util';
import { ProductVerifyFieldExtractor } from './utils/product-verify-field-extractor.util';
import { ValueNormalizer } from './utils/value-normalizer.util';
import { DateValidator } from './utils/date-validator.util';
import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';

@Injectable()
export class ProductExcelRowProcessorService {
  constructor(
    private readonly excelParser: ExcelParserService,
    private readonly validator: ImportProductValidatorService,
    private readonly duplicateDetector: ProductDuplicateDetectionService,
  ) {}

  async processRows(
    worksheet: ExcelJS.Worksheet,
    keys: string[],
    startRow: number = 3,
  ): Promise<DataRowStatus[]> {
    const rows: DataRowStatus[] = [];
    const keysLength = keys.length;

    for (let rowIndex = startRow; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      if (!this.excelParser.isValidRow(row, keysLength)) {
        continue;
      }

      const rowData = this.processVerifyRowExcelFormat(row, keys, rowIndex);
      if (rowData.columns.some((col) => col.value)) {
        rows.push(rowData);
      }
    }

    // เช็คซ้ำเฉพาะ Barcode เท่านั้น (ไม่เช็ค brand+name)
    const barcodeDuplicateMap = this.duplicateDetector.detectBarcodeDuplicates(rows);

    this.applyBarcodeDuplicateErrors(rows, barcodeDuplicateMap);

    return rows;
  }

  private applyDuplicateErrors(
    rows: DataRowStatus[],
    duplicateMap: Map<
      number,
      import('./product-duplicate-detection.service').DuplicateInfo
    >,
  ): void {
    for (const rowData of rows) {
      const duplicateInfo = duplicateMap.get(rowData.rowNo);
      if (!duplicateInfo?.isDuplicate) {
        continue;
      }

      const errorMessage = this.duplicateDetector.getDuplicateErrorMessage(
        duplicateInfo,
        rowData.rowNo,
      );

      if (errorMessage) {
        for (const col of rowData.columns) {
          col.errors.push(errorMessage);
          col.isValid = false;
        }
        rowData.isValid = false;
      }
    }
  }

  private applyBarcodeDuplicateErrors(
    rows: DataRowStatus[],
    barcodeDuplicateMap: Map<
      number,
      import('./product-duplicate-detection.service').DuplicateInfo
    >,
  ): void {
    for (const rowData of rows) {
      const duplicateInfo = barcodeDuplicateMap.get(rowData.rowNo);
      if (!duplicateInfo?.isDuplicate) {
        continue;
      }

      const errorMessage = this.duplicateDetector.getBarcodeDuplicateErrorMessage(
        duplicateInfo,
        rowData.rowNo,
      );

      if (errorMessage) {
        // Apply error only to ProductBarcode column
        const barcodeCol = rowData.columns.find(col => col.key === 'ProductBarcode');
        if (barcodeCol) {
          barcodeCol.errors.push(errorMessage);
          barcodeCol.isValid = false;
          rowData.isValid = false;
        }
      }
    }
  }

  private processVerifyRowExcelFormat(
    row: ExcelJS.Row,
    keys: string[],
    rowIndex: number,
  ): DataRowStatus {
    const rowData: DataRowStatus = {
      rowNo: rowIndex,
      isValid: true,
      columns: [],
    };

    const keysLength = keys.length;
    const columns = new Array(keysLength);

    for (let columnIndex = 1; columnIndex <= keysLength; columnIndex++) {
      const key = keys[columnIndex - 1];
      const cell = row.getCell(columnIndex);
      let value = this.excelParser.getCellValue(cell);

      const validationResult = this.validator.validateCell(
        key,
        value,
        rowIndex,
      );

      if (
        validationResult.isValid &&
        (key === KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice ||
          key === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice)
      ) {
        value = ValueNormalizer.normalize(key, value);
      }

      const column = {
        columnNo: columnIndex,
        key,
        value: value || '',
        isValid: validationResult.isValid,
        errors: [...validationResult.errors],
      };

      columns[columnIndex - 1] = column;
      rowData.columns = columns;

      if (!validationResult.isValid) {
        rowData.isValid = false;
      }
    }

    this.validateRequiredProductFields(rowData);
    this.validateDateFields(rowData);

    return rowData;
  }

  private validateRequiredProductFields(rowData: DataRowStatus): void {
    const fields = ProductVerifyFieldExtractor.verifyFieldExtract(
      rowData.columns,
    );

    if (!fields) {
      const errorMessage = ErrorMessagesImportProduct.EMPTY_FIELDS_ERROR;
      for (const col of rowData.columns) {
        const normalizedKey = KeyNormalizer.normalize(col.key);
        if (ProductVerifyFieldExtractor.isRequiredField(normalizedKey)) {
          col.errors.push(errorMessage);
          col.isValid = false;
          rowData.isValid = false;
        }
      }
    }
  }

  private validateDateFields(rowData: DataRowStatus): void {
    let specialPrice = '';
    let specialPriceStartDate = '';
    let specialPriceEndDate = '';

    for (const col of rowData.columns) {
      const normalizedKey = KeyNormalizer.normalize(col.key);
      if (normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice) {
        specialPrice = col.value?.trim() || '';
      } else if (
        normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate
      ) {
        specialPriceStartDate = col.value?.trim() || '';
      } else if (
        normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate
      ) {
        specialPriceEndDate = col.value?.trim() || '';
      }
    }

    if (specialPriceStartDate) {
      const startDateCol = rowData.columns.find(
        (col) =>
          KeyNormalizer.normalize(col.key) ===
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
      );

      if (startDateCol && startDateCol.isValid && specialPrice) {
        const startDateError =
          DateValidator.validateSpecialPriceStartDateComparison(
            specialPriceStartDate,
          );
        if (startDateError) {
          startDateCol.errors.push(startDateError);
          startDateCol.isValid = false;
          rowData.isValid = false;
        }
      }
    }

    if (specialPriceEndDate) {
      const endDateCol = rowData.columns.find(
        (col) =>
          KeyNormalizer.normalize(col.key) ===
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
      );

      if (endDateCol && endDateCol.isValid) {
        const endDateError =
          DateValidator.validateSpecialPriceEndDateComparison(
            specialPriceEndDate,
            specialPriceStartDate,
          );
        if (endDateError) {
          endDateCol.errors.push(endDateError);
          endDateCol.isValid = false;
          rowData.isValid = false;
        }
      }
    }
  }
}
