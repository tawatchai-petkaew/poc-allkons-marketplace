import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In } from 'typeorm';
import { Permission } from '@/model/permissions.entity';
import { FilterPermissionDto } from './dto/filter-permission.dto';
import { GroupedPermissionsResponse } from './dto/grouped-permissions-response.dto';
import { RolePermissions } from '@/model/role_permissions.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { Role } from '@/model/roles.entity';
import { CheckPermissionResponseDto, UserOrganizationPermissionsResponseDto, UserPermissionDto, UserRoleDto } from '../organization/dto/user-permissions.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepository: Repository<RolePermissions>,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepository: Repository<UserOrganization>,
  ) {}

  async findAll(
    filterDto?: FilterPermissionDto,
  ): Promise<{
    data: Permission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = filterDto || {};

    const where: any = {};

    if (filters.code) {
      where.code = Like(`%${filters.code}%`);
    }

    if (filters.resource) {
      where.resource = filters.resource;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.group) {
      where.group = filters.group;
    }

    if (filters.description) {
      where.description = Like(`%${filters.description}%`);
    }

    if (filters.descriptionTh) {
      where.descriptionTh = Like(`%${filters.descriptionTh}%`);
    }

    if (filters.groupNameTh) {
      where.groupNameTh = Like(`%${filters.groupNameTh}%`);
    }

    const findOptions: FindManyOptions<Permission> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    try {
      const [data, total] = await this.permissionRepository.findAndCount(
        findOptions,
      );
      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error fetching permissions');
    }
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['rolePermissions'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async findByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
      relations: ['rolePermissions'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code ${code} not found`);
    }

    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find({
        order: { group: 'ASC', code: 'ASC' },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error fetching all permissions');
    }
  }

  async getPermissionsByGroup(): Promise<GroupedPermissionsResponse[]> {
    try {
      const permissions = await this.permissionRepository.find({
        order: { group: 'ASC', code: 'ASC' },
      });

      const groupedPermissions = permissions.reduce((acc, permission) => {
        const group = permission.group || 'OTHER';
        if (!acc[group]) {
          acc[group] = {
            group: group,
            groupNameTh: permission.groupNameTh || group,
            permissions: [],
          };
        }
        acc[group].permissions.push(permission);
        return acc;
      }, {} as Record<string, GroupedPermissionsResponse>);

      return Object.values(groupedPermissions);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error fetching permissions by group',
      );
    }
  }

  /**
   * Check if user has specific permission in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permissionCode Permission code to check
   * @returns Permission check result
   */
  async checkUserPermission(
    userId: number,
    organizationId: number,
    permissionCode: string,
  ): Promise<CheckPermissionResponseDto> {
    const hasPermission = await this.checkUserPermissionByCode(
      userId,
      organizationId,
      permissionCode,
    );

    return {
      hasPermission,
      permissionCode,
      organizationId,
      userId,
    };
  }

  async checkUserPermissionByCode(
    userId: number,
    organizationId: number,
    permissionCode: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissionCodes(
      userId,
      organizationId,
    );
    return userPermissions.includes(permissionCode);
  }

  async getUserPermissionCodes(
    userId: number,
    organizationId: number,
  ): Promise<string[]> {
    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.map((p) => p.code);
  }

  async hasPermission(
    userId: number,
    organizationId: number,
    permissionCode: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionCodes(
      userId,
      organizationId,
    );
    return permissions.includes(permissionCode);
  }

  async createPermissions(roleId: number, permissions: number[]) {
    try {
      const foundPermissions = await this.permissionRepository.findByIds(
        permissions,
      );

      if (foundPermissions.length !== permissions.length) {
        throw new HttpException(
          {
            message: 'Permission not found',
            error: { code: 'PERMISSION_NOT_FOUND' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const createDto = foundPermissions.map((e) => ({
        roleId,
        permissionId: e.id,
      }));

      await this.rolePermissionsRepository.save(createDto);
      return true;
    } catch (e) {
      console.error('createPermissions error', e);
      throw new HttpException(
        {
          message: 'Not create permission',
          error: { code: 'NOT_CREATE_PERMISSION' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updatePermission(roleId: number, permissions: number[]) {
    const rolePermissions = await this.rolePermissionsRepository.find({
      where: { roleId },
    });
    const permissionList = rolePermissions.map((e) => e.permissionId);
    try {
      const deletePermissions = permissionList.filter(
        (e) => !permissions.includes(e),
      );
      const addPermissions = permissions.filter(
        (e) => !permissionList.includes(e),
      );
      if (deletePermissions.length > 0) {
        await this.deletePermissions(
          roleId,
          permissionList.filter((e) => !permissions.includes(e)),
        );
      }
      if (addPermissions.length > 0) {
        await this.createPermissions(
          roleId,
          permissions.filter((e) => !permissionList.includes(e)),
        );
      }
      return true;
    } catch (e) {
      return e;
    }
  }

  async deletePermissions(roleId: number, permissions?: number[]) {
    try {
      if (permissions) {
        await this.rolePermissionsRepository.delete({
          roleId,
          permissionId: In(permissions),
        });
      } else {
        await this.rolePermissionsRepository.delete({
          roleId,
        });
      }

      return true;
    } catch (e) {
      return e;
    }
  }

  /**
   * Get all permissions
   */
  // async getAllPermissions() {
  //   return await this.permissionRepository.find({
  //     order: { group: 'ASC', code: 'ASC' },
  //   });
  // }

  /**
   * Get user's role and permissions in an organization with a single query
   * This avoids multiple round-trips for role, permissions and codes.
   */
  async getUserRoleAndPermissions(
    userId: number,
    organizationId: number,
  ): Promise<{
    userOrg: UserOrganization | null;
    role: Role | null;
    permissions: Permission[];
    permissionCodes: string[];
  }> {
    const userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizeId: organizationId },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permissions',
        'organization',
      ],
    });

    if (!userOrg || !userOrg.role) {
      return {
        userOrg,
        role: userOrg?.role || null,
        permissions: [],
        permissionCodes: [],
      };
    }

    const permissions = (userOrg.role.rolePermissions || []).map(
      (rp) => rp.permissions,
    );
    const permissionCodes = permissions.map((p) => p.code);

    const result = {
      userOrg,
      role: userOrg.role,
      permissions,
      permissionCodes,
    };
    return result;
  }

  /**
   * Get user permissions by user ID and organization ID
   * @param userId User ID to get permissions
   * @param organizationId Organization ID to get permissions
   * @returns List of permissions for the user in the organization
   */
  async getUserPermissions(userId: number, organizationId: number) {
    const userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizeId: organizationId },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permissions',
      ],
    });

    if (!userOrg || !userOrg.role) {
      return [];
    }

    return userOrg.role.rolePermissions.map((rp) => rp.permissions);
  }

  /**
   * Check multiple permissions for user in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permissionCodes Array of permission codes to check
   * @returns Array of permission check results
   */
  async checkUserPermissions(
    userId: number,
    organizationId: number,
    permissionCodes: string[],
  ): Promise<CheckPermissionResponseDto[]> {
    const results: CheckPermissionResponseDto[] = [];

    for (const permissionCode of permissionCodes) {
      const result = await this.checkUserPermission(
        userId,
        organizationId,
        permissionCode,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get user permissions in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns User permissions response
   */
  async getUserPermissionsInOrganization(
    userId: number,
    organizationId: number,
  ): Promise<UserOrganizationPermissionsResponseDto> {
    // Fetch user's role, permissions and organization in one round-trip
    const {
      userOrg,
      role,
      permissions,
      permissionCodes,
    } = await this.getUserRoleAndPermissions(
      userId,
      organizationId,
    );

    if (!userOrg) {
      throw new ForbiddenException(
        'User is not member of this organization',
        'USER_FORBIDDEN',
      );
    }

    // Map permissions to DTO
    const permissionDtos: UserPermissionDto[] = permissions.map(
      (permission) => ({
        id: permission.id,
        code: permission.code,
        name: permission.code, // Use code as name since Permission entity doesn't have name field
        description: permission.description,
        action: permission.action,
        resource: permission.resource,
      }),
    );

    // Map role to DTO
    const roleDto: UserRoleDto | null = role
      ? {
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          isActive: role.isActive,
        }
      : null;

    return {
      userId,
      organizationId,
      organizationName: userOrg.organization?.organizeName || null,
      isOwner: userOrg.isOwner,
      role: roleDto,
      permissions: permissionDtos,
      permissionCodes,
      retrievedAt: new Date(),
    };
  }
}
