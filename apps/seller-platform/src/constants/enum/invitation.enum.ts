export enum UserInviteStatus {
  CAN_ADD_WHITELIST = "canAddToWhitelist",
  IN_MY_ORG_WHITELIST = "isInMyOrgWhitelist",
  IN_OTHER_WHITELIST = "isInOtherWhitelist",
  USER_IN_MY_ORG = "isUserInMyOrg",
  USER_IN_OTHER_ORG = "isUserInOtherOrg",
  PHONE_DUP_ORG = "isPhoneDuplicateOrg",
  IS_INVITING_USER = "isInviting",
}

export enum UserOrganizationInviteStatus {
  NONE = 'NONE',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED', // ปฏิเสธคำเชิญ
  EXPIRED = 'EXPIRED',
  WAIT_FOR_APPROVE = 'WAIT_FOR_APPROVE',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED', // ไม่อนุมัติให้เข้าร่วมองค์กร
}

export enum UserOrganizationInviteStatusApprove {
  APPROVE = 'APPROVE',
  REJECTED = 'REJECTED', // ไม่อนุมัติให้เข้าร่วมองค์กร
}