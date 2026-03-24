import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';

export interface CreateInvitationData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  roleId: number;
  organizeId: number;
  invitedByUserId: number;
  expiresAt?: Date;
  status?: UserOrganizationInviteStatus;
  addInWhiteList?: boolean;
  merchantInfo?: { merchantId: number; roleId: number }[];
  inviteStatus?: UserOrganizationInviteStatus; // New field for invite status
  approverOrgId?: number; // New field for approver organization
  approvedAt?: Date;
}
