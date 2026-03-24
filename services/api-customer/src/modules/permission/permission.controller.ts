import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UseFilters,
  UseGuards,
  CacheInterceptor,
  CacheTTL,
  CacheKey,
  Body,
  Post,
  Req,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { FilterPermissionDto } from './dto/filter-permission.dto';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { RequirePermissions } from '@/auth/decorators/organization-permissions.decorator';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { OrganizationUser } from '@/auth/decorators/organization.decorator';
import { CheckPermissionResponseDto, UserOrganizationPermissionsResponseDto } from '../organization/dto/user-permissions.dto';
import { FlexibleCacheInterceptor } from '@/cache/flexible-cache.interceptor';

@Controller('permissions')
@UseFilters(new HttpExceptionFilter())
@UseInterceptors(new ResponseInterceptor())
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  async findAll(@Query() filterDto: FilterPermissionDto) {
    return await this.permissionService.findAll(filterDto);
  }

  @Get('all')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  async getAllPermissions() {
    return await this.permissionService.getAllPermissions();
  }

  @Get('grouped')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @CacheTTL(600)
  @CacheKey('permissions:grouped')
  @RequirePermissions('org.view')
  async getPermissionsByGroup() {
    return await this.permissionService.getPermissionsByGroup();
  }

  @Get(':id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.findOne(id);
  }

  @Get('code/:code')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org.view')
  async findByCode(@Param('code') code: string) {
    return await this.permissionService.findByCode(code);
  }

  @Post(':organizationId/permissions/check')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkCurrentUserPermission(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() body: { permissionCode: string },
    @OrganizationUser() user: any,
  ): Promise<CheckPermissionResponseDto> {
    return await this.permissionService.checkUserPermission(
      user.userId,
      organizationId,
      body.permissionCode,
    );
  }

  @Post(':organizationId/permissions/check-multiple')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkCurrentUserPermissions(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() body: { permissionCodes: string[] },
    @OrganizationUser() user: any,
  ): Promise<CheckPermissionResponseDto[]> {
    return await this.permissionService.checkUserPermissions(
      user.userId,
      organizationId,
      body.permissionCodes,
    );
  }

  @Post('permissions/check')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkPermissionWithOrgToken(
    @Body() body: { permissionCode: string },
    @OrganizationUser() user: any,
  ): Promise<CheckPermissionResponseDto> {
    return await this.permissionService.checkUserPermission(
      user.userId,
      user.organizationId,
      body.permissionCode,
    );
  }

  @Get(':organizationId/permissions/me')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, ResponseInterceptor)
  // @CacheKeyFrom((req) => {
  //   const orgId = req.params?.organizationId;
  //   const userId = req.user?.userId;
  //   if (!orgId || !userId) return undefined;
  //   return `org:${orgId}:permissions:me:user:${userId}`;
  // })
  @CacheTTL(60)
  async getCurrentUserPermissions(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @OrganizationUser() user: any,
  ): Promise<UserOrganizationPermissionsResponseDto> {
    return await this.permissionService.getUserPermissionsInOrganization(
      user.userId,
      organizationId,
    );
  }

  @Get(':organizationId/permissions/user/:userId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.view_detail')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getUserPermissions(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserOrganizationPermissionsResponseDto> {
    return await this.permissionService.getUserPermissionsInOrganization(
      userId,
      organizationId,
    );
  }

  @Get('permissions/me')
  @UseGuards(OrganizationPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  // @CacheKeyFrom((req) => {
  //   const orgId = req.user?.organizationId;
  //   const userId = req.user?.userId;
  //   if (!orgId || !userId) return undefined;
  //   return `org:${orgId}:permissions:me:user:${userId}`;
  // })
  // @CacheTTL(600)
  async getCurrentUserPermissionsWithOrgToken(
    @OrganizationUser() user: any,
    @Req() request: any,
  ): Promise<UserOrganizationPermissionsResponseDto> {
    return await this.permissionService.getUserPermissionsInOrganization(
      user.userId,
      user.organizationId,
    );
  }
}
