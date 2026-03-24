export interface IMerchantImageUpload {
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

export interface IMerchantLogoIcon {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUpload: IMerchantImageUpload;
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

export interface IUserMerchant {
  userId: number;
  merchantId: number;
  lastAccessedAt: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMerchantItem {
  id: number;
  uuid: string;
  slug: string;
  subdomainStatus: string;
  tel: string | null;
  email: string | null;
  keyword: string | null;
  status: string;
  domain: string | null;
  cisNumber: string | null;
  organizeId: number;
  customerStatus: string;
  merchantName: string;
  merchantBranchType: string;
  merchantBranchCode: string | null;
  relationshipTypeStore: string | null;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  merchantLogo: IMerchantLogoIcon | null;
  merchantIcon: IMerchantLogoIcon | null;
  merchantTranslations: IMerchantTranslation[];
  userMerchant: IUserMerchant[];
  memberCount: number;
  // legacy / convenience fields used in UI
  name?: string;
  image?: string;
}

export interface IMerchantMemberUser {
  id: number;
  uuid: string;
  firstNameTh: string;
  middleNameTh: string | null;
  lastNameTh: string;
  firstNameEn: string | null;
  middleNameEn: string | null;
  lastNameEn: string | null;
  countryCode: string;
  phoneNumber: string;
  email: string | null;
}

export interface IMerchantMemberRole {
  id: number;
  name: string;
  displayName: string;
}

export interface IMerchantMember {
  users: IMerchantMemberUser;
  role: IMerchantMemberRole;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMerchantMembersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IMerchantMembersResponse {
  items: IMerchantMember[];
  pagination: IMerchantMembersPagination;
  allMembers: number;
}

export interface IAvailableMerchantMember {
  id: number;
  isOwner: boolean;
  isCreator: boolean;
  memberStatus: string;
  displayName: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  users: IMerchantMemberUser;
  role: IMerchantMemberRole;
}

export interface IAvailableMerchantMembersResponse {
  items: IAvailableMerchantMember[];
  pagination: IMerchantMembersPagination;
}

export interface IMerchantListResponse {
  data: IMerchantItem[];
}

export interface IAddMerchantMemberDetail {
  userId: number;
  merchantId: number;
  roleId: number;
  status: string;
}

export interface IAddMerchantMembersResponse {
  addedCount: number;
  details: IAddMerchantMemberDetail[];
}
