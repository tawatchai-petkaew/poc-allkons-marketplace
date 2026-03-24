import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import { Invitation } from '@/model/invitation.entity';
import {
  LeaveStatus,
  OrganizationLeaveLog,
} from '@/model/organization-leave-log.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { detectLanguage } from '@/utils/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  GetUserOrganizationsResponseDto,
  UserOrganizationResponseDto,
} from './dto/user-organization.dto';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class UserOrganizationService {
  constructor(
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepo: Repository<UserOrganization>,
    @InjectRepository(OrganizationLeaveLog)
    private readonly leaveLogRepo: Repository<OrganizationLeaveLog>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async createUserOrganization({
    userId,
    organizationId,
    roleId,
    isOwner,
    isCreator = false,
    memberStatus,
  }: {
    userId: number;
    organizationId: number;
    roleId?: number | null;
    isOwner: boolean;
    isCreator?: boolean;
    memberStatus: UserOrganizationInviteStatus;
  }) {
    return await this.userOrganizationRepo.save({
      userId,
      organizeId: organizationId,
      roleId,
      isOwner,
      isCreator,
      memberStatus,
    });
  }

  async findUserOrganizationByUserId(userId: number) {
    return await this.userOrganizationRepo.findOne({
      where: { userId },
    });
  }

  async findUserOrganizationsByUserId(userId: number) {
    return await this.userOrganizationRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findUserOrganizationByUserIdAndOrgId(
    userId: number,
    organizeId: number,
  ) {
    return await this.userOrganizationRepo.findOne({
      where: { userId, organizeId },
      relations: ['role', 'organization', 'user'],
    });
  }

  async findOrganizationByUserId(userId: number) {
    return await this.userOrganizationRepo.find({
      where: { userId },
      relations: ['organization', 'user', 'role', 'organization.juristic'],
    });
  }

  async findUsersByOrgId(organizeId: number) {
    return await this.userOrganizationRepo.find({
      where: { organizeId },
      relations: ['user', 'role'],
    });
  }

  async findUserOrganization(
    userId: number,
    organizeId: number,
  ): Promise<UserOrganization | null> {
    const userOrg = await this.userOrganizationRepo.findOne({
      where: { userId, organizeId },
    });
    return userOrg;
  }

  async findUserOrganizationOwner(
    userId: number,
  ): Promise<UserOrganization | null> {
    const userOrg = await this.userOrganizationRepo.findOne({
      where: { userId, isOwner: true },
      relations: ['organization'],
    });
    return userOrg;
  }

  async findAllRelatedByUserId(userId: number) {
    return await this.userOrganizationRepo.find({
      where: { userId },
      relations: [
        'user',
        'organization',
        'organization.store',
        'organization.store.merchants',
      ],
    });
  }

  async findUserOrgByCountryAndPhoneNumber(
    countryCode: string,
    phoneNumber: string,
  ) {
    return await this.userOrganizationRepo
      .createQueryBuilder('userOrg')
      .leftJoinAndSelect('userOrg.user', 'user')
      .leftJoinAndSelect('userOrg.organization', 'organization')
      .leftJoinAndSelect('organization.juristic', 'juristic')
      .leftJoinAndSelect('userOrg.role', 'role')
      .where('user.tel = :tel', { tel: phoneNumber })
      .andWhere('user.countryCode = :countryCode', { countryCode })
      .getMany();
  }

  async removeUserOrganizationById(id: number) {
    return await this.userOrganizationRepo.delete({ id });
  }

  async deleteUserOrganizationByIds(ids: number[]) {
    return await this.userOrganizationRepo.delete(ids);
  }

  async createRoleForUserInOrganization({
    userId,
    organizationId,
    roleId,
  }: {
    userId: number;
    organizationId: number;
    roleId: number;
  }) {
    return await this.userOrganizationRepo.save({
      userId,
      organizeId: organizationId,
      roleId,
    });
  }

  /**
   * Count users by organization ID
   * @param organizationId Organization ID to count users
   * @returns Number of users in the organization
   */
  async countUsersByOrganizationId(organizationId: number): Promise<number> {
    return await this.userOrganizationRepo.count({
      where: { organizeId: organizationId },
    });
  }

  async getUserRole(userId: number, organizationId: number) {
    const userOrg = await this.userOrganizationRepo.findOne({
      where: { userId, organizeId: organizationId },
      relations: ['role'],
    });

    return userOrg?.role || null;
  }

  async getUserRoleCode(
    userId: number,
    organizationId: number,
  ): Promise<string | null> {
    const userRole = await this.getUserRole(userId, organizationId);
    return userRole?.name || null;
  }

  async checkUserRole(
    userId: number,
    organizationId: number,
    roleCode: string,
  ): Promise<boolean> {
    const userRoleCode = await this.getUserRoleCode(userId, organizationId);
    return userRoleCode === roleCode;
  }

  public async requestCurrentUserOrganization(
    dto: any,
    organizeId: number,
  ): Promise<UserOrganization> {
    const userOrg = await this.userOrganizationRepo.findOne({
      where: { userId: dto.userId, organizeId },
      relations: ['role'],
    });

    if (!userOrg) {
      throw new Error("Can't find user organization");
    }

    return userOrg;
  }

  async findOrganizationUsers(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      membershipStatus?: string;
    } = {},
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      isOwner,
      membershipStatus,
    } = options;

    // Helper function to apply common filters
    const applyCommonFilters = (queryBuilder: any, alias: string) => {
      if (search) {
        const searchFields =
          alias === 'uo'
            ? '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.firstNameEn LIKE :search OR user.lastNameEn LIKE :search OR user.email LIKE :search OR user.tel LIKE :search)'
            : '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)';
        queryBuilder.andWhere(searchFields, { search: `%${search}%` });
      }

      if (roleId) {
        queryBuilder.andWhere(`${alias}.roleId = :roleId`, { roleId });
      }
    };

    // Build query for existing users in organization
    const userOrgQueryBuilder = this.userOrganizationRepo
      .createQueryBuilder('uo')
      .select([
        'uo.id',
        'uo.isOwner',
        'uo.isCreator',
        'uo.memberStatus',
        'uo.createdAt',
        'user.id',
        'user.uuid',
        'user.firstNameTh',
        'user.middleNameTh',
        'user.lastNameTh',
        'user.email',
        'user.countryCode',
        'user.tel',
        'uo.roleId',
        'role.name',
        'role.displayName',
      ])
      .leftJoin('uo.user', 'user')
      .leftJoin('uo.role', 'role')
      .where('uo.organizeId = :organizationId', { organizationId });

    // Apply filters to user organization query
    applyCommonFilters(userOrgQueryBuilder, 'uo');

    if (typeof isOwner === 'boolean') {
      userOrgQueryBuilder.andWhere('uo.isOwner = :isOwner', { isOwner });
    }

    if (membershipStatus) {
      userOrgQueryBuilder.andWhere('uo.memberStatus = :membershipStatus', {
        membershipStatus,
      });
    }

    // Build query for invitations
    const invitationQueryBuilder = this.invitationRepo
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.roleId',
        'inv.firstName',
        'inv.lastName',
        'inv.phoneNumber',
        'inv.countryCode',
        'inv.email',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.refCode',
        'role.name',
        'role.displayName',
      ])
      .leftJoin('inv.role', 'role')
      .where('inv.organizeId = :organizationId', { organizationId })
      .andWhere('inv.status IN (:...invitationStatuses)', {
        invitationStatuses: [
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.EXPIRED,
          UserOrganizationInviteStatus.DECLINED,
          UserOrganizationInviteStatus.REJECTED,
        ],
      });

    // Apply filters to invitation query
    applyCommonFilters(invitationQueryBuilder, 'inv');

    // Execute count queries for accurate pagination
    const [userOrgCount, invitationCount] = await Promise.all([
      userOrgQueryBuilder.getCount(),
      invitationQueryBuilder.getCount(),
    ]);

    const total = userOrgCount + invitationCount;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Execute both queries with ordering
    const [userOrganizations, invitations] = await Promise.all([
      userOrgQueryBuilder
        .orderBy('uo.createdAt', 'DESC')
        .addOrderBy('user.firstNameTh', 'ASC')
        .getMany(),
      invitationQueryBuilder
        .orderBy('inv.createdAt', 'DESC')
        .addOrderBy('inv.firstName', 'ASC')
        .getMany(),
    ]);

    // Transform invitation data to match user organization structure
    const transformedInvitations = invitations.map((inv) => ({
      id: inv.id,
      isOwner: false,
      isCreator: false,
      memberStatus: inv.status,
      createdAt: inv.createdAt || new Date(),
      user: {
        id: inv.id,
        uuid: null,
        firstNameTh: inv.firstName,
        middleNameTh: null,
        lastNameTh: inv.lastName,
        email: inv.email,
        countryCode: inv.countryCode,
        tel: inv.phoneNumber,
      },
      roleId: inv.roleId,
      role: inv.role,
      isInvitation: true,
      refCode: inv.refCode,
      invitedByUser: inv.invitedByUser,
    }));

    // Combine and sort results by creation date
    const combinedResults = [
      ...userOrganizations.map((uo) => ({
        ...uo,
        isInvitation: false,
        refCode: null,
      })),
      ...transformedInvitations,
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    // Apply pagination to combined results
    const paginatedResults = combinedResults.slice(offset, offset + limit);

    // Get pending leave requests for users only
    const userIds = paginatedResults
      .filter((item) => !item.isInvitation && item.user?.id)
      .map((item) => item.user.id);

    let pendingLeaveMap = new Map<number, boolean>();
    if (userIds.length > 0) {
      const pendingLeaveRequests = await this.leaveLogRepo.find({
        where: {
          userId: In(userIds),
          organizationId,
          leaveStatus: LeaveStatus.PENDING,
        },
      });

      pendingLeaveRequests.forEach((leaveLog) => {
        pendingLeaveMap.set(leaveLog.userId, true);
      });
    }

    // Add isRequest property
    const enhancedResults = paginatedResults.map((item) => ({
      ...item,
      isRequest: item.isInvitation
        ? false
        : pendingLeaveMap.has(item.user?.id) || false,
    }));

    return {
      userOrganizations: enhancedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOrganizationUsersApproveRequestHistory(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
    } = {},
  ) {
    const { page = 1, limit = 10, search, roleId, isOwner } = options;

    // Helper function to apply common filters
    const applyCommonFilters = (queryBuilder: any, alias: string) => {
      if (search) {
        const searchFields =
          alias === 'uo'
            ? '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.firstNameEn LIKE :search OR user.lastNameEn LIKE :search OR user.email LIKE :search OR user.tel LIKE :search)'
            : '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)';
        queryBuilder.andWhere(searchFields, { search: `%${search}%` });
      }

      if (roleId) {
        queryBuilder.andWhere(`${alias}.roleId = :roleId`, { roleId });
      }
    };

    // Build query for existing users in organization
    const userOrgQueryBuilder = this.userOrganizationRepo
      .createQueryBuilder('uo')
      .select([
        'uo.id',
        'uo.isOwner',
        'uo.isCreator',
        'uo.memberStatus',
        'uo.createdAt',
        'user.id',
        'user.uuid',
        'user.firstNameTh',
        'user.middleNameTh',
        'user.lastNameTh',
        'user.email',
        'user.countryCode',
        'user.tel',
        'uo.roleId',
        'role.name',
        'role.displayName',
        // 'invitedByUser.firstNameTh',
        // 'invitedByUser.lastNameTh',
      ])
      .leftJoin('uo.user', 'user')
      .leftJoin('uo.role', 'role')
      // .leftJoin('inv.invitedByUser', 'invitedByUser')
      .where('uo.organizeId = :organizationId', { organizationId });

    // Apply filters to user organization query
    applyCommonFilters(userOrgQueryBuilder, 'uo');

    if (typeof isOwner === 'boolean') {
      userOrgQueryBuilder.andWhere('uo.isOwner = :isOwner', { isOwner });
    }

    // Build query for invitations (include organization relation)
    const invitationQueryBuilder = this.invitationRepo
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.roleId',
        'inv.firstName',
        'inv.lastName',
        'inv.phoneNumber',
        'inv.countryCode',
        'inv.email',
        'inv.status',
        'inv.expiresAt',
        'inv.refCode',
        'inv.createdAt',
        'role.name',
        'role.displayName',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.organizeName',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      //.where('inv.organizeId = :organizationId', { organizationId })
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.status IN (:...invitationStatuses)', {
        invitationStatuses: [
          UserOrganizationInviteStatus.ACCEPTED,
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.EXPIRED,
          UserOrganizationInviteStatus.REJECTED,
        ],
      });

    // Apply filters to invitation query
    applyCommonFilters(invitationQueryBuilder, 'inv');

    // Execute count queries for accurate pagination
    const userOrgCount = await userOrgQueryBuilder.getCount();

    const total = userOrgCount;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Execute both queries with ordering
    const [userOrganizations, invitations] = await Promise.all([
      userOrgQueryBuilder
        .orderBy('uo.createdAt', 'DESC')
        .addOrderBy('user.firstNameTh', 'ASC')
        .getMany(),
      invitationQueryBuilder
        .orderBy('inv.createdAt', 'DESC')
        .addOrderBy('inv.firstName', 'ASC')
        .getMany(),
    ]);
    // Transform invitation data to match user organization structure
    const transformedInvitations = invitations.map((inv) => ({
      id: inv.id,
      isOwner: false,
      isCreator: false,
      memberStatus: inv.status,
      createdAt: inv.createdAt || new Date(),
      user: {
        id: inv.id,
        uuid: null,
        firstNameTh: inv.firstName,
        middleNameTh: null,
        lastNameTh: inv.lastName,
        email: inv.email,
        countryCode: inv.countryCode,
        tel: inv.phoneNumber,
      },
      roleId: inv.roleId,
      role: inv.role,
      isInvitation: true,
      refCode: inv.refCode || '',
      invitedByUser: {
        firstNameTh: inv.invitedByUser?.firstNameTh || '',
        lastNameTh: inv.invitedByUser?.lastNameTh || '',
      },
      organizeName: inv.organization?.organizeName || '',
    }));

    // Combine and sort results by creation date
    const combinedResults = [
      //...userOrganizations.map((uo) => ({ ...uo, isInvitation: false, refCode: "" })),
      ...transformedInvitations,
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    // Apply pagination to combined results
    const paginatedResults = combinedResults.slice(offset, offset + limit);

    // Get pending leave requests for users only
    const userIds = paginatedResults
      .filter((item) => !item.isInvitation && item.user?.id)
      .map((item) => item.user.id);

    let pendingLeaveMap = new Map<number, boolean>();
    if (userIds.length > 0) {
      const pendingLeaveRequests = await this.leaveLogRepo.find({
        where: {
          userId: In(userIds),
          organizationId,
          leaveStatus: LeaveStatus.PENDING,
        },
      });

      pendingLeaveRequests.forEach((leaveLog) => {
        pendingLeaveMap.set(leaveLog.userId, true);
      });
    }

    // Add isRequest property
    const enhancedResults = paginatedResults.map((item) => ({
      ...item,
      isRequest: item.isInvitation
        ? false
        : pendingLeaveMap.has(item.user?.id) || false,
    }));
    return {
      userOrganizations: enhancedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOrganizationUsersInvitationsStatus(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
    } = {},
    userTel: string,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      isOwner,
      inviteStatus,
    } = options;

    // Helper function to apply common filters
    const applyCommonFilters = (queryBuilder: any, alias: string) => {
      if (search) {
        const searchFields =
          alias === 'uo'
            ? '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.firstNameEn LIKE :search OR user.lastNameEn LIKE :search OR user.email LIKE :search OR user.tel LIKE :search)'
            : '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)';
        queryBuilder.andWhere(searchFields, { search: `%${search}%` });
      }

      if (roleId) {
        queryBuilder.andWhere(`${alias}.roleId = :roleId`, { roleId });
      }
    };

    // Build query for invitations
    const invitationQueryBuilder = this.invitationRepo
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.roleId',
        'inv.firstName',
        'inv.lastName',
        'inv.phoneNumber',
        'inv.countryCode',
        'inv.email',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.refCode',
        'role.name',
        'role.displayName',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.organizeName',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.phoneNumber = :userTel', { userTel })
      .andWhere('inv.status IN (:...invitationStatuses)', {
        invitationStatuses: [inviteStatus],
      });

    // Apply filters to invitation query
    applyCommonFilters(invitationQueryBuilder, 'inv');

    // Execute count queries for accurate pagination
    const invitationCount = await invitationQueryBuilder.getCount();

    const total = invitationCount;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invitations = await invitationQueryBuilder
      .orderBy('inv.createdAt', 'DESC')
      .addOrderBy('inv.firstName', 'ASC')
      .getMany();

    // Transform invitation data to match user organization structure
    const transformedInvitations = invitations.map((inv) => ({
      id: inv.id,
      isOwner: false,
      isCreator: false,
      memberStatus: inv.status,
      createdAt: inv.createdAt || new Date(),
      user: {
        id: inv.id,
        uuid: null,
        firstNameTh: inv.firstName,
        middleNameTh: null,
        lastNameTh: inv.lastName,
        email: inv.email,
        countryCode: inv.countryCode,
        tel: inv.phoneNumber,
      },
      roleId: inv.roleId,
      role: inv.role,
      isInvitation: true,
      refCode: inv.refCode,
      invitedByUser: {
        firstNameTh: inv.invitedByUser?.firstNameTh || '',
        lastNameTh: inv.invitedByUser?.lastNameTh || '',
      },
      organizeName: inv.organization?.organizeName || '',
    }));

    // Combine and sort results by creation date
    const combinedResults = [...transformedInvitations].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    // Apply pagination to combined results
    const paginatedResults = combinedResults.slice(offset, offset + limit);

    // Get pending leave requests for users only
    const userIds = paginatedResults
      .filter((item) => !item.isInvitation && item.user?.id)
      .map((item) => item.user.id);

    let pendingLeaveMap = new Map<number, boolean>();
    if (userIds.length > 0) {
      const pendingLeaveRequests = await this.leaveLogRepo.find({
        where: {
          userId: In(userIds),
          organizationId,
          leaveStatus: LeaveStatus.PENDING,
        },
      });

      pendingLeaveRequests.forEach((leaveLog) => {
        pendingLeaveMap.set(leaveLog.userId, true);
      });
    }

    // Add isRequest property
    const enhancedResults = paginatedResults.map((item) => ({
      ...item,
      isRequest: item.isInvitation
        ? false
        : pendingLeaveMap.has(item.user?.id) || false,
    }));

    return {
      userOrganizations: enhancedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOrganizationUsersInvitationsStatusApprove(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
    } = {},
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      isOwner,
      inviteStatus,
    } = options;

    // Helper function to apply common filters
    const applyCommonFilters = (queryBuilder: any, alias: string) => {
      if (search) {
        const searchFields =
          alias === 'uo'
            ? '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.firstNameEn LIKE :search OR user.lastNameEn LIKE :search OR user.email LIKE :search OR user.tel LIKE :search)'
            : '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)';
        queryBuilder.andWhere(searchFields, { search: `%${search}%` });
      }

      if (roleId) {
        queryBuilder.andWhere(`${alias}.roleId = :roleId`, { roleId });
      }
    };

    // Build query for invitations
    const invitationQueryBuilder = this.invitationRepo
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.roleId',
        'inv.firstName',
        'inv.lastName',
        'inv.phoneNumber',
        'inv.countryCode',
        'inv.email',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.refCode',
        'role.name',
        'role.displayName',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.id',
        'organization.organizeName',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      //.where('inv.organizeId = :organizationId', { organizationId })
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.status IN (:...invitationStatuses)', {
        invitationStatuses: [inviteStatus],
      });

    // Apply filters to invitation query
    applyCommonFilters(invitationQueryBuilder, 'inv');

    // Execute count queries for accurate pagination
    const invitationCount = await invitationQueryBuilder.getCount();

    const total = invitationCount;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invitations = await invitationQueryBuilder
      .orderBy('inv.createdAt', 'DESC')
      .addOrderBy('inv.firstName', 'ASC')
      .getMany();

    // Transform invitation data to match user organization structure
    const transformedInvitations = invitations.map((inv) => ({
      id: inv.id,
      isOwner: false,
      isCreator: false,
      memberStatus: inv.status,
      createdAt: inv.createdAt || new Date(),
      user: {
        id: inv.id,
        firstNameTh: inv.firstName,
        middleNameTh: null,
        lastNameTh: inv.lastName,
        email: inv.email,
        countryCode: inv.countryCode,
        tel: inv.phoneNumber,
      },
      roleId: inv.roleId,
      role: inv.role,
      isInvitation: true,
      refCode: inv.refCode,
      invitedByUser: {
        firstNameTh: inv.invitedByUser?.firstNameTh || '',
        lastNameTh: inv.invitedByUser?.lastNameTh || '',
      },
      organizeName: inv.organization?.organizeName || '',
    }));

    // Combine and sort results by creation date
    const combinedResults = [...transformedInvitations].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    // Apply pagination to combined results
    const paginatedResults = combinedResults.slice(offset, offset + limit);

    // Get pending leave requests for users only
    const userIds = paginatedResults
      .filter((item) => !item.isInvitation && item.user?.id)
      .map((item) => item.user.id);

    let pendingLeaveMap = new Map<number, boolean>();
    if (userIds.length > 0) {
      const pendingLeaveRequests = await this.leaveLogRepo.find({
        where: {
          userId: In(userIds),
          organizationId,
          leaveStatus: LeaveStatus.PENDING,
        },
      });

      pendingLeaveRequests.forEach((leaveLog) => {
        pendingLeaveMap.set(leaveLog.userId, true);
      });
    }

    // Add isRequest property
    const enhancedResults = paginatedResults.map((item) => ({
      ...item,
      isRequest: item.isInvitation
        ? false
        : pendingLeaveMap.has(item.user?.id) || false,
    }));

    return {
      userOrganizations: enhancedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOrganizationUsersInvitationsMultipleStatus(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      roleId?: number;
      isOwner?: boolean;
      inviteStatus?: string;
      inviteMultipleStatus?: string[];
    } = {},
    userTel: string,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      isOwner,
      inviteStatus,
      inviteMultipleStatus,
    } = options;

    // Helper function to apply common filters
    const applyCommonFilters = (queryBuilder: any, alias: string) => {
      if (search) {
        const searchFields =
          alias === 'uo'
            ? '(user.firstNameTh LIKE :search OR user.lastNameTh LIKE :search OR user.firstNameEn LIKE :search OR user.lastNameEn LIKE :search OR user.email LIKE :search OR user.tel LIKE :search)'
            : '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)';
        queryBuilder.andWhere(searchFields, { search: `%${search}%` });
      }

      if (roleId) {
        queryBuilder.andWhere(`${alias}.roleId = :roleId`, { roleId });
      }
    };

    // Build query for invitations
    const invitationQueryBuilder = this.invitationRepo
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.roleId',
        'inv.firstName',
        'inv.lastName',
        'inv.phoneNumber',
        'inv.countryCode',
        'inv.email',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.refCode',
        'inv.invitedByUserId',
        'role.name',
        'role.displayName',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.id',
        'organization.organizeName',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.phoneNumber = :userTel', { userTel })
      .andWhere('inv.status IN (:...invitationStatuses)', {
        invitationStatuses: inviteMultipleStatus,
      });
    // Apply filters to invitation query
    applyCommonFilters(invitationQueryBuilder, 'inv');

    // Execute count queries for accurate pagination
    const invitationCount = await invitationQueryBuilder.getCount();

    const total = invitationCount;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invitations = await invitationQueryBuilder
      .orderBy('inv.createdAt', 'DESC')
      .addOrderBy('inv.firstName', 'ASC')
      .getMany();

    // Transform invitation data to match user organization structure
    const transformedInvitations = invitations.map((inv) => ({
      id: inv.id,
      isOwner: false,
      isCreator: false,
      memberStatus: inv.status,
      createdAt: inv.createdAt || new Date(),
      user: {
        id: inv.id,
        uuid: null,
        firstNameTh: inv.firstName,
        middleNameTh: null,
        lastNameTh: inv.lastName,
        email: inv.email,
        countryCode: inv.countryCode,
        tel: inv.phoneNumber,
      },
      roleId: inv.roleId,
      role: inv.role,
      isInvitation: true,
      refCode: inv.refCode,
      invitedByUser: {
        firstNameTh: inv.invitedByUser?.firstNameTh || '',
        lastNameTh: inv.invitedByUser?.lastNameTh || '',
      },
      organization: {
        id: inv.organization?.id || null,
        organizeName: inv.organization?.organizeName || '',
      },
      organizeName: inv.organization?.organizeName || '',
    }));

    // Combine and sort results by creation date
    const combinedResults = [...transformedInvitations].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    // Apply pagination to combined results
    const paginatedResults = combinedResults.slice(offset, offset + limit);

    // Add isRequest property
    const enhancedResults = paginatedResults.map((item) => ({
      ...item,
      isRequest: false,
    }));

    return {
      userOrganizations: enhancedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async countOrganizationUsers(organizationId: number): Promise<number> {
    return await this.userOrganizationRepo.count({
      where: { organizeId: organizationId },
    });
  }

  async updateMemberStatus(
    userId: number,
    organizationId: number,
    status: string,
  ) {
    return await this.userOrganizationRepo.update(
      { userId, organizeId: organizationId },
      { memberStatus: status as any },
    );
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    userId: number,
    organizationId: number,
  ): Promise<void> {
    const userOrganization = await this.findUserOrganizationByUserIdAndOrgId(
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

    // Check if this is the only owner
    if (userOrganization.isOwner) {
      const ownerCount = await this.userOrganizationRepo.count({
        where: { organizeId: organizationId, isOwner: true },
      });

      if (ownerCount <= 1) {
        throw new HttpException(
          {
            message: 'Cannot remove the only owner from organization',
            error: { code: 'CANNOT_REMOVE_ONLY_OWNER' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.userOrganizationRepo.remove(userOrganization);
  }

  /**
   * Count owners in organization
   */
  async countOwners(organizationId: number): Promise<number> {
    return await this.userOrganizationRepo.count({
      where: { organizeId: organizationId, isOwner: true },
    });
  }

  /**
   * Get repository instance (for advanced queries)
   */
  findUserOrganizationRepo(): Repository<UserOrganization> {
    return this.userOrganizationRepo;
  }

  async findUserUseRole(roleId: number) {
    try {
      if (await this.userOrganizationRepo.findOne({ where: { roleId } })) {
        return true;
      }
      return false;
    } catch (e) {
      throw new HttpException(
        {
          message: 'Not delete permission',
          error: { code: 'NOT_DELETE_PERMISSION' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Find users by permission in organization
   * @param organizationId Organization ID
   * @param permissionCode Permission code to filter by
   * @param options Additional filter options
   * @returns List of users with the specified permission
   */
  async findUsersByPermission(
    organizationId: number,
    permissionCode: string,
    options: {
      isOwner?: boolean;
      isCreator?: boolean;
      memberStatus?: UserOrganizationInviteStatus;
    } = {},
  ) {
    const { isOwner, isCreator, memberStatus } = options;

    const queryBuilder = this.userOrganizationRepo
      .createQueryBuilder('uo')
      .leftJoin('uo.user', 'user')
      .leftJoin('uo.role', 'role')
      .leftJoin('role.rolePermissions', 'rp')
      .leftJoin('rp.permissions', 'permission')
      .select([
        'uo.id',
        'uo.isOwner',
        'uo.isCreator',
        'uo.memberStatus',
        'user.id',
        'user.firstNameTh',
        'user.lastNameTh',
        'user.name',
        'user.email',
        'user.countryCode',
        'user.tel',
        'uo.roleId',
        'role.name',
        'role.displayName',
      ])
      .where('uo.organizeId = :organizationId', { organizationId })
      .andWhere('permission.code = :permissionCode', { permissionCode });

    // Apply additional filters
    if (typeof isOwner === 'boolean') {
      queryBuilder.andWhere('uo.isOwner = :isOwner', { isOwner });
    }

    if (typeof isCreator === 'boolean') {
      queryBuilder.andWhere('uo.isCreator = :isCreator', { isCreator });
    }

    if (memberStatus) {
      queryBuilder.andWhere('uo.memberStatus = :memberStatus', {
        memberStatus,
      });
    }

    // Execute query and return results
    return await queryBuilder.getMany();
  }

  async findUserByUserIdAndOrganizationId(userId: number, organizeId: number) {
    return await this.userOrganizationRepo.findOne({
      where: { userId, organizeId },
    });
  }

  private displayName(search: string, user: any): string {
    let displayName: string;
    if (detectLanguage(search.charAt(0)) == 'thai') {
      displayName = user.firstNameTh;
      if (user.middleNameTh) {
        displayName += ` ${user.middleNameTh}`;
      }
      displayName += ` ${user.lastNameTh}`;
    } else if (detectLanguage(search.charAt(0)) == 'english') {
      displayName = user.firstNameEn;
      if (user.middleNameEn) {
        displayName += ` ${user.middleNameEn}`;
      }
      displayName += ` ${user.lastNameEn}`;
    } else {
      if (user.tel[0] == '0') {
        displayName = user.tel;
      } else {
        displayName = `0${user.tel}`;
      }
    }
    return displayName;
  }

  /**
   * Find organization users who are NOT members of a specific merchant
   * @param organizationId Organization ID
   * @param merchantId Specific merchant ID to exclude users from
   * @param query Query options for pagination and search
   * @returns Users available for the specific merchant assignment
   */
  async findOrganizationUsersNotInSpecificMerchant(
    organizationId: number,
    merchantId: number,
    query: BaseQueryDto,
  ): Promise<GetUserOrganizationsResponseDto> {
    try {
      const { page = 1, limit = 10, search } = query;
      const offset = (page - 1) * limit;

      // Build search conditions once to reuse in both count and data queries
      const buildSearchConditions = (searchTerm?: string) => {
        if (!searchTerm?.trim()) {
          return { condition: '1=1', params: {} };
        }

        const trimmedSearch = searchTerm.trim();
        const lowerSearch = trimmedSearch.toLowerCase();

        return {
          condition: `(
            LOWER(CONCAT(u.firstNameTh, ' ', u.lastNameTh)) = :exactSearch OR 
            LOWER(CONCAT(u.firstNameEn, ' ', u.lastNameEn)) = :exactSearch OR
            LOWER(u.firstNameTh) = :exactSearchFirst OR 
            LOWER(u.lastNameTh) = :exactSearchLast OR 
            LOWER(u.firstNameEn) = :exactSearchFirst OR 
            LOWER(u.lastNameEn) = :exactSearchLast OR
            LOWER(u.firstNameTh) LIKE :startsSearch OR 
            LOWER(u.lastNameTh) LIKE :startsSearch OR 
            LOWER(u.firstNameEn) LIKE :startsSearch OR 
            LOWER(u.lastNameEn) LIKE :startsSearch OR
            LOWER(CONCAT(u.firstNameTh, ' ', u.lastNameTh)) LIKE :containsSearch OR 
            LOWER(CONCAT(u.firstNameEn, ' ', u.lastNameEn)) LIKE :containsSearch OR
            LOWER(u.firstNameTh) LIKE :containsSearch OR 
            LOWER(u.lastNameTh) LIKE :containsSearch OR 
            LOWER(u.firstNameEn) LIKE :containsSearch OR 
            LOWER(u.lastNameEn) LIKE :containsSearch OR
            LOWER(u.email) LIKE :containsSearch OR 
            CONCAT('0', u.tel) LIKE :phoneSearch
          )`,
          params: {
            exactSearch: lowerSearch,
            exactSearchFirst: lowerSearch,
            exactSearchLast: lowerSearch,
            startsSearch: `${lowerSearch}%`,
            containsSearch: `%${lowerSearch}%`,
            phoneSearch: `%${trimmedSearch}%`,
          },
        };
      };

      const searchConditions = buildSearchConditions(search);

      // Optimized count query using COUNT(*) over filtered userOrganization ids
      let totalCount: number;
      try {
        totalCount = await this.userOrganizationRepo
          .createQueryBuilder('uo')
          .leftJoin('uo.user', 'u')
          .leftJoin(
            'user_merchants_merchant',
            'um',
            'um.userId = u.id AND um.merchantId = :merchantId',
          )
          .where('uo.organizeId = :organizationId', { organizationId })
          .andWhere('uo.memberStatus = :status', {
            status: UserOrganizationInviteStatus.ACCEPTED,
          })
          .andWhere('um.userId IS NULL')
          .andWhere(searchConditions.condition)
          .setParameters({ merchantId, ...searchConditions.params })
          .getCount();
      } catch (countError) {
        throw new HttpException(
          {
            message: 'Failed to count available users for merchant',
            error: { code: 'COUNT_QUERY_FAILED', details: countError.message },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Build main query with optimized LEFT JOIN
      const baseSelect = [
        'uo.id',
        'uo.userId',
        'uo.organizeId',
        'uo.roleId',
        'uo.isOwner',
        'uo.isCreator',
        'uo.memberStatus',
        'uo.createdAt',
        'uo.updatedAt',
        'u.id',
        'u.uuid',
        'u.firstNameTh',
        'u.middleNameTh',
        'u.lastNameTh',
        'u.firstNameEn',
        'u.middleNameEn',
        'u.lastNameEn',
        'u.email',
        'u.countryCode',
        'u.tel',
        'r.id',
        'r.name',
        'r.displayName',
      ];

      let queryBuilder = this.userOrganizationRepo
        .createQueryBuilder('uo')
        .select(baseSelect)
        .leftJoin('uo.user', 'u')
        .leftJoin('uo.role', 'r')
        .leftJoin(
          'user_merchants_merchant',
          'um',
          'um.userId = u.id AND um.merchantId = :merchantId',
        )
        .where('uo.organizeId = :organizationId', { organizationId })
        .andWhere('uo.memberStatus = :status', {
          status: UserOrganizationInviteStatus.ACCEPTED,
        })
        .andWhere('um.userId IS NULL')
        .andWhere(searchConditions.condition)
        .setParameters({ merchantId, ...searchConditions.params });

      // Add relevance scoring if search is active
      if (search?.trim()) {
        queryBuilder = queryBuilder.addSelect(
          `
          CASE 
            -- Priority 1: Exact match full name (highest relevance)
            WHEN LOWER(CONCAT(u.firstNameTh, ' ', u.lastNameTh)) = :exactSearch 
                 OR LOWER(CONCAT(u.firstNameEn, ' ', u.lastNameEn)) = :exactSearch THEN 1
            
            -- Priority 2: First name exact match
            WHEN LOWER(u.firstNameTh) = :exactSearchFirst OR LOWER(u.firstNameEn) = :exactSearchFirst THEN 2
            
            -- Priority 3: Last name exact match
            WHEN LOWER(u.lastNameTh) = :exactSearchLast OR LOWER(u.lastNameEn) = :exactSearchLast THEN 3
            
            -- Priority 4: First name starts with search term
            WHEN LOWER(u.firstNameTh) LIKE :startsSearch OR LOWER(u.firstNameEn) LIKE :startsSearch THEN 4
            
            -- Priority 5: Last name starts with search term
            WHEN LOWER(u.lastNameTh) LIKE :startsSearch OR LOWER(u.lastNameEn) LIKE :startsSearch THEN 5
            
            -- Priority 6: Full name contains search term
            WHEN LOWER(CONCAT(u.firstNameTh, ' ', u.lastNameTh)) LIKE :containsSearch
                 OR LOWER(CONCAT(u.firstNameEn, ' ', u.lastNameEn)) LIKE :containsSearch THEN 6
            
            -- Priority 7: First name contains
            WHEN LOWER(u.firstNameTh) LIKE :containsSearch OR LOWER(u.firstNameEn) LIKE :containsSearch THEN 7
            
            -- Priority 8: Last name contains
            WHEN LOWER(u.lastNameTh) LIKE :containsSearch OR LOWER(u.lastNameEn) LIKE :containsSearch THEN 8
            
            -- Priority 9: Email/phone match
            WHEN LOWER(u.email) LIKE :containsSearch OR u.tel LIKE :phoneSearch THEN 9
            
            ELSE 10
          END`,
          'search_relevance',
        );
      }

      // Execute query with appropriate sorting
      let userOrganizations;
      try {
        if (search?.trim()) {
          // Sort by relevance first, then by name
          userOrganizations = await queryBuilder
            .orderBy('search_relevance', 'ASC')
            .addOrderBy('u.firstNameTh', 'ASC')
            .addOrderBy('u.lastNameTh', 'ASC')
            .skip(offset)
            .take(limit)
            .getMany();
        } else {
          // No search - alphabetical sorting only
          userOrganizations = await queryBuilder
            .orderBy('u.firstNameTh', 'ASC')
            .addOrderBy('u.lastNameTh', 'ASC')
            .addOrderBy('u.firstNameEn', 'ASC')
            .addOrderBy('u.lastNameEn', 'ASC')
            .skip(offset)
            .take(limit)
            .getMany();
        }
      } catch (queryError) {
        throw new HttpException(
          {
            message: 'Failed to retrieve available users for merchant',
            error: {
              code: 'QUERY_EXECUTION_FAILED',
              details: queryError.message,
            },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Transform results to DTO
      const members: UserOrganizationResponseDto[] = userOrganizations.map(
        (uo) => ({
          id: uo.id,
          isOwner: uo.isOwner,
          isCreator: uo.isCreator,
          memberStatus: uo.memberStatus,
          displayName: this.displayName(search, uo.user),
          createdAt: uo.createdAt,
          updatedAt: uo.updatedAt,
          users: {
            id: uo.user.id,
            uuid: uo.user.uuid,
            countryCode: uo.user.countryCode,
            phoneNumber: uo.user.tel,
            email: uo.user.email,
            firstNameTh: uo.user.firstNameTh,
            middleNameTh: uo.user.middleNameTh,
            lastNameTh: uo.user.lastNameTh,
            firstNameEn: uo.user.firstNameEn,
            middleNameEn: uo.user.middleNameEn,
            lastNameEn: uo.user.lastNameEn,
          },
          role: {
            id: uo.role.id,
            name: uo.role.name,
            displayName: uo.role.displayName,
          },
        }),
      );

      return new GetUserOrganizationsResponseDto(
        members,
        page,
        limit,
        totalCount,
      );
    } catch (error) {
      // Re-throw HttpException errors as they are already properly formatted
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        {
          message:
            'An unexpected error occurred while retrieving available users for merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
