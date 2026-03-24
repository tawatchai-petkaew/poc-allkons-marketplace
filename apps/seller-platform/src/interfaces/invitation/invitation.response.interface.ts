import { UserOrganizationInviteStatus } from "@/constants/enum/organization.enum";
import { PaginationResponse } from "@/types/common.type";
import { IAuthOrganization, IAuthUser } from "../auth/auth.response.interface";
import { IRole } from "../role.interface";
import { IJuristicTypeInfo } from "../organization/organization.response.interface";

type IInvitationOrganization = Pick<IAuthOrganization['organization'], 'id' |'organizeName'>;

type IJuristicType = Pick<IJuristicTypeInfo, 'prefix' | 'subfix'>;

type IInvitationOrganizationInfo = IInvitationOrganization & {
  juristic: IJuristicType;
}

export interface IInvitation {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    countryCode: string;
    phoneNumber: string;
    refCode: string;
    status: UserOrganizationInviteStatus;
    addInWhiteList: boolean;
    merchantInfo?: { merchantId: number; roleId: number }[] | null;
    createdAt: string;
    expiresAt: string;
    acceptedAt?: string | null;
    approvedAt?: string | null;
    approverOrgId: number | null;
    deletedAt?: string | null;
    invitedByUser?: Pick<IAuthUser, 'id' | 'firstNameTh' | 'lastNameTh' | 'middleNameTh'> | null;
    organization?: IInvitationOrganizationInfo | null;
    approverOrganization?: IInvitationOrganizationInfo | null;
    role?: Pick<IRole, 'id' | 'name' | 'displayName'> | null;
}

export interface IApprovalInvitationsListResponse {
  items: IInvitation[];
  meta: PaginationResponse;
}

export interface IApprovalInvitationResponse {
  status: UserOrganizationInviteStatus;
  organizationId: number;
  emailSentTo: string;
}

export interface IRespondInvitationResponse {
    status: UserOrganizationInviteStatus;
    organizationId: number;
    userId: number;
}