export const nonPrefixCountryName = (countryName: string): string => {
  if(countryName.startsWith('ประเทศ')) {
    return countryName.replace('ประเทศ', '')
  }
  return countryName.trim();
};

export const nonPrefixProvinceName = (provinceName: string): string => {
  if(provinceName.startsWith('จังหวัด')) {
    return provinceName.replace('จังหวัด', '')
  }
  return provinceName.trim();
};

export const nonPrefixDistrictName = (districtName: string): string => {
  if(districtName.startsWith('เขต')) {
    return districtName.replace('เขต', '')
  }
  return districtName.trim();
};

export const nonPrefixSubDistrictName = (subDistrictName: string): string => {
  if(subDistrictName.startsWith('แขวง')) {
    return subDistrictName.replace('แขวง', '')
  }
  return subDistrictName.trim();
};
export const prefixCountryName = (countryName: string): string => {
  if(!countryName.startsWith('ประเทศ')) {
    return 'ประเทศ' + countryName
  }
  return countryName.trim();
};

export const prefixProvinceName = (provinceName: string): string => {
  if(!provinceName.startsWith('จังหวัด')) {
    return 'จังหวัด' + provinceName
  }
  return provinceName.trim();
};

export const prefixDistrictName = (districtName: string): string => {
  if(!districtName.startsWith('เขต')) {
    return 'เขต' + districtName
  }
  return districtName.trim();
};

export const prefixSubDistrictName = (subDistrictName: string): string => {
  if(!subDistrictName.startsWith('แขวง')) {
    return 'แขวง' + subDistrictName
  }
  return subDistrictName.trim();
};