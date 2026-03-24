import { Merchant } from '../model/merchant.entity';

const blacklistIds = {
  product: [314, 315, 316, 317, 318, 319, 492],
  productCategory: [34, 35, 36, 37, 38, 39, 77],
  productBrand: [40, 41, 57],
  productCatalog: [8, 9, 10, 11, 21],
  article: [],
  coupon: [294, 295],
};

const checkDisableOnDemoMerchant = (
  merchant: Merchant,
  type?: string,
  id?: number,
) => {
  if (
    merchant.slug === process.env.DEMO_MERCHANT_SLUG
  ) {
    if (type) {
      if (blacklistIds[type].includes(id)) {
        throw new Error('ไม่สามารถดำเนินการได้ในร้านค้าทดลอง');
      }
    } else {
      throw new Error('ไม่สามารถดำเนินการได้ในร้านค้าทดลอง');
    }
  }
};

// ***********
// Export
// ***********

export { checkDisableOnDemoMerchant };
