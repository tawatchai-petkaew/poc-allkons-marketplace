import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Brackets, In } from 'typeorm';
import { Role } from '../../model/roles.entity';
import { FilterRoleDto } from './dto/filter-role.dto';
import { clearCacheByPattern } from '@/utils';
import { plainToInstance } from 'class-transformer';
import { GetOrganizationRoleQueryDto } from '../organization/dto/organization-roles.dto';
import {
  RolePermissionDto,
  SingleRolePermissionsResponseDto,
  RolePermissionsDto,
  GetRolePermissionsQueryDto,
  RolePermissionsResponseDto,
} from '../organization/dto/role-permission.dto';
import { PermissionService } from '../permission/permission.service';
import {
  RoleListResponseDto,
  RoleResponseDto,
} from '../organization/response-dto/role-list.response.dto';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserOrganization } from '@/model/user-organization.entity';
import { UpdateUserRoleDto } from '../user-organization/dto/update-user-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepo: Repository<UserOrganization>,
    private readonly permissionService: PermissionService,
    private readonly userOrganizationService: UserOrganizationService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(displayName: string, organizeId: number) {
    const checkRoleDuplicate = await this.roleRepository
      .createQueryBuilder('roles')
      .where(
        '(LOWER(roles.displayName) = :displayName AND roles.organizeId IS NULL AND roles.isClone = FALSE) OR (LOWER(roles.displayName) = :displayName AND roles.organizeId = :organizeId)',
        { displayName: displayName.toLowerCase(), organizeId },
      )
      .getOne();
    if (checkRoleDuplicate) {
      return false;
    } else {
      let isDefault = false;
      let priority = null;
      const roles = await this.roleRepository.findOne({
        where: {
          name: displayName.toUpperCase(),
          isDefault: true,
          isClone: true,
        },
      });
      if (roles) {
        isDefault = true;
        priority = roles.priority;
      }
      return await this.roleRepository.save({
        name: displayName.toUpperCase(),
        displayName,
        organizeId,
        isDefault,
        priority,
      });
    }
  }

  async findAll(
    filterDto?: FilterRoleDto,
  ): Promise<{ data: Role[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filters } = filterDto || {};

    const where: any = {};

    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }

    if (filters.displayName) {
      where.displayName = Like(`%${filters.displayName}%`);
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.organizeId) {
      where.organizeId = filters.organizeId;
    }

    const findOptions: FindManyOptions<Role> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    try {
      const [data, total] = await this.roleRepository.findAndCount(findOptions);
      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error fetching roles');
    }
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(displayName: string, id: number, organizeId: number) {
    const checkRoleDuplicate = await this.roleRepository
      .createQueryBuilder('roles')
      .where(
        '(LOWER(roles.displayName) = :displayName AND roles.organizeId IS NULL AND roles.isClone = FALSE) OR (LOWER(roles.displayName) = :displayName AND roles.organizeId = :organizeId) AND id != :id',
        { displayName: displayName.toLowerCase(), id, organizeId },
      )
      .getOne();
    if (checkRoleDuplicate) {
      return false;
    } else {
      return await this.roleRepository.save({
        id,
        name: displayName.toUpperCase(),
        displayName,
      });
    }
  }

  async delete(id: number) {
    return await this.roleRepository.delete({ id });
  }

  async getRolesByOrganization(organizeId: number): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { organizeId, isActive: true },
      relations: ['rolePermissions'],
    });
  }

  async getDefaultAndCloneRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isDefault: true, isClone: true, isActive: true },
      relations: ['rolePermissions'],
    });
  }

  async findRoleIdInOrganization(
    id: number,
    organizeId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: [
        { id, organizeId },
        { id, isDefault: true, organizeId: null },
      ],
    });
    if (!role) {
      throw new HttpException(
        {
          message: 'Role not found in organization',
          error: { code: 'ROLE_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return role;
  }

  /**
   * Find role by ID
   */
  async findRoleById(roleId: number): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });
  }

  /**
   * Find role by name
   */
  async findRoleByName(roleName: string): Promise<Role | null> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .innerJoin('role.rolePermissions', 'rp')
      .where('role.name = :name', { name: roleName })
      .andWhere('role.isActive = :isActive', { isActive: true })
      .select(['role.id', 'role.name', 'role.displayName'])
      .getOne();
  }

  async findRoleByNameAndOrgId(
    roleName: string,
    orgId: number,
  ): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name: roleName, isActive: true, organizeId: orgId },
    });
  }

  /**
   * Get role with its permissions
   */
  async getRoleWithPermissions(roleId: number) {
    return await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['rolePermissions', 'rolePermissions.permissions'],
    });
  }

  /**
   * Get roles by organization ID with optional filters
   */
  async getRolesByOrganizationId(
    organizationId: number,
    roleId?: number,
    includeInactive?: boolean,
  ) {
    // Create query builder for more complex conditions
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Include organization-specific roles and default roles
    queryBuilder.where(
      '(role.organizeId = :organizationId) OR (role.isDefault = true AND role.organizeId IS NULL AND role.isClone = false)',
      { organizationId },
    );

    // Filter by specific role if provided
    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }

    // Filter by active status if not explicitly including inactive
    if (!includeInactive) {
      queryBuilder.andWhere('role.isActive = true');
    }

    queryBuilder
      .orderBy('role.priority', 'ASC')
      .addOrderBy('role.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get role list by organization id
   */
  async getListRole(
    orgId: number,
    { page, limit }: GetOrganizationRoleQueryDto,
  ): Promise<RoleListResponseDto> {
    // Add pagination
    const offset = (+page - 1) * limit;
    const [roles, total] = await this.roleRepository
      .createQueryBuilder('role')
      .where(
        new Brackets((qb) => {
          qb.where('role.organizeId = :organizeId', {
            organizeId: orgId,
          }).orWhere(
            new Brackets((subQb) => {
              subQb
                .where('role.organizeId IS NULL')
                .andWhere('role.isDefault = :isDefault', {
                  isDefault: true,
                })
                .andWhere('role.isClone = :isClone', {
                  isClone: false,
                });
            }),
          );
        }),
      )
      .orderBy('role.priority', 'ASC')
      .addOrderBy('role.createdAt', 'ASC')
      .offset(offset)
      .limit(limit)
      .getManyAndCount();

    return {
      roles: roles.map((role) =>
        plainToInstance(RoleResponseDto, role, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
      ),
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createRolePermission(
    organizeId: number,
    rolePermissionDto: RolePermissionDto,
  ) {
    const createRole = await this.create(
      rolePermissionDto.displayName.trim(),
      organizeId,
    );

    if (createRole) {
      const result = await this.permissionService.createPermissions(
        createRole.id,
        rolePermissionDto.permissions,
      );

      // Clear roles list cache (pagination) since new role is added
      await clearCacheByPattern(
        this.cacheManager,
        `org:${organizeId}:roles:p:*`,
      );

      return result;
    } else {
      throw new HttpException(
        {
          message: 'Role display name is duplicate',
          error: { code: 'ROLE_DUPLICATE' },
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async updateRolePermission(
    organizeId: number,
    rolePermissionDto: RolePermissionDto[],
  ) {
    if (rolePermissionDto.length == 1 && rolePermissionDto[0].displayName) {
      const updateRole = await this.update(
        rolePermissionDto[0].displayName.trim(),
        rolePermissionDto[0].roleId,
        organizeId,
      );
      if (!updateRole) {
        throw new HttpException(
          {
            message: 'Role display name is duplicate',
            error: { code: 'ROLE_DUPLICATE' },
          },
          HttpStatus.CONFLICT,
        );
      }
    }
    for (let i = 0; i < rolePermissionDto.length; i++) {
      await this.permissionService.updatePermission(
        rolePermissionDto[i].roleId,
        rolePermissionDto[i].permissions,
      );
    }

    // Clear cache for all users and roles in this organization
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `org:${organizeId}:permissions:me:*`,
      ),
      clearCacheByPattern(this.cacheManager, `org:${organizeId}:role*`),
    ]);

    return true;
  }

  async deleteRolePermission(roleId: number) {
    if (await this.userOrganizationService.findUserUseRole(roleId)) {
      throw new HttpException(
        {
          message: 'User is used role',
          error: { code: 'USER_USED' },
        },
        HttpStatus.CONFLICT,
      );
    } else {
      // Get role info before deleting to get organizationId
      const role = await this.findRoleById(roleId);

      if (await this.permissionService.deletePermissions(roleId)) {
        await this.delete(roleId);

        // Clear roles cache (role list has changed)
        if (role?.organizeId) {
          await Promise.all([
            clearCacheByPattern(
              this.cacheManager,
              `org:${role.organizeId}:role*`,
            ),
          ]);
        }

        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Get permissions for a specific role in an organization
   */
  async getRolePermissions(
    organizationId: number,
    roleId: number,
  ): Promise<SingleRolePermissionsResponseDto> {
    // Fetch role first to check if exists
    const role = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :roleId', { roleId })
      .getOne();

    if (!role || !role.isActive) {
      throw new HttpException(
        { message: 'Role not found', error: { code: 'ROLE_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    // Fetch rolePermissions separately (same pattern as getAllRolesPermissions)
    const roleWithPerms = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .where('role.id = :roleId', { roleId })
      .getOne();

    // Retrieve all permissions once (could be cached across calls)
    const allPermissions = await this.permissionService.getAllPermissions();
    const assignedPermissionIds = (roleWithPerms?.rolePermissions || []).map(
      (rp) => rp.permissionId,
    );

    const groupedPermissions = allPermissions.reduce((acc, permission) => {
      const groupKey = permission.group;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: permission.group,
          groupNameTh: permission.groupNameTh,
          permissions: [],
        };
      }
      acc[groupKey].permissions.push(permission);
      return acc;
    }, {} as Record<string, { group: any; groupNameTh: string; permissions: any[] }>);

    const permissionGroups = Object.values(groupedPermissions).map((group) => ({
      group: group.group,
      groupNameTh: group.groupNameTh,
      permissions: group.permissions.map((permission) => ({
        id: permission.id,
        code: permission.code,
        description: permission.description,
        descriptionTh: permission.descriptionTh,
        resource: permission.resource,
        action: permission.action,
        group: permission.group,
        groupNameTh: permission.groupNameTh,
        isSelected: assignedPermissionIds.includes(permission.id),
      })),
    }));

    const result: RolePermissionsDto = {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      priority: role.priority,
      isDefault: role.isDefault,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissionGroups,
    };

    return { role: result };
  }

  /**
   * Get all roles with their permissions for an organization
   */
  async getAllRolesPermissions(
    organizationId: number,
    query: GetRolePermissionsQueryDto,
  ): Promise<RolePermissionsResponseDto> {
    const roles = await this.getRolesByOrganizationId(
      organizationId,
      query.roleId,
      query.includeInactive,
    );

    // Fetch rolePermissions for all roles in one query
    const roleIds = roles.map((r) => r.id);
    const rolePermissionsRaw = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .where('role.id IN (:...roleIds)', {
        roleIds: roleIds.length ? roleIds : [0],
      })
      .getMany();
    const rolePermMap = new Map<number, number[]>(
      rolePermissionsRaw.map((r) => [
        r.id,
        (r.rolePermissions || []).map((rp: any) => rp.permissionId),
      ]),
    );

    const allPermissions = await this.permissionService.getAllPermissions();
    const groupedPermissions = allPermissions.reduce((acc, permission) => {
      const groupKey = permission.group;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: permission.group,
          groupNameTh: permission.groupNameTh,
          permissions: [],
        };
      }
      acc[groupKey].permissions.push(permission);
      return acc;
    }, {} as Record<string, { group: any; groupNameTh: string; permissions: any[] }>);

    const rolePermissions: RolePermissionsDto[] = roles.map((role) => {
      const assignedPermissionIds = rolePermMap.get(role.id) || [];
      const permissionGroups = Object.values(groupedPermissions).map(
        (group) => ({
          group: group.group,
          groupNameTh: group.groupNameTh,
          permissions: group.permissions.map((permission) => ({
            id: permission.id,
            code: permission.code,
            description: permission.description,
            descriptionTh: permission.descriptionTh,
            resource: permission.resource,
            action: permission.action,
            group: permission.group,
            groupNameTh: permission.groupNameTh,
            isSelected: assignedPermissionIds.includes(permission.id),
          })),
        }),
      );
      return {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isActive: role.isActive,
        priority: role.priority,
        isDefault: role.isDefault,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissionGroups,
      };
    });

    const rolePriorityOrder = { OWNER: 1, SUPER_ADMIN: 2 };

    const sortedRoles = rolePermissions.sort((a, b) => {
      const aPriority = rolePriorityOrder[a.name] || 3;
      const bPriority = rolePriorityOrder[b.name] || 3;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return { roles: sortedRoles, total: rolePermissions.length };
  }

  public async createRolePermissionDefault(organizationId: number) {
    const allRoleDefault = await this.getDefaultAndCloneRoles();

    const adminPermission =
      allRoleDefault
        .find((role) => role.name === 'ADMIN')
        ?.rolePermissions.map((permission) => permission.permissionId) || [];
    const memberPermission =
      allRoleDefault
        .find((role) => role.name === 'MEMBER')
        ?.rolePermissions.map((permission) => permission.permissionId) || [];

    for (const roleName of ['ADMIN', 'MEMBER']) {
      const payload: RolePermissionDto = {
        displayName: roleName === 'ADMIN' ? 'Admin' : 'Member',
        permissions: roleName === 'ADMIN' ? adminPermission : memberPermission,
      };
      await this.createRolePermission(organizationId, payload);
    }
  }

  /**
   * Update user role in specific organization
   */
  async updateUserRoleInOrganization(
    userId: number,
    organizationId: number,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserOrganization> {
    const { roleId, isOwner = false, isCreator } = updateUserRoleDto;

    // Validate that the role exists in the database
    const targetRole = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
    });

    if (!targetRole) {
      throw new HttpException(
        {
          message: `Role with ID ${roleId} not found or inactive`,
          error: { code: 'ROLE_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find roles by name to determine SUPER_ADMIN and OWNER role IDs
    const superAdminRole = await this.findRoleByName('SUPER_ADMIN');
    const ownerRole = await this.findRoleByName('OWNER');

    if (!superAdminRole || !ownerRole) {
      throw new HttpException(
        {
          message: 'Required roles (SUPER_ADMIN or OWNER) not found in system',
          error: { code: 'SYSTEM_ROLES_MISSING' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const SUPER_ADMIN_ROLE_ID = superAdminRole.id;
    const OWNER_ROLE_ID = ownerRole.id;

    // Find existing user organization
    const userOrganization = await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
      userId,
      organizationId,
    );
    if (!userOrganization) {
      throw new HttpException(
        {
          message: 'User not found in organization',
          error: { code: 'USER_NOT_FOUND_IN_ORGANIZATION' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if this user is being promoted to owner (by role name or isOwner flag)
    const isBecomingOwner =
      targetRole.name === 'OWNER' ||
      roleId === OWNER_ROLE_ID ||
      isOwner === true;

    if (isBecomingOwner) {
      // `Attempting to promote user ${userId} to owner in organization ${organizationId}`
      // Find current owner in the organization
      const currentOwner = await this.userOrganizationRepo.findOne({
        where: { organizeId: organizationId, isOwner: true },
        relations: ['user', 'role'],
      });

      // If there's already an owner and it's not the same user
      if (currentOwner && currentOwner.userId !== userId) {
        // `Transferring ownership in organization ${organizationId} from user ${currentOwner.userId} to user ${userId}`
        // Demote current owner to super admin
        await this.userOrganizationRepo.update(
          { userId: currentOwner.userId, organizeId: organizationId },
          {
            roleId: SUPER_ADMIN_ROLE_ID,
            isOwner: false,
          },
        );

        // `Previous owner (user ${currentOwner.userId}) demoted to Super Admin (roleId: ${SUPER_ADMIN_ROLE_ID})`
      }

      // Promote new user to owner
      await this.userOrganizationRepo.update(
        { userId, organizeId: organizationId },
        {
          roleId: OWNER_ROLE_ID,
          isOwner: true,
        },
      );

      // `User ${userId} promoted to Owner (roleId: ${OWNER_ROLE_ID}) in organization ${organizationId}`
    } else {
      // Regular role update (not becoming owner)
      // `Updating user ${userId} role to ${targetRole.name} (roleId: ${roleId}) in organization ${organizationId}`
      // Validate that we're not removing owner status if this is the only owner
      if (userOrganization.isOwner && !isOwner) {
        const ownerCount = await this.userOrganizationRepo.count({
          where: { organizeId: organizationId, isOwner: true },
        });

        if (ownerCount <= 1) {
          throw new HttpException(
            {
              message:
                'Cannot remove owner status - organization must have at least one owner',
              error: { code: 'CANNOT_REMOVE_ONLY_OWNER' },
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Update the user organization with regular role
      const updateData: Partial<UserOrganization> = {
        roleId,
        isOwner: isOwner || false,
      };

      // Only update isCreator if it's explicitly provided
      if (isCreator !== undefined) {
        updateData.isCreator = isCreator;
      }

      await this.userOrganizationRepo.update(
        { userId, organizeId: organizationId },
        updateData,
      );
    }

    // Return updated user organization with relations
    return await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
      userId,
      organizationId,
    );
  }

  /**
   * Update user role in organization
   */
  async updateUserRole(
    organizationId: number,
    userId: number,
    updateUserRoleDto: any,
    currentUserId: number,
  ) {
    // Check if current user has permission to update roles in this organization
    const currentUserOrg = await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
      currentUserId,
      organizationId,
    );

    if (!currentUserOrg) {
      throw new HttpException(
        {
          message: 'You are not a member of this organization',
          error: { code: 'USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Get current user's role to check if they're owner or super_admin
    const currentUserRole = await this.findRoleById(currentUserOrg.roleId);
    const isCurrentUserPrivileged =
      currentUserRole &&
      (currentUserRole.name === 'OWNER' ||
        currentUserRole.name === 'SUPER_ADMIN' ||
        currentUserOrg.isOwner);

    // Get target user's organization data
    const targetUserOrg = await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
      userId,
      organizationId,
    );

    if (!targetUserOrg) {
      throw new HttpException(
        {
          message: 'Target user is not a member of this organization',
          error: { code: 'TARGET_USER_NOT_IN_ORGANIZATION' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Get target user's current role to check if they're owner or super_admin
    const targetUserCurrentRole = await this.findRoleById(targetUserOrg.roleId);
    const isTargetUserPrivileged =
      targetUserCurrentRole &&
      (targetUserCurrentRole.name === 'OWNER' ||
        targetUserCurrentRole.name === 'SUPER_ADMIN' ||
        targetUserOrg.isOwner);

    // If current user is not privileged but target user is privileged, prevent role change
    if (!isCurrentUserPrivileged && isTargetUserPrivileged) {
      throw new HttpException(
        {
          message:
            'You do not have permission to change the role of an owner or super admin',
          error: { code: 'INSUFFICIENT_PRIVILEGES' },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Get role information from the role repository through user-organization service
    const targetRole = await this.findRoleById(updateUserRoleDto.roleId);

    if (!targetRole) {
      throw new HttpException(
        {
          message: `Role with ID ${updateUserRoleDto.roleId} not found`,
          error: { code: 'ROLE_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if this is an owner transfer
    const isOwnerTransfer =
      targetRole.name === 'OWNER' || updateUserRoleDto.isOwner === true;

    // For owner transfer, only existing owners can perform this action
    if (
      isOwnerTransfer &&
      !(
        currentUserOrg.isOwner ||
        (currentUserRole && currentUserRole.name === 'OWNER')
      )
    ) {
      throw new HttpException(
        {
          message: 'Only the organization owner can transfer ownership',
          error: { code: 'OWNER_TRANSFER_FORBIDDEN' },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Store previous owner info for response (if this is an owner transfer)
    let previousOwner = null;
    if (isOwnerTransfer) {
      previousOwner = await this.userOrganizationService
        .findUserOrganizationRepo()
        .findOne({
          where: { organizeId: organizationId, isOwner: true },
          relations: ['user', 'role'],
        });
    }

    // Update user role
    const updatedUserOrg = await this.updateUserRoleInOrganization(
      userId,
      organizationId,
      updateUserRoleDto,
    );

    // Prepare response message
    let message = 'User role updated successfully';
    let additionalInfo = {};

    if (isOwnerTransfer && previousOwner && previousOwner.userId !== userId) {
      message = 'Ownership transferred successfully';
      additionalInfo = {
        previousOwner: {
          userId: previousOwner.userId,
          email: previousOwner.user?.email,
          newRole: 'Super Admin',
        },
        newOwner: {
          userId: updatedUserOrg.userId,
          email: updatedUserOrg.user?.email,
          role: 'Owner',
        },
      };
    }

    // Clear cache for organization users and permissions
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${organizationId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `org:${organizationId}:permissions:me:user:${userId}`,
      ),
    ]);

    return {
      success: true,
      message,
      data: {
        userId: updatedUserOrg.userId,
        organizationId: updatedUserOrg.organizeId,
        roleId: updatedUserOrg.roleId,
        roleName: updatedUserOrg.role?.name,
        isOwner: updatedUserOrg.isOwner,
        ...additionalInfo,
      },
    };
  }

  /**
   * Validate role exists and belongs to organization
   */
  public async validateRole(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new HttpException(
        {
          message: 'Role not found',
          error: { code: 'ROLE_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return role;
  }

  public async getRoleByName(name: string): Promise<Role> {
    return await this.roleRepository.findOne({
      where: { name, organizeId: null },
    });
  }

  public async getRoleIdAndNameById(id: number): Promise<Role> {
    return await this.roleRepository.findOne({
      where: { id },
      select: ['id', 'name'],
    });
  }

  public async getRoleIdAndNameByIds(ids: number[]): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { id: In(ids), isActive: true },
      select: ['id', 'name'],
    });
  }
}
