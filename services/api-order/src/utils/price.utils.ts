import { ProductDiscount } from '@/model/product-discount.entity';

export const getDiscountPrice = (
  price: number,
  productDiscount?: ProductDiscount,
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
  return price;
};

export const roundToTwo = (num: number): number => {
  const number = Number(num);
  return Math.round((number + 1e-10) * 100) / 100;
};
