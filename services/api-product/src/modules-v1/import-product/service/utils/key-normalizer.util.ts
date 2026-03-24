import { ProductImportValidationConstants } from "@/constant/valid-value";

export class KeyNormalizer {
  private static readonly cache = new Map<string, string>();

  static normalize(key: string): string {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const normalized = key.replace(ProductImportValidationConstants.NORMALIZE_REGEX, '').trim();
    this.cache.set(key, normalized);
    return normalized;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

