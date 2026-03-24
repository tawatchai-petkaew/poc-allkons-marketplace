import {
  formatPhoneToCompactNational,
  generateSlug,
  maskPhoneNumber,
  isNonEmptyArray,
  isEmptyArray,
  isNonEmptyObj,
  isEmptyObj,
  isNonEmptyString,
  isValidThaiID,
  detectLanguage,
  isEmail,
  isPhoneNumber,
  detectUsernameType,
  ensureUniqueSlug,
  convertMimeTypeToFileType,
  convertStringToDate,
  extractNumber,
  removeOrganizationNamePrefixSuffix,
  generateUUID,
  getPlatform,
} from './utils';
import { Platform } from '../model/organization-contact.entity';

describe('Utils Functions', () => {
  describe('formatPhoneToCompactNational', () => {
    it('should format Thai phone', () => {
      const result = formatPhoneToCompactNational('0812345678', '66');
      expect(result).toBeTruthy();
      expect(result).toContain('8');
    });

    it('should return null for invalid phone', () => {
      expect(formatPhoneToCompactNational('invalid', '66')).toBeNull();
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from English text', async () => {
      const result = await generateSlug('Test Company');
      expect(result).toMatch(/^test-company-[a-z0-9]{4}$/);
    });

    it('should handle special characters', async () => {
      const result = await generateSlug('Test@#$Company!!!');
      expect(result).toMatch(/^testcompany-[a-z0-9]{4}$/);
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask without pattern', () => {
      expect(maskPhoneNumber('0812345678')).toBe('081*****78');
    });

    it('should mask with pattern', () => {
      expect(maskPhoneNumber('0812345678', true)).toBe('081-****-678');
    });
  });

  describe('Array helpers', () => {
    it('isNonEmptyArray should work correctly', () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray('not array')).toBe(false);
    });

    it('isEmptyArray should work correctly', () => {
      expect(isEmptyArray([])).toBe(true);
      expect(isEmptyArray([1])).toBe(false);
    });
  });

  describe('Object helpers', () => {
    it('isNonEmptyObj should work correctly', () => {
      expect(isNonEmptyObj({ key: 'value' })).toBe(true);
      expect(isNonEmptyObj({})).toBe(false);
      expect(isNonEmptyObj(null)).toBe(false);
      expect(isNonEmptyObj([1, 2])).toBe(false);
    });

    it('isEmptyObj should work correctly', () => {
      expect(isEmptyObj({})).toBe(true);
      expect(isEmptyObj({ key: 'value' })).toBe(false);
    });
  });

  describe('String helpers', () => {
    it('isNonEmptyString should work correctly', () => {
      expect(isNonEmptyString('test')).toBe(true);
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(null as any)).toBe(false);
    });
  });

  describe('isValidThaiID', () => {
    it('should validate Thai ID correctly', () => {
      expect(isValidThaiID('1234567890123')).toBe(false);
      expect(isValidThaiID('123')).toBe(false);
      expect(isValidThaiID('abcd123456789')).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('should detect Thai', () => {
      expect(detectLanguage('สวัสดี')).toBe('thai');
    });

    it('should detect English', () => {
      expect(detectLanguage('Hello')).toBe('english');
    });

    it('should return unknown for numbers', () => {
      expect(detectLanguage('12345')).toBe('unknown');
    });
  });

  describe('Email and Phone detection', () => {
    it('isEmail should work correctly', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('test@')).toBe(false);
    });

    it('isPhoneNumber should work correctly', () => {
      expect(isPhoneNumber('0812345678')).toBe(true);
      expect(isPhoneNumber('+66812345678')).toBe(true);
      expect(isPhoneNumber('123')).toBe(false);
    });

    it('detectUsernameType should work correctly', () => {
      expect(detectUsernameType('test@example.com')).toBe('email');
      expect(detectUsernameType('0812345678')).toBe('phone');
      expect(detectUsernameType('')).toBe('unknown');
      expect(detectUsernameType('abc')).toBe('unknown');
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return slug if not exists', async () => {
      const checkFn = jest.fn().mockResolvedValue(false);
      const result = await ensureUniqueSlug('test', checkFn);
      expect(result).toBe('test');
    });

    it('should generate new slug if exists', async () => {
      const checkFn = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      const result = await ensureUniqueSlug('test', checkFn);
      expect(result).toMatch(/^test-[a-z0-9]{4}$/);
    });
  });

  describe('convertMimeTypeToFileType', () => {
    it('should convert jpg/jpeg', async () => {
      expect(await convertMimeTypeToFileType('.jpg')).toBe('image/jpeg');
      expect(await convertMimeTypeToFileType('.jpeg')).toBe('image/jpeg');
    });
    it('should convert png', async () => {
      expect(await convertMimeTypeToFileType('.png')).toBe('image/png');
    });
    it('should default to octet-stream', async () => {
      expect(await convertMimeTypeToFileType('.txt')).toBe(
        'application/octet-stream',
      );
    });
  });

  describe('convertStringToDate', () => {
    it('should convert valid string', async () => {
      const date = await convertStringToDate('20230101');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2023);
    });
    it('should return null for invalid length', async () => {
      expect(await convertStringToDate('123')).toBeNull();
    });
    it('should return null for invalid numbers', async () => {
      expect(await convertStringToDate('abcdefgh')).toBeNull();
    });
  });

  describe('extractNumber', () => {
    it('should extract number from format prefix-number', async () => {
      expect(await extractNumber('prefix-123')).toBe('123');
    });
    it('should return null for invalid format', async () => {
      expect(await extractNumber('invalid')).toBeNull();
      expect(await extractNumber('a-b-c')).toBeNull();
    });
  });

  describe('removeOrganizationNamePrefixSuffix', () => {
    it('should remove juristic prefix/suffix', async () => {
      const result = await removeOrganizationNamePrefixSuffix(
        'บริษัท ทดสอบ จำกัด',
        { prefix: 'บริษัท', subfix: 'จำกัด' },
      );
      expect(result).toBe('ทดสอบ');
    });

    it('should remove common prefix/suffix if juristic details not provided', async () => {
      const result = await removeOrganizationNamePrefixSuffix(
        'บริษัท ทดสอบ จำกัด (มหาชน)',
        {} as any,
      );
      expect(result).toBe('ทดสอบ');
    });

    it('should return original if undefined', async () => {
      expect(
        await removeOrganizationNamePrefixSuffix(undefined as any, {} as any),
      ).toBeUndefined();
    });
  });

  describe('generateUUID', () => {
    it('should return a string', async () => {
      expect(typeof (await generateUUID())).toBe('string');
    });
  });

  describe('getPlatform', () => {
    it('should return BUYER platform', () => {
      process.env.APP_ID_BUYER = 'buyer-key';
      const req = { headers: { 'app-id': 'buyer-key' } };
      expect(getPlatform(req)).toBe(Platform.BUYER);
    });
    it('should return SELLER platform', () => {
      process.env.APP_ID_BUYER = 'buyer-key';
      const req = { headers: { 'app-id': 'seller-key' } };
      expect(getPlatform(req)).toBe(Platform.SELLER);
    });
    it('should return MARKETPLACE platform', () => {
      process.env.APP_ID_BUYER = 'buyer-key';
      const req = { headers: { 'app-id': 'marketplace-key' } };
      expect(getPlatform(req)).toBe(Platform.MARKETPLACE);
    });
  });
});
