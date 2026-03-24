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
