import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, In, Not } from 'typeorm';
import { Invitation } from '@/model/invitation.entity';
import { User } from '@/model/user.entity';
import { UserOrganization } from '@/model/user-organization.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { PhoneWhiteList } from '@/model/phone-white-list.entity';
import { Merchant } from '@/model/merchant.entity';
import {
  UserOrganizationInviteStatus,
  UserOrganizationInviteStatusApprove,
} from '@/model/enum/user-organization.enum';
import { v4 as uuidv4 } from 'uuid';
import { CreateInvitationData } from './interface/invitation.interface';
import {
  ApproveInvitationDto,
  RespondToInvitationDto,
} from './dto/respond-to-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { CisService } from '@/modules/cis/cis.service';
import { RelationType } from '@/modules/cis/enum/cis.enum';
import { Organization, OrganizationType } from '@/model/organization.entity';
import { ApproveInvitationResponseDto } from './dto/approve-invitation-response.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JuristicType } from '@/model/juristic-type.entity';
import { Platform } from '@/model/organization-contact.entity';
import { OrganizationService } from '@/modules/organization/organization.service';
import { clearCacheByPattern } from '@/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RoleService } from '../role/role.service';
import { PaginationType } from '@/types/pagination.type';
@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepository: Repository<UserOrganization>,
    @InjectRepository(UserMerchant)
    private readonly userMerchantRepository: Repository<UserMerchant>,
    @InjectRepository(PhoneWhiteList)
    private readonly phoneWhiteListRepository: Repository<PhoneWhiteList>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly cisService: CisService,
    @InjectQueue('invite-member-consumer')
    private inviteMemberQueue: Queue,
    private readonly connection: Connection,
    @InjectRepository(JuristicType)
    private readonly juristicTypeRepository: Repository<JuristicType>,
    @Inject(forwardRef(() => OrganizationService))
    private organizationService: OrganizationService,
    private readonly roleService: RoleService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Create a new invitation
   */
  async create(data: CreateInvitationData): Promise<Invitation> {
    try {
      // Generate unique reference code
      const refCode = this.generateRefCode();

      // Set default expiration date if not provided (1 day from now)
      const expiresAt =
        data.expiresAt || new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

      // Create invitation entity
      const invitation = this.invitationRepository.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        refCode,
        status: data.status || UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        addInWhiteList: data.addInWhiteList || false,
        merchantInfo: data.merchantInfo || [],
        expiresAt,
        invitedByUserId: data.invitedByUserId,
        roleId: data.roleId,
        organizeId: data.organizeId,
        approverOrgId: data.approverOrgId, // Add approverOrgId
        approvedAt: data.approvedAt,
      });

      // Save invitation to database
      const savedInvitation = await this.invitationRepository.save(invitation);

      // Clear cache for invitation lookup by refCode and phone
      await clearCacheByPattern(
        this.cacheManager,
        `invitations:ref:${savedInvitation.refCode}:*`,
      );
      await clearCacheByPattern(
        this.cacheManager,
        `invitations:phone:${savedInvitation.countryCode}:${savedInvitation.phoneNumber}:*`,
      );

      return savedInvitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw new InternalServerErrorException('Failed to create invitation');
    }
  }

  /**
   * Find invitation by ID
   */
  async findById(id: number): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: ['invitedByUser', 'role', 'organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  /**
   * Find invitation by reference code
   */
  async findByRefCode(refCode: string): Promise<Invitation> {
    // Narrow refCode early (fast index) then join only needed relations
    const qb = this.invitationRepository
      .createQueryBuilder('invitation')
      .where('invitation.refCode = :refCode', { refCode })
      .leftJoinAndSelect('invitation.invitedByUser', 'invitedByUser')
      .leftJoinAndSelect('invitation.role', 'role')
      .leftJoinAndSelect('invitation.organization', 'organization')
      .leftJoinAndSelect('organization.juristic', 'juristic')
      .leftJoinAndSelect(
        'invitation.approverOrganization',
        'approverOrganization',
      )
      .leftJoinAndSelect('approverOrganization.juristic', 'approverJuristic')
      .select([
        'invitation.id',
        'invitation.email',
        'invitation.firstName',
        'invitation.lastName',
        'invitation.countryCode',
        'invitation.phoneNumber',
        'invitation.refCode',
        'invitation.status',
        'invitation.createdAt',
        'invitation.expiresAt',
        'invitation.acceptedAt',
        'invitation.approverOrgId',
        'invitedByUser.id',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'role.id',
        'role.name',
        'role.displayName',
        'organization.id',
        'organization.organizeName',
        'juristic.id',
        'juristic.label',
        'juristic.prefix',
        'juristic.subfix',
        'approverOrganization.id',
        'approverOrganization.organizeName',
        'approverJuristic.id',
        'approverJuristic.label',
        'approverJuristic.prefix',
        'approverJuristic.subfix',
      ])
      .limit(1);

    const invitation = await qb.getOne();

    if (!invitation) {
      throw new HttpException(
        {
          message: 'Invitation not found',
          error: { code: 'INVITATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return invitation;
  }

  /**
   * Find invitations by phone number and country code with optional status filter
   */
  async findByPhoneNumber(
    countryCode: string,
    phoneNumber: string,
    status?: UserOrganizationInviteStatus,
  ): Promise<Invitation> {
    try {
      // Early narrow using indexed columns
      const baseQB = this.invitationRepository
        .createQueryBuilder('invitation')
        .where('invitation.countryCode = :countryCode', { countryCode })
        .andWhere('invitation.phoneNumber = :phoneNumber', { phoneNumber });

      if (status) {
        baseQB.andWhere('invitation.status = :status', { status });
      }

      const dataQB = baseQB
        .leftJoinAndSelect('invitation.invitedByUser', 'invitedByUser')
        .leftJoinAndSelect('invitation.role', 'role')
        .leftJoinAndSelect('invitation.organization', 'organization')
        .leftJoinAndSelect('organization.juristic', 'juristic')
        .leftJoinAndSelect(
          'invitation.approverOrganization',
          'approverOrganization',
        )
        .leftJoinAndSelect('approverOrganization.juristic', 'approverJuristic')
        .select([
          'invitation.id',
          'invitation.email',
          'invitation.firstName',
          'invitation.lastName',
          'invitation.countryCode',
          'invitation.phoneNumber',
          'invitation.refCode',
          'invitation.status',
          'invitation.createdAt',
          'invitation.expiresAt',
          'invitation.acceptedAt',
          'invitation.approvedAt',
          'invitation.approverOrgId',
          'invitedByUser.id',
          'invitedByUser.firstNameTh',
          'invitedByUser.lastNameTh',
          'invitedByUser.firstNameEn',
          'invitedByUser.lastNameEn',
          'role.id',
          'role.name',
          'role.displayName',
          'organization.id',
          'organization.organizeName',
          'juristic.id',
          'juristic.label',
          'juristic.prefix',
          'juristic.subfix',
          'approverOrganization.id',
          'approverOrganization.organizeName',
          'approverJuristic.id',
          'approverJuristic.label',
          'approverJuristic.prefix',
          'approverJuristic.subfix',
        ])
        .orderBy('invitation.createdAt', 'DESC')
        .limit(1);

      const invitations = await dataQB.getOne();

      // Return empty array if no invitations found (not an error)
      return invitations;
    } catch (error) {
      console.error('Error finding invitations by phone number:', error);
      throw new InternalServerErrorException('Failed to retrieve invitations');
    }
  }

  /**
   * Update invitation status
   */
  async updateStatus(
    id: number,
    status: UserOrganizationInviteStatus,
  ): Promise<Invitation> {
    const invitation = await this.findById(id);

    invitation.status = status;

    if (status === UserOrganizationInviteStatus.ACCEPTED) {
      invitation.acceptedAt = new Date();
    }

    const result = await this.invitationRepository.save(invitation);

    // Clear cache for invitation lookup
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:ref:${invitation.refCode}:*`,
    );
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:phone:${invitation.countryCode}:${invitation.phoneNumber}:*`,
    );

    return result;
  }

  /**
   * Check if invitation exists by phone number, country code and organization
   */
  async checkDuplicateInvitation(
    phoneNumber: string,
    organizeId: number,
    status: UserOrganizationInviteStatus,
    countryCode: string,
  ): Promise<boolean> {
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        phoneNumber,
        organizeId,
        status,
        countryCode,
      },
    });

    return !!existingInvitation;
  }

  async checkDuplicateInvitationNotMy(
    inviteId: number,
    phoneNumber: string,
    organizeId: number,
    countryCode: string,
  ): Promise<boolean> {
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        id: Not(inviteId),
        status: Not(UserOrganizationInviteStatus.EXPIRED),
        phoneNumber,
        organizeId,
        countryCode,
      },
    });

    return !!existingInvitation;
  }

  /**
   * Find existing pending invitation by phone number, country code and organization
   */
  async findPendingInvitation(
    phoneNumber: string,
    organizeId: number,
    status: UserOrganizationInviteStatus,
    countryCode: string,
  ): Promise<Invitation | null> {
    return await this.invitationRepository.findOne({
      where: {
        phoneNumber,
        organizeId,
        status,
        countryCode,
      },
    });
  }

  /**
   * Find existing invitation by phone number, country code and status
   */
  async checkDuplicateInvitationAll(
    phoneNumber: string,
    status: UserOrganizationInviteStatus,
    countryCode: string,
  ): Promise<boolean> {
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        phoneNumber,
        status,
        countryCode,
      },
    });

    return !!existingInvitation;
  }

  async findPendingInvitationAll(
    phoneNumber: string,
    countryCode: string,
  ): Promise<Invitation | null> {
    return await this.invitationRepository.findOne({
      where: {
        phoneNumber,
        countryCode,
        status: In([
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        ]),
      },
    });
  }

  /**
   * Cancel existing invitation (set status to DECLINED)
   */
  async cancelInvitation(
    invitationId: number,
    cancelledBy: number,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Set status using direct string value
    invitation.status = 'CANCELLED' as UserOrganizationInviteStatus;

    // Try to save the invitation first and then return it
    const savedInvitation = await this.invitationRepository.save(invitation);

    // Clear cache for cancelled invitation
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:ref:${savedInvitation.refCode}:*`,
    );
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:phone:${savedInvitation.countryCode}:${savedInvitation.phoneNumber}:*`,
    );

    return savedInvitation;
  }

  /**
   * Cancel existing invitation and create a new one
   * This method handles the scenario where a phone number was already invited
   */
  async replaceInvitation(data: CreateInvitationData): Promise<Invitation> {
    // Check if there's an existing pending invitation
    const existingInvitation = await this.findPendingInvitation(
      data.phoneNumber,
      data.organizeId,
      data.inviteStatus || UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
      data.countryCode,
    );

    if (existingInvitation) {
      // Cancel the existing invitation
      await this.cancelInvitation(existingInvitation.id, data.invitedByUserId);
    }

    // Create the new invitation
    return await this.create(data);
  }

  /**
   * Create invitation with duplicate handling options
   */
  async createInvitationSafe(
    data: CreateInvitationData,
    options: {
      allowReplace?: boolean; // If true, cancel existing and create new
      skipDuplicateCheck?: boolean; // If true, skip duplicate validation
    } = {},
  ): Promise<Invitation> {
    const { allowReplace = false, skipDuplicateCheck = false } = options;

    // If skip duplicate check, create directly
    if (skipDuplicateCheck) {
      return await this.create(data);
    }

    // Check for existing invitation
    const isDuplicate = await this.checkDuplicateInvitation(
      data.phoneNumber,
      data.organizeId,
      data.inviteStatus || UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
      data.countryCode,
    );

    if (isDuplicate) {
      if (allowReplace) {
        // Replace the existing invitation
        return await this.replaceInvitation(data);
      } else {
        throw new HttpException(
          {
            message:
              'An invitation has already been sent to this phone number for the organization',
            error: { code: 'INVITATION_DUPLICATE' },
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    // No duplicate, create new invitation
    return await this.create(data);
  }

  /**
   * Get invitations by organization
   */
  async findByOrganization(
    organizeId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ invitations: Invitation[]; total: number }> {
    const [invitations, total] = await this.invitationRepository.findAndCount({
      where: { organizeId },
      relations: ['invitedByUser', 'role', 'organization'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { invitations, total };
  }

  /**
   * Validate invitation basic requirements
   */
  private async validateInvitationBasics(
    invitation: Invitation,
  ): Promise<void> {
    if (!invitation) {
      throw new HttpException(
        {
          message: 'Invitation not found',
          error: { code: 'INVITATION_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      throw new HttpException(
        {
          message: 'Invitation has expired',
          error: { code: 'INVITATION_EXPIRED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (invitation.status !== UserOrganizationInviteStatus.SENT) {
      throw new HttpException(
        {
          message:
            'Invitation is not in valid state for response. Current status: ' +
            invitation.status,
          error: { code: 'INVITATION_INVALID_STATUS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validate all merchants exist in batch to avoid N+1 queries
   */
  private async validateMerchants(merchantInfo: any[]): Promise<void> {
    if (!merchantInfo || merchantInfo.length === 0) {
      return;
    }

    const merchantIds = merchantInfo.map((m) => m.merchantId);
    const merchants = await this.merchantRepository.findByIds(merchantIds);

    if (merchants.length !== merchantIds.length) {
      const foundIds = merchants.map((m) => m.id);
      const missingIds = merchantIds.filter((id) => !foundIds.includes(id));
      throw new HttpException(
        {
          message: `Merchants not found: ${missingIds.join(', ')}`,
          error: { code: 'MERCHANT_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Find and validate user exists
   */
  private async validateUserExists(invitation: Invitation): Promise<number> {
    const existingUser = await this.userRepository.findOne({
      where: {
        tel: invitation.phoneNumber,
        countryCode: invitation.countryCode,
      },
    });

    if (!existingUser) {
      throw new HttpException(
        {
          message: 'User must be registered before accepting invitation',
          error: { code: 'USER_NOT_REGISTERED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return existingUser.id;
  }

  /**
   * Create user organization relationship
   */
  private async createUserOrganization(
    userId: number,
    invitation: Invitation,
    queryRunner: any,
  ): Promise<void> {
    const userOrganization = this.userOrganizationRepository.create({
      userId: userId,
      organizeId: invitation.organizeId,
      roleId: invitation.roleId,
      memberStatus: UserOrganizationInviteStatus.ACCEPTED,
      isOwner: false,
      isCreator: false,
    });

    await queryRunner.manager.save(userOrganization);
  }

  /**
   * Create user merchant relationships in batch
   */
  private async createUserMerchants(
    userId: number,
    invitation: Invitation,
    queryRunner: any,
  ): Promise<void> {
    if (!invitation.merchantInfo || invitation.merchantInfo.length === 0) {
      return;
    }

    // Create user merchants in batch
    const userMerchants = invitation.merchantInfo.map((merchantData) =>
      this.userMerchantRepository.create({
        userId: userId,
        merchantId: merchantData.merchantId,
        roleId: merchantData.roleId,
        lastAccessedAt: new Date(),
      }),
    );

    await queryRunner.manager.save(userMerchants);
  }

  /**
   * Add user to phone whitelist if required
   */
  private async addToPhoneWhitelist(
    invitation: Invitation,
    queryRunner: any,
  ): Promise<void> {
    if (!invitation.addInWhiteList) {
      return;
    }

    const existingWhiteListEntry = await this.phoneWhiteListRepository.findOne({
      where: {
        phoneNumber: invitation.phoneNumber,
        countryCode: invitation.countryCode,
        organizationId: invitation.organizeId,
      },
    });

    if (!existingWhiteListEntry) {
      const phoneWhiteList = this.phoneWhiteListRepository.create({
        organizationId: invitation.organizeId,
        phoneNumber: invitation.phoneNumber,
        countryCode: invitation.countryCode,
        isActive: true,
        label: `Invited user: ${invitation.firstName} ${invitation.lastName}`,
      });

      await queryRunner.manager.save(phoneWhiteList);
    }
  }

  /**
   * Create CIS relationships for user-organization and user-merchant
   */
  private async createCisRelationships(
    userId: number,
    invitation: Invitation,
  ): Promise<void> {
    try {
      // Get user with CIS number
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'cisNumber'],
      });

      if (!user?.cisNumber) {
        console.warn(
          `User ${userId} does not have CIS number, skipping CIS relationship creation`,
        );
        return;
      }

      // Get organization with CIS number
      const organization = await this.organizationRepository.findOne({
        where: { id: invitation.organizeId },
        select: ['id', 'cisNumber'],
      });

      if (!organization?.cisNumber) {
        console.warn(
          `Organization ${invitation.organizeId} does not have CIS number, skipping organization CIS relationship creation`,
        );
      } else {
        // Get organization role name
        const orgRole = await this.roleService.getRoleIdAndNameById(
          invitation.roleId,
        );

        if (orgRole?.name) {
          // Create user-organization relationship in CIS
          await this.cisService.createRelationship(
            user.cisNumber,
            organization.cisNumber,
            RelationType.EMPLOYEE,
            orgRole.name,
            false,
          );
        }
      }

      // Create user-merchant relationships in CIS
      if (invitation.merchantInfo && invitation.merchantInfo.length > 0) {
        const merchantIds = invitation.merchantInfo.map((m) => m.merchantId);
        const merchants = await this.merchantRepository.findByIds(merchantIds, {
          select: ['id', 'cisNumber'],
        });

        for (const merchantData of invitation.merchantInfo) {
          const merchant = merchants.find(
            (m) => m.id === merchantData.merchantId,
          );

          if (!merchant?.cisNumber) {
            console.warn(
              `Merchant ${merchantData.merchantId} does not have CIS number, skipping CIS relationship creation`,
            );
            continue;
          }

          // Get merchant role name
          const merchantRole = await this.roleService.getRoleIdAndNameById(
            merchantData.roleId,
          );

          if (merchantRole?.name) {
            // Create user-merchant relationship in CIS
            await this.cisService.createRelationship(
              user.cisNumber,
              merchant.cisNumber,
              RelationType.EMPLOYEE,
              merchantRole.name,
              false,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error creating CIS relationships:', error);
      // Don't throw error to avoid breaking the invitation process
      // CIS relationships can be created later if needed
    }
  }

  /**
   * Handle invitation acceptance logic
   */
  private async handleInvitationAccept(
    invitation: Invitation,
    queryRunner: any,
  ): Promise<InvitationResponseDto> {
    // Validate role
    await this.roleService.validateRole(invitation.roleId);

    // Validate merchants in batch
    await this.validateMerchants(invitation.merchantInfo);

    // Validate and get user ID
    const userId = await this.validateUserExists(invitation);

    // Create user organization relationship
    await this.createUserOrganization(userId, invitation, queryRunner);

    // Create user merchant relationships
    await this.createUserMerchants(userId, invitation, queryRunner);

    // Add to phone whitelist if needed
    await this.addToPhoneWhitelist(invitation, queryRunner);

    // Create CIS relationships
    await this.createCisRelationships(userId, invitation);

    // Update invitation status
    invitation.status = UserOrganizationInviteStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await queryRunner.manager.save(invitation);

    // Clear all related caches in parallel
    await Promise.all([
      clearCacheByPattern(
        this.cacheManager,
        `invitations:ref:${invitation.refCode}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `invitations:phone:${invitation.countryCode}:${invitation.phoneNumber}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `user:organizations:user:${userId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `organization:users:${invitation.organizeId}:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `register:user-profile:cc:${invitation.countryCode}:pn:${invitation.phoneNumber}:app:*`,
      ),
      clearCacheByPattern(
        this.cacheManager,
        `org:${invitation.organizeId}:permissions:me:user:${userId}`,
      ),
    ]);

    return {
      success: true,
      message: 'Invitation accepted successfully',
      status: UserOrganizationInviteStatus.ACCEPTED,
      userId: userId,
      organizationId: invitation.organizeId,
    };
  }

  /**
   * Handle invitation decline logic
   */
  private async handleInvitationDecline(
    invitation: Invitation,
    queryRunner: any,
  ): Promise<InvitationResponseDto> {
    invitation.status = UserOrganizationInviteStatus.DECLINED;
    await queryRunner.manager.save(invitation);

    // Clear cache for declined invitation
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:ref:${invitation.refCode}:*`,
    );
    await clearCacheByPattern(
      this.cacheManager,
      `invitations:phone:${invitation.countryCode}:${invitation.phoneNumber}:*`,
    );

    return {
      success: true,
      message: 'Invitation declined successfully',
      status: UserOrganizationInviteStatus.DECLINED,
      organizationId: invitation.organizeId,
    };
  }

  /**
   * Respond to invitation (accept or decline)
   */
  async respondToInvitation(
    respondDto: RespondToInvitationDto,
  ): Promise<InvitationResponseDto> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find invitation by refCode
      const invitation = await queryRunner.manager.findOne(Invitation, {
        where: { refCode: respondDto.refCode },
        relations: ['organization'],
      });

      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `organization:users:${invitation.organizeId}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:*`,
        ),
        clearCacheByPattern(this.cacheManager, `merchant:members:*`),
        clearCacheByPattern(this.cacheManager, `user:organizations:user:*`),
      ]);

      // Validate invitation basics
      await this.validateInvitationBasics(invitation);

      // Handle decline
      if (respondDto.response === UserOrganizationInviteStatus.DECLINED) {
        const result = await this.handleInvitationDecline(
          invitation,
          queryRunner,
        );
        await queryRunner.commitTransaction();
        return result;
      }

      // Handle accept
      if (respondDto.response === UserOrganizationInviteStatus.ACCEPTED) {
        const result = await this.handleInvitationAccept(
          invitation,
          queryRunner,
        );
        await queryRunner.commitTransaction();
        return result;
      }

      throw new HttpException(
        {
          message: 'Invalid response type',
          error: { code: 'INVALID_RESPONSE_TYPE' },
        },
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to respond to invitation');
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Approve invitation and send email
   */
  async approveInvitation(
    approveDto: ApproveInvitationDto,
    urlOrigin: string,
    platform: Platform = Platform.SELLER,
  ): Promise<ApproveInvitationResponseDto> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find invitation by refCode
      const invitation = await queryRunner.manager.findOne(Invitation, {
        where: { refCode: approveDto.refCode },
        relations: ['organization', 'role', 'invitedByUser'],
      });
      await clearCacheByPattern(this.cacheManager, `organization:users:*`);
      await clearCacheByPattern(
        this.cacheManager,
        `organization:store-member-count:${invitation.organizeId}:*`,
      );

      if (!invitation) {
        throw new HttpException(
          {
            message: 'Invitation not found',
            error: { code: 'INVITATION_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if the response value from approveDto is NOT either ACCEPTED or REJECTED
      if (
        !(
          approveDto.respond === UserOrganizationInviteStatusApprove.APPROVE ||
          approveDto.respond === UserOrganizationInviteStatusApprove.REJECTED
        )
      ) {
        throw new HttpException(
          {
            message:
              'Invalid invitation response. Must be either ACCEPTED or REJECTED.',
            error: { code: 'INVALID_INVITATION_RESPONSE' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if invitation is in WAIT_FOR_APPROVE status
      if (invitation.status !== UserOrganizationInviteStatus.WAIT_FOR_APPROVE) {
        throw new HttpException(
          {
            message: `Invitation is not in WAIT_FOR_APPROVE status. Current status: ${invitation.status}`,
            error: { code: 'INVITATION_INVALID_STATUS' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if invitation has expired
      if (invitation.expiresAt && new Date() > invitation.expiresAt) {
        throw new HttpException(
          {
            message: 'Invitation has expired',
            error: { code: 'INVITATION_EXPIRED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      let orgName: string;
      if (
        invitation.organization.organizationType == OrganizationType.PERSONAL
      ) {
        orgName = invitation.organization?.organizeName;
      } else if (
        invitation.organization.organizationType ==
        OrganizationType.REGISTERED_INDIVIDUAL
      ) {
        orgName = `ร้าน ${invitation.organization?.organizeName}`;
      } else if (invitation.organization.juristicTypeId) {
        const juristicType = await this.juristicTypeRepository.findOne({
          where: { id: invitation.organization.juristicTypeId },
        });
        orgName = `${juristicType.prefix} ${invitation.organization?.organizeName}`;
        if (juristicType.subfix) {
          orgName += ` ${juristicType.subfix}`;
        }
      } else {
        orgName = invitation.organization?.organizeName;
      }

      // Update invitation status to SENT or REJECTED
      invitation.status = UserOrganizationInviteStatus.SENT;
      invitation.approvedAt = new Date();
      if (approveDto.respond === UserOrganizationInviteStatusApprove.REJECTED) {
        invitation.status = UserOrganizationInviteStatus.REJECTED;
      }
      await queryRunner.manager.save(invitation);

      // Clear cache for approved/rejected invitation in parallel
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `invitations:ref:${invitation.refCode}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `invitations:phone:${invitation.countryCode}:${invitation.phoneNumber}:*`,
        ),
      ]);

      // Send invitation email via queue
      if (approveDto.respond === UserOrganizationInviteStatusApprove.APPROVE) {
        try {
          this.inviteMemberQueue.add('send-email', {
            email: invitation.email,
            orgName: orgName || 'Unknown Organization',
            inviteeName: `${invitation?.firstName} ${invitation?.lastName}`.trim(),
            inviterName: `${invitation?.invitedByUser?.firstNameTh} ${invitation?.invitedByUser?.lastNameTh}`,
            roleName: invitation.role.displayName, // Can be enhanced to get actual role info
            expiresAt: invitation.expiresAt
              ? invitation.expiresAt.toLocaleString('th-TH', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null,
            refCode: invitation.refCode,
            link: await this.organizationService.genInvitationLink(
              invitation.refCode,
              'member',
              urlOrigin,
              platform,
            ),
          });
        } catch (emailError) {
          console.error('Failed to add email job to queue:', emailError);
          // Don't fail the whole process if queue fails
        }
      }
      await queryRunner.commitTransaction();

      return {
        success: true,
        successMessage: 'Invitation approved and email sent successfully',
        status: invitation.status,
        organizationId: invitation.organizeId,
        emailSentTo: invitation.email,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to approve invitation');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate unique reference code
   */
  private generateRefCode(): string {
    return `INV-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  /**
   * Update expired invitations status to EXPIRED for a specific organization
   * @param organizationId Organization ID to check invitations for
   */
  async updateExpiredInvitations(organizationId: number): Promise<void> {
    const now = new Date();

    await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ status: UserOrganizationInviteStatus.EXPIRED })
      .where('organizeId = :organizationId', { organizationId })
      .andWhere('expiresAt < :now', { now })
      .andWhere('status IN (:...validStatuses)', {
        validStatuses: [
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.SENT,
        ],
      })
      .execute();
  }

  /**
   * Update expired invitations for a specific approver organization (by approverOrgId)
   * Updates ALL expired invitations where this organization is the approver
   */
  async updateExpiredInvitationsApprover(approvalOrgId: number): Promise<void> {
    const now = new Date();
    await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ status: UserOrganizationInviteStatus.EXPIRED })
      .where('approverOrgId = :approvalOrgId', { approvalOrgId })
      .andWhere('expiresAt < :now', { now })
      .andWhere('status IN (:...validStatuses)', {
        validStatuses: [
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.SENT,
        ],
      })
      .execute();
  }

  async updateExpiredInvitationsByPhoneNumber(phoneNumber: string): Promise<void> {
    const now = new Date();
    await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ status: UserOrganizationInviteStatus.EXPIRED })
      .where('phoneNumber = :phoneNumber', { phoneNumber })
      .andWhere('expiresAt < :now', { now })
      .andWhere('status IN (:...validStatuses)', {
        validStatuses: [
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.SENT,
        ],
      })
      .execute();
  }

  async findEmailInInvite(email: string) {
    return await this.invitationRepository.findOne({
      where: {
        email,
        status: In([
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
        ]),
      },
    });
  }

  async softDelete(id: number) {
    return await this.invitationRepository.softDelete(id);
  }

  /**
   * Find invitations by organization with flexible status filtering
   * Combines logic from approve-request-history and invite-status-approve
   * Uses database-level pagination (.skip/.take) for better performance
   * Returns invitation fields directly from table with relations
   */
  async findInvitationsByOrganization(
    organizationId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      inviteStatus?: UserOrganizationInviteStatus[];
    } = {},
  ): Promise<PaginationType<Invitation>> {
    const { page = 1, limit = 10, search, inviteStatus } = options;
    const skip = (page - 1) * limit;

    // Update expired invitations before querying
    await this.updateExpiredInvitationsApprover(organizationId);

    // Default to all statuses if not specified
    const statuses = inviteStatus?.length
      ? inviteStatus
      : [
          UserOrganizationInviteStatus.ACCEPTED,
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.EXPIRED,
          UserOrganizationInviteStatus.REJECTED,
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.DECLINED,
          UserOrganizationInviteStatus.CANCELLED,
        ];

    const queryBuilder = this.invitationRepository
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.email',
        'inv.firstName',
        'inv.lastName',
        'inv.countryCode',
        'inv.phoneNumber',
        'inv.refCode',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.approvedAt',
        'inv.roleId',
        'inv.organizeId',
        'inv.approverOrgId',
        'role.id',
        'role.name',
        'role.displayName',
        'invitedByUser.id',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.id',
        'organization.organizeName',
        'juristic.prefix',
        'juristic.subfix',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      .leftJoin('organization.juristic', 'juristic')
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.status IN (:...statuses)', { statuses });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('inv.createdAt', 'DESC')
      .addOrderBy('inv.firstName', 'ASC')
      .skip(skip)
      .take(limit);

    // Single query for both data and count
    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      meta: {
        page,
        pageLimit: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
      items,
    };
  }

  /**
   * Find invitations sent to the current user (by phone number) within an organization
   * Combines logic from inviteStatus and inviteMultipleStatus
   * Looks up the user's phone number, then queries invitations matching that phone
   */
  async findMyInvitations(
    organizationId: number,
    userId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      inviteStatus?: UserOrganizationInviteStatus[];
    } = {},
  ): Promise<PaginationType<Invitation>> {
    const { page = 1, limit = 10, search, inviteStatus } = options;
    const skip = (page - 1) * limit;

    // Lightweight lookup – only need the phone number
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'tel'],
    });

    // If user has no phone number we cannot match any invitation
    if (!user?.tel) {
      return {
        meta: { page, pageLimit: limit, totalItems: 0, totalPages: 0 },
        items: [],
      };
    }

    const userTel = user.tel;

    // Update expired invitations before querying
    await this.updateExpiredInvitationsByPhoneNumber(userTel);

    // Default to all statuses if not specified
    const statuses = inviteStatus?.length
      ? inviteStatus
      : [
          UserOrganizationInviteStatus.ACCEPTED,
          UserOrganizationInviteStatus.SENT,
          UserOrganizationInviteStatus.EXPIRED,
          UserOrganizationInviteStatus.REJECTED,
          UserOrganizationInviteStatus.WAIT_FOR_APPROVE,
          UserOrganizationInviteStatus.DECLINED,
          UserOrganizationInviteStatus.CANCELLED,
        ];

    const queryBuilder = this.invitationRepository
      .createQueryBuilder('inv')
      .select([
        'inv.id',
        'inv.email',
        'inv.firstName',
        'inv.lastName',
        'inv.countryCode',
        'inv.phoneNumber',
        'inv.refCode',
        'inv.status',
        'inv.expiresAt',
        'inv.createdAt',
        'inv.approvedAt',
        'inv.roleId',
        'inv.organizeId',
        'inv.approverOrgId',
        'role.id',
        'role.name',
        'role.displayName',
        'invitedByUser.id',
        'invitedByUser.firstNameTh',
        'invitedByUser.lastNameTh',
        'organization.id',
        'organization.organizeName',
        'juristic.prefix',
        'juristic.subfix',
      ])
      .leftJoin('inv.role', 'role')
      .leftJoin('inv.invitedByUser', 'invitedByUser')
      .leftJoin('inv.organization', 'organization')
      .leftJoin('organization.juristic', 'juristic')
      .where('inv.approverOrgId = :organizationId', { organizationId })
      .andWhere('inv.phoneNumber = :userTel', { userTel })
      .andWhere('inv.status IN (:...statuses)', { statuses });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(inv.firstName LIKE :search OR inv.lastName LIKE :search OR inv.email LIKE :search OR inv.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('inv.createdAt', 'DESC')
      .addOrderBy('inv.firstName', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      meta: {
        page,
        pageLimit: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
      items,
    };
  }
}
