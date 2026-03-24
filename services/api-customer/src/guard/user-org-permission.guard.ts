import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { Connection } from 'typeorm';
import { Organization } from '@/model/organization.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { AuthUser, RequestOrganization } from '@/types/request.types';

/**
 * UserOrgPermissionGuard
 *
 * Purpose: Verify organization access and check user-organization permissions
 *
 * Usage:
 * @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @RequireUserOrgPermissions('org.view', 'org.view_detail')
 * @Get('info')
 * async getInfo(@CurrentOrganization() org: RequestOrganization) {
 *   // org.id - organization ID
 *   // org.userOrganization - user's relationship with organization (roleId, isOwner, etc)
 * }
 *
 * How it works:
 * 1. Requires ActJwtGuard - uses request.user from ActJwtGuard
 * 2. Get organization-uuid from request header
 * 3. Single JOIN query: Verify organization exists AND user has access (with Redis cache, TTL: 5 min)
 * 4. If not found: throw 'Organization not found or access denied'
 * 5. Check permissions if required by @RequireUserOrgPermissions(...) decorator
 * 6. Get user permissions based on their role (with Redis cache, TTL: 60 sec)
 * 7. Attach to request.organization: { id, userOrganization }
 *
 * Available permission codes: See src/data/permissions.ts
 */
@Injectable()
export class UserOrgPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly connection: Connection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get organization UUID from header
    const organizationUuid = request.headers['organization-uuid'];

    if (
      !organizationUuid ||
      organizationUuid === 'undefined' ||
      organizationUuid === 'null' ||
      organizationUuid.trim() === ''
    ) {
      throw new ForbiddenException('Organization UUID required in header');
    }

    // Verify organization exists and user has access (single query)
    const organization = await this.getOrganizationAccess(
      user.id,
      organizationUuid,
    );

    if (!organization) {
      throw new ForbiddenException('Organization not found or access denied');
    }

    // Attach organization data to request
    request.organization = organization;

    // Check permissions
    return this.checkPermissions(context, user.id, organization.id);
  }

  private async getOrganizationAccess(
    userId: number,
    organizationUuid: string,
  ): Promise<RequestOrganization | null> {
    const cacheKey = `guard:org:access:${userId}:${organizationUuid}`;

    // Try cache first
    const cached: RequestOrganization | undefined = await this.cacheManager.get(
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    // Cache miss: Query database with single JOIN
    // Combines organization lookup + user-organization access check
    const result = await this.connection
      .getRepository(Organization)
      .createQueryBuilder('org')
      .innerJoin(
        UserOrganization,
        'uo',
        'uo.organizeId = org.id AND uo.userId = :userId',
        { userId },
      )
      .select([
        'org.id',
        'org.uuid',
        'uo.userId',
        'uo.organizeId',
        'uo.roleId',
        'uo.isOwner',
      ])
      .where('org.uuid = :uuid', { uuid: organizationUuid })
      .getRawOne<{
        org_id: number;
        org_uuid: string;
        uo_userId: number;
        uo_organizeId: number;
        uo_roleId: number | null;
        uo_isOwner: boolean;
      }>();

    if (!result) {
      return null;
    }

    const organization: RequestOrganization = {
      id: result.org_id,
      uuid: result.org_uuid,
      userOrganization: {
        userId: result.uo_userId,
        organizeId: result.uo_organizeId,
        roleId: result.uo_roleId,
        isOwner: result.uo_isOwner,
      },
    };

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, organization, 300);

    return organization;
  }

  private async checkPermissions(
    context: ExecutionContext,
    userId: number,
    organizationId: number,
  ): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'user-org-permissions',
      context.getHandler(),
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user permissions with cache
    const userPermissions = await this.getUserPermissionCodes(
      userId,
      organizationId,
    );

    const hasRequiredPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasRequiredPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(
          ' or ',
        )}`,
      );
    }

    return true;
  }

  private async getUserPermissionCodes(
    userId: number,
    organizationId: number,
  ): Promise<string[]> {
    const cacheKey = `guard:org:user-permissions:${userId}:${organizationId}`;

    // Try cache first
    const cached: string[] | undefined = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss: Query database
    // Query: UserOrganization -> Role -> RolePermissions -> Permission
    const result = await this.connection
      .getRepository(UserOrganization)
      .createQueryBuilder('uo')
      .innerJoin('uo.role', 'role')
      .innerJoin('role.rolePermissions', 'rp')
      .innerJoin('rp.permissions', 'p')
      .select('p.code', 'code')
      .where('uo.userId = :userId AND uo.organizeId = :organizationId', {
        userId,
        organizationId,
      })
      .getRawMany<{ code: string }>();

    const permissionCodes = result.map((r) => r.code);

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, permissionCodes, 60);

    return permissionCodes;
  }
}
