export class UpdateUserRoleDto { 
  roleId: number;
  organizationId: number;
  isOwner: boolean;
  isCreator?: boolean;
}