export enum OrganizationTypes {
  REGISTERED_INDIVIDUAL = 'REGISTERED_INDIVIDUAL',
  JURISTIC = 'JURISTIC',
  PERSONAL = 'PERSONAL',
}

export enum JurigisticTypes {
  PERSONAL = 'PERSONAL',
  PUBLIC_LIMITED_COMPANY = 'PUBLIC_LIMITED_COMPANY',
  LIMITED_COMPANY = 'LIMITED_COMPANY',
  LIMITED_PARTNERSHIP = 'LIMITED_PARTNERSHIP',
  GENERAL_PARTNERSHIP = 'GENERAL_PARTNERSHIP',
  OTHER = 'OTHER',
}

export enum KycOrganizationStatus {
  NONE = 'NONE',
  WAIT_FOR_APPROVE = 'WAIT_FOR_APPROVE',
  REQUEST_MORE = 'REQUEST_MORE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
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

export enum JurigisticTypeValues {
  PUBLIC_LIMITED_COMPANY = 'บริษัทมหาชน',
  LIMITED_COMPANY = 'บริษัทจำกัด',
  LIMITED_PARTNERSHIP = 'ห้างหุ้นส่วนจำกัด',
  GENERAL_PARTNERSHIP = 'ห้างหุ้นส่วนสามัญ',
  OTHER = 'อื่นๆ',
}

export enum ExitRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}