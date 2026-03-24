export enum OrganizationType {
  JURISTIC = 'JURISTIC',
  PERSONAL = 'PERSONAL',
  REGISTERED_INDIVIDUAL = 'REGISTERED_INDIVIDUAL',
}

export interface IUserDto {
  id: number;
  uuid: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  name: string;
  firstNameTh: string;
  lastNameTh: string;
  middleNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  middleNameEn: string;
  kycStatus: string;
  createdInAuth: string | Date;
  registerStatus: string;
  registerStep: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  username: string;
  cisNumber: string;
}

export interface IRoleInfoDto {
  id: number;
  name: string;
  displayName: string;
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IJuristicInfo {
  prefix: string;
  subfix: string;
  juristicName: string;
}

export interface IOrganizationInfoDto {
  id: number;
  taxId: string;
  organizeType: string;
  organizeName: string;
  cisNumber?: string;
  type?: any;
  businessType?: string[];
  remarkTypeOther?: string;
  branchNumber?: string;
  mainPhoneNumber?: string;
  otherPhoneNumber?: string;
  mainEmail?: string;
  highestAuthorityName?: string;
  highestAuthorityPosition?: string;
  highestAuthorityPhoneNumber?: string;
  highestAuthorityEmail?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  kycStatus?: string;
  contactShownHighestAuthority?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  organizeBranchType: string;
  idCard: string;
  registrationNumber: string;
  organizationType: OrganizationType;
  customerStatus: string;
  isDopa: boolean;
  isDbd: boolean;
  juristicInfo: IJuristicInfo;
  totalUsers?: number;
  organizeBranchName?: string;
  imageUpload?: string | null;
}

export interface IOrganizationWithRoleDto {
  userOrganizationId: number;
  roleId?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  organization: IOrganizationInfoDto;
  role?: IRoleInfoDto | null;
  userPermission?: any;
  isOwner?: boolean;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalOrganizations: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface IGetUserOrganizationsResponseDto {
  success: boolean;
  message: string;
  data: {
    user: IUserDto;
    organizations: IOrganizationWithRoleDto[];
    pagination?: IPagination;
  } | null;
}

export interface IUserWithOrganizationsResponseDto {
  success: boolean;
  message: string;
  data: {
    user: IUserDto;
    organizations: IOrganizationWithRoleDto[];
    pagination?: IPagination;
  } | null;
}

export interface IUserOrganizationResponseDto {
  id: number;
  userId: number;
  organizeId: number;
  roleId?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  userInfo: IUserDto;
  organization?: IOrganizationInfoDto;
  role?: IRoleInfoDto;
}
