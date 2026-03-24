import {
  KycOrganizationStatus,
  UserOrganizationInviteStatus,
} from '../enum/organization.enum';

export interface IUser {
  id: number;
  countryCode: string;
  tel: string;
  email: string | null;
  name: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  middleNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  middleNameEn: string | null;
  originalPassword: string;
  role: string;
  locale: string;
  interfaceMode: string;
  status: string;
  gender: string | null;
  onBoardingStep: string | null;
  birthDate: string | null;
  cisNumber: string;
  idCard: string | null;
  kycStatus: KycOrganizationStatus;
  maritalStatus: string | null;
  createdAt: string;
  updatedAt: string;
  merchants: any[];
  admins: any[];
  imageUpload: string | null;
  remarkKyc: string | null;
}

export interface IUserOrganization {
  name: any;
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
