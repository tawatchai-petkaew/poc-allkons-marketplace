import { Permission } from '../model/permissions.entity';

export interface RoleData {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  isClone: boolean;
  priority: number;
  permissionCodes: string[];
}

const roles: RoleData[] = [
  {
    name: 'OWNER',
    displayName: 'Owner',
    description: 'Full access to all features',
    isActive: true,
    isDefault: true,
    isClone: false,
    priority: 1, // Highest priority
    permissionCodes: [
      // Adding all permission codes - system will assign all available permissions
      'org.view',
      'org.view_detail',
      'org.update',
      'org.upload_doc',
      'org_member.view',
      'org_member.view_detail',
      'org_member.update_profile',
      'org_member.invite',
      'org_member.approve_invite',
      'org_member.remove',
      'org_member.approve_request',
      'role.view_list',
      'role.view_detail',
      'role.create',
      'role.delete',
      'role.update',
      'org_phone.view_list',
      'org_phone.view_detail',
      'org_phone.create',
      'org_phone.delete',
      'payment.update_channel',
      'bank.view_list',
      'bank.view_detail',
      'bank.create',
      'bank.update',
      'bank.delete',
      'promptpay.view_list',
      'promptpay.view_detail',
      'promptpay.create',
      'promptpay.update',
      'promptpay.delete',
      'merchant.assign_member',
      'merchant.update_member',
      'merchant.delete_member',
      'merchant.view_list',
      'merchant.view_detail'
    ]
  },
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Admin',
    description: 'Access to most system features except critical organization settings',
    isActive: true,
    isDefault: true,
    isClone: false,
    priority: 2,
    permissionCodes: [
      'ALL_PERMISSIONS'
    ]
  },
  {
    name: 'ADMIN',
    displayName: 'Admin',
    description: 'Access to common administrative features',
    isActive: true,
    isDefault: true,
    isClone: true,
    priority: 3,
    permissionCodes: [
      'org.view',
      'org.view_detail',
      'org.update',
      'org_member.view',
      'org_member.view_detail',
      'org_member.invite',
      'org_member.remove_by_others',
      'org_member.remove_self',
      'role.view_list',
      'role.view_detail',
      'org_phone.view_list',
      'org_phone.view_detail',
      'org_phone.create',
      'payment.update_channel',
      'bank.view_list',
      'bank.view_detail',
      'bank.create',
      'promptpay.view_list',
      'promptpay.view_detail',
      'promptpay.create',
      'merchant.assign_member',
      'merchant.update_member',
      'merchant.view_list',
      'merchant.view_detail'
    ]
  },
  {
    name: 'MEMBER',
    displayName: 'Member',
    description: 'Regular member access with limited permissions',
    isActive: true,
    isDefault: true,
    isClone: true,
    priority: 4, // Lowest priority
    permissionCodes: [
      'org.view',
      'org.view_detail',
      'org_member.view',
      'org_member.remove_by_others',
      'org_member.remove_self',
      'role.view_list',
      'role.view_detail',
      'org_phone.view_list',
      'org_phone.view_detail',
      'bank.view_list',
      'promptpay.view_list',
      'merchant.assign_member',
      'merchant.view_list',
      'merchant.view_detail'
    ]
  }
];

export default roles;
