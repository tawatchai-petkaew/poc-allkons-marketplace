import { isValidThaiJuristicId } from '@/utils/validate';
import { describe, expect, it } from 'vitest';

describe('isValidThaiJuristicId', () => {
  it('should return true for a valid juristic id', () => {
    expect(isValidThaiJuristicId('0115566012531')).toBe(true);
    expect(isValidThaiJuristicId('0105534106050')).toBe(true);
    expect(isValidThaiJuristicId('1111111111119')).toBe(true);
  });

  it('should return false for an invalid check digit', () => {
    expect(isValidThaiJuristicId('0105537001254')).toBe(false);
  });

  it('should return false for non-numeric id', () => {
    expect(isValidThaiJuristicId('0abcdefghijk1')).toBe(false);
  });

  it('should return false for id that does not start with 0', () => {
    expect(isValidThaiJuristicId('1105537001255')).toBe(false);
  });

  it('should return false for id that is not 13 digits', () => {
    expect(isValidThaiJuristicId('010553700125')).toBe(false);
    expect(isValidThaiJuristicId('01055370012555')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidThaiJuristicId('')).toBe(false);
  });
});
