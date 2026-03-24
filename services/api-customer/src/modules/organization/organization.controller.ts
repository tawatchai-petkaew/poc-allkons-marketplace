import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { RequirePermissions } from '@/auth/decorators/organization-permissions.decorator';
import { OrganizationUser } from '@/auth/decorators/organization.decorator';
import { OrganizationAuthDto } from '@/auth/dto/organization-auth.dto';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { CacheKeyFrom } from '@/cache/cache-key-from.decorator';
import { FlexibleCacheInterceptor } from '@/cache/flexible-cache.interceptor';
import { ApiOkRes } from '@/decorators/api-ok.decorator';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { JuristicTypeLanguage } from '@/model/juristic-type.entity';
import { Platform } from '@/model/organization-contact.entity';
import { Organization } from '@/model/organization.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { getUrlOrigin } from '@/utils/url.utils';
import { getPlatform } from '@/utils/utils';
import { CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { UserAddressDto } from '../user-address/dto/user-address.dto';
import { UserWithOrganizationsResponseDto } from '../user/dto/get-user-organizations-response.dto';
import { OrganizationDecorator } from './decorators/organization.decorator';
import { CreateOrganizationResponseDto } from './dto/create-organization/create-organization-response.dto';
import { CreateOrganizationDto } from './dto/create-organization/create-organization.dto';
import { CheckTaxIdResponseDto } from './dto/dbd.dto';
import {
  DraftOrganizeInfoDto,
  DraftOrganizeInfoResponseDto,
} from './dto/draft-organize-info.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import {
  UploadIdentityVerificationDto,
  VerificationDocument,
} from './dto/identity-verification/identity-verification.dto';
import { CreateInvitationDto } from './dto/invitation.dto';
import { InviteValidatePhoneDto } from './dto/invite-validate-phone.dto';
import {
  CreateLeaveRequestResponseDto,
  GetLeaveRequestsResponseDto,
  LeaveRequestResponseDto,
} from './dto/leave-log/leave-request-response.dto';
import {
  CreateExitRequestDto,
  CreateLeaveRequestDto,
  GetExitRequestsQueryDto,
  GetLeaveRequestsQueryDto,
  UpdateLeaveRequestDto,
} from './dto/leave-log/leave-request.dto';
import {
  GetOrganizationUsersQueryDto,
  OrganizationUsersResponseDto,
} from './dto/organization-users.dto';
import { CheckTaxId, OrganizationResponseDto } from './dto/organization.dto';
import {
  CreatePhoneWhiteListDto,
  GetPhoneWhiteListQueryDto,
  PhoneWhiteListPaginatedResponseDto,
  PhoneWhiteListResponseDto,
  UpdatePhoneWhiteListDto,
} from './dto/phone-white-list.dto';
import { ResendInvitationDto } from './dto/resend-invitation.dto';
import { GetStorePageDto } from './dto/store-page.dto';
import { GetOrganizationStoresResponseDto } from './dto/store.dto';
import { UpdateIdentityVerificationDto } from './dto/update-identity-verification.dto';
import { CreateOrganizationAddressDto } from './dto/update-organization-address.dto';
import {
  UpdateOrganizationUserDto,
  UpdateOrganizationUserResponseDto,
} from './dto/update-organization-user.dto';
import { UpdateBusinessTypeDto } from './dto/update-organization.dto';
import { UploadDocumentCisDto } from './dto/upload-document-to-cis.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { OrganizationService } from './organization.service';
import { MultipleFileValidationPipe } from './pipes/file-validation.pipe';
import { DeleteInviteResponseDto } from './response-dto/delete-invite-response.dto';
import { InviteValidatePhoneResponseDto } from './response-dto/invite-validate-phone-response.dto';
import { SendInviteResponseDto } from './response-dto/send-invite-response.dto';
import {
  OrganizationUserUuidParamsDto,
  OrganizationUuidParamDto,
  PhoneWhiteListByUuidParamsDto,
  UuidParamDto,
} from './dto/uuid-params.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { CurrentOrganization } from '@/decorators/request.decorator';
import { RequestOrganization } from '@/types/request.types';
import { PaginationType } from '@/types/pagination.type';
import { OrganizationLeaveLog } from '@/model/organization-leave-log.entity';
import { UserOrgPermissionGuard } from '@/guard/user-org-permission.guard';

@ApiTags('Organization')
@Controller('organization')
@ApiBearerAuth('JWT-auth')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post('')
  @UseGuards(PublicApiKeyGuard)
  @ApiBearerAuth('API-Key')
  @ApiOperation({
    summary: 'Create new organization for user',
    description:
      'Create a new organization (Personal, Juristic, or Registered Individual) for authenticated user',
  })
  @ApiOkRes(CreateOrganizationResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createOrganization(
    @Request() req: any,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<CreateOrganizationResponseDto> {
    const appId = req.headers['app-id'];
    const platform: Platform =
      appId === process.env.APP_ID_BUYER ? Platform.BUYER : Platform.SELLER;

    // Create organization
    const result = await this.organizationService.createNewOrganization(
      createOrganizationDto,
      platform,
    );

    return result;
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid/identity-verification')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getIdentityVerification(
    @Param() params: UuidParamDto,
  ): Promise<OrganizationResponseDto> {
    return await this.organizationService.getIdentityVerification(params.uuid);
  }

  @UseGuards(ActJwtGuard)
  @Put(':uuid/identity-verification')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateIdentityVerification(
    @Param() params: UuidParamDto,
    @Body() body: UpdateIdentityVerificationDto,
  ) {
    return await this.organizationService.updateIdentityVerification(
      params.uuid,
      body,
    );
  }

  @UseGuards(ActJwtGuard)
  @Post('document-identity-verification')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles(MultipleFileValidationPipe) files: Express.Multer.File[],
    @Body() dto: UploadIdentityVerificationDto,
  ): Promise<string> {
    return await this.organizationService.uploadIdentityFiles(dto, files);
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid/document-identity-verification')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getIdentityDocuments(
    @Param() params: UuidParamDto,
  ): Promise<VerificationDocument[]> {
    return await this.organizationService.getIdentityVerifyDocuments(
      params.uuid,
    );
  }

  @UseGuards(ActJwtGuard)
  @Delete(':uuid/attach-documents/:documentId')
  @UseFilters(new HttpExceptionFilter())
  async deleteIdentityDocument(
    @Param() params: UuidParamDto,
    @Param('documentId') documentId: string,
  ) {
    return await this.organizationService.deleteIdentityDocument(
      params.uuid,
      documentId,
    );
  }

  @UseGuards(ActJwtGuard)
  @Put(':uuid/business-type')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateBusinessType(
    @Param() params: UuidParamDto,
    @Body() body: UpdateBusinessTypeDto,
  ): Promise<OrganizationResponseDto> {
    return await this.organizationService.updateBusinessType(params.uuid, body);
  }

  @Get('juristic-type')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getJuristicType(@Query('lang') lang: JuristicTypeLanguage) {
    return await this.organizationService.getJuristicTypeList(lang);
  }

  @Post('tax-id/check')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkTaxId(@Body() body: CheckTaxId): Promise<CheckTaxIdResponseDto> {
    const organizationId = body?.organizationId || undefined;
    return await this.organizationService.checkTaxId(
      body.taxId,
      body.organizeBranchNumber,
      organizationId,
    );
  }

  @Post('address')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createOrganizationAddress(
    @Body() body: CreateOrganizationAddressDto,
  ): Promise<{ success: boolean }> {
    return await this.organizationService.createOrganizationAddress(body);
  }

  @Post('draft-organize-info')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.update')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createDraftOrganizeInfo(
    @Body() draftOrganizeInfoDto: DraftOrganizeInfoDto,
  ): Promise<DraftOrganizeInfoResponseDto> {
    return await this.organizationService.createDraftOrganizeInfo(
      draftOrganizeInfoDto,
    );
  }

  @Put('draft-organize-info/:id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.update')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateDraftOrganizeInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() draftOrganizeInfoDto: DraftOrganizeInfoDto,
  ): Promise<DraftOrganizeInfoResponseDto> {
    return await this.organizationService.updateDraftOrganizeInfo(
      id,
      draftOrganizeInfoDto,
    );
  }

  @Get('draft-organize-info/:id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getDraftOrganizeInfo(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<any> {
    const platform = getPlatform(req);
    return await this.organizationService.getDraftOrganizeInfo(id, platform);
  }

  @Post('draft-document')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.upload_doc')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createDraftDocumentOrganize(
    @Body() uploadDocumentDto: UploadDocumentDto,
  ): Promise<any> {
    return await this.organizationService.createDraftDocumentOrganize(
      uploadDocumentDto,
    );
  }

  @Get('draft-document')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getDocumentOrganize(
    @Query() getDocumentDto: GetDocumentDto,
  ): Promise<any> {
    return await this.organizationService.getDocumentOrganize(getDocumentDto);
  }

  @Get('approve/organize-info/:id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async approveOrganizeInfo(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<DraftOrganizeInfoResponseDto> {
    const platform = getPlatform(req);

    return await this.organizationService.approveOrganizeInfo(
      id,
      1,
      null,
      platform,
    );
  }

  @Get(':uuid/address')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getOrganizationAddress(
    @Param() { uuid }: UuidParamDto,
  ): Promise<UserAddressDto[]> {
    return await this.organizationService.getOrganizationAddress(uuid);
  }

  @Get(':organizationUuid/users')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.view')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOperation({ summary: 'แสดงรายการสมาชิกในองค์กร' })
  async getOrganizationUsers(
    @Request() req: any,
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetOrganizationUsersQueryDto,
  ): Promise<OrganizationUsersResponseDto> {
    const cacheKey = `organization:users:${params.organizationUuid}:${query.page}:${query.limit}`;
    const cached = await this.cacheManager.get<OrganizationUsersResponseDto>(
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    const result = await this.organizationService.getOrganizationUsers(
      params.organizationUuid,
      query,
      req.headers.origin,
    );

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  @Get(':organizationUuid/users/approve-request-history')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_invite')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getOrganizationUsersApproveRequestHistory(
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetOrganizationUsersQueryDto,
  ): Promise<OrganizationUsersResponseDto> {
    return await this.organizationService.getOrganizationUsersApproveRequestHistory(
      params.organizationUuid,
      query,
    );
  }

  @Get(':organizationUuid/users/invite-status')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getOrganizationUsersInviteStatus(
    @Request() req,
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetOrganizationUsersQueryDto,
  ): Promise<OrganizationUsersResponseDto> {
    return await this.organizationService.getOrganizationUsersInviteStatus(
      params.organizationUuid,
      query,
      req.user.userId,
    );
  }

  @Get(':organizationUuid/users/invite-status-approve')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_invite')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getOrganizationUsersInviteStatusApprove(
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetOrganizationUsersQueryDto,
  ): Promise<OrganizationUsersResponseDto> {
    return await this.organizationService.getOrganizationUsersInviteStatusApprove(
      params.organizationUuid,
      query,
    );
  }

  @Get(':organizationUuid/users/invite-multiple-status')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getOrganizationUsersInviteMultipleStatus(
    @Request() req,
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetOrganizationUsersQueryDto,
  ): Promise<OrganizationUsersResponseDto> {
    return await this.organizationService.getOrganizationUsersInviteMultipleStatus(
      params.organizationUuid,
      query,
      req.user.userUuid,
      req.headers.origin,
    );
  }

  @Patch(':organizationUuid/users/:userUuid')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.update_profile')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateOrganizationUser(
    @Request() req,
    @Param()
    { organizationUuid, userUuid: targetUserId }: OrganizationUserUuidParamsDto,
    @Body() updateUserDto: UpdateOrganizationUserDto,
  ): Promise<UpdateOrganizationUserResponseDto> {
    return await this.organizationService.updateOrganizationUser(
      organizationUuid,
      targetUserId,
      updateUserDto,
      req.user.userId,
    );
  }

  @Delete(':organizationUuid/users/:userUuid')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.remove_self', 'org_member.remove')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async removeUserFromOrganization(
    @Request() req,
    @Param() params: OrganizationUserUuidParamsDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.organizationService.removeUserFromOrganization(
      params.organizationUuid,
      params.userUuid,
      req.user.userId,
    );
  }

  @Get(':organizationUuid/phone-white-list')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.view_list')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getPhoneWhiteList(
    @Param() params: OrganizationUuidParamDto,
    @Query() query: GetPhoneWhiteListQueryDto,
  ): Promise<PhoneWhiteListPaginatedResponseDto> {
    const cacheKey = `organization:phone-white-list:${params.organizationUuid}:${query.page}:${query.limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as PhoneWhiteListPaginatedResponseDto;
    }
    const result = await this.organizationService.getPhoneWhiteList(
      params.organizationUuid,
      query,
    );
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  @Get(':organizationUuid/phone-white-list/:phoneId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.view_list')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getPhoneWhiteListById(
    @Param() params: PhoneWhiteListByUuidParamsDto,
  ): Promise<PhoneWhiteListResponseDto> {
    return await this.organizationService.getPhoneWhiteListById(
      params.organizationUuid,
      params.phoneId,
    );
  }

  @Post('phone-white-list')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.create')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createPhoneWhiteList(
    @Body() createDto: CreatePhoneWhiteListDto[],
    @OrganizationUser() user: any,
  ): Promise<boolean> {
    return await this.organizationService.createPhoneWhiteList(
      user.organizationId,
      createDto,
      user.userId,
    );
  }

  @Patch(':organizationUuid/phone-white-list/:phoneId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.create')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updatePhoneWhiteList(
    @Param() params: PhoneWhiteListByUuidParamsDto,
    @Body() updateDto: UpdatePhoneWhiteListDto,
    @Request() req: any,
  ): Promise<PhoneWhiteListResponseDto> {
    const currentUserId = req.user?.userId;
    return await this.organizationService.updatePhoneWhiteList(
      params.organizationUuid,
      params.phoneId,
      updateDto,
      currentUserId,
    );
  }

  @Delete(':organizationUuid/phone-white-list/:phoneId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.delete')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async deletePhoneWhiteList(
    @Param() params: PhoneWhiteListByUuidParamsDto,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUserId = req.user?.userId;
    return await this.organizationService.deletePhoneWhiteList(
      params.organizationUuid,
      params.phoneId,
      currentUserId,
    );
  }

  @Get('check/:code/:phone/white-list')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_phone.create')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async verifyPhoneWhiteList(
    @OrganizationUser() user: any,
    @Param('code') code: string,
    @Param('phone') phone: string,
  ) {
    const cacheKey = `organization:verify-phone-white-list:${user.organizationId}:${code}:${phone}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as boolean;
    }
    const result = await this.organizationService.verifyPhoneWhiteList(
      user.organizationId,
      phone,
      code,
    );
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  @Post('leave-request')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_request', 'org_member.remove')
  @ApiOperation({ summary: 'Create a leave request for organization' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<CreateLeaveRequestResponseDto> {
    return this.organizationService.createLeaveRequest(createLeaveRequestDto);
  }

  @Get('leave-requests')
  @UseGuards(ActJwtGuard, OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_request')
  @ApiOperation({ summary: 'Get leave requests for organization' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const orgId = req.user?.organizationId;
    if (!orgId) return undefined;
    const { page = 1, limit = 10, status = '', userId = '' } = req.query || {};
    const appId = req.headers?.['app-id'] || '';
    return `leave-requests:org:${orgId}:p:${page}:l:${limit}:s:${status}:u:${userId}:app:${appId}`;
  })
  @CacheTTL(60)
  async getOrganizationLeaveRequests(
    @CurrentOrganization() org: RequestOrganization,
    @Query() query: GetLeaveRequestsQueryDto,
  ): Promise<GetLeaveRequestsResponseDto> {
    return await this.organizationService.getLeaveRequests(org.id, query);
  }

  @Patch('leave-requests/:requestId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.approve_request')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateLeaveRequestStatus(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Request() req: any,
  ): Promise<LeaveRequestResponseDto> {
    const organizationId = req.user?.organizationId;
    return this.organizationService.updateLeaveRequestStatus(
      requestId,
      organizationId,
      updateLeaveRequestDto,
    );
  }

  @UseGuards(ActJwtGuard)
  @Post('draft-organize-info/:id/upload-document-cis')
  @ApiOperation({ summary: 'Upload documents to CIS' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FilesInterceptor('files', 6))
  async uploadFileToCis(
    @Param('id', ParseIntPipe) draftOrganizeId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadDocumentCisDto,
    @Request() req: any,
  ): Promise<any> {
    const appId = req.headers['app-id'];
    const platform = getPlatform(req);

    return await this.organizationService.uploadDocumentToCis(
      dto.documentType,
      files,
      draftOrganizeId,
      platform,
      appId,
    );
  }

  @UseGuards(ActJwtGuard)
  @Delete('draft-organize-info/:id/delete-document-cis')
  @ApiOperation({ summary: 'Delete documents from CIS' })
  @UseFilters(new HttpExceptionFilter())
  async deleteDocumentCis(
    @Param('id', ParseIntPipe) draftOrganizeId: number,
    @Body() body: { documentIds: string[] },
    @Request() req: any,
  ): Promise<any> {
    const appId = req.headers['app-id'];
    const platform = getPlatform(req);
    return await this.organizationService.deleteDocumentCis(
      body.documentIds,
      platform,
      appId,
      draftOrganizeId,
    );
  }

  @Get('stores')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.view_list')
  @ApiOperation({
    summary: 'Get organization stores with pagination and search',
  })
  @ApiOkRes(GetOrganizationStoresResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const orgId = req.user?.organizationId;
    if (!orgId) return undefined;
    const { page = 1, limit = 10, search = '' } = req.query || {};
    const appId = req.headers?.['app-id'] || '';
    return `org-stores:org:${orgId}:p:${page}:l:${limit}:q:${search}:app:${appId}`;
  })
  @CacheTTL(120)
  async getOrganizationStores(
    @Request() req: any,
    @Query() query: BaseQueryDto,
  ): Promise<GetOrganizationStoresResponseDto> {
    const organizationId = req.user?.organizationId;
    return this.organizationService.getStores(organizationId, query);
  }

  @Post('invite/validate-phone')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.invite')
  @ApiOperation({ summary: 'Invitation : Validate phone number' })
  @ApiOkRes(InviteValidatePhoneResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async validateInvitationPhone(
    @OrganizationDecorator() org: Organization,
    @Body() body: InviteValidatePhoneDto,
  ): Promise<InviteValidatePhoneResponseDto> {
    const cacheKey = `organization:validate-invitation-phone:${org.id}:${body.phone}:${body.countryCode}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as InviteValidatePhoneResponseDto;
    }
    const result = await this.organizationService.validateInvitationPhone(
      body,
      org.id,
    );
    await this.cacheManager.set(cacheKey, result, 600);
    return result;
  }

  @Post('invite')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.invite')
  @ApiOperation({ summary: 'Invite a user to the organization' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOkRes(SendInviteResponseDto)
  async inviteUserToOrganization(
    @Req() req,
    @Body() createInvitationDto: CreateInvitationDto,
    @OrganizationUser() orgUser: OrganizationAuthDto,
  ): Promise<SendInviteResponseDto> {
    const urlOrigin = getUrlOrigin(req);
    const platform = getPlatform(req);
    return this.organizationService.inviteUserToOrganization(
      orgUser.organizationId,
      orgUser.userId,
      createInvitationDto,
      urlOrigin,
      platform,
    );
  }

  @Delete('invite/:id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.remove')
  @ApiOperation({ summary: 'Delete invitation' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOkRes(DeleteInviteResponseDto)
  async deleteInvitation(
    @Param('id') invitationId: string,
    @OrganizationUser() orgUser: OrganizationAuthDto,
  ): Promise<DeleteInviteResponseDto> {
    return await this.organizationService.deleteInvitation(
      orgUser.organizationId,
      +invitationId,
    );
  }

  @Post('invite/:id/resend')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.invite')
  @ApiOperation({ summary: 'Resend invitation' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiOkRes(SendInviteResponseDto)
  async resendInvitation(
    @Req() req,
    @Param('id') invitationId: string,
    @Body() body: ResendInvitationDto,
    @OrganizationUser() orgUser: OrganizationAuthDto,
  ): Promise<SendInviteResponseDto> {
    const urlOrigin = getUrlOrigin(req);
    const platform = getPlatform(req);
    return await this.organizationService.resendInvitation(
      orgUser.organizationId,
      orgUser.userId,
      +invitationId,
      !!body.confirmInvite,
      urlOrigin,
      platform,
    );
  }

  @Post('check/email/:email')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.invite')
  @ApiOperation({ summary: 'Invite a user to the organization' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkEmailInvitation(@Param('email') email: string) {
    return await this.organizationService.checkEmailInvitation(email);
  }

  @Get('store/member/count')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.view_list', 'merchant.view_detail')
  @ApiOperation({ summary: 'Get member in merchant & store' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async findAllStoreMemberCountPage(
    @Query() query: GetStorePageDto,
    @OrganizationUser() user: any,
  ) {
    const cacheKey = `organization:store-member-count:${user.organizationId}:${query.page}:${query.limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.organizationService.findAllStoreMemberCountPage(
      query.page,
      query.limit,
      user.organizationId,
    );
    await this.cacheManager.set(cacheKey, results, 300);
    return results;
  }

  @Get('user/:userUuid')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  async getUserOrganizations(
    @Param('userUuid') userUuid: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Request() req,
  ): Promise<UserWithOrganizationsResponseDto> {
    const appId = req.headers['app-id'];
    const platform: Platform =
      appId === process.env.APP_ID_MARKETPLACE
        ? Platform.BUYER
        : Platform.SELLER;
    return await this.organizationService.getUserOrganizations(
      userUuid,
      {
        page,
        limit,
      },
      platform,
    );
  }

  // Create exit request
  @Post('exit-requests')
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @ApiOperation({
    summary: 'Create a leave request for organization (simplified)',
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createExitRequest(
    @Body() body: CreateExitRequestDto,
    @CurrentOrganization() org: RequestOrganization,
  ) {
    const userId = body.userId || org.userOrganization.userId;
    return this.organizationService.createExitRequest(org.id, userId);
  }

  @Get('exit-requests')
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @ApiOperation({ summary: 'Get leave requests for organization (simplified)' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getExitRequest(
    @CurrentOrganization() org: RequestOrganization,
    @Query() query: GetExitRequestsQueryDto,
  ): Promise<PaginationType<OrganizationLeaveLog>> {
    const { page = 1, limit = 10, status, search } = query;
    const statusStr = status ? JSON.stringify(status) : '';
    const cacheKey = `exit-requests:org:${
      org.id
    }:p:${page}:l:${limit}:s:${statusStr}:q:${search || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as PaginationType<OrganizationLeaveLog>;
    }

    const result = await this.organizationService.getExitRequests(
      org.id,
      query,
    );
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  @Patch('exit-requests/:requestId')
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @ApiOperation({ summary: 'Approve or Reject leave request' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async approveOrRejectExitRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @CurrentOrganization() org: RequestOrganization,
  ) {
    return this.organizationService.approveOrRejectExitRequest(
      requestId,
      org.id,
      updateLeaveRequestDto,
    );
  }
}
