interface ImageUpload {
  id: number;
  imageName: string;
  name: string;
  size: string;
  url: string;
  onDeletePermanent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ProductImage {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: ImageUpload;
}

interface Stock {
  id: number;
  remaining: number;
  isServiceProduct: boolean;
  onValidateStock: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ProductDiscount {
  id: number;
  type: string;
  unitType: string;
  value: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ProductItem {
  id: number;
  slug: string | null;
  primaryOptionsValue: string | null;
  secondaryOptionsValue: string | null;
  price: number;
  bigUnitPrice: number | null;
  cost: number;
  soldQuantity: number;
  productItemIdTikTok: string | null;
  productItemIdLazada: string | null;
  voucherQuantity: number | null;
  voucherExpiredDays: number | null;
  voucherUsedPerUser: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productDiscount: ProductDiscount | null;
  productBigUnitDiscount: ProductDiscount | null;
  stock: Stock;
  flashSaleSmallUnit: string;
  flashSaleBigUnit: string;
}

interface Product {
  id: number;
  name: string;
  productItems: ProductItem[];
  highlight: string;
  description: string;
  unit: string;
  bigUnit: string;
  slug: string;
  minFinalProductPrice: number;
  maxFinalProductPrice: number;
  barCode: string;
  videoUrl: string;
  model: string;
  soldQuantity: number;
  piecePerBigUnit: number | null;
  weightSize: number;
  widthSize: number;
  lengthSize: number;
  heightSize: number;
  type: string;
  kind: string;
  isRecommend: boolean;
  isPopular: boolean;
  isNew: boolean;
  relationStatus: string;
  valueCustomRelationStatus: string[];
  createdAt: string;
  updatedAt: string;
  productImages: ProductImage[];
  isPackage: boolean;
  productPrimaryOption: any | null; // Placeholder for unknown structure
  productSecondaryOption: any | null; // Placeholder for unknown structure
  isContactOnly: boolean;
  telContact: string | null;
  emailContact: string | null;
  lineContact: string | null;
  facebookContact: string | null;
  instagramContact: string | null;
  urlGoogleMap: string | null;
  isHideProductPrice: boolean;
}

interface ProductFlashSaleItem {
  id: number;
  slug: string;
  price: number;
  bigUnitPrice: number | null;
  soldQuantity: number;
  bigUnitSoldQuantity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productItem: ProductItem;
}

export interface ProductFlashSale {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: Product;
  productFlashSaleItems: ProductFlashSaleItem[];
  soldQuantity: number;
}

interface Merchant {
  id: number;
  slug: string;
  tel: string;
  email: string;
  highlight: string;
  keyword: string | null;
  contactAddress: string;
  postCodeContactAddress: string;
  provinceContactAddress: string;
  districtContactAddress: string;
  subdistrictContactAddress: string;
  lineSocialContact: string | null;
  facebookSocialContact: string | null;
  youtubeSocialContact: string | null;
  instagramSocialContact: string | null;
  urlGoogleMap: string | null;
  companyName: string | null;
  companyId: string | null;
  companyBranch: string | null;
  companyAddress: string | null;
  postCodeCompanyAddress: string | null;
  provinceCompanyAddress: string;
  districtCompanyAddress: string | null;
  subdistrictCompanyAddress: string | null;
  locationName: string;
  locationCode: string;
  locationUTC: string;
  locationCurrencyIsoCode: string;
  locationCurrencySymbol: string;
  locationTimezone: string;
  availableLocale: string[];
  defaultLocale: string;
  status: string;
  verified: boolean;
  expiredDate: string;
  currentSubscriptionPackageStartDate: string | null;
  currentSubscriptionPackageSlug: string;
  currentSubscriptionPackagePrice: number;
  currentSubscriptionPackageTotalNumberOfDay: number;
  commision: number;
  marketplaceCommision: number;
  discountCommision: number;
  platformCommision: number;
  shopditpayCreditCardCommision: number;
  shopditpayLinepayCommision: number;
  shopditpayAirpayCommision: number;
  shopditpayScbEasyCommision: number;
  shopditpayBblCommision: number;
  shopditpayBaybankCommision: number;
  shopditpayTruemoneyCommision: number;
  primaryColor: string;
  shopditPayMerchantId: string | null;
  appsFlyerAppleId: string | null;
  appsFlyerOnelinkId: string | null;
  merchantType: string;
  deeplinkHostUrl: string | null;
  isFinishMerchantGuide: boolean;
  isEnableSES: boolean;
  domain: string;
  isEnableGoogleAi: boolean;
  isEnableCache: boolean;
  chatContract: string | null;
  isEnableOtpLogin: boolean;
  shopditProductWhitelists: string[];
  isEditOrderTime: boolean;
  orderExpireTime: number;
  orderSuccessTime: number;
  kind: string;
  performanceMode: string;
  cisNumber: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IFlashSale {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  productFlashSales: ProductFlashSale[];
  merchant: Merchant;
}
