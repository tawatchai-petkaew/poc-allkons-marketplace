
import { InvitationRespondPayload, InvitationApprovePayload } from '@/common/interfaces/Invitation.interface';
import { customerAPI } from '../../../utils/axios';
import { UserOrganizationInviteStatus } from '@/common/enum/invitation.enum';

const prefix = '/invitations';

export const getDetailRefCode = async (refCode: string) => {
  const { data: responseData } = await customerAPI.get(
    `/invitations/ref?refCode=${refCode}`
  );
  return responseData;
};

export const respondInvitation = async (payload: InvitationRespondPayload) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/respond`,
    payload
  );
  return responseData;
};

export const approveInvitation = async (payload: InvitationApprovePayload) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/approve`,
    payload
  );
  return responseData;
};

export const getApprovalInvitations = async (
  organizationUuid: string,
  params: {
    page?: number;
    limit?: number;
    inviteStatus?: UserOrganizationInviteStatus[];
  }
) => {
  // Build query string with comma-separated inviteStatus
  const queryParts: string[] = [];
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.limit) queryParts.push(`limit=${params.limit}`);
  if (params.inviteStatus && params.inviteStatus.length > 0) {
    queryParts.push(`inviteStatus=${params.inviteStatus.join(',')}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  
  const { data: responseData } = await customerAPI.get(
    `${prefix}/approvals${queryString}`,
    {
      headers: {
        'organization-uuid': organizationUuid,
      },
    }
  );
  return responseData;
};

export const getInvitations = async (
  organizationUuid: string,
  params: {
    page?: number;
    limit?: number;
    inviteStatus?: UserOrganizationInviteStatus[];
  }
) => {
  // Build query string with comma-separated inviteStatus
  const queryParts: string[] = [];
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.limit) queryParts.push(`limit=${params.limit}`);
  if (params.inviteStatus && params.inviteStatus.length > 0) {
    queryParts.push(`inviteStatus=${params.inviteStatus.join(',')}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const { data: responseData } = await customerAPI.get(
    `${prefix}${queryString}`,
    {
      headers: {
        'organization-uuid': organizationUuid,
      },
    }
  );
  return responseData;
};
