import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from "../enum/invitation.enum";

export interface IinvitationDetail {
  id: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  refCode: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  approverOrgId: number | null;
  invitedByUser: InvitedByUser;
  role: Role;
  organization: Organization;
  approverOrganization: Organization | null;
}

export interface IApprovalInvitation extends Omit<IinvitationDetail, 'acceptedAt' | 'approverOrganization' | 'approverOrgId' | 'invitedByUser' | 'organization'> {
  roleId: number;
  organizeId: number;
  approverOrgId: number;
  approvedAt: string;
  invitedByUser?: InvitedByUser;
  organization?: Pick<Organization, 'id' | 'organizeName'>;
}

export interface InvitedByUser {
  id: number;
  firstNameTh: string;
  lastNameTh: string;
}

export interface Organization {
  id: number;
  organizeName: string;
  juristic: Juristic;
}

export interface Juristic {
  id: number;
  label: string;
  prefix: string | null;
  subfix: string | null;
}

export interface Role {
  id: number;
  name: string;
  displayName: string;
}

export interface InvitationApprovePayload {
  refCode: string;
  respond: UserOrganizationInviteStatusApprove;
}

export interface InvitationRespondPayload {
  refCode: string;
  respond: UserOrganizationInviteStatusApprove;
  response: UserOrganizationInviteStatus;
}
