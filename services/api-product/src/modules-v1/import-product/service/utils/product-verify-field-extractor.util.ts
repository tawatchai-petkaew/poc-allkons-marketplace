import { KEY_COLUMNS_IMPORT_PRODUCTS } from '@/constant/key-column';
import { KeyNormalizer } from './key-normalizer.util';

export interface ProductFields {
  productBarcode: string;
  brand: string;
  productName: string;
}


export class ProductVerifyFieldExtractor {
  private static readonly REQUIRED_FIELDS = new Set<string>([
    KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode,
    KEY_COLUMNS_IMPORT_PRODUCTS.Brand,
    KEY_COLUMNS_IMPORT_PRODUCTS.ProductName,
  ]);

  static verifyFieldExtract(
    columns: Array<{ key: string; value: string }>,
  ): ProductFields | null {
    let productBarcode: string = '';
    let brand: string = '';
    let productName: string = '';

    for (const col of columns) {
      const normalizedKey = KeyNormalizer.normalize(col.key);

      if (normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode) {
        productBarcode = (col.value?.trim() || '');
      } else if (normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.Brand) {
        brand = (col.value?.trim() || '');
      } else if (normalizedKey === KEY_COLUMNS_IMPORT_PRODUCTS.ProductName) {
        productName = (col.value?.trim() || '');
      }
    }

    if (!productBarcode && !brand && !productName) {
      return null;
    }

    return { productBarcode, brand, productName };
  }

  static isRequiredField(normalizedKey: string): boolean {
    return this.REQUIRED_FIELDS.has(normalizedKey);
  }
}

