import {
  nonPrefixCountryName,
  nonPrefixProvinceName,
  nonPrefixDistrictName,
  nonPrefixSubDistrictName,
  prefixCountryName,
  prefixProvinceName,
  prefixDistrictName,
  prefixSubDistrictName,
} from './location.utils';

describe('LocationUtils', () => {
  describe('nonPrefixCountryName', () => {
    it('should remove prefix', () => {
      expect(nonPrefixCountryName('ประเทศไทย')).toBe('ไทย');
    });
    it('should return as is if no prefix', () => {
      expect(nonPrefixCountryName('Japan')).toBe('Japan');
    });
  });

  describe('nonPrefixProvinceName', () => {
    it('should remove prefix', () => {
      expect(nonPrefixProvinceName('จังหวัดกรุงเทพ')).toBe('กรุงเทพ');
    });
    it('should return as is if no prefix', () => {
      expect(nonPrefixProvinceName('Tokyo')).toBe('Tokyo');
    });
  });

  describe('nonPrefixDistrictName', () => {
    it('should remove prefix', () => {
      expect(nonPrefixDistrictName('เขตจตุจักร')).toBe('จตุจักร');
    });
    it('should return as is if no prefix', () => {
      expect(nonPrefixDistrictName('Bang Rak')).toBe('Bang Rak');
    });
  });

  describe('nonPrefixSubDistrictName', () => {
    it('should remove prefix', () => {
      expect(nonPrefixSubDistrictName('แขวงลาดยาว')).toBe('ลาดยาว');
    });
    it('should return as is if no prefix', () => {
      expect(nonPrefixSubDistrictName('Silom')).toBe('Silom');
    });
  });

  describe('prefixCountryName', () => {
    it('should add prefix', () => {
      expect(prefixCountryName('ไทย')).toBe('ประเทศไทย');
    });
    it('should not double prefix', () => {
      expect(prefixCountryName('ประเทศไทย')).toBe('ประเทศไทย');
    });
  });

  describe('prefixProvinceName', () => {
    it('should add prefix', () => {
      expect(prefixProvinceName('กรุงเทพ')).toBe('จังหวัดกรุงเทพ');
    });
    it('should not double prefix', () => {
      expect(prefixProvinceName('จังหวัดกรุงเทพ')).toBe('จังหวัดกรุงเทพ');
    });
  });

  describe('prefixDistrictName', () => {
    it('should add prefix', () => {
      expect(prefixDistrictName('จตุจักร')).toBe('เขตจตุจักร');
    });
    it('should not double prefix', () => {
      expect(prefixDistrictName('เขตจตุจักร')).toBe('เขตจตุจักร');
    });
  });

  describe('prefixSubDistrictName', () => {
    it('should add prefix', () => {
      expect(prefixSubDistrictName('ลาดยาว')).toBe('แขวงลาดยาว');
    });
    it('should not double prefix', () => {
      expect(prefixSubDistrictName('แขวงลาดยาว')).toBe('แขวงลาดยาว');
    });
  });
});
