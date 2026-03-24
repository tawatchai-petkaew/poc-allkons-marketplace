import { Permission } from '../../../model/permissions.entity';

export interface GroupedPermissionsResponse {
  group: string;
  groupNameTh: string;
  permissions: Permission[];
}
