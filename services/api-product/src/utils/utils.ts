import { Platform } from '@/model/organization-contact.entity';
import { AuthUser } from '@/types/request.types';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resolves updatedBy string for stamping: prefers userNameFromDb (e.g. from user table by uuid);
 * falls back to user.sub / user.id or 'system' if no user or name empty.
 */
export function resolveUpdatedByStamp(
  user?: AuthUser,
  userNameFromDb?: string | null,
): string {
  const name = userNameFromDb?.trim();
  if (name) return name;
  return user?.sub ?? user?.id?.toString() ?? 'system';
}

export async function generateUUID(): Promise<string> {
  return uuidv4();
}

export function isNonEmptyArray(array: any): boolean {
  return Array.isArray(array) && array.length > 0;
}

export function isEmptyArray(array: any): boolean {
  return !isNonEmptyArray(array);
}

/**
 * Parse order body field to array of order numbers to keep.
 * Frontend can send separate fields (order=1, order=2) or comma-separated (order=1,2).
 * Same pattern as useCustomCoverImage / useCustomMerchantImage (one or more form fields).
 */
export function parseOrderField(orderRaw?: string | string[]): number[] | undefined {
  if (orderRaw == null) return undefined;
  const rawArray = Array.isArray(orderRaw) ? orderRaw : [orderRaw];
  const nums = rawArray
    .flatMap((x) => String(x).split(/[\s,]+/))
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1);
  return nums.length > 0 ? [...new Set(nums)] : undefined;
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
  const phoneRegex = /^[\d\s\-+()]+$/;
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

/**
 * Generate timestamp in YYMMDDHHMMSS format with Thailand timezone (UTC+7)
 * @returns Timestamp string in format YYMMDDHHMMSS (12 characters)
 */
export function generateThailandTimestamp(): string {
  const now = new Date();
  // Add 7 hours for Thailand timezone (UTC+7)
  const thailandTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = String(thailandTime.getUTCFullYear()).slice(-2); // Last 2 digits of year
  const month = String(thailandTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(thailandTime.getUTCDate()).padStart(2, '0');
  const hours = String(thailandTime.getUTCHours()).padStart(2, '0');
  const minutes = String(thailandTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(thailandTime.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate timestamp in YYYYMMDDHHMMSS format with Thailand timezone (UTC+7)
 * @returns Timestamp string in format YYYYMMDDHHMMSS (14 characters)
 */
export function generateThailandTimestampWithFullYear(): string {
  const now = new Date();
  // Add 7 hours for Thailand timezone (UTC+7)
  const thailandTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = String(thailandTime.getUTCFullYear()); // Last 2 digits of year
  const month = String(thailandTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(thailandTime.getUTCDate()).padStart(2, '0');
  const hours = String(thailandTime.getUTCHours()).padStart(2, '0');
  const minutes = String(thailandTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(thailandTime.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Format date to Thai date format (DD/MM/YYYY with Buddhist Era)
 * Buddhist Era = Gregorian year + 543
 * @param date The date to format
 * @returns Formatted date string in DD/MM/YYYY format or empty string if invalid
 * @example formatThaiDate(new Date('2026-02-20')) // Returns "20/02/2569"
 */
export function formatThaiDate(date: Date | null | undefined): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543; // Buddhist Era

  return `${day}/${month}/${year}`;
}

export type TechnicalType = 'PDF' | 'EXCEL' | 'WORD' | 'IMAGE' | 'OTHER';

export function deriveTechnicalType(fileName: string): TechnicalType {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case '.pdf':
      return 'PDF';
    case '.xls':
    case '.xlsx':
      return 'EXCEL';
    case '.doc':
    case '.docx':
      return 'WORD';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.webp':
      return 'IMAGE';
    default:
      return 'OTHER';
  }
}
