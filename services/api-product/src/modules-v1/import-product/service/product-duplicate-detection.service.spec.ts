/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ProductDuplicateDetectionService } from './product-duplicate-detection.service';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';

describe('ProductDuplicateDetectionService', () => {
  let service: ProductDuplicateDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductDuplicateDetectionService],
    }).compile();

    service = module.get<ProductDuplicateDetectionService>(ProductDuplicateDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectDuplicates', () => {
    it('should detect no duplicates for unique products', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '9876543210987' },
            { key: 'Brand', value: 'BrandB' },
            { key: 'ProductName', value: 'Product B' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.size).toBe(2);
      expect(result.get(3)?.isDuplicate).toBe(false);
      expect(result.get(4)?.isDuplicate).toBe(false);
    });

    it('should detect duplicates for identical products', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.size).toBe(2);
      expect(result.get(3)?.isDuplicate).toBe(true);
      expect(result.get(4)?.isDuplicate).toBe(true);
      expect(result.get(3)?.rowIndices).toEqual([3, 4]);
      expect(result.get(4)?.rowIndices).toEqual([3, 4]);
    });

    it('should detect duplicates case-insensitively', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'branda' },
            { key: 'ProductName', value: 'product a' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.get(3)?.isDuplicate).toBe(true);
      expect(result.get(4)?.isDuplicate).toBe(true);
    });

    it('should handle multiple duplicates', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
        {
          rowNo: 5,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.get(3)?.isDuplicate).toBe(true);
      expect(result.get(4)?.isDuplicate).toBe(true);
      expect(result.get(5)?.isDuplicate).toBe(true);
      expect(result.get(3)?.rowIndices).toEqual([3, 4, 5]);
    });

    it('should skip rows without required fields', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '' },
            { key: 'Brand', value: '' },
            { key: 'ProductName', value: '' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.size).toBe(1);
      expect(result.get(4)?.isDuplicate).toBe(false);
    });

    it('should handle empty rows array', () => {
      const rows: any[] = [];

      const result = service.detectDuplicates(rows);

      expect(result.size).toBe(0);
    });

    it('should trim whitespace in comparison', () => {
      const rows = [
        {
          rowNo: 3,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: '  BrandA  ' },
            { key: 'ProductName', value: '  Product A  ' },
          ],
        },
        {
          rowNo: 4,
          columns: [
            { key: 'ProductBarcode', value: '1234567890123' },
            { key: 'Brand', value: 'BrandA' },
            { key: 'ProductName', value: 'Product A' },
          ],
        },
      ];

      const result = service.detectDuplicates(rows);

      expect(result.get(3)?.isDuplicate).toBe(true);
      expect(result.get(4)?.isDuplicate).toBe(true);
    });
  });

  describe('getDuplicateErrorMessage', () => {
    it('should return error message for duplicate', () => {
      const duplicateInfo = {
        rowIndices: [3, 4],
        isDuplicate: true,
      };

      const message = service.getDuplicateErrorMessage(duplicateInfo, 3);

      expect(message).toBe(ErrorMessagesImportProduct.DUPLICATE_ERROR_MESSAGE);
    });

    it('should return empty string for non-duplicate', () => {
      const duplicateInfo = {
        rowIndices: [3],
        isDuplicate: false,
      };

      const message = service.getDuplicateErrorMessage(duplicateInfo, 3);

      expect(message).toBe('');
    });

    it('should return empty string when no other rows', () => {
      const duplicateInfo = {
        rowIndices: [3],
        isDuplicate: true,
      };

      const message = service.getDuplicateErrorMessage(duplicateInfo, 3);

      expect(message).toBe('');
    });

    it('should filter out current row from other rows', () => {
      const duplicateInfo = {
        rowIndices: [3, 4, 5],
        isDuplicate: true,
      };

      const message = service.getDuplicateErrorMessage(duplicateInfo, 4);

      expect(message).toBe(ErrorMessagesImportProduct.DUPLICATE_ERROR_MESSAGE);
    });
  });
});

