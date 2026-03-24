import { IsValidSubdomainConstraint } from '../validators/subdomain.validator';
import { ValidationArguments } from 'class-validator';
export class SubdomainUtils {
  /**
   * สร้าง slug จาก shop name
   */
  static createSlugFromShopName(shopName: string): string {
    return (
      shopName
        .toLowerCase()
        .trim()
        // แปลง Thai/Unicode characters
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // แทนที่ spaces และ special chars ด้วย hyphen
        .replace(/[^a-z0-9]/g, '-')
        // ลบ hyphen ที่ติดกัน
        .replace(/-+/g, '-')
        // ลบ hyphen ที่ขึ้นต้นและลงท้าย
        .replace(/^-|-$/g, '')
        // จำกัดความยาว
        .substring(0, 50)
    );
  }
  /**
   * สร้าง slug ที่ไม่ซ้ำ
   */
  static createUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      // ป้องกัน infinite loop
      if (counter > 9999) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }
    return slug;
  }
  /**
   * แนะนำ slug alternatives
   */
  static suggestAlternatives(originalSlug: string): string[] {
    const suggestions: string[] = [];
    // เพิ่ม suffix ต่างๆ
    const suffixes = ['shop', 'store', 'th', 'official', 'main', 'hq'];
    suffixes.forEach((suffix) => {
      suggestions.push(`${originalSlug}-${suffix}`);
    });
    // เพิ่ม prefix
    const prefixes = ['my', 'the', 'best', 'top'];
    prefixes.forEach((prefix) => {
      suggestions.push(`${prefix}-${originalSlug}`);
    });
    // เพิ่มตัวเลข
    for (let i = 1; i <= 10; i++) {
      suggestions.push(`${originalSlug}${i}`);
      suggestions.push(`${originalSlug}-${i}`);
    }
    return suggestions.slice(0, 10); // จำกัดแค่ 10 คำแนะนำ
  }
  /**
   * ตรวจสอบว่า slug พร้อมใช้งานหรือไม่
   */
  static isSlugAvailable(slug: string, existingSlugs: string[]): boolean {
    return !existingSlugs.includes(slug.toLowerCase());
  }
  /**
   * Validate slug format
   */
  static validateSlugFormat(slug: string): {
    valid: boolean;
    errors: string[];
    suggestions?: string[];
  } {
    const errors: string[] = [];
    if (!slug) {
      errors.push('Slug is required');
      return { valid: false, errors };
    }
    if (slug.length < 3) {
      errors.push('Slug must be at least 3 characters long');
    }
    if (slug.length > 63) {
      errors.push('Slug must not exceed 63 characters');
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push(
        'Slug can only contain lowercase letters, numbers, and hyphens',
      );
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      errors.push('Slug cannot start or end with a hyphen');
    }
    if (slug.includes('--')) {
      errors.push('Slug cannot contain consecutive hyphens');
    }
    if (/^\d+$/.test(slug)) {
      errors.push('Slug cannot be only numbers');
    }
    const validator = new IsValidSubdomainConstraint();
    if (!validator.validate(slug, {} as ValidationArguments)) {
      errors.push('Slug contains reserved or invalid terms');
    }
    const valid = errors.length === 0;
    const result: any = { valid, errors };
    if (!valid) {
      result.suggestions = this.suggestAlternatives(slug);
    }
    return result;
  }
}
