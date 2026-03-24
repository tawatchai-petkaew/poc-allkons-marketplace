export interface IOrganizationRegisteredIndividualInfo {
  idCard: string;
  registrationName: string;
  businessType: string[];
  registrationNumber: string;
  acceptTerms: boolean;
  businessTypeDescription?: string;
}

export interface ICreateOrganizationPayload {
  userId: number;
  countryCode: string;
  phoneNumber: string;
  skipRegister: boolean;
  organizationType: string;
  registeredIndividualInfo?: IOrganizationRegisteredIndividualInfo;
  juristicInfo?: IOrganizationJuristicInfo;
}

export interface IOrganizationJuristicInfo {
  businessType: string[];
  taxId: string;
  juristicType: string;
  remarkTypeOther?: string;
  juristicTypeId: number;
  juristicName: string;
  branchType: string;
  branchNumber: string;
  branchName: string;
  acceptTerms: boolean;
  businessTypeDescription?: string;
}

export interface IReqDraftOrganization {
  organizationType: string;
  orgInfo: string;
  contactInfo: string;
  addressInfo: string;
  taxInfo: string;
  fileInfo: string;
  organizeId: number;
}

export interface IReqUpdateUser {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  roleId: number;
}

export interface IReqUpdateUserRole {
  roleId: number;
}

export interface IReqAddPhoneWhitelist {
  phoneNumber: string;
  countryCode?: string;
  label?: string;
  isActive?: boolean;
}

type merchantInfo = {
  merchantId: number;
  roleId: number;
}

export interface IReqInviteUser {
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  roleId: number;
  addInWhiteList: boolean;
  merchantInfo?: merchantInfo[];
}

export interface IReqCheckTaxId {
  taxId: string;
  organizeBranchNumber: string;
}
