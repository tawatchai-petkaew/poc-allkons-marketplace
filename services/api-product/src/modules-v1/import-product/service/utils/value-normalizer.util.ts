import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';
import { roundToTwoDecimals } from '@/utils/price.utils';


export class ValueNormalizer {

  static normalize(key: string, value: string): string {
    const trimmed = value?.trim() || '';
    if (!trimmed) {
      return trimmed;
    }

    if (key === KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice ||
        key === KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice) {
      return roundToTwoDecimals(trimmed);
    }

    return trimmed;
  }

}

