import { Platform } from '@/model/organization-contact.entity';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { v4 as uuidv4 } from 'uuid';

export function formatPhoneToCompactNational(
  phone: string,
  countryCode: string,
): string | null {
  const fullPhone = `+${countryCode}${phone.replace(/^0/, '')}`;
  const phoneNumber = parsePhoneNumberFromString(fullPhone);

  if (phoneNumber && phoneNumber.isValid()) {
    const national = phoneNumber.formatNational();
    return national.replace(/\D/g, '');
  }

  return null;
}

export async function generateSlug(name: string): Promise<string> {
  const thaiToEnglishMap = {
    ก: 'k',
    ข: 'kh',
    ฃ: 'kh',
    ค: 'kh',
    ฅ: 'kh',
    ฆ: 'kh',
    ง: 'ng',
    จ: 'ch',
    ฉ: 'ch',
    ช: 'ch',
    ซ: 's',
    ฌ: 'ch',
    ญ: 'y',
    ฎ: 'd',
    ฏ: 't',
    ฐ: 'th',
    ฑ: 'th',
    ฒ: 'th',
    ณ: 'n',
    ด: 'd',
    ต: 't',
    ถ: 'th',
    ท: 'th',
    ธ: 'th',
    น: 'n',
    บ: 'b',
    ป: 'p',
    ผ: 'ph',
    ฝ: 'f',
    พ: 'ph',
    ฟ: 'f',
    ภ: 'ph',
    ม: 'm',
    ย: 'y',
    ร: 'r',
    ล: 'l',
    ว: 'w',
    ศ: 's',
    ษ: 's',
    ส: 's',
    ห: 'h',
    ฬ: 'l',
    อ: '',
    ฮ: 'h',
    ะ: 'a',
    'ั': 'a',
    า: 'a',
    ำ: 'am',
    'ิ': 'i',
    'ี': 'i',
    'ึ': 'ue',
    'ื': 'ue',
    'ุ': 'u',
    'ู': 'u',
    เ: 'e',
    แ: 'ae',
    โ: 'o',
    ใ: 'ai',
    ไ: 'ai',
    '่': '',
    '้': '',
    '๊': '',
    '๋': '',
    '็': '',
    '์': '',
    ๆ: '',
  };

  let slug = name.trim().toLowerCase();

  for (const [thai, english] of Object.entries(thaiToEnglishMap)) {
    slug = slug.replace(new RegExp(thai, 'g'), english);
  }

  slug = slug
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${randomSuffix}`;
}

export async function ensureUniqueSlug(
  slug: string,
  checkExistingFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const exists = await checkExistingFn(slug);
  if (!exists) {
    return slug;
  } else {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return ensureUniqueSlug(`${slug}-${randomSuffix}`, checkExistingFn);
  }
}

export async function convertMimeTypeToFileType(
  fileExtension: string,
): Promise<string> {
  let fileType: string;
  if (fileExtension) {
    const ext = fileExtension.toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        fileType = 'image/jpeg';
        break;
      case '.png':
        fileType = 'image/png';
        break;
      default:
        fileType = 'application/octet-stream';
    }
  }
  return fileType;
}

export const convertStringToDate = async (
  dateString: string,
): Promise<Date | null> => {
  if (!dateString || dateString.length !== 8) return null;

  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  // Validate date parts
  if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
    return null;
  }

  return new Date(`${year}-${month}-${day}`);
};

export async function extractNumber(input: string): Promise<string | null> {
  const parts = input.split('-');
  if (parts.length === 2 && /^\d+$/.test(parts[1])) {
    return parts[1];
  }
  return null;
}

/**
 * Remove organization name prefix and suffix based on juristic type
 * @param organizeName Original organization name
 * @param juristicType Juristic type with prefix and subfix
 * @returns Cleaned organization name
 */
export async function removeOrganizationNamePrefixSuffix(
  organizeName: string,
  juristicType: { prefix: string; subfix: string },
): Promise<string> {
  if (!organizeName || !juristicType) {
    return organizeName;
  }

  let cleanedName = organizeName.trim();

  // Remove prefix if exists
  if (juristicType.prefix && cleanedName.startsWith(juristicType.prefix)) {
    cleanedName = cleanedName.substring(juristicType.prefix.length).trim();
  }

  // Remove suffix if exists
  if (juristicType.subfix && cleanedName.endsWith(juristicType.subfix)) {
    cleanedName = cleanedName
      .substring(0, cleanedName.length - juristicType.subfix.length)
      .trim();
  }

  // Fallback: Remove common prefixes and suffixes if not found in juristicType
  const commonPrefixes = [
    'บริษัท',
    'ห้างหุ้นส่วนสามัญ',
    'ห้างหุ้นส่วนจำกัด',
    'ห้างหุ้นส่วนจำกัด (มหาชน)',
  ];
  const commonSuffixes = ['จำกัด', 'จำกัด (มหาชน)', 'มหาชน'];

  // Remove common prefixes
  for (const prefix of commonPrefixes) {
    if (cleanedName.startsWith(prefix)) {
      cleanedName = cleanedName.substring(prefix.length).trim();
      break;
    }
  }

  // Remove common suffixes
  for (const suffix of commonSuffixes) {
    if (cleanedName.endsWith(suffix)) {
      cleanedName = cleanedName
        .substring(0, cleanedName.length - suffix.length)
        .trim();
      break;
    }
  }

  return cleanedName;
}

export async function generateUUID(): Promise<string> {
  return uuidv4();
}

export function maskPhoneNumber(
  phone: string,
  pattern: boolean = false,
): string {
  if (pattern) {
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1-****-$2');
  }
  return phone.replace(/(\d{3})\d{5}(\d{2})/, '$1*****$2');
}

export function isNonEmptyArray(array: any): boolean {
  return Array.isArray(array) && array.length > 0;
}

export function isEmptyArray(array: any): boolean {
  return !isNonEmptyArray(array);
}

export function isNonEmptyObj(obj: unknown): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.keys(obj).length > 0
  );
}

export function isEmptyObj(obj: unknown): boolean {
  return !isNonEmptyObj(obj);
}

export function isNonEmptyString(value: string): boolean {
  return value != null && value != '';
}

export function isValidThaiID(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;

  const digits = id.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;

  return checkDigit === digits[12];
}

export function detectLanguage(text: string): 'thai' | 'english' | 'unknown' {
  const hasThai = /[ก-๙]/.test(text);
  const hasEnglish = /[a-zA-Z]/.test(text);

  if (hasThai) {
    return 'thai';
  } else if (hasEnglish) {
    return 'english';
  } else {
    return 'unknown';
  }
}

export function getPlatform(req: any): Platform {
  const platform =
    req.headers['app-id'] === process.env.APP_ID_BUYER
      ? Platform.BUYER
      : req.headers['app-id'] === process.env.APP_ID_MARKETPLACE
      ? Platform.MARKETPLACE
      : Platform.SELLER;
  return platform;
}

/**
 * Detect if a string is an email address
 * @param value The string to check
 * @returns true if the string is an email, false otherwise
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Detect if a string is a phone number
 * @param value The string to check
 * @returns true if the string is a phone number, false otherwise
 */
export function isPhoneNumber(value: string): boolean {
  // Check if it contains only digits, spaces, hyphens, plus sign, or parentheses
  // and starts with + or 0 or contains at least 8 digits
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const digitCount = value.replace(/\D/g, '').length;
  return phoneRegex.test(value) && digitCount >= 8;
}

/**
 * Detect the type of username (email or phone number)
 * @param username The username to detect
 * @returns 'email' | 'phone' | 'unknown'
 */
export function detectUsernameType(
  username: string,
): 'email' | 'phone' | 'unknown' {
  if (!username || username.trim() === '') {
    return 'unknown';
  }

  const trimmedUsername = username.trim();

  if (isEmail(trimmedUsername)) {
    return 'email';
  }

  if (isPhoneNumber(trimmedUsername)) {
    return 'phone';
  }

  return 'unknown';
}
