import { customerAPI } from '../../../utils/axios';

const prefix = '/organization';

// Member interfaces
export interface IMember {
  id: number;
  userId: number;
  organizationId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReqInviteMember {
  email: string;
  role: string;
  organizationId: number;
}

export interface IReqUpdateMember {
  memberId: number;
  role?: string;
  status?: string;
}

// Get members list
export const getMemberList = async (organizationId: number) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationId}/members`
  );
  return responseData;
};

// Get member detail
export const getMemberDetail = async (
  organizationId: number,
  memberId: number
) => {
  const { data: responseData } = await customerAPI.get(
    `${prefix}/${organizationId}/members/${memberId}`
  );
  return responseData;
};

// Invite member
export const inviteMember = async (payload: IReqInviteMember) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/${payload.organizationId}/members/invite`,
    payload
  );
  return responseData;
};

// Update member
export const updateMember = async (
  organizationId: number,
  memberId: number,
  payload: Partial<IReqUpdateMember>
) => {
  const { data: responseData } = await customerAPI.put(
    `${prefix}/${organizationId}/members/${memberId}`,
    payload
  );
  return responseData;
};

// Remove member
export const removeMember = async (
  organizationId: number,
  memberId: number
) => {
  const { data: responseData } = await customerAPI.delete(
    `${prefix}/${organizationId}/members/${memberId}`
  );
  return responseData;
};

// Resend invitation
export const resendInvitation = async (
  organizationId: number,
  memberId: number
) => {
  const { data: responseData } = await customerAPI.post(
    `${prefix}/${organizationId}/members/${memberId}/resend-invitation`
  );
  return responseData;
};
