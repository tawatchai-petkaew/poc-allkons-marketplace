import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant, MerchantStatus } from '@/model/merchant.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestContext } from '@/model/request-context.model';

import { Organization } from '@/model/organiztion.entity';
import { Repository } from 'typeorm';
import { User } from '@/model/user.entity';
import { Cache } from 'cache-manager';
import { Customer } from '@/model/customer.entity';

@Injectable()
export class RequestContextService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  get currentUser() {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.req.user) || null;
  }

  public async currentMerchant() {
    const requestContext = this.currentRequest;
    const merchant: Merchant = await this.requestCurrentMerchant(
      requestContext.req.user,
      requestContext.req.headers.currentmerchantslug,
    );

    return merchant;
  }
  public async requestCurrentMerchant(dto: any, slug: any): Promise<Merchant> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
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

  public async currentMerchantOnSlug() {
    const requestContext = this.currentRequest;
    const merchant: Merchant = await this.requestMerchantBySlug(
      requestContext.req.headers.currentmerchantslug,
    );

    return merchant;
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
      .leftJoinAndSelect('merchant.merchantPolicy', 'merchantPolicy')
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
      merchantPolicy: {
        ...merchant.merchantPolicy,
        privacyPolicy: '<p></p>',
      },
    };

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  public async currentCustomer() {
    const requestContext = this.currentRequest;
    const customer: Customer = await this.requestCurrentCustomer(
      requestContext.req.user,
      requestContext.req.headers.currentmerchantslug,
    );

    return customer;
  }
  public async requestCurrentCustomer(dto: any, slug: any): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: {
        user: { id: dto.userId },
        merchant: { slug },
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

  // public async currentPublicCustomer() {
  //   const requestContext = this.currentRequest;
  //   const customer: Customer =
  //     requestContext.req.user && requestContext.req.headers.currentmerchantslug
  //       ? await this.userService.requestCurrentCustomer(
  //           requestContext.req.user,
  //           requestContext.req.headers.currentmerchantslug
  //         )
  //       : undefined;

  //   return customer;
  // }

  // public async currentAdmin() {
  //   const requestContext = this.currentRequest;
  //   const admin: Admin = await this.userService.requestCurrentAdmin(
  //     requestContext.req.user,
  //     requestContext.req.headers.currentmerchantslug
  //   );

  //   return admin;
  // }

  // public async currentUserOrganization() {
  //   const requestContext = this.currentRequest;
  //   const userOrganization: UserOrganization =
  //     await this.userOrganizationService.requestCurrentUserOrganization(
  //       requestContext.req.user,
  //       +(requestContext.req as any).authPayload.organizeId
  //     );
  //   return userOrganization;
  // }

  public async currentOrganization() {
    const requestContext = this.currentRequest;
    const organization: Organization = await this.findOrgById(
      +(requestContext.req as any).authPayload.organizationId,
    );
    return organization;
  }

  async findOrgById(id: number): Promise<Organization> {
    // Check cache first
    const cacheKey = `organization:${id}`;
    const cachedOrganization = await this.cacheManager.get<Organization>(
      cacheKey,
    );

    if (cachedOrganization) {
      return cachedOrganization;
    }

    // Cache miss - query database
    const organization = await this.organizationRepo.findOne({
      where: {
        id,
      },
    });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, organization, 300);

    return organization;
  }

  get currentRequestId(): number | null {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.requestId) || null;
  }

  get currentLang() {
    const requestContext = this.currentRequest;
    return (requestContext && requestContext.req.headers.lang) || 'th';
  }

  private get currentRequest() {
    const requestContext = RequestContext.currentContext;
    return requestContext || null;
  }
}
