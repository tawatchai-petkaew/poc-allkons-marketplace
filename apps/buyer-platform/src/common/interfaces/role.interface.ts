export interface IPermission {
  id: number;
  code: string;
  description: string;
  descriptionTh: string;
  resource: string | null;
  action: string | null;
  group: string;
  groupNameTh: string;
  isSelected: boolean;
}

export interface IPermissionGroup {
  group: string;
  groupNameTh: string;
  permissions: IPermission[];
}

export interface IRole {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  priority: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  permissionGroups: IPermissionGroup[];
}
