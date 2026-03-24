export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive'
}

interface DATA {
  slug: string;
  name: string;
  description: string;
  tel: string;
  email: string;
  contactAddress: string;
  postCodeContactAddress: string;
  provinceContactAddress: string;
  districtContactAddress: string;
  subdistrictContactAddress: string;
  lineSocialContact: string;
  facebookSocialContact: string;
  youtubeSocialContact: string;
  instagramSocialContact: string;
  companyName: string;
  companyId: string;
  companyBranch: string;
  companyAddress: string;
  postCodeCompanyAddress: string;
  provinceCompanyAddress: string;
  districtCompanyAddress: string;
  subdistrictCompanyAddress: string;
  status: MerchantStatus;
  verified: boolean;
  expiredDate: Date;
  merchantCategoryId: number;
}
const data: DATA[] = [
  {
    slug: 'shopdit-develop',
    name: 'shopdit',
    description: 'shopdit merchant',
    tel: '090000000',
    email: 'shopdit@gamil.com',
    contactAddress: 'Shopdit tower',
    postCodeContactAddress: null,
    provinceContactAddress: null,
    districtContactAddress: null,
    subdistrictContactAddress: null,
    lineSocialContact: null,
    facebookSocialContact: null,
    youtubeSocialContact: null,
    instagramSocialContact: null,
    companyName: null,
    companyId: null,
    companyBranch: null,
    companyAddress: null,
    postCodeCompanyAddress: null,
    provinceCompanyAddress: null,
    districtCompanyAddress: null,
    subdistrictCompanyAddress: null,
    merchantCategoryId: 1,
    status: MerchantStatus.ACTIVE,
    verified: true,
    expiredDate: null
  }
];

export default data;
