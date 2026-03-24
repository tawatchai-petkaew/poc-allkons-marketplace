export interface IMerchantOrganizeInfo {
  cisNumber: string;
  id: number;
  taxId: string;
  juristicType: string;
  organizeName: string;
  organizeBranchType: string;
}

export interface ICreateMerchantPayload {
  phoneNumber: string;
  shopName: string;
  type: string;
  slug: string;
  skipRegisterStep: boolean;
  merchantName: string;
  organizeInfo: IMerchantOrganizeInfo;
}
