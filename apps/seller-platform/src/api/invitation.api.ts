import { UserOrganizationInviteStatus } from "@/constants/enum/organization.enum";
import { InvitationApprove, InvitationRespondPayload } from "@/interfaces/invitation/invitation.request.interface";
import { IApprovalInvitationResponse, IApprovalInvitationsListResponse, IInvitation, IRespondInvitationResponse } from "@/interfaces/invitation/invitation.response.interface";
import { customerAPI } from "@/libs/axios";
import { ApiResponse } from "@/types/common.type";

export const getApprovalInvitations = async (
  organizationUuid: string,
  params: {
    page?: number;
    limit?: number;
    inviteStatus?: UserOrganizationInviteStatus[];
  },
) => {
  const queryParams: Record<string, string | number> = {};
  
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.inviteStatus && params.inviteStatus.length > 0) {
    queryParams.inviteStatus = params.inviteStatus.join(',');
  }

  const { data: responseData } = await customerAPI.get<ApiResponse<IApprovalInvitationsListResponse>>(
    `/invitations/approvals`,
    {
      headers: {
        'organization-uuid': organizationUuid,
      },
      params: queryParams,
    },
  );
  return responseData;
};

export const approveInvitation = async (payload: InvitationApprove, organizationUuid: string) => {
  const { data: responseData } = await customerAPI.post<ApiResponse<IApprovalInvitationResponse>>(
    `/invitations/approve`,
    payload,
    {
        headers: {
            'organization-uuid': organizationUuid,
        }
    }
  );
  return responseData;
};

export const getDetailRefCode = async (refCode: string) => {
  const { data: responseData } = await customerAPI.get<ApiResponse<IInvitation>>(
    `/invitations/ref?refCode=${refCode}`
  );
  return responseData;
}

export const respondInvitation = async (payload: InvitationRespondPayload) => {
    const { data: responseData } = await customerAPI.post<ApiResponse<IRespondInvitationResponse>>(
        `/invitations/respond`,
        payload
    );
    return responseData;
}

export const getInvitations = async (
  organizationUuid: string,
  params: {
    page?: number;
    limit?: number;
    inviteStatus?: UserOrganizationInviteStatus[];
  }
) => {
  // Build query string with comma-separated inviteStatus
 const queryParams: Record<string, string | number> = {};
  
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.inviteStatus && params.inviteStatus.length > 0) {
    queryParams.inviteStatus = params.inviteStatus.join(',');
  }

  const { data: responseData } = await customerAPI.get<ApiResponse<IInvitation[]>>(
    `/invitations`,
    {
      headers: {
        'organization-uuid': organizationUuid,
      },
      params: queryParams,
    }
  );

  return responseData;
};