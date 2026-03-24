import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
@ValidatorConstraint({ name: 'isValidSubdomain', async: false })
export class IsValidSubdomainConstraint
  implements ValidatorConstraintInterface {
  private readonly RESERVED_NAMES = [
    'www',
    'mail',
    'ftp',
    'pop',
    'smtp',
    'webmail',
    'webdisk',
    'admin',
    'administrator',
    'root',
    'postmaster',
    'hostmaster',
    'api',
    'cdn',
    'ns1',
    'ns2',
    'ns3',
    'ns4',
    'mx',
    'mx1',
    'mx2',
    'cpanel',
    'whm',
    'autoconfig',
    'autodiscover',
    'localhost',
    'test',
    'staging',
    'dev',
    'development',
    'blog',
    'forum',
    'chat',
    'help',
    'support',
    'docs',
    'shop',
    'store',
    'cart',
    'checkout',
    'payment',
    'pay',
    'secure',
    'ssl',
    'tls',
    'vpn',
    'proxy',
    'status',
    'monitor',
    'health',
    'ping',
    'trace',
  ];
  private readonly OFFENSIVE_WORDS = [
    'admin',
    'root',
    'test',
    'demo',
    'sample',
    'example',
    // เพิ่มคำที่ไม่เหมาะสมอื่นๆ ตามต้องการ
  ];
  validate(subdomain: string, args: ValidationArguments) {
    if (!subdomain) return false;
    // 1. ตรวจสอบความยาว
    if (subdomain.length < 1 || subdomain.length > 63) {
      return false;
    }
    // 2. ตรวจสอบ characters ที่อนุญาต (a-z, 0-9, hyphen)
    const validCharPattern = /^[a-z0-9-]+$/i;
    if (!validCharPattern.test(subdomain)) {
      return false;
    }
    // 3. ไม่สามารถขึ้นต้นหรือลงท้ายด้วย hyphen
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return false;
    }
    // 4. ไม่สามารถมี hyphen ติดกันเกิน 2 ตัว
    if (subdomain.includes('--')) {
      return false;
    }
    // 5. ไม่สามารถเป็นตัวเลขล้วนๆ
    const isOnlyNumbers = /^\d+$/.test(subdomain);
    if (isOnlyNumbers) {
      return false;
    }
    // 6. ตรวจสอบ reserved names
    const lowerSubdomain = subdomain.toLowerCase();
    if (this.RESERVED_NAMES.includes(lowerSubdomain)) {
      return false;
    }
    // 7. ตรวจสอบคำที่ไม่เหมาะสม
    if (this.OFFENSIVE_WORDS.some((word) => lowerSubdomain.includes(word))) {
      return false;
    }
    // 8. ตรวจสอบรูปแบบ shop name ที่ดี
    return this.isGoodShopNamePattern(subdomain);
  }
  private isGoodShopNamePattern(subdomain: string): boolean {
    const lowerSubdomain = subdomain.toLowerCase();
    // ห้ามขึ้นต้นด้วยตัวเลข
    if (/^\d/.test(subdomain)) {
      return false;
    }
    // ห้าม hyphen มากเกิน 3 ตัว
    const hyphenCount = (subdomain.match(/-/g) || []).length;
    if (hyphenCount > 3) {
      return false;
    }
    // แนะนำให้มีอย่างน้อย 3 ตัวอักษร
    if (subdomain.length < 3) {
      return false;
    }
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    const subdomain = args.value;
    if (!subdomain) {
      return 'Subdomain is required';
    }
    if (subdomain.length < 3) {
      return 'Subdomain must be at least 3 characters long';
    }
    if (subdomain.length > 63) {
      return 'Subdomain must not exceed 63 characters';
    }
    if (!/^[a-z0-9-]+$/i.test(subdomain)) {
      return 'Subdomain can only contain letters, numbers, and hyphens';
    }
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return 'Subdomain cannot start or end with a hyphen';
    }
    if (subdomain.includes('--')) {
      return 'Subdomain cannot contain consecutive hyphens';
    }
    if (/^\d+$/.test(subdomain)) {
      return 'Subdomain cannot be only numbers';
    }
    if (/^\d/.test(subdomain)) {
      return 'Subdomain cannot start with a number';
    }
    if (this.RESERVED_NAMES.includes(subdomain.toLowerCase())) {
      return `Subdomain '${subdomain}' is reserved and cannot be used`;
    }
    const hyphenCount = (subdomain.match(/-/g) || []).length;
    if (hyphenCount > 3) {
      return 'Subdomain cannot contain more than 3 hyphens';
    }
    return 'Invalid subdomain format';
  }
}
// Decorator function
export function IsValidSubdomain(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSubdomainConstraint,
    });
  };
}
