import { Injectable } from '@nestjs/common';
import { ProductVerifyFieldExtractor, ProductFields } from './utils/product-verify-field-extractor.util';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';

export interface DuplicateInfo {
  rowIndices: number[];
  isDuplicate: boolean;
}

@Injectable()
export class ProductDuplicateDetectionService {

  detectDuplicates(
    rows: Array<{ rowNo: number; columns: Array<{ key: string; value: string }> }>,
  ): Map<number, DuplicateInfo> {
    const combinationMap = new Map<string, number[]>();

    for (const row of rows) {
      const fields = ProductVerifyFieldExtractor.verifyFieldExtract(row.columns);
      if (!fields) {
        continue;
      }

      const key = this.createCombinationKey(fields);
      const existing = combinationMap.get(key) || [];
      existing.push(row.rowNo);
      combinationMap.set(key, existing);
    }

    const duplicateMap = new Map<number, DuplicateInfo>();

    for (const [, rowIndices] of combinationMap.entries()) {
      const isDuplicate = rowIndices.length > 1;

      for (const rowNo of rowIndices) {
        duplicateMap.set(rowNo, {
          rowIndices,
          isDuplicate,
        });
      }
    }

    return duplicateMap;
  }

  /**
   * Detect duplicate barcodes in the file
   * Returns a map of row numbers to duplicate info based on barcode only
   */
  detectBarcodeDuplicates(
    rows: Array<{ rowNo: number; columns: Array<{ key: string; value: string }> }>,
  ): Map<number, DuplicateInfo> {
    const barcodeMap = new Map<string, number[]>();

    for (const row of rows) {
      const fields = ProductVerifyFieldExtractor.verifyFieldExtract(row.columns);
      if (!fields) {
        continue;
      }

      const barcode = fields.productBarcode.toLowerCase().trim();
      if (!barcode) {
        continue; // Skip empty barcodes
      }

      const existing = barcodeMap.get(barcode) || [];
      existing.push(row.rowNo);
      barcodeMap.set(barcode, existing);
    }

    const duplicateMap = new Map<number, DuplicateInfo>();

    for (const [, rowIndices] of barcodeMap.entries()) {
      const isDuplicate = rowIndices.length > 1;

      for (const rowNo of rowIndices) {
        duplicateMap.set(rowNo, {
          rowIndices,
          isDuplicate,
        });
      }
    }

    return duplicateMap;
  }



  private createCombinationKey(fields: ProductFields): string {
    const normalized = {
      productBarcode: fields.productBarcode.toLowerCase().trim(),
      brand: fields.brand.toLowerCase().trim(),
      productName: fields.productName.toLowerCase().trim(),
    };
    return `${normalized.productBarcode}|${normalized.brand}|${normalized.productName}`;
  }


  getDuplicateErrorMessage(duplicateInfo: DuplicateInfo, currentRowNo: number): string {
    if (!duplicateInfo.isDuplicate) {
      return '';
    }
    const otherRows = duplicateInfo.rowIndices
      .filter((rowNo) => rowNo !== currentRowNo)
      .sort((a, b) => a - b);

    if (otherRows.length === 0) {
      return '';
    }
    return ErrorMessagesImportProduct.DUPLICATE_ERROR_MESSAGE;
  }

  getBarcodeDuplicateErrorMessage(duplicateInfo: DuplicateInfo, currentRowNo: number): string {
    if (!duplicateInfo.isDuplicate) {
      return '';
    }
    const otherRows = duplicateInfo.rowIndices
      .filter((rowNo) => rowNo !== currentRowNo)
      .sort((a, b) => a - b);

    if (otherRows.length === 0) {
      return '';
    }
    return ErrorMessagesImportProduct.DUPLICATE_BARCODE_ERROR;
  }
}

