import { UserOrganizationInviteStatus, UserOrganizationInviteStatusApprove } from "@/constants/enum/invitation.enum";

export interface InvitationApprove {
  refCode: string;
  respond: UserOrganizationInviteStatusApprove;
}

export interface InvitationRespondPayload extends InvitationApprove {
  response: UserOrganizationInviteStatus;
}