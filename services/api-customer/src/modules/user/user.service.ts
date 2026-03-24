import { DraftUserAddress } from '@/model/draft-user-address.entity';
import { DraftUser } from '@/model/draft-user.entity';
import { UserOrganizationInviteStatus } from '@/model/enum/user-organization.enum';
import {
  ContactType,
  Platform,
  UsagePurposeType,
} from '@/model/organization-contact.entity';
import { Type } from '@/model/organization.entity';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Job, Queue } from 'bull';
import { Cache } from 'cache-manager';
import { I18nContext } from 'nestjs-i18n';
import { getConnection, Not, Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { Customer } from '../../model/customer.entity';
import {
  OnBoardingStep,
  RegisterStep,
  UserStatus,
} from '../../model/enum/user.enum';
import { ImageUpload } from '../../model/image-upload.entity';
import { Merchant, MerchantStatus } from '../../model/merchant.entity';
import { AddressTypeEnum } from '../../model/user-address.entity';
import { UserIdentityDocument } from '../../model/user-identity-document.entity';
import { kycStatus, User, UserRole } from '../../model/user.entity';
import { clearCacheByPattern } from '../../utils';
import {
  convertMimeTypeToFileType,
  isNonEmptyString,
  isValidThaiID,
} from '../../utils/utils';
import { AuthCenterService } from '../auth-center/auth-center.service';
import { CisService } from '../cis/cis.service';
import {
  AddressTypeCis,
  ContactTypeCIS,
  CustomerStatusCIS,
  DocumentAttachType,
  DocumentTypeCis,
  DocumentTypeCodeFromCis,
  GenderCIS,
  JuristicTypeCIS,
  KycStatusCIS,
  MaritalStatusCIS,
  PlatformCIS,
  PlatformTypeCIS,
  RoleBusinessTypeCIS,
  UsagePurposeTypeCIS,
} from '../cis/enum/cis.enum';
import {
  AddressInfoCis,
  AddVerifyUserInfoCis,
  CreateCustomerAddressCis,
  DocumentAttachItem,
  UpdatePersonalProfileCis,
} from '../cis/interfaces/api-request.interface';
import { ImageUploadDto } from '../image-upload/dto/image-upload.dto';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { OrganizationContactService } from '../organization-contact/organization-contact.service';
import { OrganizationDto } from '../organization/dto/organization.dto';
import { UpdateOrganizationUserDto } from '../organization/dto/update-organization-user.dto';
import { OrganizationService } from '../organization/organization.service';
import { UserInfo } from '../register/interface/register.interface';
import { UserAddressService } from '../user-address/user-address.service';
import { UserMerchantService } from '../user-merchant/user-merchant.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { ChangeEmailUserDto } from './dto/change-email-user.dto';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import { CreateUserFromExternalDto } from './dto/create-external-user.dto';
import { CreateUserOrganizeDto } from './dto/create-user-organize.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  CreateDraftUserAddressDto,
  CreateDraftUserDto,
  UpdateDraftUserDto,
} from './dto/draft-user.dto';
import {
  IdentityVerificationDto,
  IdentityVerificationResponseDto,
  UploadIdentityVerificationDto,
} from './dto/identity-verification/identity-verification.dto';
import { SendChangeEmailDto } from './dto/send-change-email.dto';
import { SetPasswordUserDto } from './dto/set-password-user.dto';
import { UpdateLastAccessedDto } from './dto/update-last-accessed.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DocumentType } from './dto/upload-document-to-cis.dto';
import { UserDto } from './dto/user.dto';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    @InjectRepository(UserIdentityDocument)
    private readonly userIdentityDocumentRepo: Repository<UserIdentityDocument>,
    @InjectRepository(DraftUser)
    private readonly draftUserRepo: Repository<DraftUser>,
    @InjectRepository(DraftUserAddress)
    private readonly draftUserAddressRepo: Repository<DraftUserAddress>,
    private imageUploadService: ImageUploadService,
    private mailService: MailService,
    private userAddressService: UserAddressService,
    private cisService: CisService,
    private userMerchantService: UserMerchantService,
    private userOrganizationService: UserOrganizationService,
    private organizationService: OrganizationService,
    private authCenterService: AuthCenterService,
    private organizationContactService: OrganizationContactService,
    @InjectQueue('user-consumer')
    private userQueue: Queue,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  public async create(createUserDto: CreateUserDto) {
    const merchants = await createUserDto.merchantIds.map(async (id) => {
      return await this.merchantRepo.findOne(id);
    });

    const resultMerchants = await Promise.all(merchants).then((values) => {
      return values;
    });

    const dto = {
      ...createUserDto,
      merchants: resultMerchants,
    };

    const user = User.create(dto);
    await user.save();

    delete user.password;
    return user;
  }

  public async showById(id: number): Promise<User> {
    const user = await this.findById(id);
    console.log('test');
    delete user.password;
    delete user.originalPassword;
    return user;
  }

  public async showByUuid(uuid: string): Promise<User> {
    const user = await this.findByUuid(uuid);

    delete user.password;
    delete user.originalPassword;
    return user;
  }

  public async update(
    uuid: string,
    file,
    dto: UpdateUserDto,
    i18n: I18nContext,
  ): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { uuid } });
    const merchants = await dto.merchantIds?.map(async (id) => {
      const parent = await this.merchantRepo.findOne(id);

      return parent;
    });
    const imageUploadDto: ImageUploadDto = file
      ? await this.imageUploadService.uploadWithoutFolder(file)
      : null;
    const imageUpload: ImageUpload = imageUploadDto
      ? await this.imageUploadRepo.findOne(imageUploadDto?.id)
      : undefined;

    const resultMerchants = await Promise.all(merchants ? merchants : []).then(
      (values) => {
        return values;
      },
    );

    if (dto?.tel) {
      const users = await this.userRepo.findOne({
        where: {
          id: Not(user?.id),
          tel: dto?.tel,
          role: user?.role,
        },
      });

      if (users) {
        throw new Error(i18n.t('errors.TEL_EXISTS'));
      }
    }

    if (dto?.email && user?.role === UserRole.ADMIN) {
      const users = await this.userRepo.findOne({
        where: {
          id: Not(user?.id),
          email: dto?.email,
          role: user?.role,
        },
      });

      if (users) {
        throw new Error(i18n.t('errors.EMAIL_EXISTS'));
      }
    }

    const updateDto = {
      ...dto,
      imageUpload,
      merchants:
        resultMerchants && resultMerchants.length > 0
          ? resultMerchants
          : undefined,
    };

    const userEntity = UserDto.toEntity(updateDto);

    const result = await this.userRepo.save(Object.assign(user, userEntity));
    delete result.password;
    delete result.originalPassword;

    return result;
  }

  public async updateUserProfile(
    uuid: string,
    imageProfileFile,
    dto: UpdateUserDto,
  ) {
    const appId = process.env.APP_ID_SELLER;
    const user = await this.userRepo.findOne({ where: { uuid } });

    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    const cisNumber = user.cisNumber;
    if (!cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // update personal profile to cis
    try {
      await this.cisService.updatePersonalProfile({
        app_id: appId,
        cis_number: user.cisNumber,
        first_name: dto?.firstNameTh,
        middle_name: dto?.middleNameTh,
        last_name: dto?.lastNameTh,
        customer_status: CustomerStatusCIS.CUSTOMER,
        is_allow_concern: true,
        active_status: true,
      });
    } catch (error) {
      throw new HttpException(
        {
          message: 'Update personal profile failed',
          data: { code: 'UPDATE_PERSONAL_PROFILE_FAILED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // update businessType CIS
    if (dto?.businessType?.length) {
      try {
        await this.updateBusinessTypeToCis(user, dto.businessType);
      } catch (error) {
        throw new HttpException(
          {
            message: 'Update business type failed',
            data: { code: 'UPDATE_BUSINESS_TYPE_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (imageProfileFile) {
      // Get attachments for the user
      const attachments = await this.cisService.getAttachDocuments(
        appId,
        user.cisNumber,
        DocumentAttachType.IMAGE_PROFILE,
        null,
        false,
      );

      if (attachments.data.documents?.length > 0) {
        attachments.data?.documents?.forEach(async (data) => {
          await this.cisService.unattachDocument(appId, user.cisNumber, [
            {
              document_attach_type: DocumentAttachType.IMAGE_PROFILE,
              document_id: data.id,
            },
          ]);

          // Then delete the old document
          await this.cisService.deleteDocument(appId, [data.id]);
        });
      }
      // Upload new image profile
      const uploadResponse = await this.cisService.uploadDocument(
        appId,
        imageProfileFile,
      );
      const documentId = uploadResponse.data.id;

      const documentItem: DocumentAttachItem = {
        document_attach_type: DocumentAttachType.IMAGE_PROFILE,
        document_id: documentId,
      };

      // Attach the new document
      await this.cisService.attachDocument(appId, user.cisNumber, [
        documentItem,
      ]);
    }

    if (dto?.tel) {
      this.cisService.updateCustomerContactDetail(cisNumber, {
        contactType: 1,
        contactDetail: dto.tel,
      });
    }

    if (dto?.email) {
      this.cisService.updateCustomerContactDetail(cisNumber, {
        contactType: 2,
        contactDetail: dto.email,
      });
    }

    if (dto?.businessType?.length) {
      this.updateBusinessTypeToCis(user, dto.businessType);
    }

    const userEntity = UserDto.toEntity(dto);

    const result = await this.userRepo.save(Object.assign(user, userEntity));
    delete result.password;
    delete result.originalPassword;

    return {
      statusCode: HttpStatus.OK,
      data: result,
      message: 'Update user profile successfully',
    };
  }

  public async setCustomerPassword(dto: SetPasswordUserDto, userId: any) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.CUSTOMER,
      },
    });
    const userDto = {
      password: await bcrypt.hash(dto?.password, 8),
    };
    const userEntity = UserDto.toEntity(userDto);

    return await this.userRepo.save(Object.assign(user, userEntity));
  }

  public async setAdminPassword(dto: SetPasswordUserDto, userId: any) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.ADMIN,
      },
    });

    const userDto = {
      password: await bcrypt.hash(dto?.password, 8),
    };
    const userEntity = UserDto.toEntity(userDto);

    return await this.userRepo.save(Object.assign(user, userEntity));
  }

  public async verifyAdminEmail(userId: any) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.ADMIN,
        status: UserStatus.PENDING,
      },
    });

    const userDto = {
      status: UserStatus.ACTIVE,
    };

    const userEntity = UserDto.toEntity(userDto);
    const userUpdated = await this.userRepo.save(
      Object.assign(user, userEntity),
    );

    const userUp: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    this.mailService.sendAdminUserEmailVerifySuccess(userUp);

    return userUpdated;
  }

  public async sendAdminChangeEmail(
    dto: SendChangeEmailDto,
    userId: any,
    accessToken: any,
    i18n: I18nContext,
  ) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
      },
    });

    if (dto?.email) {
      const users = await this.userRepo.findOne({
        where: {
          id: Not(user?.id),
          email: dto?.email,
          role: UserRole.ADMIN,
        },
      });

      if (users) {
        throw new Error(i18n.t('errors.EMAIL_EXISTS'));
      }
    }

    const access_token = accessToken;
    this.mailService.sendAdminUserChangeEmail(user, access_token, dto.email);
  }

  public async changeUserPassword(
    dto: ChangePasswordUserDto,
    userId: any,
    i18n: I18nContext,
  ) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
      },
    });

    if (!(await user?.validatePassword(dto?.oldPassword))) {
      throw new Error(i18n.t('errors.WRONG_PASSWORD'));
    }

    const userDto = {
      password: await bcrypt.hash(dto?.newPassword, 8),
    };
    const userEntity = UserDto.toEntity(userDto);

    return await this.userRepo.save(Object.assign(user, userEntity));
  }

  public async changeUserEmail(
    dto: ChangeEmailUserDto,
    userId: any,
    i18n: I18nContext,
  ) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
      },
    });

    if (dto?.email) {
      const users = await this.userRepo.findOne({
        where: {
          id: Not(user?.id),
          email: dto?.email,
          role: UserRole.ADMIN,
        },
      });

      if (users) {
        throw new Error(i18n.t('errors.EMAIL_EXISTS'));
      }
    }

    const userDto = {
      email: dto?.email,
    };

    const userEntity = UserDto.toEntity(userDto);
    const userUpdated = await this.userRepo.save(
      Object.assign(user, userEntity),
    );

    const userUp: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.ADMIN,
      },
    });

    this.mailService.sendAdminUserChangeEmailSuccess(userUp);

    return userUpdated;
  }

  public async changeCustomerPassword(
    dto: ChangePasswordUserDto,
    userId: any,
    i18n: I18nContext,
  ) {
    const user: User = await this.userRepo.findOne({ id: userId.userId });

    if (!(await user?.validatePassword(dto?.oldPassword))) {
      throw new Error(i18n.t('errors.WRONG_PASSWORD'));
    }

    const userDto = {
      password: await bcrypt.hash(dto?.newPassword, 8),
    };
    const userEntity = UserDto.toEntity(userDto);

    return await this.userRepo.save(Object.assign(user, userEntity));
  }

  public async currentMerchant(userId: any, slug: string): Promise<Merchant> {
    const user = await this.userRepo.findOne(userId, {
      relations: ['merchants'],
    });

    const currentMerchant = user?.merchants?.find(
      (merchant) => merchant.slug === slug,
    );

    if (currentMerchant === undefined) {
      throw new Error("Can't find merchant");
    }

    return currentMerchant;
  }

  public async requestMerchantBySlug(slug: any): Promise<any> {
    // Cache key for merchant with full relations
    const cacheKey = `merchant:full:${slug}`;

    // Try to get from cache first
    const cachedMerchant = await this.cacheManager.get(cacheKey);
    if (cachedMerchant) {
      return cachedMerchant;
    }

    // If not in cache, query database
    const merchant = await this.merchantRepo
      .createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.merchantLogo', 'merchantLogo')
      .leftJoinAndSelect('merchantLogo.imageUpload', 'logoImage')
      .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
      .leftJoinAndSelect('merchantIcon.imageUpload', 'iconImage')
      .leftJoinAndSelect('merchant.merchantCategory', 'merchantCategory')
      .where('merchant.slug = :slug', { slug })
      .select([
        'merchant.id',
        'merchant.slug',
        'merchant.merchantName',
        'merchant.tel',
        'merchant.email',
        'merchant.status',
        'merchantLogo.id',
        'logoImage.id',
        'logoImage.name',
        'logoImage.url',
        'merchantIcon.id',
        'iconImage.id',
        'iconImage.name',
        'iconImage.url',
        'merchantCategory.id',
        'merchantCategory.name',
      ])
      .getOne();

    if (merchant === undefined) {
      throw new HttpException(
        'errors.CANT_FIND_MERCHANT',
        HttpStatus.NOT_FOUND,
      );
    }

    if (merchant.status === MerchantStatus.INACTIVE) {
      throw new HttpException(
        'errors.CANT_FIND_MERCHANT',
        HttpStatus.MOVED_PERMANENTLY,
      );
    }

    // TODO: For free tier
    // if (
    //   merchant.expiredDate <
    //   new Date(
    //     currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1
    //   )
    // ) {
    //   throw new HttpException(
    //     'errors.CANT_FIND_MERCHANT',
    //     HttpStatus.NOT_ACCEPTABLE
    //   );
    // }

    const result = {
      ...merchant,
    };

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  public async requestMerchantSlugByDomain(domain: any): Promise<any> {
    const merchant = await this.merchantRepo.findOne({
      where: { domain },
    });

    return merchant?.slug;
  }

  public async requestCurrentMerchant(dto: any, slug: any): Promise<Merchant> {
    const user = await this.userRepo.findOne(dto.userId, {
      relations: ['merchants'],
    });

    const currentMerchant = user?.merchants?.find(
      (merchant) => merchant.slug === slug,
    );

    if (currentMerchant === undefined) {
      throw new Error("Can't find merchant");
    }

    return currentMerchant;
  }

  public async requestCurrentCustomer(dto: any, slug: any): Promise<Customer> {
    const merchant = await this.merchantRepo.findOne({
      where: {
        slug,
      },
    });
    const user = await this.userRepo.findOne({ id: dto.userId });
    const customer = await this.customerRepo.findOne({
      where: {
        user,
        merchant,
      },
      relations: [
        'merchant',
        'customerWallet',
        // 'customerAddresses',
        // 'orders',
        // 'orders.invoice',
        'user',
        'imageUpload',
        // 'customerNotificationConfiguration',
        // 'cart',
        // 'cart.cartItems',
        // 'cart.cartItems.productItem'
      ],
    });

    return customer;
  }

  async findById(id: number) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.merchants', 'merchants')
      .leftJoinAndSelect('merchants.store', 'store')
      .leftJoinAndSelect('user.imageUpload', 'imageUpload')
      .leftJoinAndSelect('merchants.organization', 'organization')
      .leftJoin('user.draftUser', 'draftUser')
      .addSelect(['draftUser.image'])
      .where('user.id = :id', { id })
      .getOne();

    if (user) {
      const rawImage = user.draftUser?.image || null;
      (user as any).imageProfile = rawImage ? JSON.parse(rawImage) : null;
      delete user.draftUser;
    }

    if (user && user.merchants && user.merchants.length > 0) {
      // Get lastAccessedAt data from user_merchants_merchant table
      const userMerchantData = await this.userRepo.manager
        .createQueryBuilder()
        .select([
          'pivot.merchantId',
          'pivot.lastAccessedAt',
          'pivot.createdAt',
          'pivot.updatedAt',
        ])
        .from('user_merchants_merchant', 'pivot')
        .where('pivot.userId = :userId', { userId: id })
        .getRawMany();

      // Add the lastAccessedAt data to each merchant object
      user.merchants.forEach((merchant) => {
        const pivotData = userMerchantData.find(
          (pivot) => pivot.pivot_merchantId === merchant.id,
        );
        (merchant as any).lastAccessedAt =
          pivotData?.pivot_lastAccessedAt || null;
        (merchant as any).isOrganize = merchant.organizeId !== null;
      });
    }

    return user;
  }

  async getUserProfile(uuid: string) {
    const appId = process.env.APP_ID_SELLER;
    const user = await this.userRepo.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new HttpException(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.cisNumber) {
      throw new HttpException(
        {
          message: 'User CIS Number not found',
          code: 'USER_CIS_NUMBER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    delete user.password;
    delete user.originalPassword;

    const userProfile = { ...user, imageProfile: null };
    const attachments = await this.cisService.getAttachDocuments(
      appId,
      user.cisNumber,
      DocumentAttachType.IMAGE_PROFILE,
    );

    if (attachments?.data?.documents?.length) {
      userProfile.imageProfile = attachments?.data?.documents[0];
    }

    return {
      statusCode: HttpStatus.OK,
      data: userProfile,
      message: 'success',
    };
  }

  async updateBusinessTypeToCis(
    user: User,
    businessType: string[],
  ): Promise<any> {
    if (!user.cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const roleBusinessTypeValues = businessType?.map(
      (value: string) =>
        RoleBusinessTypeCIS[value as keyof typeof RoleBusinessTypeCIS],
    );
    await this.cisService.updateUserValue(
      user.cisNumber,
      'ROLE_BUSINESSES',
      roleBusinessTypeValues,
    );

    return {
      data: { message: 'Business type updated successfully' },
    };
  }

  async findByEmail(email: string) {
    return await User.findOne({
      where: { email },
      relations: ['merchants', 'imageUpload'],
    });
  }

  async findSuperAdminByEmail(email: string) {
    return await User.findOne({
      where: {
        email: email,
        role: UserRole.SUPER_ADMIN,
      },
      relations: ['merchants', 'imageUpload'],
    });
  }

  async findByCustomerTel(tel: string, merchant: string) {
    const user = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.merchants', 'merchants')
      .leftJoinAndSelect('user.imageUpload', 'imageUpload')
      .where({
        tel,
        role: UserRole.CUSTOMER,
      })
      .andWhere('merchants.slug = :merchant', { merchant })
      .getOne();

    return user;
  }

  public async delete(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.userRepo.delete(id);
  }

  public async deleteByUuid(uuid: string) {
    const user = await this.userRepo.findOne({ where: { uuid } });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.userRepo.delete(user.id);
  }

  public async setOnboardingStep(onBoardingStep: OnBoardingStep, userId: any) {
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId.userId,
        role: UserRole.ADMIN,
      },
    });
    const userDto = {
      onBoardingStep,
    };
    const userEntity = UserDto.toEntity(userDto);

    return await this.userRepo.save(Object.assign(user, userEntity));
  }

  async findUserOrgByCountryAndPhoneNumber(
    countryCode: string,
    phoneNumber: string,
  ) {
    const userOrgs = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userOrganizations', 'userOrg')
      .leftJoinAndSelect('userOrg.organization', 'organization')
      .leftJoinAndSelect('organization.juristic', 'juristic')
      .leftJoinAndSelect('userOrg.role', 'role')
      .where('user.tel = :tel', { tel: phoneNumber })
      .andWhere('user.countryCode = :countryCode', { countryCode })
      .getOne();
    return userOrgs;
  }

  async findUserOrgByCountryAndEmail(countryCode: string, email: string) {
    const userOrgs = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userOrganizations', 'userOrg')
      .leftJoinAndSelect('userOrg.organization', 'organization')
      .leftJoinAndSelect('organization.juristic', 'juristic')
      .leftJoinAndSelect('userOrg.role', 'role')
      .where('user.email = :email', { email })
      .andWhere('user.countryCode = :countryCode', { countryCode })
      .getOne();
    return userOrgs;
  }

  async findUserById(userId: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id: userId } });
  }

  async findUserOrgById(
    userId: number,
    pagination?: { page: number; limit: number },
    excludeOrganizationType?: string,
  ) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return null;
      }

      // Base query builder for filtering
      let baseCountQuery = this.userRepo.manager
        .createQueryBuilder()
        .select('COUNT(DISTINCT userOrg.id)', 'count')
        .from('user_organization', 'userOrg')
        .where('userOrg.userId = :userId', {
          userId,
        });

      if (excludeOrganizationType) {
        baseCountQuery = baseCountQuery
          .innerJoin(
            'organization',
            'orgCount',
            'orgCount.id = userOrg.organizeId',
          )
          .andWhere('orgCount.organizationType != :excludeOrgType', {
            excludeOrgType: excludeOrganizationType,
          });
      }

      // Get total count of user organizations (regardless of pagination)
      const totalCount = await baseCountQuery.getRawOne();
      const totalOrganizations = parseInt(totalCount.count) || 0;

      // If no pagination, return all data
      if (!pagination || !pagination.limit || !pagination.page) {
        let query = this.userRepo
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.userOrganizations', 'userOrg')
          .leftJoinAndSelect('userOrg.organization', 'organization')
          .leftJoinAndSelect('organization.juristic', 'juristic')
          .leftJoinAndSelect('userOrg.role', 'role')
          .where('user.id = :id', { id: userId });

        if (excludeOrganizationType) {
          query = query.andWhere(
            'organization.organizationType != :excludeOrgType',
            { excludeOrgType: excludeOrganizationType },
          );
        }

        return await query.orderBy('userOrg.id', 'DESC').getOne();
      }

      // Apply pagination to userOrganizations
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Get paginated userOrganization IDs with store filter if needed
      let userOrgIdsQuery = this.userRepo.manager
        .createQueryBuilder()
        .select('DISTINCT userOrg.id', 'id')
        .from('user_organization', 'userOrg')
        .where('userOrg.userId = :userId', {
          userId,
        });

      if (excludeOrganizationType) {
        userOrgIdsQuery = userOrgIdsQuery
          .innerJoin('organization', 'org', 'org.id = userOrg.organizeId')
          .andWhere('org.organizationType != :excludeOrgType', {
            excludeOrgType: excludeOrganizationType,
          });
      }

      const userOrgIds = await userOrgIdsQuery
        .orderBy('userOrg.id', 'DESC')
        .limit(limit)
        .offset(skip)
        .getRawMany();

      const orgIds = userOrgIds.map((item) => item.id);

      // Get user with filtered userOrganizations
      let paginatedUser;
      if (orgIds.length === 0) {
        // If no organizations found, return user with empty userOrganizations
        paginatedUser = {
          ...user,
          userOrganizations: [],
        };
      } else {
        // Get user with filtered userOrganizations and proper ordering
        paginatedUser = await this.userRepo
          .createQueryBuilder('user')
          .leftJoinAndSelect(
            'user.userOrganizations',
            'userOrg',
            'userOrg.id IN (:...orgIds)',
            { orgIds },
          )
          .leftJoinAndSelect('userOrg.organization', 'organization')
          .leftJoinAndSelect('organization.juristic', 'juristic')
          .leftJoinAndSelect('userOrg.role', 'role')
          .where('user.id = :id', { id: userId })
          .orderBy('userOrg.id', 'DESC')
          .getOne();
      }

      // Return with pagination metadata
      return {
        ...paginatedUser,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: orgIds.length,
          totalOrganizations,
          totalPages: Math.ceil(totalOrganizations / pagination.limit),
          hasNext: page < Math.ceil(totalOrganizations / pagination.limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Get user organizations by ID error:', error);
      throw new HttpException(
        {
          message: 'Get user organizations by ID error',
          error: {
            errMsg: error.message,
            code: 'GET_USER_ORGANIZATIONS_BY_ID_ERROR',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async createUserWithPhone(
    phoneNumber: string,
    countryCode: string,
    password: string,
    platform: boolean,
    registerStep?: RegisterStep,
    refreshToken?: string | null,
  ): Promise<User> {
    const userDto = {
      tel: phoneNumber,
      countryCode: countryCode,
      password: password,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isSeller: platform,
      authRefreshToken: refreshToken,
      registerStep: registerStep,
      createdInAuth: new Date(),
    };
    const user = User.create(userDto);
    await user.save();
    return user;
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: {
        tel: phoneNumber,
      },
      relations: ['merchants'],
    });
  }

  public async findByPhoneAndCountryCode(
    phoneNumber: string,
    countryCode: string,
  ): Promise<User | null> {
    return await this.userRepo.findOne({
      where: {
        tel: phoneNumber,
        countryCode: countryCode,
      },
      relations: ['merchants'],
    });
  }

  public async findByIdCard(idCard: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: {
        idCard: idCard,
      },
      relations: ['merchants'],
    });
  }

  /**
   * Update user information by phone number.
   * @param updateData user data to update
   * @param phoneNumber phone number of the user to update
   * @returns Updated user object
   */
  public async updateUser(
    updateData: Partial<User>,
    phoneNumber: string,
  ): Promise<User> {
    try {
      const user = await this.findByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          { message: 'User not found', code: 'USER_NOT_FOUND' },
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(user, updateData);

      const updatedUser = await this.userRepo.save(user);

      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to update user: ${error.message || 'Unknown error'}`,
          code: 'UPDATE_USER_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user by user id
   * @param updateData user data to update
   * @param userId user id of the user to update
   * @returns Updated user object
   */
  public async updateUserById(
    updateData: Partial<User>,
    userId: number,
  ): Promise<User> {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException(
          { message: 'User not found', code: 'USER_NOT_FOUND' },
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(user, updateData);
      const updatedUser = await this.userRepo.save(user);

      delete updatedUser.password;

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to update user: ${error.message || 'Unknown error'}`,
          code: 'UPDATE_USER_FAILED',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async findByTaxId(taxId: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: {
        taxId: taxId,
      },
      relations: ['merchants'],
    });
  }

  /**
   * Check if ID card is already registered
   * @param idCard Thai national ID card number
   * @returns CheckIdCardResponseDto with registration status
   */
  public async checkIdCardRegistration(
    idCard: string,
  ): Promise<{ exists: boolean }> {
    const checkExists = await this.organizationService.checkIdCardNumberExists(
      idCard,
    );
    return checkExists;
  }

  /**
   * Check if registration number is already registered
   * @param regisNumber Registration number
   * @returns CheckIdCardResponseDto with registration status
   */
  public async checkRegisNumberExists(
    regisNumber: string,
  ): Promise<{ exists: boolean }> {
    const checkExists =
      await this.organizationService.checkRegistrationNumberExists(regisNumber);
    return checkExists;
  }

  /**
   * Update user identity verification information
   * @param id User ID
   * @param dto Identity verification data including personal info and addresses
   * @param i18n Internationalization context
   * @returns Updated user data
   */
  public async updateIdentityVerification(
    uuid: string,
    dto: IdentityVerificationDto,
    i18n: I18nContext,
  ): Promise<UserDto> {
    try {
      // Find the user
      const user = await this.userRepo.findOne({ where: { uuid } });
      if (!user) {
        throw new HttpException(
          { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.cisNumber) {
        throw new HttpException(
          {
            message: 'User cis number not found',
            data: { code: 'CIS_NUMBER_NOT_FOUND' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle approval status
      if (dto.sendApproval) {
        await this.updateKycStatus(user);
      }

      let userIdentityInfo: AddVerifyUserInfoCis = null;

      // Process personal information
      if (dto.personalInfo) {
        userIdentityInfo = await this.processPersonalInfo(
          user,
          dto.personalInfo,
        );
      }

      if (dto.addressInfo) {
        userIdentityInfo = await this.processAddressInfo(
          user.id,
          user,
          dto.addressInfo,
          userIdentityInfo,
        );
      }

      // Update or create verify user info in CIS
      if (userIdentityInfo) {
        await this.updateOrCreateVerifyUserInfo(
          user.cisNumber,
          userIdentityInfo,
          user.id,
        );
      }

      // Return updated user data
      const updatedUser = await this.userRepo.findOne({
        where: { id: user.id },
        relations: ['userAddresses'],
      });

      return UserDto.fromEntity(updatedUser);
    } catch (error) {
      console.error('Error updating identity verification:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to update identity verification: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'UPDATE_IDENTITY_VERIFICATION_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update KYC status for user and CIS
   */
  private async updateKycStatus(user: User): Promise<void> {
    user.kycStatus = kycStatus.WAIT_FOR_APPROVE;
    await Promise.all([
      this.userRepo.save(user),
      this.cisService.updateStatusVerify(
        process.env.APP_ID_SELLER,
        user.cisNumber,
        KycStatusCIS.WAIT_FOR_APPROVE,
      ),
    ]);
  }

  /**
   * Process personal information updates
   */
  private async processPersonalInfo(
    user: User,
    personalInfo: any,
  ): Promise<AddVerifyUserInfoCis> {
    // Update user entity
    Object.assign(user, {
      name: `${personalInfo.firstName} ${personalInfo.middleName || ''} ${
        personalInfo.lastName
      }`.trim(),
      firstNameTh: personalInfo.firstName,
      middleNameTh: personalInfo.middleName,
      lastNameTh: personalInfo.lastName,
      firstNameEn: personalInfo.firstNameEn,
      middleNameEn: personalInfo.middleNameEn,
      lastNameEn: personalInfo.lastNameEn,
      birthDate: personalInfo.birthDate
        ? new Date(personalInfo.birthDate)
        : undefined,
      gender: personalInfo.gender,
      maritalStatus: personalInfo.maritalStatus,
      idCard: personalInfo.idCard,
    });

    // Update personal profile in CIS
    const personalProfile: UpdatePersonalProfileCis = {
      app_id: process.env.APP_ID_SELLER,
      cis_number: user.cisNumber,
      first_name: personalInfo.firstName,
      middle_name: personalInfo.middleName || null,
      last_name: personalInfo.lastName,
      customer_status: CustomerStatusCIS.CUSTOMER,
      is_allow_concern: true,
      active_status: true,
    };

    await Promise.all([
      this.userRepo.save(user),
      this.cisService.updatePersonalProfile(personalProfile),
    ]);

    // Return user identity info for CIS
    return {
      app_id: process.env.APP_ID_SELLER,
      cis_number: user.cisNumber,
      first_name: personalInfo.firstName,
      middle_name: personalInfo.middleName || null,
      last_name: personalInfo.lastName,
      first_name_en: personalInfo.firstNameEn,
      middle_name_en: personalInfo.middleNameEn || null,
      last_name_en: personalInfo.lastNameEn,
      birth_day: personalInfo.birthDate.toString().split('T')[0],
      gender: parseInt(GenderCIS[personalInfo.gender]),
      marital_status: parseInt(MaritalStatusCIS[personalInfo.maritalStatus]),
      id_card_number: personalInfo.idCard,
      is_dopa: false,
    };
  }

  /**
   * Process address information updates
   */
  private async processAddressInfo(
    userId: number,
    user: User,
    addressInfo: any,
    userIdentityInfo: AddVerifyUserInfoCis,
  ): Promise<AddVerifyUserInfoCis> {
    let updatedUserIdentityInfo = { ...userIdentityInfo };

    // Process ID Card address
    if (addressInfo.addressIdCard) {
      updatedUserIdentityInfo = await this.processIdCardAddress(
        userId,
        addressInfo.addressIdCard,
        updatedUserIdentityInfo,
      );
    }

    // Process Current address
    if (addressInfo.addressCurrent) {
      updatedUserIdentityInfo = await this.processCurrentAddress(
        userId,
        addressInfo.addressCurrent,
        updatedUserIdentityInfo,
      );
    }

    // Process Tax Invoice address
    if (addressInfo.addressTaxInvoice) {
      await this.processTaxInvoiceAddress(
        userId,
        user,
        addressInfo.addressTaxInvoice,
      );
    }

    return updatedUserIdentityInfo;
  }

  /**
   * Process ID Card address
   */
  private async processIdCardAddress(
    userId: number,
    addressIdCard: any,
    userIdentityInfo: AddVerifyUserInfoCis,
  ): Promise<AddVerifyUserInfoCis> {
    await this.userAddressService.createOrUpdate(
      userId,
      AddressTypeEnum.ID_CARD,
      {
        address: addressIdCard.address,
        countryId: parseInt(addressIdCard.countryId),
        provinceId: parseInt(addressIdCard.provinceId),
        districtId: parseInt(addressIdCard.districtId),
        subDistrictId: parseInt(addressIdCard.subDistrictId),
        zipCode: parseInt(addressIdCard.zipCode),
      },
    );

    return {
      ...userIdentityInfo,
      address_according_id_card: {
        address_info: addressIdCard.address,
        country: parseInt(addressIdCard.countryId),
        province: parseInt(addressIdCard.provinceId),
        district: parseInt(addressIdCard.districtId),
        sub_district: parseInt(addressIdCard.subDistrictId),
        zipcode: parseInt(addressIdCard.zipCode),
        country_name: null,
        province_name: null,
        district_name: null,
        sub_district_name: null,
        zipcode_name: null,
      },
    };
  }

  /**
   * Process Current address
   */
  private async processCurrentAddress(
    userId: number,
    addressCurrent: any,
    userIdentityInfo: AddVerifyUserInfoCis,
  ): Promise<AddVerifyUserInfoCis> {
    const usedAddress = addressCurrent.usedAddress
      ? AddressTypeEnum[addressCurrent.usedAddress]
      : null;

    await this.userAddressService.createOrUpdate(
      userId,
      AddressTypeEnum.CURRENT,
      {
        usedAddress: usedAddress,
        address: addressCurrent.address,
        countryId: parseInt(addressCurrent.countryId),
        provinceId: parseInt(addressCurrent.provinceId),
        districtId: parseInt(addressCurrent.districtId),
        subDistrictId: parseInt(addressCurrent.subDistrictId),
        zipCode: parseInt(addressCurrent.zipCode),
      },
    );

    return {
      ...userIdentityInfo,
      current_address: {
        address_info: addressCurrent.address,
        country: parseInt(addressCurrent.countryId),
        province: parseInt(addressCurrent.provinceId),
        district: parseInt(addressCurrent.districtId),
        sub_district: parseInt(addressCurrent.subDistrictId),
        zipcode: parseInt(addressCurrent.zipCode),
        country_name: null,
        province_name: null,
        district_name: null,
        sub_district_name: null,
        zipcode_name: null,
      },
      current_address_shown_id_card:
        addressCurrent.usedAddress === AddressTypeEnum.ID_CARD,
    };
  }

  /**
   * Process Tax Invoice address
   */
  private async processTaxInvoiceAddress(
    userId: number,
    user: User,
    addressTaxInvoice: any,
  ): Promise<void> {
    const usedAddress = addressTaxInvoice.usedAddress
      ? AddressTypeEnum[addressTaxInvoice.usedAddress]
      : null;

    await this.userAddressService.createOrUpdate(
      userId,
      AddressTypeEnum.TAX_INVOICE,
      {
        usedAddress: usedAddress,
        address: addressTaxInvoice.address,
        countryId: parseInt(addressTaxInvoice.countryId),
        provinceId: parseInt(addressTaxInvoice.provinceId),
        districtId: parseInt(addressTaxInvoice.districtId),
        subDistrictId: parseInt(addressTaxInvoice.subDistrictId),
        zipCode: parseInt(addressTaxInvoice.zipCode),
      },
    );

    // Handle CIS address creation/update
    const userAddresses = await this.userAddressService.findByUserId(userId);
    const addressTaxInvoiceEntity = userAddresses.find(
      (address) => address.addressType === AddressTypeEnum.TAX_INVOICE,
    );

    if (!addressTaxInvoiceEntity) return;

    const taxInvoiceAddress: CreateCustomerAddressCis = {
      app_id: process.env.APP_ID_SELLER,
      cis_number: user.cisNumber,
      platform: PlatformCIS.ALLKONS_M_SELLER,
      address_name: 'ที่อยู่สำหรับออกใบกำกับภาษี',
      address_type: AddressTypeCis.OFFICIAL_ADDRESS,
      address_info: addressTaxInvoice.address,
      country: parseInt(addressTaxInvoice.countryId),
      province: parseInt(addressTaxInvoice.provinceId),
      district: parseInt(addressTaxInvoice.districtId),
      sub_district: parseInt(addressTaxInvoice.subDistrictId),
      zipcode: parseInt(addressTaxInvoice.zipCode),
      is_default: false,
    };

    if (addressTaxInvoiceEntity.cisNumber) {
      // Update existing address
      const addressToUpdate = {
        ...taxInvoiceAddress,
        id: addressTaxInvoiceEntity.cisNumber,
      };
      await this.cisService.updateCustomerAddress(addressToUpdate);
    } else {
      // Create new address
      const createAddress = await this.cisService.createCustomerAddress(
        taxInvoiceAddress,
      );
      const cisNumber = createAddress.data.id;

      // Update user address with cisNumber
      addressTaxInvoiceEntity.cisNumber = cisNumber;
      await this.userAddressService.update(
        addressTaxInvoiceEntity.id,
        addressTaxInvoiceEntity,
      );
    }
  }

  /**
   * Update or create verify user info in CIS
   */
  private async updateOrCreateVerifyUserInfo(
    cisNumber: string,
    userIdentityInfo: AddVerifyUserInfoCis,
    userId: number,
  ): Promise<void> {
    const getVerifyUserInfo = await this.cisService.getVerifyUserInfo(
      process.env.APP_ID_SELLER,
      cisNumber,
    );
    if (getVerifyUserInfo?.data) {
      // Update existing user info
      await this.cisService.updateVerifyUserInfo(userIdentityInfo);
    } else {
      // Add new user info
      await this.cisService.addVerifyUserInfo(userIdentityInfo, userId);
    }
  }

  /**
   * Get user identity verification information
   * @param id User ID
   * @returns User identity verification data
   */
  public async getIdentityVerification(
    uuid: string,
  ): Promise<IdentityVerificationResponseDto> {
    try {
      // Find user with relations
      const user = await this.userRepo.findOne({
        where: { uuid },
      });

      if (!user) {
        throw new HttpException(
          { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }

      // Get user addresses
      const addresses = await this.userAddressService.findByUserId(user.id);

      return IdentityVerificationResponseDto.fromUserAndAddresses(
        user,
        addresses,
      );
    } catch (error) {
      console.error('Error getting identity verification:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to get identity verification: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'GET_IDENTITY_VERIFICATION_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async uploadIdentityFile(
    dto: UploadIdentityVerificationDto,
    file: Express.Multer.File,
  ): Promise<string | null> {
    const user = await this.userRepo.findOne({
      where: { id: parseInt(dto.userId) },
    });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if user has cisNumber
    if (!user.cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sellerAppId = process.env.APP_ID_SELLER;
    if (dto.sendApproval) {
      // Attach document and update status
      user.kycStatus = kycStatus.WAIT_FOR_APPROVE;
      await Promise.all([
        this.cisService.updateStatusVerify(
          sellerAppId,
          user.cisNumber,
          KycStatusCIS.WAIT_FOR_APPROVE,
        ),
        this.userRepo.save(user),
      ]);
    }

    // Get attachments for the user
    const attachments = await this.cisService.getAttachDocuments(
      process.env.APP_ID_SELLER,
      user.cisNumber,
      DocumentAttachType.VERIFY_DOCUMENT,
      null,
      false,
    );

    if (attachments.data.documents?.length > 0) {
      // Check if the document already exists
      const existingAttachment = attachments.data.documents.find(
        (doc) => doc.document_type === DocumentTypeCis[dto.documentType],
      );

      if (existingAttachment) {
        // Document exists - unattach old document first
        await this.cisService.unattachDocument(sellerAppId, user.cisNumber, [
          {
            document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
            document_id: existingAttachment.id,
          },
        ]);

        // Then delete the old document
        await this.cisService.deleteDocument(sellerAppId, [
          existingAttachment.id,
        ]);
      }
    }

    // Upload new document
    const uploadResponse = await this.cisService.uploadDocument(
      sellerAppId,
      file,
    );
    const documentId = uploadResponse.data.id;

    const documentItem: DocumentAttachItem = {
      document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
      document_id: documentId,
      document_type: DocumentTypeCis[dto.documentType],
    };

    // Attach the new document
    await this.cisService.attachDocument(sellerAppId, user.cisNumber, [
      documentItem,
    ]);

    const message = attachments.data.documents?.find(
      (doc) => doc.document_type === DocumentTypeCis[dto.documentType],
    )
      ? 'Document updated successfully'
      : 'Document saved successfully';

    return message;
  }

  /**
   * Get identity documents for a user
   * @param userId User ID to retrieve documents for
   * @returns List of identity documents
   */
  public async getIdentityVerifyDocuments(
    uuid: string,
  ): Promise<UserIdentityDocument[]> {
    const user = uuid ? await this.userRepo.findOne({ where: { uuid } }) : null;
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    const cisNumber = user.cisNumber;
    if (!cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sellerAppId = process.env.APP_ID_SELLER;
    const documentResponse = await this.cisService.getAttachDocuments(
      sellerAppId,
      cisNumber,
      DocumentAttachType.VERIFY_DOCUMENT,
      null,
      false,
    );
    const documents = documentResponse.data.documents;

    // Map documents to UserIdentityDocument format
    if (!documents?.length) {
      return [];
    }
    const userIdentityDocuments: UserIdentityDocument[] = documents.map(
      (doc) => {
        const userDoc = new UserIdentityDocument();
        userDoc.id = doc.id; // Assuming id is the document ID from CIS
        userDoc.documentType =
          DocumentTypeCodeFromCis[doc.document_type] || null;
        userDoc.fileName = doc.file_name;
        userDoc.fileType = doc.file_type;
        userDoc.fileSize = doc.file_size;
        userDoc.createdAt = doc.create_at;
        userDoc.updatedAt = doc.update_at;
        return userDoc;
      },
    );
    return userIdentityDocuments;
  }

  /**
   * Get file document by document ID
   * @param userId User ID (for validation)
   * @param documentId Document ID to retrieve file for
   * @returns File data with base64 content and buffer
   */
  public async getFileDocument(
    uuid: string,
    documentId: string,
  ): Promise<{
    fileName: string;
    fileType: string;
    fileBuffer: Buffer;
    fileSize: number;
  }> {
    const user = await this.userRepo.findOne({ where: { uuid } });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const sellerAppId = process.env.APP_ID_SELLER;
      const documentResponse = await this.cisService.getDocumentById(
        sellerAppId,
        documentId,
      );
      const {
        file_name: fileName,
        file_extension: fileExtension,
        file_size: fileSize,
        file_path: filePath,
      } = documentResponse.data;

      const [fileDocumentsResponse, fileType] = await Promise.all([
        this.cisService.getFileDocuments(sellerAppId, filePath),
        convertMimeTypeToFileType(fileExtension),
      ]);

      return {
        fileName: fileName,
        fileType: fileType,
        fileBuffer: fileDocumentsResponse,
        fileSize: fileSize,
      };
    } catch (error) {
      console.error('Error getting file document:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to get file document: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'GET_FILE_DOCUMENT_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * อัปเดต timestamp lastAccessedAt สำหรับ user และ merchant
   */
  public async updateLastAccessed(
    dto: UpdateLastAccessedDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { userId, merchantId } = dto;

      // ตรวจสอบว่า user มีอยู่จริง
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          {
            message: 'User not found',
            data: { code: 'USER_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // ตรวจสอบว่า merchant มีอยู่จริง
      const merchant = await this.merchantRepo.findOne({
        where: { id: merchantId },
      });

      if (!merchant) {
        throw new HttpException(
          {
            message: 'Merchant not found',
            data: { code: 'MERCHANT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // อัปเดต lastAccessedAt ผ่าน UserMerchantService
      await this.userMerchantService.updateLastAccessedAt(userId, merchantId);

      return {
        success: true,
        message: 'Last accessed timestamp updated successfully',
      };
    } catch (error) {
      console.error('Error updating last accessed:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to update last accessed: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'UPDATE_LAST_ACCESSED_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteIdentityDocument(
    uuid: string,
    documentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userRepo.findOne({ where: { uuid } });
      if (!user) {
        throw new HttpException(
          { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }

      const sellerAppId = process.env.APP_ID_SELLER;
      const documentResponse = await this.cisService.getDocumentById(
        sellerAppId,
        documentId,
      );
      if (!documentResponse || !documentResponse.data) {
        throw new HttpException(
          {
            message: 'Document not found',
            data: { code: 'DOCUMENT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await Promise.all([
        this.cisService.deleteDocument(sellerAppId, [documentId]),
        this.cisService.unattachDocument(sellerAppId, user.cisNumber, [
          {
            document_attach_type: DocumentAttachType.VERIFY_DOCUMENT,
            document_id: documentId,
          },
        ]),
      ]);

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting identity document:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Failed to delete identity document: ${
            error.message || 'Unknown error'
          }`,
          data: { code: 'DELETE_IDENTITY_DOCUMENT_FAILED' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrganization(dto: CreateUserOrganizeDto): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', error: { data: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    const cisNumber = user.cisNumber;
    if (!cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          data: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check tax ID uniqueness
    const checkIdCard = await this.organizationService.findByTaxId(dto.taxId);
    if (checkIdCard) {
      throw new HttpException(
        { message: 'Tax ID already exists', data: { code: 'TAX_ID_EXISTS' } },
        HttpStatus.BAD_REQUEST,
      );
    }

    const juristicCisNumber =
      await this.organizationService.createJuristicProfileCis(cisNumber, dto);

    const organizationPayload: OrganizationDto = {
      taxId: dto.taxId,
      organizeType: parseInt(JuristicTypeCIS[dto.juristicType]),
      organizeName: dto.juristicName,
      cisNumber: juristicCisNumber,
      businessType: dto.businessType as any,
      type: Type.HEAD_OFFICE,
      remarkTypeOther:
        dto.juristicType === JuristicTypeCIS.OTHER ? dto.remarkTypeOther : null,
      mainPhoneNumber: user?.tel,
      mainEmail: user?.email,
      juristicTypeId: dto?.juristicTypeId,
    };

    const organizeInfo = await this.organizationService.createOrganization(
      organizationPayload,
    );

    await this.userOrganizationService.createUserOrganization({
      userId: dto.userId,
      organizationId: organizeInfo.id,
      roleId: 4,
      isOwner: true,
      memberStatus: UserOrganizationInviteStatus.ACCEPTED,
    });

    // Clear cache for user's organizations list
    await clearCacheByPattern(
      this.cacheManager,
      `user:organizations:user:${dto.userId}:*`,
    );

    return {
      ...organizeInfo,
      cisNumber: juristicCisNumber,
    };
  }

  async checkPlatform(uuid: string): Promise<{ isSeller: boolean }> {
    const user = await this.userRepo.findOne({
      where: { uuid },
    });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      isSeller: user.isSeller || false,
    };
  }

  async sendEmailOtp(payload: {
    email: string;
  }): Promise<{ status: string; refno: string; method: string }> {
    return this.authCenterService.sendEmailOtp(payload);
  }

  async verifyEmailOtp(payload: {
    pin: string;
    refno: string;
    email: string;
  }): Promise<{ status: string; message: string }> {
    return await this.authCenterService.verifyEmailOtp(payload);
  }

  async verifyEmailOtpAuthCenter(
    payload: {
      pin: string;
      refno: string;
      email: string;
      userId?: number;
    },
    authToken?: string,
  ): Promise<{ status: string; message: string }> {
    const result = await this.authCenterService.verifyEmailOtp(payload);
    if (result?.data?.status == 'success' && payload.userId) {
      // Update user's email verification status
      const user = await this.userRepo.findOne({
        where: { id: payload.userId },
      });
      if (user) {
        user.email = payload.email;

        const draftUser = await this.draftUserRepo.findOne({
          where: { userId: user.id },
        });
        if (draftUser) {
          draftUser.email = payload.email;
          await this.draftUserRepo.save(draftUser);
        }

        await Promise.all([
          await this.userRepo.save(user),
          await this.authCenterService.upSertEmail(payload.email, authToken),
          await this.cisService.updateCustomerContactDetail(user.cisNumber, {
            contactType: ContactTypeCIS.EMAIL, // Email
            contactDetail: payload.email,
          }),
        ]);

        // Clear user organizations cache since email is displayed in user info
        await clearCacheByPattern(
          this.cacheManager,
          `user:organizations:user:${user.id}:*`,
        );

        // Get all organizations this user belongs to and clear their user lists
        const userOrgs =
          await this.userOrganizationService.findUserOrganizationsByUserId(
            user.id,
          );
        if (userOrgs && userOrgs.length > 0) {
          await Promise.all(
            userOrgs.map((userOrg) =>
              clearCacheByPattern(
                this.cacheManager,
                `organization:users:${userOrg.organizeId}:*`,
              ),
            ),
          );
        }
      }
    }
    return result;
  }

  async checkEmail(dto: { email: string }): Promise<{ exists: boolean }> {
    const emailExists = await this.cisService.checkExistEmail(dto.email);
    return { exists: emailExists.data };
  }

  /**
   * Check if email exists in CIS and local database
   * @param bodyDto Object containing email to check
   * @returns Object with description and existence status
   */
  async checkEmailExists(bodyDto: {
    email: string;
  }): Promise<{ description: string; exists: boolean }> {
    const [cisEmailExists, localEmailExists, authCenterEmailExists] =
      await Promise.all([
        this.checkEmail({ email: bodyDto.email }),
        this.findByEmail(bodyDto.email),
        this.authCenterService.checkExistValue({
          type: 'EMAIL',
          email: bodyDto.email,
        }),
      ]);

    if (cisEmailExists.exists) {
      return { description: 'Email already exists in CIS', exists: true };
    }

    if (localEmailExists) {
      return {
        description: 'Email already exists in local database',
        exists: true,
      };
    }

    if (authCenterEmailExists.isExist) {
      return {
        description: 'Email already exists in Auth Center',
        exists: true,
      };
    }

    return { description: 'Email does not exist', exists: false };
  }

  async checkPlatformWithPhoneNumber(
    phoneNumber: string,
  ): Promise<{ isSeller: boolean }> {
    const user = await this.userRepo.findOne({
      where: { tel: phoneNumber },
    });
    if (!user) {
      throw new HttpException(
        { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      isSeller: user.isSeller || false,
    };
  }

  /**
   * Create a new user from an external system
   * @param dto User data from external system
   * @returns Created User entity
   */
  public async createUserFromExternal(
    dto: CreateUserFromExternalDto,
    refreshToken?: string,
  ): Promise<User> {
    const userDto = {
      tel: dto.phoneNumber,
      countryCode: dto.countryCode,
      firstNameTh: dto.firstName,
      middleNameTh: dto.middleName || null,
      lastNameTh: dto.lastName,
      email: dto.email || null,
      name: `${dto.firstName} ${dto.middleName || ''} ${dto.lastName}`.trim(),

      cisNumber: dto.cisNumber || null,
      createdInAuth: dto.createdInAuth,
      authRefreshToken: refreshToken || null,
      registerStep: RegisterStep.USER_INFO,
      ...(dto.uuid && { uuid: dto.uuid }),
    };

    const user = User.create(userDto);
    await user.save();

    return user;
  }

  /**
   * Create a new user in CIS if not already exists
   * @param phoneNumber Phone number of the user
   * @param userInfo User information to create
   * @param userId User ID to associate with the contact
   * @param authToken Auth token for updating Auth Center
   * @returns New CIS user ID
   */
  public async createUserToThirdParty(
    phoneNumber: string,
    userInfo: UserInfo,
    userId: number,
    authToken: string,
    platform: Platform = Platform.SELLER,
  ): Promise<string> {
    // Create user in CIS
    const cisUser = await this.cisService.createPersonalProfile(userInfo);
    const cisNumber = cisUser.cis_number;

    await Promise.all([
      this.cisService.createPlatformAssociation(cisNumber),
      this.createUserContactPhone({
        phoneNumber: phoneNumber,
        cisNumber: cisNumber,
        userId: userId,
        platform: platform,
      }),
      this.authCenterService.updateAuthCenterCisNumber(cisNumber, authToken),
    ]);

    if (userInfo.email) {
      await this.createUserContactEmail({
        email: userInfo.email,
        cisNumber: cisNumber,
        userId: userId,
        platform: platform,
      });
    }

    return cisNumber;
  }

  /**
   * Create user contact phone in CIS and save in database
   * @param phoneNumber Phone number to create
   * @param countryCode Country code of the phone number
   * @param cisNumber CIS number of the user
   * @param userId User ID to associate with the contact
   */
  public async createUserContactPhone({
    phoneNumber,
    cisNumber,
    userId,
    platform,
  }: {
    phoneNumber: string;
    cisNumber: string;
    userId: number;
    platform: Platform;
  }): Promise<void> {
    // Create user contact phone in CIS
    const contact = await this.cisService.createContactProfile({
      app_id: process.env.APP_ID_SELLER,
      cis_number: cisNumber,
      platform: PlatformTypeCIS[platform],
      contact_type: ContactTypeCIS.PHONE,
      usage_purpose_type: UsagePurposeTypeCIS.NONE_SPECIFIED,
      contact: phoneNumber,
      active_status: true,
      is_verify: true,
      is_default: true,
      is_kyc_document: false,
    });
    const contactCisNumber = contact.data.id;
    // Save user contact phone in database
    await this.organizationContactService.createOrganizationContact({
      userId: userId,
      platform: platform,
      cisNumber: contactCisNumber,
      contactType: ContactType.PHONE,
      contact: phoneNumber,
      usagePurposeType: UsagePurposeType.NONE_SPECIFIED,
      isVerify: true,
      isDefault: true,
      isKycDocument: false,
      activeStatus: true,
    });
  }

  /**
   * Create user contact email in CIS and save in database
   * @param email Email address to create
   * @param cisNumber CIS number of the user
   * @param userId User ID to associate with the contact
   */
  public async createUserContactEmail({
    email,
    cisNumber,
    userId,
    platform,
  }: {
    email: string;
    cisNumber: string;
    userId: number;
    platform: Platform;
  }): Promise<void> {
    // Create user contact email in CIS
    const contact = await this.cisService.createContactProfile({
      app_id: process.env.APP_ID_SELLER,
      cis_number: cisNumber,
      platform: PlatformTypeCIS[platform],
      contact_type: ContactTypeCIS.EMAIL,
      usage_purpose_type: UsagePurposeTypeCIS.NONE_SPECIFIED,
      contact: email,
      active_status: true,
      is_verify: true,
      is_default: true,
      is_kyc_document: false,
    });
    const contactCisNumber = contact.data.id;

    // Save user contact email in database
    await this.organizationContactService.createOrganizationContact({
      userId: userId,
      platform: platform,
      cisNumber: contactCisNumber,
      contactType: ContactType.EMAIL,
      contact: email,
      usagePurposeType: UsagePurposeType.NONE_SPECIFIED,
      isVerify: true,
      isDefault: true,
      isKycDocument: false,
      activeStatus: true,
    });
  }

  /**
   * Update user CIS number and username in Auth Center
   * @param cisNumber CIS number to update
   * @param authToken Auth token for authentication
   * @param username New username to set
   * @param userInfo User information to update
   */
  public async updateUserToAuthCenter(
    authToken: string,
    username: string,
    userInfo: UserInfo,
  ): Promise<void> {
    if (userInfo?.email) {
      await this.authCenterService.upSertEmail(userInfo.email, authToken);
    }
    await Promise.all([
      this.authCenterService.updateAuthCenterUsername(username, authToken),
      this.authCenterService.updateProfile(authToken, userInfo),
    ]);
  }

  public async updateUserProfileByOrg(
    id: number,
    dto: UpdateOrganizationUserDto,
  ) {
    const appId = process.env.APP_ID_SELLER;
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(
        { message: 'User not found', error: { code: 'USER_NOT_FOUND' } },
        HttpStatus.NOT_FOUND,
      );
    }

    const cisNumber = user.cisNumber;
    if (!cisNumber) {
      throw new HttpException(
        {
          message: 'User does not have CIS number',
          error: { code: 'CIS_NUMBER_NOT_FOUND' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // update personal profile to cis
    await this.cisService.updatePersonalProfile({
      app_id: appId,
      cis_number: user.cisNumber,
      first_name: dto?.firstName,
      middle_name: dto?.middleName,
      last_name: dto?.lastName,
      customer_status: CustomerStatusCIS.CUSTOMER,
      is_allow_concern: true,
      active_status: true,
    });

    if (dto?.email) {
      await this.cisService.updateCustomerContactDetail(cisNumber, {
        contactType: 2,
        contactDetail: dto.email,
      });
    }
    Object.assign(user, {
      firstNameTh: dto?.firstName,
      middleNameTh: dto?.middleName,
      lastNameTh: dto?.lastName,
      name: `${dto?.firstName} ${dto?.lastName}`,
    });

    const userEntity = UserDto.toEntity(dto);

    const result = await this.userRepo.save(Object.assign(user, userEntity));
    delete result.password;

    return result;
  }

  /**
   * Find user by phone number
   * @param tel : Phone number
   * @param countryCode : country code
   * @return user entity
   * @returns include : user organizations
   */
  public async findUserByPhone(
    tel: string,
    countryCode: string,
  ): Promise<User> {
    return await this.userRepo.findOne({
      where: {
        tel,
        countryCode,
      },
      relations: ['userOrganizations'],
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email } });
  }

  async findByCisNumber(cisNumber: string) {
    return await this.userRepo.findOne({ where: { cisNumber } });
  }

  async getDraftUser(userId: number) {
    try {
      const draftUser = await this.draftUserRepo.findOne({
        where: { userId },
        relations: [
          'draftUserAddresses',
          'draftUserAddresses.country',
          'draftUserAddresses.province',
          'draftUserAddresses.district',
          'draftUserAddresses.subDistrict',
        ],
      });
      if (!draftUser) {
        const user = await this.userRepo.findOne({
          where: { id: userId },
          relations: ['userAddresses'],
        });
        const createDraftUserDto = new CreateDraftUserDto();
        createDraftUserDto.countryCode = user.countryCode;
        createDraftUserDto.tel = user.tel;
        createDraftUserDto.email = user.email;
        createDraftUserDto.firstNameTh = user.firstNameTh;
        createDraftUserDto.middleNameTh = user.middleNameTh;
        createDraftUserDto.lastNameTh = user.lastNameTh;
        createDraftUserDto.firstNameEn = user.firstNameEn;
        createDraftUserDto.middleNameEn = user.middleNameEn;
        createDraftUserDto.lastNameEn = user.lastNameEn;
        createDraftUserDto.gender = user.gender;
        createDraftUserDto.maritalStatus = user.maritalStatus;
        createDraftUserDto.birthDate = user.birthDate;
        createDraftUserDto.idCard = user.idCard;
        createDraftUserDto.businessType = user.businessType;
        createDraftUserDto.kycStatus = user.kycStatus;
        createDraftUserDto.userId = user.id;
        const createDraftUser = await this.draftUserRepo.save(
          createDraftUserDto,
        );
        if (user.userAddresses.length > 0) {
          const draftUserAddresses = [];
          for (let i = 0; i < user.userAddresses.length; i++) {
            const createDraftUserAddressDto = new CreateDraftUserAddressDto();
            createDraftUserAddressDto.addressType =
              user.userAddresses[i].addressType;
            createDraftUserAddressDto.address = user.userAddresses[i].address;
            createDraftUserAddressDto.countryId =
              user.userAddresses[i].countryId;
            createDraftUserAddressDto.provinceId =
              user.userAddresses[i].provinceId;
            createDraftUserAddressDto.districtId =
              user.userAddresses[i].districtId;
            createDraftUserAddressDto.subDistrictId =
              user.userAddresses[i].subDistrictId;
            createDraftUserAddressDto.isSameAddress =
              user.userAddresses[i].usedAddress;
            createDraftUserAddressDto.draftUserId = createDraftUser.id;
            draftUserAddresses.push(
              await this.draftUserAddressRepo.save(createDraftUserAddressDto),
            );
          }
          createDraftUser['draftUserAddresses'] = draftUserAddresses;
        } else {
          const draftUserAddresses = [];
          const createDraftUserAddressIdCardDto =
            new CreateDraftUserAddressDto();
          createDraftUserAddressIdCardDto.addressType = AddressTypeEnum.ID_CARD;
          createDraftUserAddressIdCardDto.draftUserId = createDraftUser.id;
          draftUserAddresses.push(
            await this.draftUserAddressRepo.save(
              createDraftUserAddressIdCardDto,
            ),
          );
          const createDraftUserAddressCurrentDto =
            new CreateDraftUserAddressDto();
          createDraftUserAddressCurrentDto.addressType =
            AddressTypeEnum.CURRENT;
          createDraftUserAddressCurrentDto.draftUserId = createDraftUser.id;
          draftUserAddresses.push(
            await this.draftUserAddressRepo.save(
              createDraftUserAddressCurrentDto,
            ),
          );
          createDraftUser['draftUserAddresses'] = draftUserAddresses;
        }
        return createDraftUser;
      }
      return draftUser;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Draft user not found',
          error: { code: 'DRAFT_USER_NOT_FOUND' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateDraftUser(
    userId: number,
    updateDraftUserDto: UpdateDraftUserDto,
  ) {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const draftUser = await this.draftUserRepo.findOne({ where: { userId } });
      draftUser.image = updateDraftUserDto.image;
      draftUser.countryCode = updateDraftUserDto.countryCode;
      draftUser.tel = updateDraftUserDto.tel;
      draftUser.email = updateDraftUserDto.email;
      draftUser.firstNameTh = updateDraftUserDto.firstNameTh;
      draftUser.middleNameTh = updateDraftUserDto.middleNameTh;
      draftUser.lastNameTh = updateDraftUserDto.lastNameTh;
      draftUser.firstNameEn = updateDraftUserDto.firstNameEn;
      draftUser.middleNameEn = updateDraftUserDto.middleNameEn;
      draftUser.lastNameEn = updateDraftUserDto.lastNameEn;
      draftUser.gender = updateDraftUserDto.gender;
      draftUser.maritalStatus = updateDraftUserDto.maritalStatus;
      draftUser.birthDate = updateDraftUserDto.birthDate;
      draftUser.idCard = updateDraftUserDto.idCard;
      draftUser.businessType = updateDraftUserDto.businessType;
      draftUser.kycStatus = kycStatus.NONE;
      await this.draftUserRepo.save(draftUser);
      await this.userRepo.update(
        { id: userId },
        { kycStatus: kycStatus.NONE, remarkKyc: null },
      );

      for (let i = 0; i < updateDraftUserDto.draftUserAddresses.length; i++) {
        await this.draftUserAddressRepo.update(
          {
            addressType: updateDraftUserDto.draftUserAddresses[i].addressType,
            draftUserId: draftUser.id,
          },
          {
            address: updateDraftUserDto.draftUserAddresses[i].address,
            countryId: updateDraftUserDto.draftUserAddresses[i].countryId,
            provinceId: updateDraftUserDto.draftUserAddresses[i].provinceId,
            districtId: updateDraftUserDto.draftUserAddresses[i].districtId,
            subDistrictId:
              updateDraftUserDto.draftUserAddresses[i].subDistrictId,
            isSameAddress:
              updateDraftUserDto.draftUserAddresses[i].isSameAddress,
          },
        );
      }
      await queryRunner.commitTransaction();
      return 'Update data success';
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          message: `Error is ${error}`,
          error: { code: 'DRAFT_USER_NOT_UPDATED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async validateDraftUserAddress(
    draftUserAddress: DraftUserAddress,
  ): Promise<boolean> {
    if (
      isNonEmptyString(draftUserAddress.address) &&
      draftUserAddress.countryId &&
      draftUserAddress.provinceId &&
      draftUserAddress.districtId &&
      draftUserAddress.subDistrictId
    ) {
      return true;
    }
    return false;
  }

  async validateDraftUser(draftUser: DraftUser): Promise<boolean> {
    if (
      isNonEmptyString(draftUser.firstNameTh) &&
      isNonEmptyString(draftUser.lastNameTh) &&
      isNonEmptyString(draftUser.firstNameEn) &&
      isNonEmptyString(draftUser.lastNameEn) &&
      draftUser.birthDate &&
      draftUser.gender &&
      draftUser.maritalStatus &&
      isValidThaiID(draftUser.idCard) &&
      draftUser.draftUserAddresses.length == 2
    ) {
      for (let i = 0; i < draftUser.draftUserAddresses.length; i++) {
        if (
          !(await this.validateDraftUserAddress(
            draftUser.draftUserAddresses[i],
          ))
        ) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  async approveKyc(userId: number, platform: Platform) {
    try {
      const draftUser = await this.draftUserRepo.findOne({
        where: { userId },
        relations: [
          'draftUserAddresses',
          'draftUserAddresses.country',
          'draftUserAddresses.province',
          'draftUserAddresses.district',
          'draftUserAddresses.subDistrict',
          'user',
        ],
      });

      if (await this.validateDraftUser(draftUser)) {
        await this.userRepo.update(
          { id: userId },
          { kycStatus: kycStatus.WAIT_FOR_APPROVE },
        );
        await this.draftUserRepo.update(
          { userId },
          { kycStatus: kycStatus.WAIT_FOR_APPROVE },
        );
        const idCardAddress: AddressInfoCis = {
          address_info: '',
          country: 0,
          province: 0,
          district: 0,
          sub_district: 0,
          zipcode: 0,
          country_name: '',
          province_name: '',
          district_name: '',
          sub_district_name: '',
          zipcode_name: '',
        };

        const currentAddress: AddressInfoCis = {
          address_info: '',
          country: 0,
          province: 0,
          district: 0,
          sub_district: 0,
          zipcode: 0,
          country_name: '',
          province_name: '',
          district_name: '',
          sub_district_name: '',
          zipcode_name: '',
        };

        for (let i = 0; i < draftUser.draftUserAddresses.length; i++) {
          if (
            draftUser.draftUserAddresses[i].addressType ==
            AddressTypeEnum.ID_CARD
          ) {
            idCardAddress.address_info =
              draftUser.draftUserAddresses[i].address;
            idCardAddress.country = draftUser.draftUserAddresses[i].countryId;
            idCardAddress.province = draftUser.draftUserAddresses[i].provinceId;
            idCardAddress.district = draftUser.draftUserAddresses[i].districtId;
            idCardAddress.sub_district =
              draftUser.draftUserAddresses[i].subDistrictId;
            idCardAddress.zipcode = Number(
              draftUser.draftUserAddresses[i].subDistrict.zip_code,
            );
            idCardAddress.country_name =
              draftUser.draftUserAddresses[i].country.name;
            idCardAddress.province_name =
              draftUser.draftUserAddresses[i].province.name_th;
            idCardAddress.district_name =
              draftUser.draftUserAddresses[i].district.name_th;
            idCardAddress.sub_district_name =
              draftUser.draftUserAddresses[i].subDistrict.name_th;
            idCardAddress.zipcode_name =
              draftUser.draftUserAddresses[i].subDistrict.zip_code;
          } else if (
            draftUser.draftUserAddresses[i].addressType ==
            AddressTypeEnum.CURRENT
          ) {
            currentAddress.address_info =
              draftUser.draftUserAddresses[i].address;
            currentAddress.country = draftUser.draftUserAddresses[i].countryId;
            currentAddress.province =
              draftUser.draftUserAddresses[i].provinceId;
            currentAddress.district =
              draftUser.draftUserAddresses[i].districtId;
            currentAddress.sub_district =
              draftUser.draftUserAddresses[i].subDistrictId;
            currentAddress.zipcode = Number(
              draftUser.draftUserAddresses[i].subDistrict.zip_code,
            );
            currentAddress.country_name =
              draftUser.draftUserAddresses[i].country.name;
            currentAddress.province_name =
              draftUser.draftUserAddresses[i].province.name_th;
            currentAddress.district_name =
              draftUser.draftUserAddresses[i].district.name_th;
            currentAddress.sub_district_name =
              draftUser.draftUserAddresses[i].subDistrict.name_th;
            currentAddress.zipcode_name =
              draftUser.draftUserAddresses[i].subDistrict.zip_code;
          }
        }

        const body: AddVerifyUserInfoCis = {
          app_id:
            platform === Platform.SELLER
              ? this.configService.get<string>('APP_ID_SELLER')
              : platform === Platform.MARKETPLACE
              ? this.configService.get<string>('APP_ID_MARKETPLACE')
              : this.configService.get<string>('APP_ID_BUYER'),
          cis_number: draftUser.user.cisNumber,
          first_name: draftUser.firstNameTh,
          middle_name: draftUser.middleNameTh,
          last_name: draftUser.lastNameTh,
          first_name_en: draftUser.firstNameEn,
          middle_name_en: draftUser.middleNameEn,
          last_name_en: draftUser.lastNameEn,
          birth_day: draftUser.birthDate,
          gender: GenderCIS[draftUser.gender],
          marital_status: MaritalStatusCIS[draftUser.maritalStatus],
          id_card_number: draftUser.idCard,
          address_according_id_card: idCardAddress,
          current_address: currentAddress,
          current_address_shown_id_card:
            JSON.stringify(idCardAddress) === JSON.stringify(currentAddress),
        };
        this.userQueue.add(
          'approve',
          {
            userId,
            body,
          },
          {
            attempts: 4,
            backoff: {
              type: 'fixed',
              delay: Number(this.configService.get<number>('DELAY_RETRY')),
            },
          },
        );
        return 'Send to cis success';
      } else {
        throw new HttpException(
          {
            message: 'Validate data not pass',
            error: { code: 'VALIDATE_NOT_PASS' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Draft user not send cis',
          error: { code: 'DRAFT_USER_NOT_SEND_CIS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async approveCis(job: Job) {
    // check verify info again before send to cis
    const verifyInfo = await this.cisService.getVerifyUserInfo(
      job.data.body.app_id,
      job.data.body.cis_number,
    );
    if (verifyInfo?.data) {
      // update verify info
      await this.cisService.updateVerifyUserInfo(job.data.body);
    } else {
      // add verify info
      await this.cisService.addVerifyUserInfo(job.data.body, job.data.userId);
    }

    // update kyc status in cis service
    await this.cisService.updateStatusVerify(
      job.data.body.app_id,
      job.data.body.cis_number,
      KycStatusCIS.WAIT_FOR_APPROVE,
    );
  }

  async updateUserFromDraft(user: User) {
    const draftUser = await this.getDraftUser(user.id);

    user.countryCode = draftUser.countryCode;
    user.tel = draftUser.tel;
    user.email = draftUser.email;
    user.firstNameTh = draftUser.firstNameTh;
    user.middleNameTh = draftUser.middleNameTh;
    user.lastNameTh = draftUser.lastNameTh;
    user.firstNameEn = draftUser.firstNameEn;
    user.middleNameEn = draftUser.middleNameEn;
    user.lastNameEn = draftUser.lastNameEn;
    user.gender = draftUser.gender;
    user.maritalStatus = draftUser.maritalStatus;
    user.birthDate = draftUser.birthDate;
    user.idCard = draftUser.idCard;
    user.businessType = draftUser.businessType;

    await this.userRepo.save(user);

    draftUser.kycStatus = user.kycStatus;

    await this.draftUserRepo.save(draftUser);

    for (let i = 0; i < draftUser.draftUserAddresses.length; i++) {
      await this.userAddressService.createOrUpdate(
        user.id,
        draftUser.draftUserAddresses[i].addressType,
        {
          address: draftUser.draftUserAddresses[i].address,
          countryId: draftUser.draftUserAddresses[i].countryId,
          provinceId: draftUser.draftUserAddresses[i].provinceId,
          districtId: draftUser.draftUserAddresses[i].districtId,
          subDistrictId: draftUser.draftUserAddresses[i].subDistrictId,
          usedAddress: draftUser.draftUserAddresses[i].isSameAddress,
          cisNumber: user.cisNumber,
        },
      );
    }
  }

  async uploadDocumentToCis(
    documentType: DocumentType,
    files: Express.Multer.File[],
    userId: number,
    platform: Platform,
    attachType: DocumentAttachType,
  ) {
    const appId =
      platform == Platform.SELLER
        ? this.configService.get<string>('APP_ID_SELLER')
        : platform == Platform.MARKETPLACE
        ? this.configService.get<string>('APP_ID_MARKETPLACE')
        : this.configService.get<string>('APP_ID_BUYER');
    const draftUser = await this.draftUserRepo.findOne({
      where: { userId },
      relations: ['user'],
    });

    const fileInfo = draftUser.fileInfo ? JSON.parse(draftUser.fileInfo) : {};
    const existingFiles = fileInfo?.[documentType] ?? [];

    try {
      // Upload new files and attach to CIS
      const uploadedDocs = await this.uploadAndAttachFiles(
        files,
        appId,
        draftUser.user.cisNumber,
        platform,
        documentType,
        attachType,
      );

      // Update draft organization with new file info
      if (attachType == DocumentAttachType.IMAGE_PROFILE) {
        draftUser.image = JSON.stringify(uploadedDocs);
        await this.draftUserRepo.save(draftUser);
      } else {
        await this.updateDraftUserFileInfo(
          draftUser,
          documentType,
          existingFiles,
          uploadedDocs,
        );
      }

      return uploadedDocs;
    } catch (error) {
      console.error('Error uploading documents to CIS:', error);
      throw error;
    }
  }

  private async uploadAndAttachFiles(
    files: Express.Multer.File[],
    appId: string,
    cisNumber: string,
    platform: Platform,
    documentType: DocumentType,
    attachType: DocumentAttachType,
  ): Promise<any | any[]> {
    const fileArray: any[] = [];

    // Upload files to CIS
    for (const file of files) {
      const responseCis = await this.cisService.uploadDocument(
        appId,
        file,
        platform,
      );

      if (responseCis?.data?.id) {
        fileArray.push({
          document_attach_type: attachType,
          document_id: responseCis.data.id,
          document_type: DocumentTypeCis[documentType] || null,
          expired_date: '',
          file_name: file.originalname,
        });
      }
    }

    // Attach uploaded documents
    if (fileArray.length > 0) {
      await this.cisService.attachDocument(
        appId,
        cisNumber,
        fileArray,
        platform,
      );
    }

    // Get and filter attached documents
    const { data } = await this.cisService.getAttachDocuments(
      appId,
      cisNumber,
      attachType,
    );

    if (attachType == DocumentAttachType.IMAGE_PROFILE) {
      return {
        documentCisId: data.documents[0].id,
        fileName: data.documents[0].file_name,
        fileType: data.documents[0].file_type,
        filePath: data.documents[0].file_path,
        fileSize: data.documents[0].file_size,
      };
    }

    return this.filterAndSortDocuments(
      data.documents || [],
      files,
      documentType,
    );
  }

  private filterAndSortDocuments(
    documents: any[],
    uploadedFiles: Express.Multer.File[],
    documentType: string,
  ): any[] {
    const documentTypeCode = DocumentTypeCis[documentType];
    const fileNames = uploadedFiles.map((file) => file.originalname);
    const uniqueSortedFileNames = [...new Set(fileNames)]
      .filter(Boolean)
      .sort();

    const orderMap = new Map(
      uniqueSortedFileNames.map((name, index) => [name, index]),
    );

    // Filter and sort documents, removing duplicates
    const filtered: any[] = [];
    const seenFileNames = new Set<string>();
    const sortedDocs = documents
      .filter(
        (doc) =>
          doc.file_name &&
          orderMap.has(doc.file_name) &&
          doc.document_type === documentTypeCode,
      )
      .sort((a, b) => {
        const orderDiff =
          orderMap.get(a.file_name)! - orderMap.get(b.file_name)!;
        if (orderDiff !== 0) return orderDiff;

        const dateA = new Date(a.create_at || 0).getTime();
        const dateB = new Date(b.create_at || 0).getTime();
        return dateB - dateA;
      });

    for (const doc of sortedDocs) {
      if (!seenFileNames.has(doc.file_name)) {
        filtered.push({
          documentCisId: doc.id,
          fileName: doc.file_name,
          fileType: doc.file_type,
          filePath: doc.file_path,
          fileSize: doc.file_size,
        });
        seenFileNames.add(doc.file_name);
      }
    }

    return filtered;
  }

  private async updateDraftUserFileInfo(
    draftUser: DraftUser,
    documentType: string,
    existingFiles: any[],
    newDocuments: any[],
  ): Promise<void> {
    const fileInfo = draftUser.fileInfo ? JSON.parse(draftUser.fileInfo) : {};
    const allFiles = [...existingFiles, ...newDocuments];

    fileInfo[documentType] = allFiles;
    draftUser.fileInfo = JSON.stringify(fileInfo);

    await this.draftUserRepo.save(draftUser);
  }

  async deleteDocumentCis(
    documentId: string[],
    platform: Platform,
    userId: number,
    attachType: DocumentAttachType,
  ) {
    const appId =
      platform == Platform.SELLER
        ? this.configService.get<string>('APP_ID_SELLER')
        : platform == Platform.MARKETPLACE
        ? this.configService.get<string>('APP_ID_MARKETPLACE')
        : this.configService.get<string>('APP_ID_BUYER');
    const draftUser = await this.draftUserRepo.findOne({
      where: { userId },
    });

    if (attachType == DocumentAttachType.IMAGE_PROFILE) {
      draftUser.image = null;
    } else {
      const fileInfo = draftUser.fileInfo ? JSON.parse(draftUser.fileInfo) : {};

      Object.keys(fileInfo).forEach((key) => {
        fileInfo[key] = fileInfo[key].filter(
          (file: any) => !documentId.includes(file.documentCisId),
        );
      });
      draftUser.fileInfo = JSON.stringify(fileInfo);
    }

    await this.draftUserRepo.save(draftUser);

    return (await this.cisService.deleteDocument(appId, documentId, platform))
      .data;
  }

  async findDraftUserByUserId(userId: number): Promise<DraftUser> {
    return await this.draftUserRepo.findOne({ where: { userId } });
  }

  async deleteDraftUserById(id: number) {
    return await this.draftUserRepo.delete({ id });
  }

  async deleteDraftUserAddressByDraftUserId(draftUserId: number) {
    return await this.draftUserAddressRepo.delete({ draftUserId });
  }

  async findByUuid(uuid: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.merchants', 'merchants')
      .leftJoinAndSelect('user.imageUpload', 'imageUpload')
      .leftJoinAndSelect('merchants.organization', 'organization')
      .where('user.uuid = :uuid', { uuid })
      .getOne();

    if (!user) {
      throw new HttpException(
        { message: 'User not found', code: 'USER_NOT_FOUND' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.getUserMerchantData(user);
  }

  async getUserMerchantData(user: User) {
    if (!user || !user.merchants || user.merchants.length === 0) {
      return user;
    }

    // Get lastAccessedAt data from user_merchants_merchant table
    const userMerchantData = await this.userRepo.manager
      .createQueryBuilder()
      .select([
        'pivot.merchantId',
        'pivot.lastAccessedAt',
        'pivot.createdAt',
        'pivot.updatedAt',
      ])
      .from('user_merchants_merchant', 'pivot')
      .where('pivot.userId = :userId', { userId: user.id })
      .getRawMany();

    // Add the lastAccessedAt data to each merchant object
    user.merchants.forEach((merchant) => {
      const pivotData = userMerchantData.find(
        (pivot) => pivot.pivot_merchantId === merchant.id,
      );
      (merchant as any).lastAccessedAt =
        pivotData?.pivot_lastAccessedAt || null;
      (merchant as any).isOrganize = merchant.organizeId !== null;
    });

    return user;
  }
}
