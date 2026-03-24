interface ImageUpload {
  id: number;
  imageName: string;
  name: string;
  size: string;
  url: string;
  onDeletePermanent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface MerchantLogo {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  imageUpload: ImageUpload;
}

interface MerchantIcon {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  imageUpload: ImageUpload;
}

interface MerchantCategory {
  id: number;
  name: string;
  nameEn: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface MerchantPolicy {
  privacyPolicy: string;
}

interface MerchantCodeIntegration {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  dbdExtension: null;
  facebookExtension: null;
  googleExtension: null;
  lineExtension: null;
  tiktokExtension: null;
}

export interface IMerchant {
  id: number;
  slug: string;
  merchantType: string;
  name: string;
  description: string;
  tel: string;
  highlight: string;
  keyword: null;
  email: string;
  merchantLogo: MerchantLogo;
  merchantIcon: MerchantIcon;
  contactAddress: string;
  postCodeContactAddress: string;
  provinceContactAddress: string;
  districtContactAddress: string;
  subdistrictContactAddress: string;
  lineSocialContact: null;
  facebookSocialContact: null;
  youtubeSocialContact: null;
  instagramSocialContact: null;
  chatContract: null;
  companyName: null;
  companyId: null;
  companyBranch: null;
  companyAddress: null;
  postCodeCompanyAddress: null;
  provinceCompanyAddress: string;
  districtCompanyAddress: null;
  subdistrictCompanyAddress: null;
  merchantCategory: MerchantCategory;
  merchantPolicy: MerchantPolicy;
  merchantCodeIntegration: MerchantCodeIntegration;
  status: string;
  verified: boolean;
  expiredDate: string;
  createdAt: string;
  currentSubscriptionPackageSlug: string;
  currentSubscriptionPackageStartDate: null;
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
  appsFlyerAppleId: null;
  appsFlyerOnelinkId: null;
  locationName: string;
  locationCode: string;
  availableLocale: string[];
  locationCurrencyIsoCode: string;
  locationCurrencySymbol: string;
  locationUTC: string;
  locationTimezone: string;
  defaultLocale: string;
  isEnableGoogleAi: boolean;
  isEnableCache: boolean;
  isEnableOtpLogin: boolean;
  shopditProductWhitelists: string[];
  kind: string;
}
