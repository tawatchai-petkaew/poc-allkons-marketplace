import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseFilters,
  UseInterceptors,
  Body,
  CacheTTL,
  Delete,
  ParseIntPipe,
  Post,
  Put,
  Patch,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Role } from '../../model/roles.entity';
import { FilterRoleDto } from './dto/filter-role.dto';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { RequirePermissions } from '@/auth/decorators/organization-permissions.decorator';
import { OrganizationUser } from '@/auth/decorators/organization.decorator';
import { CacheKeyFrom } from '@/cache/cache-key-from.decorator';
import { FlexibleCacheInterceptor } from '@/cache/flexible-cache.interceptor';
import { ApiOkRes } from '@/decorators/api-ok.decorator';
import { Organization } from '@/model/organization.entity';
import { OrganizationDecorator } from '../organization/decorators/organization.decorator';
import { GetOrganizationRoleQueryDto } from '../organization/dto/organization-roles.dto';
import {
  RolePermissionDto,
  SingleRolePermissionsResponseDto,
  GetRolePermissionsQueryDto,
  RolePermissionsResponseDto,
} from '../organization/dto/role-permission.dto';
import { RoleListResponseDto } from '../organization/response-dto/role-list.response.dto';
import {
  UpdateUserRoleInOrganizationDto,
  UpdateUserRoleResponseDto,
} from '../organization/dto/update-user-role.dto';

@ApiTags('Roles')
@UseFilters(new HttpExceptionFilter())
@UseInterceptors(new ResponseInterceptor())
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  async findAll(@Query() filterDto: FilterRoleDto) {
    return await this.roleService.findAll(filterDto);
  }

  @Get('default/clone')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  async getDefaultAndCloneRoles(): Promise<Role[]> {
    return await this.roleService.getDefaultAndCloneRoles();
  }

  @Get('organization/:organizeId')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  async getRolesByOrganization(
    @Param('organizeId') organizeId: string,
  ): Promise<Role[]> {
    return await this.roleService.getRolesByOrganization(+organizeId);
  }

  @Get('roles')
  @UseGuards(OrganizationPermissionGuard)
  @ApiOperation({ summary: 'List organization roles' })
  @ApiOkRes(RoleListResponseDto)
  @RequirePermissions('role.view_list')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getListRole(
    @OrganizationDecorator() org: Organization,
    @Query() query: GetOrganizationRoleQueryDto,
  ) {
    return await this.roleService.getListRole(org.id, query);
  }

  @Get('roles-list')
  @UseGuards(OrganizationPermissionGuard)
  @ApiOperation({ summary: 'List organization roles without permission' })
  @ApiOkRes(RoleListResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getListRoleWithoutPermission(
    @OrganizationDecorator() org: Organization,
    @Query() query: GetOrganizationRoleQueryDto,
  ) {
    return await this.roleService.getListRole(org.id, query);
  }

  @Get('roles/permissions')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const orgId = req.user?.organizationId;
    const { page = 1, limit = 10 } = req.query || {};
    return `org:${orgId}:roles:p:${page}:l:${limit}`;
  })
  @CacheTTL(300)
  async getAllRolesPermissions(
    @Query() query: GetRolePermissionsQueryDto,
    @OrganizationUser() user: any,
  ): Promise<RolePermissionsResponseDto> {
    return await this.roleService.getAllRolesPermissions(user.organizationId, query);
  }

  @Get('roles/:roleId/permissions')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @CacheKeyFrom((req) => {
    const orgId = req.user?.organizationId;
    const roleId = req.params?.roleId;
    return `org:${orgId}:role:${roleId}`;
  })
  @CacheTTL(300)
  async getRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @OrganizationUser() user: any,
  ): Promise<SingleRolePermissionsResponseDto> {
    return await this.roleService.getRolePermissions(user.organizationId, roleId);
  }

  @Post(':organizeId/create/role-permission')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.create')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createRolePermission(
    @Param('organizeId', ParseIntPipe) organizeId: number,
    @Body() rolePermissionDto: RolePermissionDto,
  ) {
    return await this.roleService.createRolePermission(organizeId, rolePermissionDto);
  }

  @Put(':organizeId/update/role-permission')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.update')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateRolePermission(
    @Param('organizeId', ParseIntPipe) organizeId: number,
    @Body() rolePermissionDto: RolePermissionDto[],
  ) {
    return await this.roleService.updateRolePermission(organizeId, rolePermissionDto);
  }

  @Delete(':roleId/delete/role-permission')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.delete')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async deleteRolePermission(@Param('roleId', ParseIntPipe) roleId: number) {
    return await this.roleService.deleteRolePermission(roleId);
  }

  @Patch(':organizationId/users/:userId/role')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('org_member.update_profile')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateUserRole(
    @Request() req,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserRoleDto: UpdateUserRoleInOrganizationDto,
  ): Promise<UpdateUserRoleResponseDto> {
    return await this.roleService.updateUserRole(
      organizationId,
      userId,
      updateUserRoleDto,
      req.user.userId,
    );
  }

  @Get(':id')
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('role.view_list')
  async findOne(@Param('id') id: string): Promise<Role> {
    return await this.roleService.findOne(+id);
  }
}