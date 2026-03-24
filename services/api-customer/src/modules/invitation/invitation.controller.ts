import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { CacheTTL } from '@nestjs/common';

import { Invitation } from '@/model/invitation.entity';
import { FlexibleCacheInterceptor } from '@/cache/flexible-cache.interceptor';
import { CacheKeyFrom } from '@/cache/cache-key-from.decorator';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { ApiOkRes } from '@/decorators/api-ok.decorator';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import {
  ApproveInvitationDto,
  GetInvitationByPhoneDto,
  RespondToInvitationDto,
} from './dto/respond-to-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { ApproveInvitationResponseDto } from './dto/approve-invitation-response.dto';
import { RequirePermissions } from '@/auth/decorators/organization-permissions.decorator';
import { getUrlOrigin } from '@/utils/url.utils';
import { getPlatform } from '@/utils/utils';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { UserOrgPermissionGuard } from '@/guard/user-org-permission.guard';
import { CurrentOrganization, CurrentUser } from '@/decorators/request.decorator';
import { AuthUser, RequestOrganization } from '@/types/request.types';
import { GetInvitationsQueryDto } from './dto/invitations.dto';
import { PaginationType } from '@/types/pagination.type';

@ApiTags('Invitations')
@Controller('invitations')
@UseFilters(new HttpExceptionFilter())
@UseInterceptors(new ResponseInterceptor())
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get my invitations for the current organization',
    description:
      'List invitations sent to the current user (filtered by phone number). ' +
      'Supports filtering by multiple statuses and search. ' +
      'Organization ID is resolved from the organization-uuid header.',
  })
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @ApiOkRes(Invitation, { isArray: true })
  async getMyInvitations(
    @CurrentUser() user: AuthUser,
    @CurrentOrganization() org: RequestOrganization,
    @Query() query: GetInvitationsQueryDto,
  ): Promise<PaginationType<Invitation>> {
    return await this.invitationService.findMyInvitations(
      org.id,
      user.id,
      query,
    );
  }

  @Get('ref')
  @ApiOperation({ summary: 'Get invitation by reference code' })
  @ApiQuery({
    name: 'refCode',
    description: 'Invitation reference code',
    required: true,
  })
  @UseGuards(PublicApiKeyGuard)
  @ApiOkRes(Invitation)
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const refCode = req.query?.refCode || req.params?.refCode;
    if (!refCode) return undefined;
    const appId = req.headers?.['app-id'] || '';
    return `invitations:ref:${refCode}:app:${appId}`;
  })
  @CacheTTL(180)
  async getInvitationByRefCode(
    @Query('refCode') refCode: string,
  ): Promise<Invitation> {
    return await this.invitationService.findByRefCode(refCode);
  }

  @Get('phone')
  @ApiOperation({ summary: 'Get invitations by phone number and country code' })
  @UseGuards(PublicApiKeyGuard)
  @ApiOkRes(Invitation, { isArray: true })
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const { countryCode = '', phoneNumber = '', status = '' } = req.query || {};
    if (!countryCode || !phoneNumber) return undefined;
    const appId = req.headers?.['app-id'] || '';
    return `invitations:phone:${countryCode}:${phoneNumber}:status:${status}:app:${appId}`;
  })
  @CacheTTL(180)
  async getInvitationsByPhone(
    @Query() query: GetInvitationByPhoneDto,
  ): Promise<Invitation> {
    return await this.invitationService.findByPhoneNumber(
      query.countryCode,
      query.phoneNumber,
      query.status,
    );
  }

  @Post('respond')
  @ApiOperation({ summary: 'Accept or decline invitation' })
  @UseGuards(PublicApiKeyGuard)
  @ApiOkRes(InvitationResponseDto)
  async respondToInvitation(
    @Body() respondDto: RespondToInvitationDto,
  ): Promise<InvitationResponseDto> {
    return await this.invitationService.respondToInvitation(respondDto);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Approve invitation and send email' })
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_invite')
  @ApiOkRes(ApproveInvitationResponseDto)
  async approveInvitation(
    @Req() req,
    @Body() approveDto: ApproveInvitationDto,
  ): Promise<ApproveInvitationResponseDto> {
    const urlOrigin = getUrlOrigin(req);
    const platform = getPlatform(req);

    return await this.invitationService.approveInvitation(
      approveDto,
      urlOrigin,
      platform,
    );
  }

  @Get('approvals')
  @ApiOperation({
    summary: 'Get organization invitations with flexible status filtering',
    description:
      'List invitations for an organization with optional status filtering. ' +
      'Supports filtering by multiple statuses, search, and role. ' +
      'Organization ID is resolved from the organization-uuid header.',
  })
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @ApiOkRes(Invitation, { isArray: true })
  async getInvitationList(
    @CurrentOrganization() org: RequestOrganization,
    @Query() query: GetInvitationsQueryDto,
  ): Promise<PaginationType<Invitation>> {
    return await this.invitationService.findInvitationsByOrganization(
      org.id,
      query,
    );
  }

}
