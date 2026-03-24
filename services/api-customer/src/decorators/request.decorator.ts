import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import {
  AuthUser,
  RequestMerchant,
  RequestOrganization,
} from '@/types/request.types';
import { Platform } from '@/model/organization-contact.entity';

/**
 * Auth decorators to extract data from request object
 */

/**
 * Extract current authenticated user from request
 * @requires ActJwtGuard - Must be used with @UseGuards(ActJwtGuard)
 * @returns AuthUser - Current authenticated user
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);

/**
 * Extract access token from request
 * @requires ActJwtGuard - Must be used with @UseGuards(ActJwtGuard)
 * @returns string - JWT access token
 */
export const AccessToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    return ctx.switchToHttp().getRequest().accessToken;
  },
);

/**
 * Extract current merchant from request
 * Merchant is fetched and validated by MerchantGuard
 * @requires MerchantGuard - Must be used with @UseGuards(ActJwtGuard, MerchantGuard)
 * @returns RequestMerchant - Current merchant context (minimal fields)
 *
 * @example
 * @UseGuards(ActJwtGuard, MerchantGuard)
 * @Get('products')
 * async getProducts(@CurrentMerchant() merchant: RequestMerchant) {
 *   console.log(merchant.slug); // ✓ Type-safe
 * }
 */
export const CurrentMerchant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestMerchant => {
    return ctx.switchToHttp().getRequest().merchant;
  },
);

/**
 * Extract current organization from request
 * Organization is fetched and validated by UserOrgPermissionGuard
 * @requires UserOrgPermissionGuard - Must be used with @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @returns RequestOrganization - Current organization context with user relationship
 *
 * @example
 * @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
 * @RequireUserOrgPermissions('org.view')
 * @Get('info')
 * async getInfo(@CurrentOrganization() org: RequestOrganization) {
 *   console.log(org.id); // Organization ID
 *   console.log(org.uuid); // Organization UUID
 *   console.log(org.userOrganization.roleId); // User's role in this organization
 *   console.log(org.userOrganization.isOwner); // Is user the owner?
 * }
 */
export const CurrentOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestOrganization => {
    return ctx.switchToHttp().getRequest().organization;
  },
);

/**
 * Public decorators to extract data from request object
 */

/**
 * Extract platform from request
 * Platform is determined by 'app-id' header
 * @requires app-id header - Must be a valid app-id (BUYER, MARKETPLACE, or SELLER)
 * @returns Platform - BUYER | SELLER | MARKETPLACE
 * @throws BadRequestException if app-id header is missing or invalid
 *
 * @example
 * @Get('data')
 * async getData(@GetPlatform() platform: Platform) {
 *   if (platform === Platform.BUYER) {
 *     // Handle buyer logic
 *   }
 * }
 */
export const GetPlatform = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Platform => {
    const req = ctx.switchToHttp().getRequest();
    const appId = req.headers['app-id'];

    if (!appId || appId === 'undefined' || appId === 'null') {
      throw new BadRequestException('app-id header is required');
    }

    // Match app-id to platform
    if (appId === process.env.APP_ID_BUYER) {
      return Platform.BUYER;
    } else if (appId === process.env.APP_ID_MARKETPLACE) {
      return Platform.MARKETPLACE;
    } else if (appId === process.env.APP_ID_SELLER) {
      return Platform.SELLER;
    } else {
      throw new BadRequestException(
        `Invalid app-id header: ${appId}. Must be a valid platform app-id.`,
      );
    }
  },
);

/**
 * Extract merchant slug from request header
 * @requires 'currentmerchantslug' header
 * @returns string - merchant slug from currentmerchantslug header
 * @throws BadRequestException if slug is missing or invalid
 *
 * @example
 * @Get('products')
 * async getProducts(@GetMerchantSlug() slug: string) {
 *   // slug from currentmerchantslug header
 * }
 */
export const GetMerchantSlug = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    const slug = req.headers['currentmerchantslug'];

    if (
      !slug ||
      slug === 'undefined' ||
      slug === 'null' ||
      slug.trim() === ''
    ) {
      throw new BadRequestException(
        'Current merchant slug not provided in header',
      );
    }

    return slug;
  },
);

/**
 * Extract organization UUID from request header
 * @requires 'organization-uuid' header
 * @returns string - Organization UUID from 'organization-uuid' header
 * @throws BadRequestException if organization UUID is missing or invalid
 *
 * @example
 * @Get('data')
 * async getData(@GetOrganizationUuid() orgUuid: string) {
 *   console.log(orgUuid); // UUID from header
 * }
 */
export const GetOrganizationUuid = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const organizationUuid = ctx.switchToHttp().getRequest().headers[
      'organization-uuid'
    ];
    if (
      !organizationUuid ||
      organizationUuid === 'undefined' ||
      organizationUuid === 'null' ||
      organizationUuid.trim() === ''
    ) {
      throw new BadRequestException('Organization uuid not provided in header');
    }
    return organizationUuid;
  },
);
