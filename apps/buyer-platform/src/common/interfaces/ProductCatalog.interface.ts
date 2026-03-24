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

interface Merchant {
  id: number;
  slug: string;
  tel: string;
  email: string;
  highlight: string;
  keyword: string[];
  contactAddress: string;
  postCodeContactAddress: string;
  provinceContactAddress: string;
  districtContactAddress: string;
  subdistrictContactAddress: string;
  lineSocialContact: string;
  facebookSocialContact: string;
  youtubeSocialContact: string;
  instagramSocialContact: string;
  urlGoogleMap: string | null;
  companyName: string;
  companyId: string;
  companyBranch: string;
  companyAddress: string;
  postCodeCompanyAddress: string;
  provinceCompanyAddress: string;
  districtCompanyAddress: string;
  subdistrictCompanyAddress: string;
  locationName: string;
  locationCode: string;
  locationUTC: string;
  locationCurrencyIsoCode: string;
  locationCurrencySymbol: string;
  locationTimezone: string;
  availableLocale: string[];
  defaultLocale: string;
  status: 'active' | 'inactive'; // Assuming possible values based on "active"
  verified: boolean;
  expiredDate: string;
  currentSubscriptionPackageStartDate: string;
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
  shopditPayMerchantId: string;
  appsFlyerAppleId: string;
  appsFlyerOnelinkId: string | null;
  merchantType: string;
  deeplinkHostUrl: string;
  isFinishMerchantGuide: boolean;
  isEnableSES: boolean;
  domain: string;
  isEnableGoogleAi: boolean;
  isEnableCache: boolean;
  chatContract: string;
  isEnableOtpLogin: boolean;
  shopditProductWhitelists: string[];
  isEditOrderTime: boolean;
  orderExpireTime: number;
  orderSuccessTime: number;
  kind: string;
  performanceMode: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IProductCatalog {
  id: number;
  name: string;
  status: string;
  mainStatus: 'primary' | 'secondary'; // Assuming possible values based on "primary"
  merchant: Merchant;
  imageUpload: ImageUpload;
}
