import { ProductDiscount } from '@/common/interfaces/product.interface';
import { JurigisticTypes } from '@/common/enum/organization.enum';

interface Address {
  addressInfo: string;
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  subDistrictId: number;
  subDistrictName: string;
  zipcodeName: string;
  zipCodeId: number;
}

export function formatThaiBaht(
  amount: number | string | undefined | null,
  decimal: number = 2
): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }

  const value = amount ?? 0;

  return value.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  });
}

export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
) => {
  const discountAmount = originalPrice - discountedPrice;
  const discountPercentage = (discountAmount / originalPrice) * 100;
  return Math.floor(discountPercentage);
};

export const calculateDiscountPercentageV1 = (
  price: number,
  specialPrice: number | null | undefined
): number => {
  const originalPrice = price;
  const discountedPrice = specialPrice ?? 0;

  if (originalPrice === 0) return 0;

  const discountAmount = originalPrice - discountedPrice;
  const discountPercentage = (discountAmount / originalPrice) * 100;
  return parseFloat(discountPercentage.toFixed(2));
};

export function getSoldDisplay(soldQuantity: number): string {
  if (soldQuantity < 1000) {
    return soldQuantity.toString();
  } else if (soldQuantity < 10000) {
    const tenThousands = soldQuantity / 1000;
    const roundedTenThousands = Math.floor(tenThousands * 2) / 2; // Rounds to nearest 0.2K
    return `${roundedTenThousands}พัน`;
  } else if (soldQuantity < 100000) {
    const hundredThousands = soldQuantity / 10000;
    const roundedHundredThousands = Math.floor(hundredThousands * 2) / 2; // Rounds to nearest 0.2หมื่น
    return `${roundedHundredThousands}หมื่น`;
  } else if (soldQuantity < 1000000) {
    const hundredThousands = soldQuantity / 100000;
    const roundedHundredThousands = Math.floor(hundredThousands * 2) / 2; // Rounds to nearest 0.2แสน
    return `${roundedHundredThousands}แสน`;
  } else {
    const millions = soldQuantity / 1000000;
    const roundedMillions = Math.floor(millions * 2) / 2; // Rounds to nearest 0.2M
    return `${roundedMillions}ล้าน`;
  }
}

export const formatAddressDetail = (address: Partial<Address>): string => {
  if (!address) return '';

  return `${address.addressInfo}, ${
    address.provinceId !== 10 ? 'ตำบล' : 'แขวง'
  }${address.subDistrictName}, ${address.provinceId !== 10 ? 'อำเภอ' : 'เขต'}${
    address.districtName
  }, จังหวัด${address.provinceName} ${address.zipcodeName}`;
};

export const getDiscountPrice = (
  price: number,
  productDiscount?: ProductDiscount
): number => {
  if (productDiscount && productDiscount.type === 'remain') {
    return price - productDiscount.value;
  }
  return productDiscount?.value || 0;
};

export const getFinalPrice = (price: number, discount?: number): number => {
  if (discount) {
    return price - discount;
  }
  return price || 0;
};

// คำนวณราคาสินค้าในออเดอร์
export const getOrderPrices = (order: any) => {
  if (!order || !order.subOrders) {
    return {
      priceIncludeVat: 0,
      originalPriceIncludeVat: 0,
      discountPriceIncludeVat: 0,
      priceVat: 0,
      priceExcludeVat: 0,
      priceDelivery: 0,
    };
  }

  let totalOriginalPrice = 0;
  let totalFinalPrice = 0;
  let totalDeliveryPrice = 0;

  order.subOrders.forEach((subOrder: any) => {
    totalDeliveryPrice += subOrder.deliveryPrice || 0;

    subOrder.orderItems?.forEach((item: any) => {
      const quantity = item.quantity || 0;
      const originalPrice = item.productItem?.price || item.price || 0;
      const finalPrice = item.price || 0;

      totalOriginalPrice += originalPrice * quantity;
      totalFinalPrice += finalPrice * quantity;
    });
  });

  const priceExcludeVat = totalFinalPrice / 1.07;
  const priceVat = totalFinalPrice - priceExcludeVat;

  // Calculate discount

  const originalPriceIncludeVat = totalOriginalPrice; // Already includes VAT
  const priceIncludeVat = totalFinalPrice; // Already includes VAT
  const discountPriceIncludeVat = originalPriceIncludeVat - priceIncludeVat;

  return {
    priceIncludeVat: Math.round(priceIncludeVat * 100) / 100, // Final price with VAT
    originalPriceIncludeVat: Math.round(originalPriceIncludeVat * 100) / 100, // Original price with VAT
    discountPriceIncludeVat: Math.round(discountPriceIncludeVat * 100) / 100, // Total discount including VAT
    priceVat: Math.round(priceVat * 100) / 100, // VAT amount (7% of final price)
    priceExcludeVat: Math.round(priceExcludeVat * 100) / 100, // Final price without VAT
    priceDelivery: totalDeliveryPrice, // Total delivery cost
  };
};

/**
 * Hash a name by showing 40% of characters and replacing the rest with asterisks
 */
export const hashName = (name: string): string => {
  if (!name || name.length <= 3) return name;
  const visibleChars = Math.ceil(name.length * 0.4); // Show 40% of characters
  const hashedPart = '*'.repeat(name.length - visibleChars);
  return name.substring(0, visibleChars) + hashedPart;
};

/**
 * Format a full name with optional suffix
 * @param firstName - First name
 * @param lastName - Last name
 * @param middleName - Middle name (suffix)
 * @param isHashed - Whether to hash the name
 */
export const formatFullName = (
  firstName: string,
  lastName: string,
  middleName?: string,
  isHashed: boolean = false
): string => {
  const first = firstName || '';
  const last = lastName || '';
  const middle = middleName || '';

  if (isHashed) {
    const hashedFirst = hashName(first);
    const hashedLast = hashName(last);
    const hashedMiddle = middle ? hashName(middle) : '';
    return hashedMiddle
      ? `${hashedFirst} ${hashedMiddle} ${hashedLast}`.trim()
      : `${hashedFirst} ${hashedLast}`.trim();
  }

  return middle
    ? `${first} ${middle} ${last}`.trim()
    : `${first} ${last}`.trim();
};

/**
 * Format Thai phone number (xxx-xxx-xxxx)
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '-';

  let formattedPhone = phone.length === 9 ? `0${phone}` : phone;

  if (formattedPhone.length === 10) {
    return `${formattedPhone.slice(0, 3)}-${formattedPhone.slice(
      3,
      6
    )}-${formattedPhone.slice(6)}`;
  }

  return formattedPhone;
};

/**
 * Hash Thai phone number (xxx-***-xxxx)
 */
export const hashPhone = (phone: string): string => {
  if (!phone) return '-';

  let formattedPhone = phone.length === 9 ? `0${phone}` : phone;

  if (formattedPhone.length === 10) {
    return `${formattedPhone.slice(0, 3)}-***-${formattedPhone.slice(6)}`;
  }

  return formattedPhone;
};

/**
 * Hash email address (showing first 3 chars and domain)
 * Example: john.doe@example.com → joh*****@example.com
 */
export const hashEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;

  const [localPart, domain] = email.split('@');

  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }

  const visibleChars = 3;
  const hiddenLength = localPart.length - visibleChars;
  const hashedPart = '*'.repeat(hiddenLength);

  return `${localPart.substring(0, visibleChars)}${hashedPart}@${domain}`;
};

export function calculateMemberAge(createdAt: string | Date): string {
  const dayjs = require('dayjs');
  const utc = require('dayjs/plugin/utc');
  const timezone = require('dayjs/plugin/timezone');

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const now = dayjs().tz('Asia/Bangkok');
  const created = dayjs(createdAt).tz('Asia/Bangkok');

  const years = now.diff(created, 'year');
  const afterYears = created.add(years, 'year');

  const months = now.diff(afterYears, 'month');
  const afterMonths = afterYears.add(months, 'month');

  const days = now.diff(afterMonths, 'day');

  return `อายุสมาชิก : ${years} ปี ${months} เดือน ${days} วัน`;
}
// Round a number to two decimal places
export const roundToTwo = (num: number): number => {
  const number = Number(num);
  return Math.round((number + 1e-10) * 100) / 100;
};

export const removeLeadingZero = (phone: string): string => {
  if (phone[0] === '0') {
    return phone.slice(1);
  }
  return phone;
};

export const elipsisText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + '...';
};

export const getDiscountPriceV1 = (price: number, specialPrice?: number) => {
  const parsedPrice = price;
  const parsedSpecialPrice = specialPrice || 0;

  return parsedPrice - parsedSpecialPrice;
};

export const resolvedRoleDisplayName = (roleName: string) => {
  switch (roleName) {
    case 'Owner':
      return 'เจ้าของ';
    case 'Member':
      return 'สมาชิก';
    case 'Admin':
      return 'ผู้ดูแลระบบ';
    case 'Super Admin':
      return 'ผู้ดูแลระบบสูงสุด';
    default:
      return roleName;
  }
};

export const getFirstChar = (text: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ'];
  let index = 0;
  while (index < trimmed.length && leadingVowels.includes(trimmed[index])) {
    index++;
  }
  return (trimmed[index] || trimmed[0] || '').toUpperCase();
};

export const getJuristicTypeSuffixAndPrefix = (juristicType: string) => {
  let prefix = undefined;
  let suffix = undefined;

  if (
    juristicType === JurigisticTypes.LIMITED_COMPANY ||
    juristicType === JurigisticTypes.PUBLIC_LIMITED_COMPANY
  ) {
    prefix = 'บริษัท';
  } else if (juristicType === JurigisticTypes.GENERAL_PARTNERSHIP) {
    prefix = 'ห้างหุ้นส่วนสามัญ';
  } else if (juristicType === JurigisticTypes.LIMITED_PARTNERSHIP) {
    prefix = 'ห้างหุ้นส่วนจำกัด';
  } else if (juristicType === JurigisticTypes.OTHER) {
    prefix = 'อื่นๆ';
  }

  if (juristicType === JurigisticTypes.LIMITED_COMPANY) {
    suffix = 'จำกัด';
  } else if (juristicType === JurigisticTypes.PUBLIC_LIMITED_COMPANY) {
    suffix = 'จำกัด (มหาชน)';
  }

  return { prefix, suffix };
};
