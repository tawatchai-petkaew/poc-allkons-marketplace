export interface IExists {
  exists: boolean;
}

export type IExistsSuccessTaxId = {
  taxId: string;
  organizeName: string;
  organizeNameEN: string;
  juristicType: {
    id: number;
    label: string;
    value: string;
    prefix: string;
    subfix: string;
    language: string;
    otherValue: string;
  };
  registerDate: string;
  status: string;
  registerCapital: string;
  branchName: string;
  objective: {
    code: string;
    textTH: string;
    textEN: string;
  };
  address: {
    address: string;
    provinceId: number;
    province: string;
    districtId: number;
    district: string;
    subdistrictId: number;
    subdistrict: string;
    zipCode: string;
    zipCodeId: string;
  };
};

export interface IExistsTaxId extends IExistsSuccessTaxId {
  exists: boolean;
}

export interface IProvinceData {
  id: number;
  name_th: string;
  name_en: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IDistrictData {
  id: number;
  name_th: string;
  name_en: string;
  code: string;
  provinceId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ISubDistrictData {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: string;
  code: string;
  zipCodeId: string;
  districtId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IDraftUserAddress {
  id: number;
  addressType: string;
  address: string | null;
  countryId: number | null;
  provinceId: number | null;
  districtId: number | null;
  subDistrictId: number | null;
  isSameAddress: boolean | null;
  draftUserId: number;
  createdAt: string;
  updatedAt: string;
  country: string | null;
  province: IProvinceData | null;
  district: IDistrictData | null;
  subDistrict: ISubDistrictData | null;
}

export interface IUserDraftKycResponse {
  id: number;
  image: string;
  countryCode: string;
  tel: string;
  email: string;
  firstNameTh: string;
  middleNameTh: string | null;
  lastNameTh: string;
  firstNameEn: string | null;
  middleNameEn: string | null;
  lastNameEn: string | null;
  gender: string;
  maritalStatus: string;
  birthDate: string | null;
  idCard: string | null;
  businessType: string[];
  kycStatus: string;
  fileInfo: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  draftUserAddresses: IDraftUserAddress[];
}

export interface IMasterDataBusinessTypeResponse {
  id: number;
  name: string;
  name_en: string;
  code: string;
  order: number;
  active_status: boolean;
  is_constant: boolean;
  parent_ref: string | null;
  create_at: string;
  create_by: string;
  create_by_platform: string;
  update_at: string | null;
  update_by: string | null;
  update_by_platform: string | null;
  children: IMasterDataBusinessTypeResponse[];
}

export interface IUpdateDraftUserKycPayload {
  image?: string;
  countryCode?: string;
  tel?: string;
  email?: string;
  firstNameTh?: string;
  middleNameTh?: string;
  lastNameTh?: string;
  firstNameEn?: string;
  middleNameEn?: string;
  lastNameEn?: string;
  idCard?: string;
  gender?: string;
  maritalStatus?: string;
  birthDate?: string | null;
  businessType?: string[];
  draftUserAddresses?: {
    addressType: string;
    address?: string;
    countryId?: number;
    provinceId?: number;
    districtId?: number;
    subDistrictId?: number;
    isSameAddress?: string | null;
  }[];
}

export interface ISendOtpEmailResponse {
  code: string;
  method: string;
  refno: string;
  status: string;
}
