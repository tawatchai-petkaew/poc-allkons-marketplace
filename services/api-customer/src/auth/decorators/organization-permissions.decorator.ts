import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for accessing an endpoint
 * @param permissions Array of permission codes required
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify that an endpoint requires organization access
 * Use this with OrganizationPermissionGuard
 */
export const RequireOrganizationAccess = () =>
  SetMetadata('require_organization_access', true);

/**
 * Combined decorator for organization access with specific permissions
 */
export const OrganizationPermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('require_organization_access', true)(target, propertyKey, descriptor);
    SetMetadata(PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
  };
};
