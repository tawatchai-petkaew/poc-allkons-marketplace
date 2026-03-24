import { throwTemplateFormatError, throwEmptyDataError } from '@/utils/helpers';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

type ExcelJSLoadInput = Parameters<ExcelJS.Workbook['xlsx']['load']>[0];

@Injectable()
export class ExcelParserService {
  async loadWorkbook(
    buffer: Buffer | Uint8Array | ArrayBuffer,
  ): Promise<ExcelJS.Workbook> {
    try {
      if (!buffer) {
        throw new Error('Buffer is null or undefined');
      }

      let bufferData: Buffer;
      if (buffer instanceof Buffer) {
        bufferData = buffer;
      } else if (buffer instanceof Uint8Array) {
        bufferData = Buffer.from(buffer);
      } else if (buffer instanceof ArrayBuffer) {
        bufferData = Buffer.from(new Uint8Array(buffer));
      } else {
        throw new Error('Invalid buffer type');
      }

      if (bufferData.length === 0) {
        throw new Error('Buffer is empty');
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(bufferData as unknown as ExcelJSLoadInput);
      return workbook;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('sheetNo') || errorMessage.includes('Cannot set properties')) {
        throw new Error('Invalid or corrupted Excel file format');
      }
      throw error;
    }
  }

  getWorksheet(workbook: ExcelJS.Workbook, index: number = 1): ExcelJS.Worksheet {
    const worksheet = workbook.getWorksheet(index) || workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    return worksheet;
  }

  getColumnKeys(
    worksheet: ExcelJS.Worksheet,
    canonicalKeys?: readonly string[],
  ): string[] {
    const headerRow = worksheet.getRow(1);
    const keys: string[] = [];
    let columnIndex = 0;
    const canonicalKeysLength = canonicalKeys?.length || 0;

    headerRow.eachCell((cell) => {
      if (cell.value) {
        if (canonicalKeys && columnIndex < canonicalKeysLength) {
          keys.push(canonicalKeys[columnIndex]);
        } else {
          keys.push(cell.value.toString().trim());
        }
        columnIndex++;
      }
    });

    return keys;
  }

  getCellValue(cell: ExcelJS.Cell): string {
    if (cell.formula) {
      return cell.result?.toString() || '';
    }

    if (cell.type === ExcelJS.ValueType.Date) {
      const date = cell.value as Date;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    if (cell.type === ExcelJS.ValueType.RichText || cell.type === ExcelJS.ValueType.String) {
      if (cell.text !== null && cell.text !== undefined && cell.text.toString().trim()) {
        return cell.text.toString().trim();
      }
    }

    if (cell.text !== null && cell.text !== undefined) {
      const textValue = cell.text.toString().trim();
      const numValue = cell.value?.toString().trim() || '';
      if (textValue && (textValue.includes(',') || textValue.includes('-') || textValue !== numValue)) {
        return textValue;
      }
    }

    if (cell.value !== null && cell.value !== undefined) {
      return cell.value.toString().trim();
    }

    return '';
  }

  isValidRow(row: ExcelJS.Row, expectedColumnCount: number): boolean {
    for (let i = 1; i <= expectedColumnCount; i++) {
      const cell = row.getCell(i);
      const value = cell.value;
      if (value !== null && value !== undefined && value.toString().trim() !== '') {
        return true;
      }
    }
    return false;
  }

  validateTemplateFormat(
    worksheet: ExcelJS.Worksheet,
    expectedColumnCount: number,
    expectedValues?: readonly string[],
  ): void {
    const row2 = worksheet.getRow(2);
    const actualRowLength = row2.values && Array.isArray(row2.values)
      ? row2.values.length - 1
      : 0;

    if (expectedValues && expectedValues.length > 0) {
      this.validateExpectedValuesLength(expectedValues.length, expectedColumnCount);
      this.validateRowLength(actualRowLength, expectedColumnCount);
      this.validateRowContent(row2, expectedValues, expectedColumnCount);
    } else {
      this.validateRowLength(actualRowLength, expectedColumnCount);
    }
  }

  private throwTemplateFormatError(): never {
    throwTemplateFormatError();
  }

  private validateExpectedValuesLength(
    actualLength: number,
    expectedLength: number,
  ): void {
    if (actualLength !== expectedLength) {
      this.throwTemplateFormatError();
    }
  }

  private validateRowLength(
    actualLength: number,
    expectedLength: number,
  ): void {
    if (actualLength !== expectedLength) {
      this.throwTemplateFormatError();
    }
  }

  private validateRowContent(
    row: ExcelJS.Row,
    expectedValues: readonly string[],
    expectedColumnCount: number,
  ): void {
    for (let i = 1; i <= expectedColumnCount; i++) {
      const cell = row.getCell(i);
      const actualValue = this.extractCellText(cell);
      const expectedValue = expectedValues[i - 1];

      if (actualValue !== expectedValue) {
        this.throwTemplateFormatError();
      }
    }
  }

  private extractCellText(cell: ExcelJS.Cell): string {
    if (!cell || !cell.value) {
      return '';
    }

    if (cell.value && typeof cell.value === 'object' && 'richText' in cell.value) {
      const richTextArray = (cell.value as any).richText;
      if (Array.isArray(richTextArray)) {
        return richTextArray.map((richText: any) => richText.text || '').join('');
      }
    }

    if (cell.type === ExcelJS.ValueType.RichText && cell.value && Array.isArray(cell.value)) {
      return cell.value.map((richText: any) => richText.text || '').join('');
    }

    if (cell.text !== null && cell.text !== undefined) {
      return cell.text.toString().trim();
    }

    if (cell.value) {
      return cell.value.toString().trim();
    }

    return '';
  }

  validateDataExists(
    worksheet: ExcelJS.Worksheet,
    expectedColumnCount: number,
    startRow: number = 3,
    maxCheckRows: number = 100,
  ): void {
    for (let rowIndex = startRow; rowIndex < startRow + maxCheckRows; rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      if (this.isValidRow(row, expectedColumnCount)) {
        return;
      }
    }
    throwEmptyDataError();
  }
}

