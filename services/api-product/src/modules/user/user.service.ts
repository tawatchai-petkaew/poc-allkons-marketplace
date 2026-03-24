import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Merchant, MerchantStatus } from '../../model/merchant.entity';
import { User } from '../../model/user.entity';
import { Customer } from '@/model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  public async showById(id: number): Promise<User> {
    const user = await this.findById(id);

    delete user.password;
    delete user.originalPassword;
    return user;
  }

  public async currentMerchant(userId: any, slug: string): Promise<Merchant> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
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

    if (!merchant) {
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

  async findById(id: number) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.merchants', 'merchants')
      .leftJoinAndSelect('user.admins', 'admins')
      .leftJoinAndSelect('admins.merchant', 'adminMerchant')
      .leftJoinAndSelect('user.imageUpload', 'imageUpload')
      .leftJoinAndSelect('merchants.organization', 'organization')
      .where('user.id = :id', { id })
      .getOne();

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

  public async requestCurrentCustomer(dto: any, slug: any): Promise<Customer> {
    const merchant = await this.merchantRepo.findOne({
      where: {
        slug,
      },
    });
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
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

  public async requestCurrentAdmin(dto: any, slug: any) {
    return null;
  }
}
