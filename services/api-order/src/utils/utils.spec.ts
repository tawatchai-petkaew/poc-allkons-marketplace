import {
  formatPhoneToCompactNational,
  generateSlug,
  ensureUniqueSlug,
  convertMimeTypeToFileType,
  convertStringToDate,
  extractNumber,
  removeOrganizationNamePrefixSuffix,
  generateUUID,
  maskPhoneNumber,
  isNonEmptyArray,
  isEmptyArray,
  isNonEmptyObj,
  isEmptyObj,
  isNonEmptyString,
  isValidThaiID,
  detectLanguage,
  getPlatform,
  isEmail,
  isPhoneNumber,
  detectUsernameType,
} from './utils';
import { Platform } from '@/model/organization-contact.entity';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('uuid'),
}));

describe('utils', () => {
  describe('formatPhoneToCompactNational', () => {
    it('should format phone number', () => {
      expect(formatPhoneToCompactNational('0812345678', '66')).toBe(
        '0812345678',
      );
    });

    it('should return null for invalid phone', () => {
      expect(formatPhoneToCompactNational('abc', '66')).toBeNull();
    });
  });

  describe('generateSlug', () => {
    it('should generate slug', async () => {
      const slug = await generateSlug('สวัสดี ก-ฮ');
      // 'swasdi k-h' + suffix
      expect(slug).toMatch(/swasdi-k-h-[a-z0-9]+/);
    });
  });

  describe('ensureUniqueSlug', () => {
    it('should return slug if not exists', async () => {
      const result = await ensureUniqueSlug('slug', async () => false);
      expect(result).toBe('slug');
    });

    it('should generate new slug if exists', async () => {
      let callCount = 0;
      const checker = async (s) => {
        if (callCount === 0) {
          callCount++;
          return true;
        }
        return false;
      };
      const result = await ensureUniqueSlug('slug', checker);
      expect(result).toMatch(/slug-[a-z0-9]+/);
    });
  });

  describe('convertMimeTypeToFileType', () => {
    it('should convert jpg', async () => {
      expect(await convertMimeTypeToFileType('.jpg')).toBe('image/jpeg');
    });
    it('should convert png', async () => {
      expect(await convertMimeTypeToFileType('.png')).toBe('image/png');
    });
    it('should default to octet-stream', async () => {
      expect(await convertMimeTypeToFileType('.foo')).toBe(
        'application/octet-stream',
      );
    });
  });

  describe('convertStringToDate', () => {
    it('should convert valid string', async () => {
      const date = await convertStringToDate('20230101');
      expect(date).toEqual(new Date('2023-01-01'));
    });
    it('should return null for invalid length', async () => {
      expect(await convertStringToDate('2023')).toBeNull();
    });
    it('should return null for invalid parts', async () => {
      expect(await convertStringToDate('2023aa01')).toBeNull();
    });
  });

  describe('extractNumber', () => {
    it('should extract number', async () => {
      expect(await extractNumber('abc-123')).toBe('123');
    });
    it('should return null if invalid format', async () => {
      expect(await extractNumber('abc-def')).toBeNull();
    });
  });

  describe('removeOrganizationNamePrefixSuffix', () => {
    it('should remove prefix from juristicType', async () => {
      expect(
        await removeOrganizationNamePrefixSuffix('บริษัท ABC', {
          prefix: 'บริษัท',
          subfix: '',
        }),
      ).toBe('ABC');
    });
    it('should remove common prefix', async () => {
      expect(
        await removeOrganizationNamePrefixSuffix('บริษัท ABC', {
          prefix: '',
          subfix: '',
        }),
      ).toBe('ABC');
    });
    it('should remove common suffix', async () => {
      expect(
        await removeOrganizationNamePrefixSuffix('ABC จำกัด', {
          prefix: '',
          subfix: '',
        }),
      ).toBe('ABC');
    });
  });

  describe('generateUUID', () => {
    it('should generate uuid', async () => {
      expect(await generateUUID()).toBe('uuid');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask phone', () => {
      expect(maskPhoneNumber('0812345678')).toBe('081*****78');
    });
    it('should mask phone with pattern', () => {
      expect(maskPhoneNumber('0812345678', true)).toBe('081-****-678');
    });
  });

  describe('isNonEmptyArray', () => {
    it('should return true', () => {
      expect(isNonEmptyArray([1])).toBe(true);
    });
    it('should return false', () => {
      expect(isNonEmptyArray([])).toBe(false);
    });
  });

  describe('isEmptyArray', () => {
    it('should return true', () => {
      expect(isEmptyArray([])).toBe(true);
    });
  });

  describe('isNonEmptyObj', () => {
    it('should return true', () => {
      expect(isNonEmptyObj({ a: 1 })).toBe(true);
    });
    it('should return false', () => {
      expect(isNonEmptyObj({}));
    });
  });

  describe('isEmptyObj', () => {
    it('should return true', () => {
      expect(isEmptyObj({})).toBe(true);
    });
  });

  describe('isValidThaiID', () => {
    it('should validate thai id', () => {
      // A valid Thai ID is hard to generate randomly, but we can test invalid
      expect(isValidThaiID('1234567890123')).toBe(false);
      expect(isValidThaiID('123')).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('should detect thai', () => {
      expect(detectLanguage('สวัสดี')).toBe('thai');
    });
    it('should detect english', () => {
      expect(detectLanguage('hello')).toBe('english');
    });
    it('should return unknown', () => {
      expect(detectLanguage('123')).toBe('unknown');
    });
  });

  describe('getPlatform', () => {
    it('should return buyer', () => {
      process.env.APP_ID_BUYER = 'buyer-key';
      expect(getPlatform({ headers: { 'app-id': 'buyer-key' } })).toBe(
        Platform.BUYER,
      );
    });
    it('should return seller', () => {
      expect(getPlatform({ headers: { 'app-id': 'other' } })).toBe(
        Platform.SELLER,
      );
    });
  });

  describe('isEmail', () => {
    it('should return true', () => {
      expect(isEmail('test@test.com')).toBe(true);
    });
    it('should return false', () => {
      expect(isEmail('test')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('should return true', () => {
      expect(isPhoneNumber('0812345678')).toBe(true);
    });
    it('should return false', () => {
      expect(isPhoneNumber('abc')).toBe(false);
    });
  });

  describe('detectUsernameType', () => {
    it('should detect email', () => {
      expect(detectUsernameType('test@test.com')).toBe('email');
    });
    it('should detect phone', () => {
      expect(detectUsernameType('0812345678')).toBe('phone');
    });
    it('should return unknown', () => {
      expect(detectUsernameType('abc')).toBe('unknown');
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non empty string', () => {
      expect(isNonEmptyString('a')).toBe(true);
    });
    it('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });
  });
});
