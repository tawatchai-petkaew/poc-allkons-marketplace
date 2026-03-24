export enum OrganizationTypes {
  PERSONAL = "PERSONAL",
  REGISTERED_INDIVIDUAL = "REGISTERED_INDIVIDUAL",
  JURISTIC = "JURISTIC",
}

export const OrganizationType = OrganizationTypes;
export type OrganizationType = OrganizationTypes;

export enum KycOrganizationStatus {
  NONE = "NONE",
  WAIT_FOR_APPROVE = "WAIT_FOR_APPROVE",
  REQUEST_MORE = "REQUEST_MORE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export enum UserOrganizationInviteStatus {
  NONE = "NONE",
  SENT = "SENT",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  WAIT_FOR_APPROVE = "WAIT_FOR_APPROVE",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export enum ExitRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
