import { idCardCheck } from '@/utils/validate';
import { describe, expect, test } from 'vitest';

describe('Thai ID Card Validation', () => {
  test('Thai ID Card Validation valid', () => {
    expect(idCardCheck('7665358315383')).toBe(true);
    expect(idCardCheck('1158815437727')).toBe(true);
  });
  test('Thai ID Card Validation invalid', () => {
    expect(idCardCheck('1101700203451')).toBe(false);
    expect(idCardCheck('1101700203452')).toBe(false);
  });
  test('wrong length', () => {
    expect(idCardCheck('110170020345')).toBe(false); // Only 12 digits
  });
  test('non-digit characters', () => {
    expect(idCardCheck('11017002A3451')).toBe(false);
  });
  test('starts with 0', () => {
    expect(idCardCheck('0123456789123')).toBe(false);
  });
  test('all zeros', () => {
    expect(idCardCheck('0000000000000')).toBe(false);
  });
});
