/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ImportProductValidatorService } from './import-product-validator.service';
import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';
import { ErrorMessagesImportProduct } from '@/constant/error-messages';
import { DateValidator } from './utils/date-validator.util';

jest.mock('./utils/key-normalizer.util', () => ({
  KeyNormalizer: {
    normalize: jest.fn((key: string) => key),
  },
}));

jest.mock('./utils/date-validator.util', () => ({
  DateValidator: {
    validateDateFormat: jest.fn(() => null),
  },
}));

describe('ImportProductValidatorService', () => {
  let service: ImportProductValidatorService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportProductValidatorService],
    }).compile();

    service = module.get<ImportProductValidatorService>(
      ImportProductValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCell', () => {
    it('should return valid result when no errors', () => {
      const result = service.validateCell('ProductBarcode', '1234567890123', 3);

      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('should return invalid result when errors exist', () => {
      const result = service.validateCell('ProductBarcode', '123,456', 3);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
      );
    });

    it('should handle multiple errors', () => {
      const result = service.validateCell('RegularPrice', '12345678901234', 3);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty value', () => {
      const result = service.validateCell('Brand', '', 3);

      expect(result.isValid).toBe(true);
    });

    it('should handle null value', () => {
      const result = service.validateCell('ProductName', null as any, 3);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validate', () => {
    describe('ProductBarcode validation', () => {
      it('should return error for comma-separated values', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode,
          '123,456',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
        );
      });

      it('should pass for valid barcode', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode,
          '1234567890123',
        );

        expect(result).toEqual([]);
      });
    });

    describe('PricingTypes validation', () => {
      it('should return error for empty value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
          '',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR,
        );
      });

      it('should return error for invalid value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
          'Invalid',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
        );
      });

      it('should pass for InVAT', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
          'InVAT',
        );

        expect(result).toEqual([]);
      });

      it('should pass for ExVAT', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
          'ExVAT',
        );

        expect(result).toEqual([]);
      });
    });

    describe('RegularPrice validation', () => {
      it('should return error for empty value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR,
        );
      });

      it('should return error for zero', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '0',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.MUST_BE_GREATER_THAN_ZERO,
        );
      });

      it('should return error for negative number', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '-100',
        );

        expect(result).toContain(ErrorMessagesImportProduct.MUST_BE_NUMERIC);
      });

      it('should return error for comma-separated number', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '1,000',
        );

        expect(result).toContain(ErrorMessagesImportProduct.MUST_BE_NUMERIC);
      });

      it('should return error for hyphen-separated number', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '1-000',
        );

        expect(result).toContain(ErrorMessagesImportProduct.MUST_BE_NUMERIC);
      });

      it('should return error for length > 13', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '12345678901234',
        );

        expect(result).toContain(ErrorMessagesImportProduct.MAX_LENGTH_ERROR);
      });

      it('should pass for valid price', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
          '100.50',
        );

        expect(result).toEqual([]);
      });
    });

    describe('SpecialPrice validation', () => {
      it('should pass for empty value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
          '',
        );

        expect(result).toEqual([]);
      });

      it('should return error for zero', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
          '0',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.MUST_BE_GREATER_THAN_ZERO,
        );
      });

      it('should return error for negative number', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
          '-50',
        );

        expect(result).toContain(ErrorMessagesImportProduct.MUST_BE_NUMERIC);
      });

      it('should pass for valid price', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
          '50.25',
        );

        expect(result).toEqual([]);
      });
    });

    describe('Vat validation', () => {
      it('should return error for empty value', () => {
        const result = service.validate(KEY_COLUMNS_IMPORT_PRODUCTS.Vat, '');

        expect(result).toContain(
          ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR,
        );
      });

      it('should return error for invalid value', () => {
        const result = service.validate(KEY_COLUMNS_IMPORT_PRODUCTS.Vat, '2');

        expect(result).toContain(
          ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
        );
      });

      it('should pass for 0', () => {
        const result = service.validate(KEY_COLUMNS_IMPORT_PRODUCTS.Vat, '0');

        expect(result).toEqual([]);
      });

      it('should pass for 3', () => {
        const result = service.validate(KEY_COLUMNS_IMPORT_PRODUCTS.Vat, '3');

        expect(result).toEqual([]);
      });

      it('should pass for 7', () => {
        const result = service.validate(KEY_COLUMNS_IMPORT_PRODUCTS.Vat, '7');

        expect(result).toEqual([]);
      });
    });

    describe('CustomersRequiredInquire validation', () => {
      it('should return error for empty value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          '',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR,
        );
      });

      it('should return error for invalid value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          'Test',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
        );
      });

      it('should pass for Y (uppercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          'Y',
        );

        expect(result).toEqual([]);
      });

      it('should pass for y (lowercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          'y',
        );

        expect(result).toEqual([]);
      });

      it('should pass for N (uppercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          'N',
        );

        expect(result).toEqual([]);
      });

      it('should pass for n (lowercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
          'n',
        );

        expect(result).toEqual([]);
      });
    });

    describe('ProductStatus validation', () => {
      it('should return error for empty value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          '',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR,
        );
      });

      it('should return error for invalid value', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          'Test',
        );

        expect(result).toContain(
          ErrorMessagesImportProduct.INVALID_FORMAT_ERROR,
        );
      });

      it('should pass for Selling (uppercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          'Selling',
        );

        expect(result).toEqual([]);
      });

      it('should pass for selling (lowercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          'selling',
        );

        expect(result).toEqual([]);
      });

      it('should pass for Hidden (uppercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          'Hidden',
        );

        expect(result).toEqual([]);
      });

      it('should pass for hidden (lowercase)', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
          'hidden',
        );

        expect(result).toEqual([]);
      });
    });

    describe('Date validation', () => {
      it('should validate SpecialPriceStartDate format', () => {
        (DateValidator.validateDateFormat as jest.Mock).mockReturnValue(
          'Invalid date format',
        );

        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
          '1 Dec 2568',
        );

        expect(DateValidator.validateDateFormat).toHaveBeenCalledWith(
          '1 Dec 2568',
        );
        expect(result).toContain('Invalid date format');
      });

      it('should validate SpecialPriceEndDate format', () => {
        (DateValidator.validateDateFormat as jest.Mock).mockReturnValue(
          'Invalid date format',
        );

        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
          '1 Dec 2568',
        );

        expect(DateValidator.validateDateFormat).toHaveBeenCalledWith(
          '1 Dec 2568',
        );
        expect(result).toContain('Invalid date format');
      });

      it('should pass for valid date format', () => {
        (DateValidator.validateDateFormat as jest.Mock).mockReturnValue(null);

        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
          '15/01/2568',
        );

        expect(result).toEqual([]);
      });

      it('should pass for empty date', () => {
        const result = service.validate(
          KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
          '',
        );

        expect(result).toEqual([]);
      });
    });

    describe('Unknown keys', () => {
      it('should return empty array for unknown key', () => {
        const result = service.validate('UnknownKey', 'any value');

        expect(result).toEqual([]);
      });
    });
  });
});
