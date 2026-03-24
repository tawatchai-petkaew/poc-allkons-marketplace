/**
 * Request context types
 * Types for data attached to request by Guards and middleware
 */

/**
 * Authenticated user from JWT token
 * Attached to request by ActJwtGuard
 */
export interface AuthUser {
  id: number;
  uuid: string;
  sub: string;
  azp: string;
}

/**
 * Merchant context from request
 * Fetched and validated by MerchantGuard
 * Contains minimal fields for access control
 */
export interface RequestMerchant {
  id: number;
  uuid: string;
  slug: string;
}

/**
 * User-Organization relationship from request
 * Fetched and validated by UserOrgPermissionGuard
 * Contains minimal fields for access control and permission checking
 */
export interface RequestUserOrganization {
  userId: number;
  organizeId: number;
  roleId: number | null;
  isOwner: boolean;
}

/**
 * Organization context from request
 * Fetched and validated by UserOrgPermissionGuard
 * Contains minimal fields for access control and user's relationship with the organization
 */
export interface RequestOrganization {
  id: number;
  uuid: string;
  userOrganization: RequestUserOrganization;
}
