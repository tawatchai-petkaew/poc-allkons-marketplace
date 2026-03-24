import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { I18nContext } from 'nestjs-i18n';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Connection, Repository, UpdateResult } from 'typeorm';

import {
  clearCacheByPattern,
  createWithTranslation,
  deleteWithTranslation,
  getAllWithTranslation,
  getByIdWithTranslation,
  updateWithTranslation,
} from '../../utils';

import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { ImageUpload } from '../../model/image-upload.entity';
import { MerchantCategory } from '../../model/merchant-category.entity';
import { MerchantIcon } from '../../model/merchant-icon.entity';
import { MerchantLogo } from '../../model/merchant-logo.entity';
import { MerchantPdpa } from '../../model/merchant-pdpa.entity';
import { MerchantTaxInvoiceItem } from '../../model/merchant-tax-invoice-item.entity';
import { MerchantTaxInvoice } from '../../model/merchant-tax-invoice.entity';
import { MerchantTranslation } from '../../model/merchant-translation.entity';
import { Merchant, MerchantBranchType } from '../../model/merchant.entity';
import { User } from '../../model/user.entity';

import { UserDto } from '../user/dto/user.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantIconDto } from './dto/merchant-icon.dto';
import { MerchantLogoDto } from './dto/merchant-logo.dto';
import { MerchantTranslationDto } from './dto/merchant-translation.dto';
import { MerchantDto, MerchantStatus } from './dto/merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { GetMerchantListDto } from './dto/get-merchant-list.dto';

import { RequestContextService } from '../request-context/request-context.service';

import { RegisterStatus } from '@/model/enum/user.enum';
import {
  MerchantShipment,
  PaymentShipmentType,
  ShipmentType,
} from '@/model/merchant-shipment.entity';
import { Platform } from '@/model/organization-contact.entity';
import { OrganizationType } from '@/model/organization.entity';
import { Role } from '@/model/roles.entity';
import { Store, StoreCustomerStatus, StoreType } from '@/model/store.entity';
import { UserMerchant } from '@/model/user-merchant.entity';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { SubdomainUtils } from '@/utils/subdomain.utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { CisService } from '../cis/cis.service';
import {
  CustomerProfileType,
  CustomerStatusCIS,
  JuristicTypeCIS,
  KycStatusCIS,
  OrganizeTypeCIS,
  RelationType,
  RoleCis,
} from '../cis/enum/cis.enum';
import { UpdateJuristicProfileCis } from '../cis/interfaces/api-request.interface';
import { CreateShopDto } from '../register/dto/create-register.dto';
import { RoleService } from '../role/role.service';
import {
  AddUsersToMerchantDto,
  AddUsersToMerchantResponseDto,
} from '../user-merchant/dto/add-user-to-merchant.dto';
import {
  GetMerchantMembersResponseDto,
  MerchantMemberDto,
} from '../user-merchant/dto/user-merchant.dto';
import { UserMerchantService } from '../user-merchant/user-merchant.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import { UserService } from '../user/user.service';
import { updateMerchantInfoDto } from './dto/update-merchant-info.dto';
import { UpdateMerchantMemberDto } from './dto/update-merchant-member.dto';
import { AutoTrace, ErrorHandler } from 'allkons-api-helper';
import { RequestMerchant } from '@/types/request.types';

const successStatus = 'SUCCESS';
const defaultBranchCode = '00000';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(MerchantTranslation)
    private readonly merchantTranslateRepo: Repository<MerchantTranslation>,
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoryRepo: Repository<MerchantCategory>,
    @InjectRepository(ImageUploadFolder)
    private readonly imageUploadFolderRepo: Repository<ImageUploadFolder>,
    @InjectRepository(MerchantLogo)
    private readonly merchantLogoRepo: Repository<MerchantLogo>,
    @InjectRepository(MerchantIcon)
    private readonly merchantIconRepo: Repository<MerchantIcon>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(MerchantPdpa)
    private readonly merchantPdpaRepo: Repository<MerchantPdpa>,
    @InjectRepository(MerchantTaxInvoice)
    private readonly merchantTaxInvoiceRepo: Repository<MerchantTaxInvoice>,
    @InjectRepository(MerchantTaxInvoiceItem)
    private readonly merchantTaxInvoiceItemRepo: Repository<MerchantTaxInvoiceItem>,
    @InjectRepository(MerchantShipment)
    private readonly merchantShipmentRepo: Repository<MerchantShipment>,
    private readonly contextService: RequestContextService,
    @InjectQueue('create-expense-bill-queue') private expeseBillQueue: Queue,
    @InjectQueue('demo-merchant') private demoMerchantQueue: Queue,
    @Inject(forwardRef(() => UserOrganizationService))
    private readonly userOrganizationService: UserOrganizationService,
    @Inject(forwardRef(() => UserMerchantService))
    private readonly userMerchantService: UserMerchantService,
    private readonly roleService: RoleService,
    private readonly cisService: CisService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly userService: UserService,
    private readonly connection: Connection,
    private readonly jwtService: JwtService,
  ) {}
  public async getAll(body: GetMerchantListDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      withPagination = true,
      search,
      filter,
      uuids,
    } = body;
    const options: IPaginationOptions = { page, limit };
    const currentDate = new Date();
    let parents = this.merchantRepo
      .createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.merchantLogo', 'merchantLogo')
      .leftJoinAndSelect('merchantLogo.imageUpload', 'logo')
      .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
      .leftJoinAndSelect('merchantIcon.imageUpload', 'icon');

    if (body) {
      if (search && search !== '') {
        parents = this.merchantRepo
          .createQueryBuilder('merchant')
          .leftJoinAndSelect(
            'merchant.merchantTranslations',
            'merchantTranslation',
          )
          .where(
            '(LOWER(merchantTranslation.name) like LOWER(:name) OR merchant.slug like :slug)',
            { name: `%${search}%`, slug: `%${search}%` },
          );
      }

      if (filter) {
        const filterObj =
          typeof filter === 'string' ? JSON.parse(filter) : filter;

        if (filterObj.status) {
          if (filterObj.status === 'active') {
            parents = this.merchantRepo
              .createQueryBuilder('merchant')
              .andWhere('merchant.expiredDate > :expiredDate', {
                expiredDate: new Date(
                  currentDate.getTime() +
                    currentDate.getTimezoneOffset() * 60 * 1000 * -1,
                ).toISOString(),
              });
          } else {
            parents = this.merchantRepo
              .createQueryBuilder('merchant')
              .andWhere('merchant.expiredDate < :expiredDate', {
                expiredDate: new Date(
                  currentDate.getTime() +
                    currentDate.getTimezoneOffset() * 60 * 1000 * -1,
                ).toISOString(),
              });
          }
        }
      }

      if (uuids && uuids.length > 0) {
        parents = parents.andWhere('merchant.uuid IN (:...uuids)', {
          uuids,
        });
      }
    }

    parents = await parents.orderBy('merchant.updatedAt', 'DESC');

    const result: any = withPagination
      ? await paginate<Merchant>(parents, options)
      : await parents.getMany();

    return getAllWithTranslation({
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      locale: this.contextService.currentLang,
      parents: result.items || result,
      meta: result.meta,
      relations: [],
      nestedParentChildWithTranslation: [],
    });
  }

  public async create(dto: CreateMerchantDto, userId: any): Promise<any> {
    const merchantCategory = await this.merchantCategoryRepo.findOne(
      dto.merchantCategoryId,
    );
    const currentDate = new Date();
    const currentDateTZ = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );
    const currentStartDate = new Date();
    const currentStartDateTZ = new Date(
      currentStartDate.getTime() +
        currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );
    // const expiredDate = currentDateTZ.setDate(currentDateTZ.getDate() + 30);

    // TODO: fix this
    const packageSlug = 'free';

    const parentDto = {
      ...dto,
      isEnableCache: false,
      expiredDate: null,
      currentSubscriptionPackageSlug: packageSlug,
      currentSubscriptionPackageStartDate: currentStartDate,
      currentSubscriptionPackageTotalNumberOfDay: 0,
      merchantCategory: merchantCategory,
    };

    const childDto = {
      name: dto.name,
      description: dto.description,
      locale: dto.locale ? dto.locale : 'th',
      merchant: null,
    };

    const user: User = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['merchants', 'imageUpload'],
    });

    const merchant: Promise<MerchantDto> = createWithTranslation({
      patentDto: parentDto,
      childDto: childDto,
      parentKeyForUpdateChild: 'merchant',
      parentRepoClass: this.merchantRepo,
      parentDtoClass: CreateMerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      childDtoClass: MerchantTranslationDto,
    });

    // Callback After Create Merchant
    await merchant.then(async (m) => {
      const merchant = await this.merchantRepo.findOne(m.id);

      const userDto = {
        merchants: [...user?.merchants, merchant],
      };
      const userEntity = UserDto.toEntity(userDto);

      await this.userRepo.save({ ...user, ...userEntity });

      ////////////////////////

      if (dto?.merchantLogoAttributes) {
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantLogoAttributes?.imageUploadId,
        });

        const merchantLogoDto: MerchantLogoDto = {
          ...dto?.merchantLogoAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantLogoRepo.save(
          MerchantLogoDto.toEntity(merchantLogoDto),
        );
      }

      if (dto?.merchantIconAttributes) {
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantIconAttributes?.imageUploadId,
        });

        const merchantIconDto: MerchantIconDto = {
          ...dto?.merchantLogoAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantIconRepo.save(
          MerchantIconDto.toEntity(merchantIconDto),
        );
      }

      const imageUploadFolderUploads = this.imageUploadFolderRepo.create({
        name: 'Uploads',
        merchant: merchant,
      });

      await imageUploadFolderUploads.save();

      const imageUploadFolderLogoAndApp = this.imageUploadFolderRepo.create({
        name: 'Logo & App',
        merchant: merchant,
      });

      await imageUploadFolderLogoAndApp.save();

      const imageUploadFolderBanners = this.imageUploadFolderRepo.create({
        name: 'Banners',
        merchant: merchant,
      });

      await imageUploadFolderBanners.save();

      const imageUploadFolderArticles = this.imageUploadFolderRepo.create({
        name: 'Articles',
        merchant: merchant,
      });

      await imageUploadFolderArticles.save();

      const imageUploadFolderCategories = this.imageUploadFolderRepo.create({
        name: 'Categories',
        merchant: merchant,
      });

      await imageUploadFolderCategories.save();

      const imageUploadFolderBrands = this.imageUploadFolderRepo.create({
        name: 'Brands',
        merchant: merchant,
      });

      await imageUploadFolderBrands.save();

      // await this.productBrandService.create(productBrandDto, userId, m.slug);

      /////////////////////////////////
      // Ceate Subscription Statement
      ////////////////////////////////

      const date = new Date();
      const statemantCurrentDate = new Date();
      const end = statemantCurrentDate.setUTCHours(23, 59, 59, 999);
      const start = statemantCurrentDate.setUTCHours(0, 0, 0, 0);
      const dateNumber =
        `${date.getFullYear()}` +
        `${
          date.getMonth() + 1 < 10
            ? `0${date.getMonth() + 1}`
            : date.getMonth() + 1
        }` +
        `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;

      const widgetsAttributes = [
        {
          key: 'home_product_category',
          name: 'category',
          order: 1,
        },
        {
          key: 'home_flash_sale',
          name: 'flash sale',
          order: 2,
        },
        {
          key: 'home_recommend_product',
          name: 'recommend',
          order: 3,
        },
        {
          key: 'home_best_sale_product',
          name: 'best seller',
          order: 4,
        },
        {
          key: 'home_product_catalog',
          name: 'catalog',
          order: 5,
        },
        {
          key: 'home_interest_product',
          name: 'your interest',
          order: 6,
        },
        {
          key: 'home_new_product',
          name: 'new arrivals',
          order: 7,
        },
        {
          key: 'home_article',
          name: 'article',
          order: 8,
        },
        {
          key: 'home_banner_promotion',
          name: 'promotion banner',
          order: 9,
        },
        {
          key: 'home_product_browser',
          name: 'products section',
          order: 10,
        },
      ];

      const themeWidgetDto = {
        key: `${merchant.slug}-default-theme`,
        name: `${merchant.slug}-default-theme`,
        widgetsAttributes,
        isPublic: false,
        themeWidgets: undefined,
        merchantIds: undefined,
        merchants: [merchant],
      };

      const merchantShipment = new MerchantShipment();
      merchantShipment.name = 'Online Shipment';
      merchantShipment.shipmentType = ShipmentType.ONLINE;
      merchantShipment.paymentShipmentType = PaymentShipmentType.FREE;
      merchantShipment.fixedPrice = 0;
      merchantShipment.isActive = true;
      await this.merchantShipmentRepo.save(merchantShipment);

      if (process.env.REDIS_HOST) {
        await this.expeseBillQueue.add(
          'create-expense-bill-job',
          {
            merchantId: merchant.id,
          },
          {
            repeat: {
              cron: '0 0 20 * *',
            },
            jobId: `create-expense-bill-job-${merchant?.slug}-${merchant?.id}`,
            removeOnComplete: {
              age: 24 * 3600 * 7,
            },
            removeOnFail: {
              age: 24 * 3600 * 30,
            },
          },
        );

        await this.expeseBillQueue.add(
          'create-expense-bill-job',
          {
            merchantId: merchant.id,
          },
          {
            repeat: {
              cron: '0 0 5 * *',
            },
            jobId: `create-expense-bill-job-${merchant?.slug}-${merchant?.id}`,
            removeOnComplete: {
              age: 24 * 3600 * 7,
            },
            removeOnFail: {
              age: 24 * 3600 * 30,
            },
          },
        );
      }
    });

    const m = await merchant;

    const result = await this.merchantRepo.findOne({
      where: {
        id: m.id,
      },
    });

    const r = await this.showByUuid(result.uuid);

    return {
      ...r,
    };
  }

  public async showByUuid(uuid: string): Promise<MerchantDto> {
    const parent = await this.merchantRepo.findOne({
      where: { uuid: uuid },
      relations: [
        'organization',
        'merchantCategory',
        'merchantLogo',
        'merchantLogo.imageUpload',
        'merchantIcon',
        'merchantIcon.imageUpload',
        'merchantWallet',
      ],
    });

    return getByIdWithTranslation({
      id: parent.id,
      parent: parent,
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      locale: this.contextService.currentLang,
      relations: ['merchantCategory'],
      nestedParentChildWithTranslation: [],
    });
  }

  public async showBySlug(slug: string): Promise<MerchantDto> {
    const parent = await this.merchantRepo.findOne({
      where: { slug },
      relations: [
        'merchantCategory',
        'merchantLogo',
        'merchantLogo.imageUpload',
        'merchantIcon',
        'merchantIcon.imageUpload',
        'merchantWallet',
      ],
    });

    return getByIdWithTranslation({
      id: parent.id,
      parent: parent,
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      locale: this.contextService.currentLang,
      relations: ['merchantCategory'],
      nestedParentChildWithTranslation: [],
    });
  }

  public async checkSlug(slug: string, i18n: I18nContext): Promise<any> {
    const parent = await this.merchantRepo.findOne({
      where: { slug },
    });

    if (parent) {
      throw new Error(i18n.t('errors.MERCHANT_SLUG_EXISTS'));
    }

    return i18n.t('success.SLUG_CAN_USE');
  }

  public async showCurrentMerchant(
    slug: string,
    userId: any,
  ): Promise<MerchantDto> {
    try {
      const user = await this.userRepo.findOne(userId, {
        relations: [
          'merchants',
          'merchants.merchantCategory',
          'merchants.merchantLogo',
          'merchants.merchantLogo.imageUpload',
          'merchants.merchantIcon',
          'merchants.merchantIcon.imageUpload',
          'merchants.merchantWallet',
        ],
      });

      const parent = user?.merchants?.find(
        (merchant) => merchant.slug === slug,
      );

      const result = await getByIdWithTranslation({
        id: parent.id,
        parent: parent,
        parentRepoClass: this.merchantRepo,
        parentDtoClass: MerchantDto,
        childRepoClass: this.merchantTranslateRepo,
        parentKeyForGetChild: 'merchant',
        locale: this.contextService.currentLang,
        relations: ['merchantCategory'],
        nestedParentChildWithTranslation: [],
      });

      this.updateUserAccessMerchant({ userId, merchantSlug: slug });

      return result;
    } catch (error) {
      ErrorHandler.handleNotFoundError(
        error,
        error.message || 'Failed to get current merchant',
      );
    }
  }

  public async updateUserAccessMerchant({
    userId,
    merchantSlug,
  }: {
    userId: number;
    merchantSlug: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      if (!userId || !merchantSlug) {
        return;
      }

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
        where: { slug: merchantSlug },
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
      await this.userMerchantService.updateLastAccessedAt(userId, merchant.id);

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

  public async update(
    id: string,
    dto: UpdateMerchantDto,
    userId: any,
  ): Promise<MerchantDto> {
    const merchant = await this.merchantRepo.findOne({ where: { uuid: id } });

    const childDto = {
      name: dto.name,
      description: dto.description,
      locale: dto.locale ? dto.locale : 'th',
      merchant: null,
    };

    const merchantCategory = await this.merchantCategoryRepo.findOne(
      dto.merchantCategoryId,
    );

    const parentDto = {
      ...dto,
      merchantCategory: merchantCategory,
    };

    const merchantEntity = UpdateMerchantDto.toEntity(parentDto);

    const merchantUpdated: Promise<MerchantDto> = updateWithTranslation({
      parent: merchant,
      parentEntity: merchantEntity,
      patentDto: parentDto,
      childDto: childDto,
      parentKeyForUpdateChild: 'merchant',
      parentRepoClass: this.merchantRepo,
      parentDtoClass: MerchantDto,
      childRepoClass: this.merchantTranslateRepo,
      childDtoClass: MerchantTranslationDto,
      relations: ['merchantCategory'],
    });

    merchantUpdated.then(async (m) => {
      const merchant = await this.merchantRepo.findOne(m.id, {
        relations: [
          'merchantLogo',
          'merchantLogo.imageUpload',
          'merchantIcon',
          'merchantIcon.imageUpload',
        ],
      });

      // Clear merchant cache when updated
      if (merchant?.slug) {
        await this.cacheManager.del(`merchant:full:${merchant.slug}`);
        await this.cacheManager.del(merchant.slug); // Also clear basic cache from middleware
      }

      if (
        merchant?.merchantLogo &&
        dto?.merchantLogoAttributes &&
        (dto?.merchantLogoAttributes?.id === undefined ||
          dto?.merchantLogoAttributes?.id === null)
      ) {
        await this.merchantLogoRepo.delete(merchant?.merchantLogo?.id);

        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantLogoAttributes?.imageUploadId,
        });

        const merchantLogoDto: MerchantLogoDto = {
          ...dto?.merchantLogoAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantLogoRepo.save(
          MerchantLogoDto.toEntity(merchantLogoDto),
        );
      } else if (
        dto?.merchantLogoAttributes &&
        (dto?.merchantLogoAttributes?.id === undefined ||
          dto?.merchantLogoAttributes?.id === null)
      ) {
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantLogoAttributes?.imageUploadId,
        });

        const merchantLogoDto: MerchantLogoDto = {
          ...dto?.merchantLogoAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantLogoRepo.save(
          MerchantLogoDto.toEntity(merchantLogoDto),
        );
      }

      if (
        merchant?.merchantLogo &&
        dto?.merchantLogoAttributes &&
        dto?.merchantLogoAttributes?.id
      ) {
        const merchantLogo = await this.merchantLogoRepo.findOne({
          id: dto?.merchantLogoAttributes?.id,
        });
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantLogoAttributes?.imageUploadId,
        });

        const merchantLogoDto = {
          ...dto?.merchantLogoAttributes,
          imageUpload,
          merchant,
        };

        const merchantLogoEntity = MerchantLogoDto.toEntity(merchantLogoDto);

        await this.merchantLogoRepo.save(
          Object.assign(merchantLogo, merchantLogoEntity),
        );
      }

      if (
        merchant?.merchantIcon &&
        dto?.merchantIconAttributes &&
        (dto?.merchantIconAttributes?.id === undefined ||
          dto?.merchantIconAttributes?.id === null)
      ) {
        await this.merchantIconRepo.delete(merchant?.merchantIcon?.id);

        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantIconAttributes?.imageUploadId,
        });

        const merchantIconDto: MerchantIconDto = {
          ...dto?.merchantIconAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantIconRepo.save(
          MerchantIconDto.toEntity(merchantIconDto),
        );
      } else if (
        dto?.merchantIconAttributes &&
        (dto?.merchantIconAttributes?.id === undefined ||
          dto?.merchantIconAttributes?.id === null)
      ) {
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantIconAttributes?.imageUploadId,
        });

        const merchantIconDto: MerchantIconDto = {
          ...dto?.merchantIconAttributes,
          imageUpload,
          merchant,
        };

        await this.merchantIconRepo.save(
          MerchantIconDto.toEntity(merchantIconDto),
        );
      }

      if (
        merchant?.merchantIcon &&
        dto?.merchantIconAttributes &&
        dto?.merchantIconAttributes?.id
      ) {
        const merchantIcon = await this.merchantIconRepo.findOne({
          id: dto?.merchantIconAttributes?.id,
        });
        const imageUpload: ImageUpload = await this.imageUploadRepo.findOne({
          id: dto?.merchantIconAttributes?.imageUploadId,
        });

        const merchantIconDto = {
          ...dto?.merchantIconAttributes,
          imageUpload,
          merchant,
        };

        const merchantIconEntity = MerchantIconDto.toEntity(merchantIconDto);

        await this.merchantIconRepo.save(
          Object.assign(merchantIcon, merchantIconEntity),
        );
      }

      //////////////////////////////////
      // Change Subsciption Package
      //////////////////////////////////

      if (dto?.subsciptionPackageId) {
        const currentDate = new Date();
        const currentStartDate = new Date();
        const currentStartDateTZ = new Date(
          currentStartDate.getTime() +
            currentDate.getTimezoneOffset() * 60 * 1000 * -1,
        );

        const merchantDto = {
          ...dto,
          currentSubscriptionPackageSlug: '',
          currentSubscriptionPackageStartDate: currentStartDateTZ,
          currentSubscriptionPackagePrice: 0,
          currentSubscriptionPackageTotalNumberOfDay: 0,
        };
        const merchantEntity = UpdateMerchantDto.toEntity(merchantDto);

        await this.merchantRepo.save({ ...merchant, ...merchantEntity });

        /////////////////////////////////
        // Ceate Subscription Statement
        ////////////////////////////////

        // if (merchant.currentSubscriptionPackagePrice > totalPrice() && merchant.currentSubscriptionPackageSlug !== merchantSubscriptionPackage.slug && (merchant.expiredDate >= new Date(currentDateNow.getTime() + currentDateNow.getTimezoneOffset()*60*1000*-1))) {
        //   throw new Error(i18n.t('errors.MUST_BE_UPGRADE_OR_SAME_PACKAGE'));
        // }

        /////////////////////
        // Generate Number
        /////////////////////

        /////////////////////////
        // Create Tax Invoice
        /////////////////////////
      }
    });

    return merchantUpdated;
  }

  public async delete(id: string): Promise<UpdateResult> {
    // Get merchant before deletion to clear cache
    const merchant = await this.merchantRepo.findOne({ where: { uuid: id } });

    const result = await deleteWithTranslation({
      id: merchant.id,
      parentRepoClass: this.merchantRepo,
      childRepoClass: this.merchantTranslateRepo,
      parentKeyForGetChild: 'merchant',
      relations: ['merchantCategory'],
    });

    // Clear merchant cache after deletion
    if (merchant?.slug) {
      await this.cacheManager.del(`merchant:full:${merchant.slug}`);
      await this.cacheManager.del(merchant.slug); // Also clear basic cache from middleware
    }

    return result;
  }

  public async startCronJobCreateExpenseBill(merchant: RequestMerchant) {
    if (process.env.REDIS_HOST) {
      await this.expeseBillQueue.add(
        'create-expense-bill-job',
        {
          merchantId: merchant.id,
        },
        {
          repeat: {
            cron: '0 0 20 * *',
          },
          jobId: `create-expense-bill-job-${merchant?.slug}-${merchant?.id}`,
          removeOnComplete: {
            age: 24 * 3600 * 7,
          },
          removeOnFail: {
            age: 24 * 3600 * 30,
          },
        },
      );

      await this.expeseBillQueue.add(
        'create-expense-bill-job',
        {
          merchantId: merchant.id,
        },
        {
          repeat: {
            cron: '0 0 5 * *',
          },
          jobId: `create-expense-bill-job-${merchant?.slug}-${merchant?.id}`,
          removeOnComplete: {
            age: 24 * 3600 * 7,
          },
          removeOnFail: {
            age: 24 * 3600 * 30,
          },
        },
      );
    }
  }

  public async manaulCronJobCreateExpenseBill(merchant: RequestMerchant) {
    if (process.env.REDIS_HOST) {
      await this.expeseBillQueue.add('create-expense-bill-job', {
        merchantId: merchant.id,
      });
    }
  }

  public async manaulCreateExpenseBill(dto: any) {
    const merchant: Merchant = await this.merchantRepo.findOne({
      where: {
        slug: dto.merchantSlug,
      },
    });
  }

  public async setSoftDeleteRepository(type, id, merchantSlug: string) {
    if (process.env.REDIS_HOST) {
      if (merchantSlug === process.env.DEMO_MERCHANT_SLUG) {
        await this.demoMerchantQueue.add(
          `soft-delete-${type}-repository`,
          {
            id,
          },
          {
            delay: 86400000,
            removeOnComplete: {
              age: 24 * 3600 * 7,
            },
            removeOnFail: {
              age: 24 * 3600 * 30,
            },
          },
        );
      }
    }
  }

  public async migrateMerchantShipmentOnline() {
    const merchants = await this.merchantRepo.find({
      relations: ['merchantShipments'],
    });

    await Promise.all(
      merchants.map(async (merchant) => {
        return;
      }),
    );
  }

  public async getApiKey(merchantId: number) {
    return null;
  }

  private generateApiKey(): string {
    // Generate a random string using randomBytes
    const randomBytesLength = 32;
    const randomString = randomBytes(randomBytesLength).toString('hex');

    // Hash the random string using a secure hashing algorithm (e.g., SHA256)
    const hashedString = createHash('sha256')
      .update(randomString)
      .digest('hex');

    return hashedString;
  }

  public async findByTaxId(taxId: string): Promise<Merchant | undefined> {
    return await this.merchantRepo.findOne({
      where: { companyId: taxId },
      relations: ['merchantCategory'],
    });
  }

  async findByOrganizationId(organizeId: number): Promise<Merchant[]> {
    return await this.merchantRepo.find({
      where: { organizeId },
    });
  }

  async findByTel(tel: string): Promise<Merchant[]> {
    return await this.merchantRepo.find({
      where: { tel },
    });
  }

  async deleteByIds(ids: number[]) {
    return await this.merchantRepo.delete(ids);
  }

  async findMerchantTranslationByMerchantId(
    merchantId: number,
  ): Promise<MerchantTranslation[]> {
    return await this.merchantTranslateRepo.find({
      where: { merchant: { id: merchantId } },
      relations: ['merchant'],
    });
  }

  async findMerchantByStoreId(storeId: number) {
    return await this.merchantRepo.find({
      where: { storeId },
    });
  }

  async findStoreByOrgBranchId(organizeBranchId: number) {
    return await this.storeRepo.find({
      where: { organizeBranchId },
    });
  }

  async findStoreByOrgId(organizeId: number) {
    return await this.storeRepo.find({
      where: { organizeId },
    });
  }

  async deleteMerchantTranslationById(id: number) {
    return await this.merchantTranslateRepo.delete({ id });
  }

  async deleteMerchantTranslationByIds(ids: number[]) {
    return await this.merchantTranslateRepo.delete(ids);
  }

  async deleteStoreByIds(ids: number[]) {
    return await this.storeRepo.delete(ids);
  }

  /**
   * Get all members (users) of a specific merchant with pagination and search
   * @param uuid - uuid of the merchant
   * @param query - Query parameters for pagination and search
   * @returns Promise<GetMerchantMembersResponseDto>
   */
  async getMemberMerchant(
    uuid: string,
    query: BaseQueryDto,
  ): Promise<GetMerchantMembersResponseDto> {
    const merchant = await this.merchantRepo.findOne({
      where: { uuid },
      select: ['id'],
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    const merchantId = merchant.id;

    const baseQb = this.merchantRepo.manager
      .createQueryBuilder()
      .from('user_merchants_merchant', 'um')
      .innerJoin('user', 'u', 'u.id = um."userId"')
      .leftJoin('roles', 'r', 'r.id = um."roleId"')
      .where('um."merchantId" = :merchantId', { merchantId });

    if (query?.search?.trim()) {
      baseQb.andWhere(
        `
        (u.name ILIKE :search OR u.email ILIKE :search OR CONCAT(u."countryCode", u.tel) ILIKE :search)
      `,
        { search: `%${query.search.trim()}%` },
      );
    }

    const totalFilteredUsers = await baseQb
      .clone()
      .select('COUNT(DISTINCT u.id)', 'count')
      .getRawOne()
      .then((res) => parseInt(res.count, 10) || 0);

    const totalUsersInMerchant = await this.merchantRepo.manager
      .createQueryBuilder()
      .from('user_merchants_merchant', 'um')
      .innerJoin('user', 'u', 'u.id = um."userId"')
      .where('um."merchantId" = :merchantId', { merchantId })
      .select('COUNT(DISTINCT u.id)', 'count')
      .getRawOne()
      .then((res) => parseInt(res.count, 10) || 0);

    const offset = ((query?.page || 1) - 1) * (query?.limit || 10);
    const rawUsers = await baseQb
      .clone()
      .select([
        'u.id as "userId"',
        'u.uuid as "userUuid"',
        'u.firstNameTh as "firstNameTh"',
        'u.middleNameTh as "middleNameTh"',
        'u.lastNameTh as "lastNameTh"',
        'u.firstNameEn as "firstNameEn"',
        'u.middleNameEn as "middleNameEn"',
        'u.lastNameEn as "lastNameEn"',
        'u.email as "email"',
        'u."countryCode" as "countryCode"',
        'u.tel as "phoneNumber"',
        'um."roleId" as "roleId"',
        'r.name as "roleName"',
        'r."displayName" as "roleDisplayName"',
        'um."lastAccessedAt" as "lastAccessedAt"',
        'um."createdAt" as "createdAt"',
        'um."updatedAt" as "updatedAt"',
      ])
      .orderBy('um."createdAt"', 'DESC')
      .offset(offset)
      .limit(query?.limit || 10)
      .getRawMany();

    const members: MerchantMemberDto[] = rawUsers.map((user) => ({
      users: {
        id: user.userId,
        uuid: user.userUuid,
        firstNameTh: user.firstNameTh,
        middleNameTh: user.middleNameTh,
        lastNameTh: user.lastNameTh,
        firstNameEn: user.firstNameEn,
        middleNameEn: user.middleNameEn,
        lastNameEn: user.lastNameEn,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        email: user.email,
      },
      role: {
        id: user.roleId,
        name: user.roleName,
        displayName: user.roleDisplayName,
      },
      lastAccessedAt: user.lastAccessedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const response = Object.assign(
      new GetMerchantMembersResponseDto(
        members,
        query?.page || 1,
        query?.limit || 10,
        totalFilteredUsers,
      ),
      {
        allMembers: totalUsersInMerchant,
      },
    );

    return response;
  }

  /**
   * Get organization users who are NOT members of the specified merchant
   * @param merchantId Merchant ID to exclude users from
   * @param query Query options for pagination and search
   * @returns Users available for merchant assignment
   */
  async getAvailableUsersForMerchant(uuid: string, query: BaseQueryDto) {
    try {
      // First, get the merchant to verify it exists and get organization ID
      const merchant = await this.merchantRepo.findOne({
        where: { uuid },
        select: ['id', 'organizeId', 'merchantName'],
      });

      if (!merchant) {
        throw new HttpException(
          {
            message: 'Merchant not found',
            error: { code: 'MERCHANT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Use UserOrganizationService to find users in organization who are not in this specific merchant
      return await this.userOrganizationService.findOrganizationUsersNotInSpecificMerchant(
        merchant.organizeId,
        merchant.id,
        query,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to retrieve available users for merchant',
          error: {
            code: 'UNEXPECTED_ERROR',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add users to merchant
   * @param dto DTO containing merchantId and array of users with their roles
   * @returns Response with details of the operation
   */
  async addUsersToMerchant(
    dto: AddUsersToMerchantDto,
  ): Promise<AddUsersToMerchantResponseDto> {
    const result = await this.userMerchantService.addUsersToMerchant(dto);
    // Clear cache for available users and member lists when users are added
    if (result.addedCount > 0) {
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `merchant:availableUsers:m:${dto.merchantId}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `merchant:members:${dto.merchantId}:*`,
        ),
      ]);
    }

    return result;
  }

  async updateMerchantInfo(
    uuid: string,
    updateMerchantInfo: updateMerchantInfoDto,
  ) {
    try {
      const merchant = await this.merchantRepo.findOne({
        where: { uuid },
        relations: ['organization'],
      });
      merchant.merchantName = updateMerchantInfo.merchantName;
      merchant.status = updateMerchantInfo.status
        ? MerchantStatus.ACTIVE
        : MerchantStatus.INACTIVE;
      await this.merchantRepo.save(merchant);

      if (merchant.merchantBranchType == MerchantBranchType.BRANCH) {
        const merchantPayload: UpdateJuristicProfileCis = {
          app_id: this.configService.get<string>('APP_ID_SELLER'),
          cis_number: merchant.organization.cisNumber,
          customer_profile_type: CustomerProfileType.OFFICE,
          customer_status: CustomerStatusCIS.VISITOR,
          juristic_name: merchant.merchantName,
          juristic_type: JuristicTypeCIS.PERSONAL,
          organize_type: OrganizeTypeCIS.BRANCH,
          tax_id: merchant.organization.taxId,
          contact_shown_highest_authority: false,
          is_dopa: true,
          is_dbd: true,
          kyc_status:
            KycStatusCIS[merchant.organization.kycStatus] || KycStatusCIS.NONE,
          active_status: true,
        };

        await this.cisService.updateJuristicProfile(merchantPayload);

        return 'Update successful';
      }
      return 'Update fail';
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed update store and merchant',
          error: {
            code: 'FAILED_UPDATE_STORE_MERCHANT',
            details: error.message || 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMerchantMember(
    organizationId: number,
    merchantUuid: string,
    updateMerchantMemberDto: UpdateMerchantMemberDto,
  ) {
    try {
      const merchant = await this.merchantRepo.findOne({
        where: { uuid: merchantUuid },
        select: ['id'],
      });
      const findUpdatedUser = await this.userRepo.findOne({
        where: { uuid: updateMerchantMemberDto.userUuid },
        select: ['id'],
      });
      if (!findUpdatedUser) {
        throw new HttpException(
          {
            message: 'User not found',
            data: { code: 'USER_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const merchantMember = await this.userMerchantService.findMember(
        merchant.id,
        findUpdatedUser.id,
      );

      await this.roleService.findRoleIdInOrganization(
        updateMerchantMemberDto.roleId,
        organizationId,
      );
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `merchant:members:${merchantUuid}:*`,
        ),
      ]);
      return this.userMerchantService.updateMerchantMember(
        merchantMember,
        updateMerchantMemberDto.roleId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }

  async deleteMerchantMember(merchantUuid: string, userId: string) {
    try {
      const merchant = await this.merchantRepo.findOne({
        where: { uuid: merchantUuid },
      });
      const user = await this.userRepo.findOne({ where: { uuid: userId } });
      await this.userMerchantService.deleteMerchantMember(merchant.id, user.id);
      const response = await this.cisService.getCustomerRelationShip(
        user.cisNumber,
        merchant.cisNumber,
        RelationType.EMPLOYEE,
      );
      await this.cisService.deleteCustomerRelationShip(response.cis_number.id);
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `merchant:availableUsers:m:${merchantUuid}:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `organization:store-member-count:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `merchant:members:${merchantUuid}:*`,
        ),
      ]);

      return 'Delete success';
    } catch (error) {
      console.log(error);
    }
  }

  async createMerchant(data: CreateShopDto) {
    try {
      const user = await this.userService.findByPhoneNumber(data.phoneNumber);
      if (!user) {
        throw new HttpException(
          { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!data?.organizeInfo?.id) {
        throw new HttpException(
          {
            message: 'Organization Id is required',
            data: { code: 'ORGANIZATION_ID_REQUIRED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const userOrganization =
        await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
          user.id,
          data.organizeInfo.id,
        );
      const allowedRoles = [RoleCis.SUPER_ADMIN, RoleCis.OWNER];
      if (
        userOrganization?.role &&
        !allowedRoles.includes(userOrganization?.role?.name as RoleCis)
      ) {
        throw new HttpException(
          {
            message: 'User does not have permission to create merchant',
            data: { code: 'USER_DOES_NOT_ALLOW' },
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // check format subdomain
      const validateSubdomainFormat = SubdomainUtils.validateSlugFormat(
        data?.slug,
      );
      if (validateSubdomainFormat?.errors.length > 0) {
        throw new BadRequestException(validateSubdomainFormat.errors);
      }
      // check isExisting subdomain
      const slugCheck = async (): Promise<boolean> => {
        const existingSlug = await this.merchantRepo.findOne({
          where: { slug: data?.slug },
        });
        return !!existingSlug; // Ensures a boolean is returned
      };
      if (await slugCheck()) {
        throw new BadRequestException('Slug already exists');
      }

      let merchantCisNumber: string;
      let storeCisNumber: string;
      let registerStatus: RegisterStatus = RegisterStatus.IN_PROGRESS;

      if (
        data.type === OrganizationType.JURISTIC ||
        data.type === OrganizationType.PERSONAL ||
        data.type === OrganizationType.REGISTERED_INDIVIDUAL
      ) {
        const createOrganizationResult = await this.createOrganizationMerchant(
          data,
          user.cisNumber,
        );
        merchantCisNumber = createOrganizationResult.storeBranchCisNumber;
        storeCisNumber = createOrganizationResult.storeCisNumber;

        if (createOrganizationResult.status === successStatus) {
          registerStatus = RegisterStatus.COMPLETED;
        }
      } else {
        throw new HttpException(
          {
            message: 'Invalid organization type',
            data: { code: 'INVALID_ORGANIZATION_TYPE' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      data.merchantName = 'สำนักงานใหญ่';
      data.merchantBranchCode = defaultBranchCode;
      const createMerchant = await this.createStoreAndMerchant(
        data,
        merchantCisNumber,
        storeCisNumber,
        registerStatus,
      );

      if (registerStatus === RegisterStatus.COMPLETED) {
        // Clear cache
        clearCacheByPattern(
          this.cacheManager,
          `register:user-profile:cc:${data?.countryCode}:pn:${data?.phoneNumber}:app:*`,
        );

        return {
          status: 'success',
          message: 'Shop created successfully',
          accessToken: createMerchant.accessToken,
        };
      } else {
        throw new HttpException(
          'Failed to create shop',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorHandler.handleInternalServerError(
        `Error creating shop for phone number ${data.phoneNumber}`,
        error.message,
      );
    }
  }

  private async createStoreAndMerchant(
    data: CreateShopDto,
    merchantCisNumber: string,
    storeCisNumber: string,
    registerStatus: RegisterStatus,
  ): Promise<{ accessToken: string }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orgInfo = data?.organizeInfo;

      if (!orgInfo) {
        throw new HttpException(
          {
            message: 'Organization information is required',
            data: { code: 'ORGANIZATION_INFO_REQUIRED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.userService.findByPhoneNumber(
        data.phoneNumber,
      );
      if (!existingUser) {
        throw new HttpException(
          { message: 'User not found', data: { code: 'USER_NOT_FOUND' } },
          HttpStatus.NOT_FOUND,
        );
      }

      const taxId = orgInfo.taxId || orgInfo.idCard;

      const store = new Store();
      store.storeBranchName = data.shopName;
      store.storeBranchCode = defaultBranchCode;
      store.customerProfileType = 'OFFICIAL_BRAND';
      store.customerStatus = StoreCustomerStatus.VISITOR;
      store.storeType = StoreType.HEAD_OFFICE;
      store.organizeId = orgInfo.id;
      store.organizeBranchId =
        orgInfo.organizeBranchInfo?.organizeBranchId || null;
      store.relationshipTypeOrganize = RelationType.BRANCH;
      store.cisNumber = storeCisNumber || null;

      const storeResult = await queryRunner.manager.save(store);
      if (!storeResult) {
        throw new HttpException(
          {
            message: 'Failed to create store',
            data: { code: 'STORE_CREATION_FAILED' },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const merchantDto = {
        merchantName: data.merchantName,
        merchantBranchCode: data.merchantBranchCode,
        slug: data.slug,
        tel: data.phoneNumber,
        cisNumber: merchantCisNumber,
        organizeId: orgInfo.id,
        storeId: storeResult.id,
      };

      const merchant = new Merchant();
      Object.assign(merchant, merchantDto);

      const merchantResult = await queryRunner.manager.save(merchant);
      if (!merchantResult) {
        throw new HttpException(
          {
            message: 'Failed to create merchant',
            data: { code: 'MERCHANT_CREATION_FAILED' },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const merchantTranslation = new MerchantTranslation();
      merchantTranslation.name = data.shopName;
      merchantTranslation.description = '';
      merchantTranslation.locale = 'th';
      merchantTranslation.merchant = merchant;

      await queryRunner.manager.save(merchantTranslation);

      if (!data?.skipRegisterStep) {
        existingUser.registerStatus = registerStatus;
      }

      await queryRunner.manager.save(existingUser);

      // Find OWNER role
      const ownerRole = await queryRunner.manager
        .getRepository(Role)
        .findOne({ where: { name: 'OWNER' } });

      // Create UserMerchant relationship with roleId
      const userMerchant = new UserMerchant();
      userMerchant.userId = existingUser.id;
      userMerchant.merchantId = merchantResult.id;
      userMerchant.roleId = ownerRole?.id || null;
      userMerchant.lastAccessedAt = new Date();

      await queryRunner.manager.save(userMerchant);

      const payload = {
        userId: existingUser.id,
        phoneNumber: existingUser.tel,
        slug: data.slug,
        merchantId: merchant.id,
        role: existingUser.role,
      };

      await queryRunner.commitTransaction();

      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('Error creating user and merchant:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error creating user and merchant: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createOrganizationMerchant(
    data: CreateShopDto,
    userCisNumber: string,
  ): Promise<{
    storeCisNumber: string;
    status: string;
    storeBranchCisNumber: string;
  }> {
    try {
      const orgInfo = data?.organizeInfo;

      if (!orgInfo) {
        throw new HttpException(
          'Organization information is required for merchant creation',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Find master data by id
      const masterJuristicType = await this.cisService.findMasterDataById(
        Platform.SELLER,
        {
          app_id: this.configService.get<number>('APP_ID_SELLER'),
          master_code: 'JURISTIC_TYPE',
          code: orgInfo.juristicType,
        },
      );

      // Determine organization type and tax ID based on organization type
      const isJuristic = data.type === OrganizationType.JURISTIC;
      const organizeType = isJuristic
        ? OrganizeTypeCIS[orgInfo.organizeBranchType] ||
          OrganizeTypeCIS.HEAD_OFFICE
        : OrganizeTypeCIS.HEAD_OFFICE;
      const taxId = isJuristic ? orgInfo.taxId : orgInfo.idCard;

      // Create shop profile - Store
      const shopPayload = {
        customer_profile_type: CustomerProfileType.OFFICIAL_BRAND,
        customer_status: CustomerStatusCIS.VISITOR,
        juristic_name: data.shopName,
        juristic_type: masterJuristicType
          ? masterJuristicType?.data?.id
          : JuristicTypeCIS[orgInfo.juristicType],
        organize_type: organizeType,
        tax_id: taxId,
      };
      const shopProfile = await this.cisService.createJuristicProfile(
        shopPayload,
      );

      if (!shopProfile.cis_number)
        throw new HttpException(
          {
            message: 'Unable to create shop CIS number for organization',
            data: { code: 'SHOP_CIS_CREATION_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );

      // Create branch profile - Store branch
      const branchPayload = {
        customer_profile_type: CustomerProfileType.OFFICE,
        customer_status: CustomerStatusCIS.VISITOR,
        juristic_name: data?.merchantName ? data.merchantName : 'สำนักงานใหญ่',
        juristic_type: masterJuristicType
          ? masterJuristicType?.data?.id
          : JuristicTypeCIS[orgInfo.juristicType],
        organize_type: organizeType,
        branch_number: defaultBranchCode,
        tax_id: taxId,
      };
      const branchProfile = await this.cisService.createJuristicProfile(
        branchPayload,
      );

      if (!branchProfile.cis_number)
        throw new HttpException(
          'Unable to create branch CIS number for organization',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // Link user with shop
      const linkUserWithShopResult = await this.cisService.createRelationship(
        userCisNumber,
        shopProfile.cis_number,
        RelationType.EMPLOYEE,
        RoleCis.OWNER,
        true,
      );

      if (!linkUserWithShopResult.cis_number)
        throw new HttpException(
          'Unable to link user with shop',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // Link shop with branch
      const linkShopWithBranchResult = await this.cisService.createRelationship(
        shopProfile.cis_number,
        branchProfile.cis_number,
        RelationType.BRANCH,
        null,
        true,
      );

      if (!linkShopWithBranchResult.cis_number)
        throw new HttpException(
          'Unable to link shop with branch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // Link user with branch
      const linkUserWithBranchResult = await this.cisService.createRelationship(
        userCisNumber,
        branchProfile.cis_number,
        RelationType.EMPLOYEE,
        RoleCis.OWNER,
        true,
      );

      if (!linkUserWithBranchResult.cis_number)
        throw new HttpException(
          'Unable to link user with branch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // Link shop with org
      const linkShopAndOrgBranchResult =
        await this.cisService.createRelationship(
          orgInfo.cisNumber,
          shopProfile.cis_number,
          RelationType.BRANCH,
          null,
          true,
        );

      if (!linkShopAndOrgBranchResult.cis_number)
        throw new HttpException(
          'Unable to link shop with org branch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // Link branch with org
      const linkBranchAndOrgBranchResult =
        await this.cisService.createRelationship(
          orgInfo.cisNumber,
          branchProfile.cis_number,
          RelationType.BRANCH,
          null,
          true,
        );

      if (!linkBranchAndOrgBranchResult.cis_number)
        throw new HttpException(
          'Unable to link branch with org branch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return {
        storeCisNumber: shopProfile.cis_number,
        storeBranchCisNumber: branchProfile.cis_number,
        status: successStatus,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error in organization merchant creation process: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMerchantListByOrganizationId(
    organizationId: number,
  ): Promise<(Merchant & { memberCount: number })[]> {
    const merchants = await this.merchantRepo
      .createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.merchantLogo', 'merchantLogo')
      .leftJoinAndSelect('merchantLogo.imageUpload', 'logo')
      .leftJoinAndSelect('merchant.merchantIcon', 'merchantIcon')
      .leftJoinAndSelect('merchantIcon.imageUpload', 'icon')
      .leftJoinAndSelect('merchant.merchantTranslations', 'merchantTranslation')
      .leftJoinAndSelect('merchant.userMerchant', 'userMerchant')
      .loadRelationCountAndMap('merchant.memberCount', 'merchant.userMerchant')
      .where('merchant.organizeId = :organizeId', {
        organizeId: organizationId,
      })
      .getMany();

    return merchants as (Merchant & { memberCount: number })[];
  }
}
