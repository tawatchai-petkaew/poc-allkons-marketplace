import { UserOrganizationInviteStatus } from "@/constants/enum/organization.enum";
import { IAuthOrganization, IAuthUser } from "../auth/auth.response.interface";
import { PaginationResponse } from "@/types/common.type";
import { IRole } from "../role.interface";

export interface IOrganizationListResponse {
  organizations: IAuthOrganization[];
  user: IAuthUser;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalOrganizations: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IOrganizationResponse {
  organization: {
    id: number;
    name: string;
    type: string;
    cisNumber: string;
    createdAt: string;
  };
}

export interface IOrganizationJuristicTypeMasterDataResponse {
  id: number;
  label: string;
  value: string;
  prefix: string | null;
  subfix: string | null;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserOrganization {
  name: string;
  uuid: string;
  id: number;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string;
  countryCode: string;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  isOwner: boolean;
  membershipStatus: UserOrganizationInviteStatus;
  isRequest: boolean;
  isInvitation: boolean;
  createdAt: string;
  refCode: string | null;
  invitationLink: string | null;
}

export interface IPhoneWhitelist {
  id: number;
  phoneNumber: string;
  countryCode: string;
  label: string;
  isActive: boolean;
}

export interface ICheckTaxIdAddress {
  address: string;
  provinceId: number;
  province: string;
  districtId: number;
  district: string;
  subdistrictId: number;
  subdistrict: string;
  zipCode: string;
  zipCodeId: number;
}

export interface ICheckTaxIdObjective {
  code: string;
  textTH: string;
  textEN: string;
}

export interface IJuristicTypeInfo {
  id: number;
  label: string;
  value: string;
  prefix: string;
  subfix: string;
  language: string;
  otherValue: string;
}

export interface ICheckTaxIdResponse {
  taxId: string;
  organizeName: string;
  organizeNameEN: string;
  type: string;
  registerDate: string;
  status: string;
  objective: ICheckTaxIdObjective;
  registerCapital: string;
  branchName: string;
  address: ICheckTaxIdAddress;
  juristicType: IJuristicTypeInfo;
}

export interface IDraftOrganizeInfoResponse {
  id: number;
  organizationType: string;
  orgInfo: string;
  contactInfo: string;
  addressInfo: string;
  fileInfo: string | null;
  taxInfo: string | null;
  organizeId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  kycStatus: string;
}

export interface IUpdateOrganizationUserResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    updatedAt: string;
  };
}

export interface IInviteValidatePhoneUserInfoResponse {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
}

export interface IInviteValidatePhoneResponse {
  canAddToWhitelist: boolean;
  isInMyOrgWhitelist: boolean;
  isInOtherWhitelist: boolean;
  isUserInMyOrg: boolean;
  isUserInOtherOrg: boolean;
  isInviting: boolean;
  userInfo: IInviteValidatePhoneUserInfoResponse | null;
}

export interface ISendInviteResponse {
  success: boolean;
  message: string;
}

export interface ICheckExistResponse {
  exists: boolean;
}

export interface ICreateExitRequestOragizationResponse {  
  createdAt: string;
  id: number;
  leaveStatus: "PENDING" | "APPROVED" | "REJECTED";
  organizationId: number;
  roleId: number;
  updatedAt: string;
  userId: number;
}

export type IExitRequestUser = Pick<IAuthUser, 'id' | 'email' | 'firstNameTh' | 'lastNameTh'>;

export type IExitRequestRole = Pick<IRole, 'id' | 'name' | 'displayName'>;

export interface IExitRequest {
  id: number;
  leaveStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user: IExitRequestUser;
  role: IExitRequestRole;
}

export interface IGetExitOrganizationRequests {
  meta: PaginationResponse;
  items: IExitRequest[];
}