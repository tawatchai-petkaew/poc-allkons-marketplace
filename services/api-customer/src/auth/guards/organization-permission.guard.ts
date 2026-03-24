import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '@/model/organization.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { PermissionService } from '@/modules/permission/permission.service';

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepo: Repository<UserOrganization>,
    private readonly permissionService: PermissionService,
  ) {}

  // Lightweight in-memory caches to reduce repeated lookups and still hydrate request objects
  private orgCache = new Map<
    number,
    { entity: Pick<Organization, 'id'>; ts: number }
  >();
  private userOrgCache = new Map<
    string,
    {
      entity: Pick<
        UserOrganization,
        'userId' | 'organizeId' | 'roleId' | 'isOwner'
      >;
      ts: number;
    }
  >();
  private readonly existenceTtlMs = 30_000; // 30 seconds
  private readonly cacheMax = 1000; // Simple LRU bound

  // In-flight dedupe to collapse concurrent requests for same key
  private orgInflight = new Map<
    number,
    Promise<Pick<Organization, 'id'> | undefined>
  >();
  private userOrgInflight = new Map<
    string,
    Promise<
      | Pick<UserOrganization, 'userId' | 'organizeId' | 'roleId' | 'isOwner'>
      | undefined
    >
  >();

  private getOrgFromCache(id: number): Pick<Organization, 'id'> | undefined {
    const hit = this.orgCache.get(id);
    if (!hit) return undefined;
    if (Date.now() - hit.ts > this.existenceTtlMs) {
      this.orgCache.delete(id);
      return undefined;
    }
    return hit.entity;
  }

  private setOrgCache(entity: Pick<Organization, 'id'>) {
    if (!entity?.id) return;
    this.orgCache.set(entity.id, { entity, ts: Date.now() });
    if (this.orgCache.size > this.cacheMax) {
      const firstKey = this.orgCache.keys().next().value;
      if (firstKey !== undefined) this.orgCache.delete(firstKey);
    }
  }

  private getUserOrgFromCache(
    userId: number,
    orgId: number,
  ):
    | Pick<UserOrganization, 'userId' | 'organizeId' | 'roleId' | 'isOwner'>
    | undefined {
    const key = `${userId}:${orgId}`;
    const hit = this.userOrgCache.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.ts > this.existenceTtlMs) {
      this.userOrgCache.delete(key);
      return undefined;
    }
    return hit.entity;
  }

  private setUserOrgCache(
    entity: Pick<
      UserOrganization,
      'userId' | 'organizeId' | 'roleId' | 'isOwner'
    >,
  ) {
    if (!entity?.userId || !entity?.organizeId) return;
    const key = `${entity.userId}:${entity.organizeId}`;
    this.userOrgCache.set(key, { entity, ts: Date.now() });
    if (this.userOrgCache.size > this.cacheMax) {
      const firstKey = this.userOrgCache.keys().next().value;
      if (firstKey !== undefined) this.userOrgCache.delete(firstKey);
    }
  }

  private async getOrLoadOrgLite(
    id: number,
  ): Promise<Pick<Organization, 'id'> | undefined> {
    // const cached = this.getOrgFromCache(id);
    // if (cached) return cached;
    const inflight = this.orgInflight.get(id);
    if (inflight) return inflight;
    const work = (async () => {
      const row = await this.organizationRepo
        .createQueryBuilder('org')
        .select(['org.id'])
        .where('org.id = :id', { id })
        .limit(1)
        .getRawOne<{ org_id: number }>();
      if (!row) return undefined;
      const entity = { id } as Pick<Organization, 'id'>;
      //this.setOrgCache(entity);
      return entity;
    })().finally(() => this.orgInflight.delete(id));
    this.orgInflight.set(id, work);
    return work;
  }

  private async getOrLoadUserOrgLite(
    userId: number,
    orgId: number,
  ): Promise<
    | Pick<UserOrganization, 'userId' | 'organizeId' | 'roleId' | 'isOwner'>
    | undefined
  > {
    // const cached = this.getUserOrgFromCache(userId, orgId);
    // if (cached) return cached;
    const key = `${userId}:${orgId}`;
    const inflight = this.userOrgInflight.get(key);
    if (inflight) return inflight;
    const work = (async () => {
      const row = await this.userOrganizationRepo
        .createQueryBuilder('uo')
        .select(['uo.userId', 'uo.organizeId', 'uo.roleId', 'uo.isOwner'])
        .where('uo.userId = :userId AND uo.organizeId = :orgId', {
          userId,
          orgId,
        })
        .limit(1)
        .getOne();
      if (!row) return undefined;
      const entity = {
        userId: row.userId,
        organizeId: row.organizeId,
        roleId: row.roleId,
        isOwner: row.isOwner,
      };
      //this.setUserOrgCache(entity);
      return entity;
    })().finally(() => this.userOrgInflight.delete(key));
    this.userOrgInflight.set(key, work);
    return work;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
      console.log(
        '🔍 Guard - canActivate - Verified payload.organizationId:',
        payload?.organizationId,
      );
      console.log('🔍 Guard - Verified payload.type:', payload?.type);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token verification failed');
    }

    // Handle organization token
    if (payload.type === 'organization_token') {
      return this.handleOrganizationToken(context, request, payload);
    }

    // Handle regular token with organization context
    return this.handleRegularTokenWithOrganization(context, request, payload);
  }

  private async handleOrganizationToken(
    context: ExecutionContext,
    request: any,
    payload: any,
  ): Promise<boolean> {
    console.log(
      '🔍 Guard - handleOrganizationToken - payload.organizationId:',
      payload.organizationId,
    );
    console.log('🔍 Guard - Full payload:', JSON.stringify(payload, null, 2));

    // Verify organization exists and hydrate request.organization
    let organization = await this.getOrLoadOrgLite(payload.organizationId);

    if (!organization) {
      throw new ForbiddenException('Organization not found');
    }

    // Verify user still has access to organization and hydrate request.userOrganization
    let userOrganization = await this.getOrLoadUserOrgLite(
      payload.userId,
      payload.organizationId,
    );

    if (!userOrganization) {
      throw new ForbiddenException('Access to organization revoked');
    }

    // Add data to request for use in controllers
    request.user = {
      ...payload,
      organizationId: payload.organizationId, // Explicitly use token's organizationId
    };
    console.log(
      '🔍 Guard - Set request.user.organizationId to:',
      request.user.organizationId,
    );

    request.organization = organization ?? request.organization;
    request.userOrganization = userOrganization ?? request.userOrganization;

    // Check permissions
    return this.checkPermissions(
      context,
      payload.userId,
      payload.organizationId,
    );
  }

  private async handleRegularTokenWithOrganization(
    context: ExecutionContext,
    request: any,
    payload: any,
  ): Promise<boolean> {
    // Get organization ID from request (params, query, or body)
    const organizationId =
      request.organizationId ||
      payload.organizationId ||
      request.headers['organizationid'];

    if (!organizationId) {
      throw new ForbiddenException('Organization ID required');
    }

    const userId = payload.userId || payload.id;

    // Verify organization exists and hydrate request.organization
    const orgNumericId = parseInt(organizationId);
    let organization = await this.getOrLoadOrgLite(orgNumericId);

    if (!organization) {
      throw new ForbiddenException('Organization not found');
    }

    // Verify user has access to organization and hydrate request.userOrganization
    let userOrganization = await this.getOrLoadUserOrgLite(
      userId,
      orgNumericId,
    );

    if (!userOrganization) {
      throw new ForbiddenException('Access to organization denied');
    }

    // Add data to request for use in controllers
    request.user = payload;
    request.organization = organization ?? request.organization;
    request.userOrganization = userOrganization ?? request.userOrganization;
    request.organizationId = orgNumericId;

    // Check permissions
    return this.checkPermissions(context, userId, parseInt(organizationId));
  }

  private async checkPermissions(
    context: ExecutionContext,
    userId: number,
    organizationId: number,
  ): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    try {
      const userPermissions =
        await this.permissionService.getUserPermissionCodes(
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
    } catch (error) {
      console.error('Permission check failed:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Permission check failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
