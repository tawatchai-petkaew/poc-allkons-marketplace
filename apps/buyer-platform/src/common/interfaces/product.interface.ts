export interface ImageUpload {
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

export interface ProductImage {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: ImageUpload;
}

export interface ProductCategory {
  id: number;
  name: string;
  order: number;
  status: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  isNoBrand: boolean;
  order: number;
  status: string;
}

export interface IStore {
  id: number;
  storeBranchName: string;
  storeBranchCode: string;
  customerProfileType: string;
  customerStatus: string;
  storeType: string;
  organizeId: number | null;
  organizeBranchId: number | null;
  relationshipTypeOrganize: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IMerchantLogo {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: ImageUpload;
}

export interface IMerchantTranslation {
  id: number;
  name: string;
  locale: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductWhitelist {
  id: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Merchant contact information
export interface IMerchantContact {
  tel: string;
  email: string;
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
}

// Company information
export interface ICompanyInfo {
  companyName: string;
  companyId: string;
  companyBranch: string;
  companyAddress: string;
  postCodeCompanyAddress: string;
  provinceCompanyAddress: string;
  districtCompanyAddress: string;
  subdistrictCompanyAddress: string;
}

// Location information
export interface ILocationInfo {
  locationName: string;
  locationCode: string;
  locationUTC: string;
  locationCurrencyIsoCode: string;
  locationCurrencySymbol: string;
  locationTimezone: string;
  availableLocale: string[];
  defaultLocale: string;
}

// Subscription package information
export interface ISubscriptionPackage {
  currentSubscriptionPackageStartDate: string;
  currentSubscriptionPackageSlug: string;
  currentSubscriptionPackagePrice: number;
  currentSubscriptionPackageTotalNumberOfDay: number;
}

// Commission information
export interface ICommissionInfo {
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
}

// Merchant settings
export interface IMerchantSettings {
  primaryColor: string;
  isFinishMerchantGuide: boolean;
  isEnableSES: boolean;
  isEnableGoogleAi: boolean;
  isEnableCache: boolean;
  isEnableOtpLogin: boolean;
  isEditOrderTime: boolean;
}

// Merchant identification
export interface IMerchantIdentity {
  id: number;
  slug: string;
  merchantName: string | null;
  merchantBranchType: string;
  merchantBranchCode: string | null;
  merchantType: string;
  status: string;
  verified: boolean;
}

// Merchant timestamps
export interface IMerchantTimestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  expiredDate: string | null;
}

// Main merchant interface
export interface IProductMerchant
  extends IMerchantIdentity,
    IMerchantContact,
    ICompanyInfo,
    ILocationInfo,
    ISubscriptionPackage,
    ICommissionInfo,
    IMerchantSettings,
    IMerchantTimestamps {
  // Additional fields
  highlight: string;
  keyword: string | null;
  shopditPayMerchantId: string | null;
  appsFlyerAppleId: string | null;
  appsFlyerOnelinkId: string | null;
  deeplinkHostUrl: string | null;
  domain: string | null;
  chatContract: Record<string, unknown> | null;
  shopditProductWhitelists: IProductWhitelist[];
  orderExpireTime: number;
  orderSuccessTime: number;
  kind: string;
  performanceMode: string;
  cisNumber: string | null;
  organizeId: number | null;
  customerProfileType: string | null;
  customerStatus: string;
  relationshipTypeStore: string | null;
  storeId: number;

  // Nested objects
  store: IStore;
  merchantLogo: IMerchantLogo;
  merchantIcon: IMerchantIcon;
  merchantTranslations: IMerchantTranslation[];
}

export interface IPackageProduct {
  id: number;
  packageId: number;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IPackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  packageProducts: IPackageProduct[];
}

export interface ProductDiscount {
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

export interface Stock {
  id: number;
  remaining: number;
  isServiceProduct: boolean;
  onValidateStock: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductItemOptionValue {
  id: number;
  name: string;
  productOptionValueId: number;
  productItemId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductItem {
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
  imageUpload: ImageUpload | null;
}

export interface IImageUpload {
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

export interface IMerchantIcon {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: IImageUpload;
}

export interface IProductOptionValue {
  id: number;
  name: string;
  order: number;
  productOptionId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductOption {
  id: number;
  name: string;
  type: string;
  isRequired: boolean;
  order: number;
  productId: number;
  productOptionValues: IProductOptionValue[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductRelation {
  id: number;
  relationType: string;
  relationValue: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProduct {
  id: number;
  name: string;
  productItems: IProductItem[];
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
  valueCustomRelationStatus: IProductRelation[];
  createdAt: string;
  updatedAt: string;
  productCategory: ProductCategory;
  productBrand: ProductBrand;
  merchant: IProductMerchant;
  productImages: ProductImage[];
  isPackage: boolean;
  package: IPackage;
  productPrimaryOption: IProductOption | null;
  productSecondaryOption: IProductOption | null;
  isContactOnly: boolean;
  telContact: string | null;
  emailContact: string | null;
  lineContact: string | null;
  facebookContact: string | null;
  instagramContact: string | null;
  urlGoogleMap: string | null;
  isHideProductPrice: boolean;
}
//change file name
