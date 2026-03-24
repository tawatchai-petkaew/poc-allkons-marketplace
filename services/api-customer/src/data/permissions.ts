import { PermissionAction, PermissionResource, PermissionGroup } from '../model/permissions.entity';

interface PermissionData {
  code: string;
  description: string;
  descriptionTh: string;
  group: PermissionGroup | null;
  groupNameTh: string | null;
}

const permissions: PermissionData[] = [
  // Organization permissions
  {
    code: 'org.view',
    description: 'View organization information',
    descriptionTh: 'มีสิทธิ์ดูรายชื่อองค์กร',
    group: PermissionGroup.ORGANIZATION_INFO,
    groupNameTh: 'ข้อมูลองค์กร',
  },
  {
    code: 'org.view_detail',
    description: 'View organization information',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดองค์กร',
    group: PermissionGroup.ORGANIZATION_INFO,
    groupNameTh: 'ข้อมูลองค์กร',
  },
  {
    code: 'org.update',
    description: 'Update organization information',
    descriptionTh: 'มีสิทธิ์แก้ไขรายละเอียดองค์กร',
    group: PermissionGroup.ORGANIZATION_INFO,
    groupNameTh: 'ข้อมูลองค์กร',
  },
  {
    code: 'org.upload_doc',
    description: 'Upload Organization Documents for KYC',
    descriptionTh: 'มีสิทธิ์ขอยืนยันตัวตน (KYC)',
    group: PermissionGroup.ORGANIZATION_INFO,
    groupNameTh: 'ข้อมูลองค์กร',
  },

  // Member permissions
  {
    code: 'org_member.view',
    description: 'View Organization Members',
    descriptionTh: 'มีสิทธิ์ดูรายชื่อสมาชิก',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.view_detail',
    description: 'View Organization Members Detail',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดสมาชิกขององค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.update_profile',
    description: 'Update Member Profile',
    descriptionTh: 'มีสิทธิ์แก้ไขข้อมูลสมาชิกภายในองค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.invite',
    description: 'Invite Organization Member',
    descriptionTh: 'มีสิทธิ์เชิญสมาชิกเข้าองค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.approve_invite',
    description: 'Approve Invite Organization Member',
    descriptionTh: 'มีสิทธิ์อนุมัติให้เข้าร่วมในองค์กรอื่น',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.remove',
    description: 'Remove Organization Member',
    descriptionTh: 'มีสิทธิ์ลบสมาชิกออกจากองค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.approve_request',
    description: 'Approve Member Request to Leave Organization',
    descriptionTh: 'มีสิทธิ์ในการอนุมัติคนออกจากองค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.remove_by_others',
    description: 'Remove Member by Others',
    descriptionTh: 'มีสิทธิ์ถูกลบออกจากองค์กร',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  {
    code: 'org_member.remove_self',
    description: 'Remove Self from Organization',
    descriptionTh: 'มีสิทธิ์ออกจากองค์กรด้วยตัวเอง',
    group: PermissionGroup.USER_ORGANIZATION,
    groupNameTh: 'จัดการสมาชิก',
  },
  
  // Role & Permission management
  {
    code: 'role.view_list',
    description: 'View roles and permissions',
    descriptionTh: 'มีสิทธิ์ดูรายการบทบาทและสิทธิ์',
    group: PermissionGroup.ROLE_PERMISSION,
    groupNameTh: 'บทบาทและสิทธิ์การใช้งาน',
  },
  {
    code: 'role.view_detail',
    description: 'View roles and permissions detail',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดรายการบทบาทและสิทธิ์',
    group: PermissionGroup.ROLE_PERMISSION,
    groupNameTh: 'บทบาทและสิทธิ์การใช้งาน',
  },
  {
    code: 'role.create',
    description: 'Create roles and permissions',
    descriptionTh: 'มีสิทธิ์เพิ่มบทบาทและสิทธิ์',
    group: PermissionGroup.ROLE_PERMISSION,
    groupNameTh: 'บทบาทและสิทธิ์การใช้งาน',
  },
  {
    code: 'role.delete',
    description: 'Delete roles and permissions',
    descriptionTh: 'มีสิทธิ์ลบบทบาทและสิทธิ์',
    group: PermissionGroup.ROLE_PERMISSION,
    groupNameTh: 'บทบาทและสิทธิ์การใช้งาน',
  },
  {
    code: 'role.update',
    description: 'Update roles and permissions',
    descriptionTh: 'มีสิทธิ์แก้ไขบทบาทและสิทธิ์',
    group: PermissionGroup.ROLE_PERMISSION,
    groupNameTh: 'บทบาทและสิทธิ์การใช้งาน',
  },
  
  // Phone white list of organization permissions
   {
    code: 'org_phone.view_list',
    description: 'View phone white list',
    descriptionTh: 'มีสิทธิ์ดูรายการเบอร์องค์กร',
    group: PermissionGroup.ORGANIZATION_PHONE,
    groupNameTh: 'จัดการข้อมูลเบอร์องค์กร',
  },
  {
    code: 'org_phone.view_detail',
    description: 'View phone white detail',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดของเบอร์องค์กร',
    group: PermissionGroup.ORGANIZATION_PHONE,
    groupNameTh: 'จัดการข้อมูลเบอร์องค์กร',
  },
  {
    code: 'org_phone.create',
    description: 'Create new phone white list entry',
    descriptionTh: 'มีสิทธิ์เพิ่มเบอร์องค์กร',
    group: PermissionGroup.ORGANIZATION_PHONE,
    groupNameTh: 'จัดการข้อมูลเบอร์องค์กร',
  },
  {
    code: 'org_phone.delete',
    description: 'Delete phone white list entry',
    descriptionTh: 'มีสิทธิ์ลบเบอร์องค์กร',
    group: PermissionGroup.ORGANIZATION_PHONE,
    groupNameTh: 'จัดการข้อมูลเบอร์องค์กร',
  },
  
  // Payment permissions
  {
    code: 'payment.update_channel',
    description: 'Update payment channel',
    descriptionTh: 'อัพเดทช่องทางการจ่ายเงิน',
    group: PermissionGroup.PAYMENT,
    groupNameTh: 'การชำระเงิน',
  },
  
  // Bank account permissions
  {
    code: 'bank.view_list',
    description: 'View bank account list',
    descriptionTh: 'มีสิทธิ์ดูรายชื่อบัญชีธนาคาร',
    group: PermissionGroup.BANK_ACCOUNT_INFO,
    groupNameTh: 'ข้อมูลบัญชีธนาคาร',
  },
  {
    code: 'bank.view_detail',
    description: 'View bank account details',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดบัญชีธนาคาร',
    group: PermissionGroup.BANK_ACCOUNT_INFO,
    groupNameTh: 'ข้อมูลบัญชีธนาคาร',
  },
  {
    code: 'bank.create',
    description: 'Create bank account',
    descriptionTh: 'มีสิทธิ์เพิ่มบัญชีธนาคาร',
    group: PermissionGroup.BANK_ACCOUNT_INFO,
    groupNameTh: 'ข้อมูลบัญชีธนาคาร',
  },
  {
    code: 'bank.update',
    description: 'Update bank account details',
    descriptionTh: 'มีสิทธิ์แก้ไขบัญชีธนาคาร',
    group: PermissionGroup.BANK_ACCOUNT_INFO,
    groupNameTh: 'ข้อมูลบัญชีธนาคาร',
  },
  {
    code: 'bank.delete',
    description: 'Delete bank account',
    descriptionTh: 'มีสิทธิ์ลบบัญชีธนาคาร',
    group: PermissionGroup.BANK_ACCOUNT_INFO,
    groupNameTh: 'ข้อมูลบัญชีธนาคาร',
  },

  // PromptPay account permissions
  {
    code: 'promptpay.view_list',
    description: 'View PromptPay account list',
    descriptionTh: 'มีสิทธิ์ดูรายชื่อบัญชีพร้อมเพย์',
    group: PermissionGroup.PROMPTPAY,
    groupNameTh: 'ข้อมูลบัญชีพร้อมเพย์',
  },
  {
    code: 'promptpay.view_detail',
    description: 'View PromptPay account details',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดบัญชีพร้อมเพย์',
    group: PermissionGroup.PROMPTPAY,
    groupNameTh: 'ข้อมูลบัญชีพร้อมเพย์',
  },
  {
    code: 'promptpay.create',
    description: 'Create PromptPay account',
    descriptionTh: 'มีสิทธิ์สร้างบัญชีพร้อมเพย์',
    group: PermissionGroup.PROMPTPAY,
    groupNameTh: 'ข้อมูลบัญชีพร้อมเพย์',
  },
  {
    code: 'promptpay.update',
    description: 'Update PromptPay account',
    descriptionTh: 'มีสิทธิ์แก้ไขบัญชีพร้อมเพย์',
    group: PermissionGroup.PROMPTPAY,
    groupNameTh: 'ข้อมูลบัญชีพร้อมเพย์',
  },
  {
    code: 'promptpay.delete',
    description: 'Delete PromptPay account',
    descriptionTh: 'มีสิทธิ์ลบบัญชีพร้อมเพย์',
    group: PermissionGroup.PROMPTPAY,
    groupNameTh: 'ข้อมูลบัญชีพร้อมเพย์',
  },

  // Merchant and branch permissions
  {
    code: 'merchant.assign_member',
    description: 'Assign Member Merchant and Branch',
    descriptionTh: 'มีสิทธิ์จัดการสมาชิกภายในร้าน (assign)',
    group: PermissionGroup.MERCHANT,
    groupNameTh: 'ข้อมูลร้านค้าและสาขา',
  },
  {
    code: 'merchant.update_member',
    description: 'Update Role Member Merchant and Branch',
    descriptionTh: 'มีสิทธิ์แก้ไขบทบาทสมาชิกภายในร้าน',
    group: PermissionGroup.MERCHANT,
    groupNameTh: 'ข้อมูลร้านค้าและสาขา',
  },
  {
    code: 'merchant.delete_member',
    description: 'Delete Member Merchant and Branch',
    descriptionTh: 'มีสิทธิ์ลบสมาชิกภายในร้าน',
    group: PermissionGroup.MERCHANT,
    groupNameTh: 'ข้อมูลร้านค้าและสาขา',
  },
  {
    code: 'merchant.view_list',
    description: 'View Merchant and Branch list',
    descriptionTh: 'มีสิทธิ์ดูรายชื่อร้านค้าและสาขา',
    group: PermissionGroup.MERCHANT,
    groupNameTh: 'ข้อมูลร้านค้าและสาขา',
  },
  {
    code: 'merchant.view_detail',
    description: 'View Merchant and Branch details',
    descriptionTh: 'มีสิทธิ์ดูรายละเอียดร้านค้าและสาขา',
    group: PermissionGroup.MERCHANT,
    groupNameTh: 'ข้อมูลร้านค้าและสาขา',
  }
];

export default permissions;
