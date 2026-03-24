import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required user-organization permissions for a route
 *
 * Used with UserOrgPermissionGuard to check if the user has required permissions
 * within the organization context (based on their role in UserOrganization).
 *
 * @param permissions - Array of user-organization permission codes (must match codes in permissions table)
 *
 * @example Single permission
 * ```typescript
 * @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @RequireUserOrgPermissions('org.view')
 * @Get('info')
 * async getInfo() { ... }
 * ```
 *
 * @example Multiple permissions (user needs ANY one of them)
 * ```typescript
 * @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @RequireUserOrgPermissions('org.view', 'org.view_detail')
 * @Get('info')
 * async getInfo() { ... }
 * ```
 *
 * @example Without permissions (only check organization access)
 * ```typescript
 * @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @Get('info')
 * async getInfo() { ... }
 * ```
 *
 * Available permission codes: See src/data/permissions.ts
 *
 * @requires UserOrgPermissionGuard - Must be used with this guard
 * @requires ActJwtGuard - Authentication required
 */
export const RequireUserOrgPermissions = (...permissions: string[]) =>
  SetMetadata('user-org-permissions', permissions);
