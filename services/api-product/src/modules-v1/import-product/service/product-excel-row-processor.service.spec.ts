/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ProductExcelRowProcessorService } from './product-excel-row-processor.service';
import { ExcelParserService } from '@/common/service/excel-parser.service';
import { ImportProductValidatorService } from './import-product-validator.service';
import { ProductDuplicateDetectionService } from './product-duplicate-detection.service';
import * as ExcelJS from 'exceljs';
import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';
import { ValueNormalizer } from './utils/value-normalizer.util';
import { DateValidator } from './utils/date-validator.util';
import { ProductVerifyFieldExtractor } from './utils/product-verify-field-extractor.util';

// Mock utilities
jest.mock('./utils/key-normalizer.util', () => ({
  KeyNormalizer: {
    normalize: jest.fn((key: string) => key),
  },
}));

jest.mock('./utils/product-verify-field-extractor.util', () => ({
  ProductVerifyFieldExtractor: {
    verifyFieldExtract: jest.fn(),
    isRequiredField: jest.fn((key: string) =>
      ['ProductBarcode', 'Brand', 'ProductName'].includes(key),
    ),
  },
}));

jest.mock('./utils/value-normalizer.util', () => ({
  ValueNormalizer: {
    normalize: jest.fn((key: string, value: string) => value),
  },
}));

jest.mock('./utils/date-validator.util', () => ({
  DateValidator: {
    validateSpecialPriceStartDateComparison: jest.fn(() => null),
    validateSpecialPriceEndDateComparison: jest.fn(() => null),
  },
}));

describe('ProductExcelRowProcessorService', () => {
  let service: ProductExcelRowProcessorService;
  let excelParser: jest.Mocked<ExcelParserService>;
  let validator: jest.Mocked<ImportProductValidatorService>;
  let duplicateDetector: jest.Mocked<ProductDuplicateDetectionService>;

  const mockExcelParser = {
    isValidRow: jest.fn(),
    getCellValue: jest.fn(),
  };

  const mockValidator = {
    validateCell: jest.fn(),
  };

  const mockDuplicateDetector = {
    detectDuplicates: jest.fn(),
    getDuplicateErrorMessage: jest.fn(),
  };

  let mockWorksheet: jest.Mocked<ExcelJS.Worksheet>;
  let mockRow: jest.Mocked<ExcelJS.Row>;
  let mockCell: jest.Mocked<ExcelJS.Cell>;

  beforeEach(async () => {
    // Create mock cell
    mockCell = {
      value: 'test',
      text: 'test',
    } as any;

    // Create mock row
    mockRow = {
      getCell: jest.fn().mockReturnValue(mockCell),
    } as any;

    // Create mock worksheet
    mockWorksheet = {
      rowCount: 10,
      getRow: jest.fn().mockReturnValue(mockRow),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductExcelRowProcessorService,
        {
          provide: ExcelParserService,
          useValue: mockExcelParser,
        },
        {
          provide: ImportProductValidatorService,
          useValue: mockValidator,
        },
        {
          provide: ProductDuplicateDetectionService,
          useValue: mockDuplicateDetector,
        },
      ],
    }).compile();

    service = module.get<ProductExcelRowProcessorService>(
      ProductExcelRowProcessorService,
    );
    excelParser = module.get(ExcelParserService) as any;
    validator = module.get(ImportProductValidatorService) as any;
    duplicateDetector = module.get(ProductDuplicateDetectionService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processRows', () => {
    const mockKeys = [
      KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode,
      KEY_COLUMNS_IMPORT_PRODUCTS.Brand,
      KEY_COLUMNS_IMPORT_PRODUCTS.ProductName,
    ];

    beforeEach(() => {
      (excelParser.isValidRow as jest.Mock).mockReturnValue(true);
      (excelParser.getCellValue as jest.Mock).mockReturnValue('value');
      (validator.validateCell as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });
      (duplicateDetector.detectDuplicates as jest.Mock).mockReturnValue(
        new Map(),
      );
    });

    it('should process rows starting from startRow', async () => {
      const result = await service.processRows(
        mockWorksheet as any,
        mockKeys,
        3,
      );

      expect(mockWorksheet.getRow).toHaveBeenCalledWith(3);
      expect(result).toBeDefined();
    });

    it('should skip invalid rows', async () => {
      (excelParser.isValidRow as jest.Mock).mockReturnValue(false);

      const result = await service.processRows(
        mockWorksheet as any,
        mockKeys,
        3,
      );

      expect(result).toEqual([]);
    });

    it('should skip rows with no values', async () => {
      (excelParser.getCellValue as jest.Mock).mockReturnValue('');

      const result = await service.processRows(
        mockWorksheet as any,
        mockKeys,
        3,
      );

      expect(result).toEqual([]);
    });

    it('should process valid rows', async () => {
      const result = await service.processRows(
        mockWorksheet as any,
        mockKeys,
        3,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('rowNo');
      expect(result[0]).toHaveProperty('isValid');
      expect(result[0]).toHaveProperty('columns');
    });

    it('should detect and apply duplicate errors', async () => {
      const duplicateMap = new Map();
      duplicateMap.set(3, {
        rowIndices: [3, 4],
        isDuplicate: true,
      });
      (duplicateDetector.detectDuplicates as jest.Mock).mockReturnValue(
        duplicateMap,
      );
      (duplicateDetector.getDuplicateErrorMessage as jest.Mock).mockReturnValue(
        ErrorMessagesImportProduct.DUPLICATE_ERROR_MESSAGE,
      );

      const result = await service.processRows(
        mockWorksheet as any,
        mockKeys,
        3,
      );

      expect(duplicateDetector.detectDuplicates).toHaveBeenCalled();
      expect(duplicateDetector.getDuplicateErrorMessage).toHaveBeenCalled();
    });
  });

  describe('processVerifyRowExcelFormat', () => {
    it('should create row data with columns', () => {
      const keys = ['ProductBarcode', 'Brand'];
      (excelParser.getCellValue as jest.Mock).mockReturnValue('test');
      (validator.validateCell as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });

      // Access private method via any cast for testing
      const result = (service as any).processVerifyRowExcelFormat(
        mockRow as any,
        keys,
        3,
      );

      expect(result.rowNo).toBe(3);
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0].key).toBe('ProductBarcode');
      expect(result.columns[1].key).toBe('Brand');
    });

    it('should mark row as invalid when validation fails', () => {
      const keys = ['ProductBarcode'];
      (excelParser.getCellValue as jest.Mock).mockReturnValue('invalid');
      (validator.validateCell as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Error message'],
      });

      const result = (service as any).processVerifyRowExcelFormat(
        mockRow as any,
        keys,
        3,
      );

      expect(result.isValid).toBe(false);
      expect(result.columns[0].isValid).toBe(false);
      expect(result.columns[0].errors).toContain('Error message');
    });

    it('should normalize RegularPrice and SpecialPrice values', () => {
      const keys = [KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice];
      (excelParser.getCellValue as jest.Mock).mockReturnValue('100.123');
      (validator.validateCell as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });

      (ValueNormalizer.normalize as jest.Mock).mockReturnValue('100.12');

      (service as any).processVerifyRowExcelFormat(mockRow as any, keys, 3);

      expect(ValueNormalizer.normalize).toHaveBeenCalledWith(
        KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
        '100.123',
      );
    });
  });

  describe('validateRequiredProductFields', () => {
    it('should add error when required fields are missing', () => {
      (
        ProductVerifyFieldExtractor.verifyFieldExtract as jest.Mock
      ).mockReturnValue(null);

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          { key: 'ProductBarcode', value: '', isValid: true, errors: [] },
          { key: 'Brand', value: '', isValid: true, errors: [] },
          { key: 'ProductName', value: '', isValid: true, errors: [] },
        ],
      };

      (service as any).validateRequiredProductFields(rowData);

      expect(rowData.isValid).toBe(false);
      expect(rowData.columns[0].errors).toContain(
        ErrorMessagesImportProduct.EMPTY_FIELDS_ERROR,
      );
    });

    it('should not add error when required fields are present', () => {
      (
        ProductVerifyFieldExtractor.verifyFieldExtract as jest.Mock
      ).mockReturnValue({
        productBarcode: '123',
        brand: 'Brand',
        productName: 'Product',
      });

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          { key: 'ProductBarcode', value: '123', isValid: true, errors: [] },
        ],
      };

      (service as any).validateRequiredProductFields(rowData);

      expect(rowData.isValid).toBe(true);
      expect(rowData.columns[0].errors).toEqual([]);
    });

    it('should not add error when only one field has a value', () => {
      (
        ProductVerifyFieldExtractor.verifyFieldExtract as jest.Mock
      ).mockReturnValue({
        productBarcode: '123',
        brand: '',
        productName: '',
      });

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          { key: 'ProductBarcode', value: '123', isValid: true, errors: [] },
          { key: 'Brand', value: '', isValid: true, errors: [] },
          { key: 'ProductName', value: '', isValid: true, errors: [] },
        ],
      };

      (service as any).validateRequiredProductFields(rowData);

      expect(rowData.isValid).toBe(true);
      expect(rowData.columns[0].errors).toEqual([]);
      expect(rowData.columns[1].errors).toEqual([]);
      expect(rowData.columns[2].errors).toEqual([]);
    });
  });

  describe('validateDateFields', () => {
    it('should preserve date fields when SpecialPrice is empty', () => {
      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
            value: '',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
            value: '15/01/2569',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
            value: '30/01/2569',
            isValid: true,
            errors: [],
          },
        ],
      };

      (service as any).validateDateFields(rowData);

      // Dates should remain unchanged
      expect(rowData.columns[1].value).toBe('15/01/2569');
      expect(rowData.columns[1].errors).toEqual([]);
      expect(rowData.columns[1].isValid).toBe(true);
      expect(rowData.columns[2].value).toBe('30/01/2569');
      expect(rowData.columns[2].errors).toEqual([]);
      expect(rowData.columns[2].isValid).toBe(true);
      
      // Date comparison validations should not be called when SpecialPrice is empty
      expect(
        DateValidator.validateSpecialPriceStartDateComparison,
      ).not.toHaveBeenCalled();
      expect(
        DateValidator.validateSpecialPriceEndDateComparison,
      ).not.toHaveBeenCalled();
    });

    it('should validate SpecialPriceStartDate when SpecialPrice is present', () => {
      (
        DateValidator.validateSpecialPriceStartDateComparison as jest.Mock
      ).mockReturnValue('Error');

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
            value: '100',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
            value: '15/01/2569',
            isValid: true,
            errors: [],
          },
        ],
      };

      (service as any).validateDateFields(rowData);

      expect(
        DateValidator.validateSpecialPriceStartDateComparison,
      ).toHaveBeenCalled();
    });

    it('should validate SpecialPriceEndDate when SpecialPrice is present', () => {
      (
        DateValidator.validateSpecialPriceEndDateComparison as jest.Mock
      ).mockReturnValue('Error');

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
            value: '100',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
            value: '15/01/2569',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
            value: '30/01/2569',
            isValid: true,
            errors: [],
          },
        ],
      };

      (service as any).validateDateFields(rowData);

      expect(
        DateValidator.validateSpecialPriceEndDateComparison,
      ).toHaveBeenCalled();
    });

    it('should validate end date comparison even when SpecialPrice is empty', () => {
      (
        DateValidator.validateSpecialPriceStartDateComparison as jest.Mock
      ).mockReturnValue(null);
      (
        DateValidator.validateSpecialPriceEndDateComparison as jest.Mock
      ).mockReturnValue(null);

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
            value: '',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
            value: '15/01/2569',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
            value: '30/01/2569',
            isValid: true,
            errors: [],
          },
        ],
      };

      (service as any).validateDateFields(rowData);

      // Start date comparison (vs current date) should not be called when SpecialPrice is empty
      expect(
        DateValidator.validateSpecialPriceStartDateComparison,
      ).not.toHaveBeenCalled();
      
      // End date comparison (vs start date) should still be called even when SpecialPrice is empty
      expect(
        DateValidator.validateSpecialPriceEndDateComparison,
      ).toHaveBeenCalledWith('30/01/2569', '15/01/2569');
      
      // Dates should remain unchanged
      expect(rowData.columns[1].value).toBe('15/01/2569');
      expect(rowData.columns[2].value).toBe('30/01/2569');
    });

    it('should show error when end date is before start date even when SpecialPrice is empty', () => {
      (
        DateValidator.validateSpecialPriceEndDateComparison as jest.Mock
      ).mockReturnValue(ErrorMessagesImportProduct.END_DATE_BEFORE_START_ERROR);

      const rowData = {
        rowNo: 3,
        isValid: true,
        columns: [
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
            value: '',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
            value: '29/02/2571',
            isValid: true,
            errors: [],
          },
          {
            key: KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
            value: '30/01/2569',
            isValid: true,
            errors: [],
          },
        ],
      };

      (service as any).validateDateFields(rowData);

      const endDateCol = rowData.columns.find(
        (col) => col.key === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
      );

      expect(endDateCol.errors).toContain(
        ErrorMessagesImportProduct.END_DATE_BEFORE_START_ERROR,
      );
      expect(endDateCol.isValid).toBe(false);
      expect(rowData.isValid).toBe(false);
    });
  });
});
