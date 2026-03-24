import { IsValidSubdomainConstraint } from './subdomain.validator';
import { ValidationArguments } from 'class-validator';

describe('IsValidSubdomainConstraint', () => {
  let validator: IsValidSubdomainConstraint;
  const mockArgs = {} as ValidationArguments;

  beforeEach(() => {
    validator = new IsValidSubdomainConstraint();
  });

  describe('validate', () => {
    it('should return false for empty subdomain', () => {
      expect(validator.validate('', mockArgs)).toBe(false);
    });

    it('should return false for invalid length', () => {
      expect(validator.validate('ab', mockArgs)).toBe(false); // < 3 (from isGoodShopNamePattern)
      expect(validator.validate('a'.repeat(64), mockArgs)).toBe(false); // > 63
    });

    it('should return false for invalid characters', () => {
      expect(validator.validate('invalid_char', mockArgs)).toBe(false);
      expect(validator.validate('invalid space', mockArgs)).toBe(false);
      expect(validator.validate('invalid@', mockArgs)).toBe(false);
    });

    it('should return false if starts or ends with hyphen', () => {
      expect(validator.validate('-start', mockArgs)).toBe(false);
      expect(validator.validate('end-', mockArgs)).toBe(false);
    });

    it('should return false if consecutive hyphens', () => {
      expect(validator.validate('double--hyphen', mockArgs)).toBe(false);
    });

    it('should return false if only numbers', () => {
      expect(validator.validate('123456', mockArgs)).toBe(false);
    });

    it('should return false if reserved name', () => {
      expect(validator.validate('www', mockArgs)).toBe(false);
      expect(validator.validate('admin', mockArgs)).toBe(false);
      expect(validator.validate('shop', mockArgs)).toBe(false);
    });

    it('should return false if offensive word', () => {
      expect(validator.validate('my-test-shop', mockArgs)).toBe(false); // 'test' is in OFFENSIVE_WORDS
    });

    it('should return false if bad pattern (starts with digit)', () => {
      expect(validator.validate('1shop', mockArgs)).toBe(false);
    });

    it('should return false if bad pattern (too many hyphens)', () => {
      expect(validator.validate('one-two-three-four-five', mockArgs)).toBe(
        false,
      );
    });

    it('should return true for valid subdomain', () => {
      expect(validator.validate('myshop123', mockArgs)).toBe(true);
      expect(validator.validate('my-cool-shop', mockArgs)).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    const getArgs = (value: any) => ({ value } as ValidationArguments);

    it('should return required message', () => {
      expect(validator.defaultMessage(getArgs(''))).toContain('required');
    });

    it('should check length', () => {
      expect(validator.defaultMessage(getArgs('ab'))).toContain(
        'at least 3 characters',
      );
      expect(validator.defaultMessage(getArgs('a'.repeat(64)))).toContain(
        'not exceed 63 characters',
      );
    });

    it('should check chars', () => {
      expect(validator.defaultMessage(getArgs('bad_char'))).toContain(
        'letters, numbers, and hyphens',
      );
    });

    it('should check hyphens', () => {
      expect(validator.defaultMessage(getArgs('-bad'))).toContain(
        'start or end with a hyphen',
      );
      expect(validator.defaultMessage(getArgs('bad-'))).toContain(
        'start or end with a hyphen',
      );
      expect(validator.defaultMessage(getArgs('bad--bad'))).toContain(
        'consecutive hyphens',
      );
    });

    it('should check numbers', () => {
      expect(validator.defaultMessage(getArgs('12345'))).toContain(
        'only numbers',
      );
      expect(validator.defaultMessage(getArgs('1shop'))).toContain(
        'start with a number',
      );
    });

    it('should check reserved', () => {
      expect(validator.defaultMessage(getArgs('admin'))).toContain('reserved');
    });

    it('should check hyphen count', () => {
      expect(validator.defaultMessage(getArgs('a-b-c-d-e'))).toContain(
        'more than 3 hyphens',
      );
    });

    it('should return generic message', () => {
      // Case that fails validation but passes all specific checks in defaultMessage?
      // E.g. offensive word check is NOT in defaultMessage explicitly?
      // The code for defaultMessage does NOT check offensive words array.
      // It returns 'Invalid subdomain format' at the end.
      expect(validator.defaultMessage(getArgs('my-test-shop'))).toBe(
        'Invalid subdomain format',
      );
    });
  });
});
