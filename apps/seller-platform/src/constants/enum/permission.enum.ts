export enum PermissionGroup {
  ORGANIZATION_INFO = 'ORGANIZATION_INFO', // ข้อมูลองค์กร
  USER_ORGANIZATION = 'USER_ORGANIZATION', // จัดการสมาชิก
  ROLE_PERMISSION = 'ROLE_PERMISSION', // บทบาทและสิทธิ์การใช้งาน
  ORGANIZATION_PHONE = 'ORGANIZATION_PHONE', // จัดการข้อมูลเบอร์องค์กร
  PAYMENT = 'PAYMENT', // การชำระเงิน
  BANK_ACCOUNT_INFO = 'BANK_ACCOUNT_INFO', // ข้อมูลบัญชีธนาคาร
  MERCHANT = 'MERCHANT', // ข้อมูลร้านค้าและสาขา
  PROMPTPAY = 'PROMPTPAY', // ข้อมูลบัญชีพร้อมเพย์
}

export enum PermissionCode {
  ORG_PHONE_CREATE = 'org_phone.create',
  ROLE_UPDATE = 'role.update',
  ORG_PHONE_VIEW_DETAIL = 'org_phone.view_detail',
  ROLE_VIEW_DETAIL = 'role.view_detail',
  ROLE_DELETE = 'role.delete',
  ROLE_CREATE = 'role.create',
  ROLE_VIEW_LIST = 'role.view_list',
  ORG_MEMBER_REMOVE_SELF = 'org_member.remove_self',
  ORG_MEMBER_REMOVE = 'org_member.remove',
  ORG_MEMBER_APPROVE_REQUEST = 'org_member.approve_request',
  ORG_MEMBER_APPROVE_INVITE = 'org_member.approve_invite',
  ORG_MEMBER_UPDATE_PROFILE = 'org_member.update_profile',
  ORG_MEMBER_VIEW_DETAIL = 'org_member.view_detail',
  ORG_VIEW_DETAIL = 'org.view_detail',
  ORG_MEMBER_VIEW = 'org_member.view',
  ORG_UPDATE_DOC = 'org.update_doc',
  ORG_MEMBER_INVITE = 'org_member.invite',
  ORG_UPDATE = 'org.update',
  ORG_VIEW = 'org.view',
}
