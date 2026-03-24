import { Injectable } from '@nestjs/common';
import { KeyNormalizer } from './utils/key-normalizer.util';
import { DateValidator } from './utils/date-validator.util';
import { ErrorMessagesImportProduct } from '../../../constant/error-messages';
import { ProductImportValidationConstants } from '@/constant/valid-value';
import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';

type KeyValidator = (value: string) => string;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class ImportProductValidatorService {
  private static readonly REQUIRED_FIELDS_WHEN_EMPTY = new Set<string>([
    KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
    KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
    KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
    KEY_COLUMNS_IMPORT_PRODUCTS.Vat,
    KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
    KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
  ]);

  private readonly keyValidators: Record<string, KeyValidator[]> = {
    ProductBarcode: [this.validateCommaSeparatedValues.bind(this)],
    Brand: [this.validateCommaSeparatedValues.bind(this)],
    ProductName: [], // ไม่ validate อักขระพิเศษ เพื่อให้สามารถจับคู่สินค้าได้
    PricingTypes: [this.validatePricingTypes.bind(this)],
    RegularPrice: [this.validateRegularPrice.bind(this)],
    SpecialPrice: [this.validateSpecialPrice.bind(this)],
    Vat: [this.validateVat.bind(this)],
    SpecialPriceStartDate: [
      this.validateSpecialPriceStartDateFormat.bind(this),
    ],
    SpecialPriceEndDate: [this.validateSpecialPriceEndDateFormat.bind(this)],
    CustomersRequiredInquire: [
      this.validateCustomersRequiredInquire.bind(this),
    ],
    ProductStatus: [this.validateProductStatus.bind(this)],
  };

  validateCell(
    key: string,
    value: string,
    _rowIndex: number,
  ): ValidationResult {
    const errors = this.validate(key, value ?? '');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validate(key: string, value: string): string[] {
    const normalizedKey = KeyNormalizer.normalize(key);
    const validators = this.keyValidators[normalizedKey];
    if (!validators?.length) {
      return [];
    }

    const trimmedValue = value?.trim() || '';
    if (
      !trimmedValue &&
      !ImportProductValidatorService.REQUIRED_FIELDS_WHEN_EMPTY.has(
        normalizedKey,
      )
    ) {
      return [];
    }

    const errors: string[] = [];
    for (const validator of validators) {
      const error = validator(trimmedValue);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  private validateCommaSeparatedValues(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (ProductImportValidationConstants.COMMA_SEPARATOR_REGEX.test(trimmed)) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    return null;
  }

  private validatePricingTypes(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR;
    }

    if (ProductImportValidationConstants.COMMA_SEPARATOR_REGEX.test(trimmed)) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    if (!ProductImportValidationConstants.VALID_PRICING_TYPES.has(trimmed)) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    return null;
  }

  private validateRegularPrice(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR;
    }

    if (ProductImportValidationConstants.COMMA_SEPARATOR_REGEX.test(trimmed)) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (
      ProductImportValidationConstants.HYPHEN_IN_MIDDLE_NOT_START_REGEX.test(
        trimmed,
      )
    ) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (
      !ProductImportValidationConstants.NUMERIC_WITH_NEGATIVE_REGEX.test(
        trimmed,
      )
    ) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    const numValue = parseFloat(trimmed);

    if (isNaN(numValue)) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (numValue <= 0) {
      return ErrorMessagesImportProduct.MUST_BE_GREATER_THAN_ZERO;
    }

    // Validate decimal places (max 2 decimal places)
    const parts = trimmed.split('.');
    if (parts[1] && parts[1].length > 2) {
      return ErrorMessagesImportProduct.MAX_DECIMAL_PLACES_ERROR;
    }

    // Normalize to always have 2 decimal places to count digits properly
    // This prevents Excel from removing .00 and bypassing validation
    // Example: Excel reads 123456789012.00 as 123456789012, but we normalize it back
    const normalizedValue = numValue.toFixed(2);

    // Check total digits excluding decimal point (max 13 digits)
    // Remove decimal point and count only digits
    const digitsOnly = normalizedValue.replace('.', '');
    // Valid examples: "9999999999.99" -> "999999999999" (12 digits) ✓
    // Invalid examples: "123456789012.00" -> "12345678901200" (14 digits) ✗
    if (digitsOnly.length > ProductImportValidationConstants.MAX_PRICE_LENGTH) {
      return ErrorMessagesImportProduct.MAX_LENGTH_ERROR;
    }

    return null;
  }

  private validateSpecialPrice(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (ProductImportValidationConstants.COMMA_SEPARATOR_REGEX.test(trimmed)) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (
      ProductImportValidationConstants.HYPHEN_IN_MIDDLE_NOT_START_REGEX.test(
        trimmed,
      )
    ) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (
      !ProductImportValidationConstants.NUMERIC_WITH_NEGATIVE_REGEX.test(
        trimmed,
      )
    ) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    const numValue = parseFloat(trimmed);

    if (isNaN(numValue)) {
      return ErrorMessagesImportProduct.MUST_BE_NUMERIC;
    }

    if (numValue <= 0) {
      return ErrorMessagesImportProduct.MUST_BE_GREATER_THAN_ZERO;
    }

    // Validate decimal places (max 2 decimal places)
    const parts = trimmed.split('.');
    if (parts[1] && parts[1].length > 2) {
      return ErrorMessagesImportProduct.MAX_DECIMAL_PLACES_ERROR;
    }

    // Normalize to always have 2 decimal places to count digits properly
    // This prevents Excel from removing .00 and bypassing validation
    const normalizedValue = numValue.toFixed(2);

    // Check total digits excluding decimal point (max 13 digits)
    // Remove decimal point and count only digits
    const digitsOnly = normalizedValue.replace('.', '');
    if (digitsOnly.length > ProductImportValidationConstants.MAX_PRICE_LENGTH) {
      return ErrorMessagesImportProduct.MAX_LENGTH_ERROR;
    }

    return null;
  }

  private validateVat(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR;
    }

    const lowerTrimmed = trimmed.toLowerCase();
    if (
      lowerTrimmed ===
      ProductImportValidationConstants.CASE_INSENSITIVE_VAT_VALUE
    ) {
      return null;
    }

    if (ProductImportValidationConstants.VALID_VAT_VALUES.has(trimmed)) {
      return null;
    }

    return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
  }

  private validateSpecialPriceStartDateFormat(value: string): string {
    if (!value || !value.trim()) {
      return null;
    }
    return DateValidator.validateDateFormat(value);
  }

  private validateSpecialPriceEndDateFormat(value: string): string {
    if (!value || !value.trim()) {
      return null;
    }
    return DateValidator.validateDateFormat(value);
  }

  private validateCustomersRequiredInquire(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR;
    }

    const upperTrimmed = trimmed.toUpperCase();
    if (
      !ProductImportValidationConstants.VALID_CUSTOMERS_REQUIRED_INQUIRE.has(
        upperTrimmed,
      )
    ) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    return null;
  }

  private validateProductStatus(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      return ErrorMessagesImportProduct.REQUIRED_FIELD_ERROR;
    }

    const lowerTrimmed = trimmed.toLowerCase();
    const validLowerValues = Array.from(
      ProductImportValidationConstants.VALID_PRODUCT_STATUS,
    ).map((v) => v.toLowerCase());
    if (!validLowerValues.includes(lowerTrimmed)) {
      return ErrorMessagesImportProduct.INVALID_FORMAT_ERROR;
    }

    return null;
  }
}
