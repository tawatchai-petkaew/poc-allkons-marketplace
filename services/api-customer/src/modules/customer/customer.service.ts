import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { I18nContext } from 'nestjs-i18n';

import { Merchant } from '../../model/merchant.entity';
import { Customer } from '../../model/customer.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { UserService } from '../user/user.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { CustomerAddressDto } from './dto/customer-address.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RequestContextService } from '../request-context/request-context.service';
import { CartDto } from './dto/cart.dto';
import { Cart } from '../../model/cart.entity';
import { User } from '../../model/user.entity';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepo: Repository<CustomerAddress>,
    private readonly userService: UserService,
    private readonly contextService: RequestContextService,
  ) {}

  public async getAll(
    options: IPaginationOptions,
    merchantSlug: string,
    userId: any,
    withPagination: string = 'true',
    fullName: string = '',
    tel: string = '',
  ): Promise<any> {
    const merchant: Merchant = await this.userService.currentMerchant(
      userId,
      merchantSlug,
    );

    let customers = await this.customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.merchant', 'merchant')
      .leftJoinAndSelect('customer.cart', 'cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItem')
      .leftJoinAndSelect('cartItem.productItem', 'cartProductItem')
      .leftJoinAndSelect('cartProductItem.product', 'cartProductItemProduct')
      .leftJoinAndSelect(
        'cartProductItemProduct.productTranslations',
        'cartProductTranslation',
      )
      .leftJoinAndSelect('customer.customerAddresses', 'customerAddress')
      .leftJoinAndSelect('customer.orders', 'order')
      .leftJoinAndSelect('customer.imageUpload', 'imageUpload')
      .leftJoinAndSelect('order.invoice', 'invoice')
      .withDeleted()
      .where('merchant.id = :id', { id: merchant.id })
      .andWhere('customer.tel IS NOT NULL');

    if (fullName !== '') {
      customers = await customers.andWhere('customer.fullName like :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (tel !== '') {
      customers = await customers.andWhere('customer.tel like :tel', {
        tel: `%${tel}%`,
      });
    }

    if (tel !== '') {
      customers = await customers.andWhere('customer.tel like :tel', {
        tel: `%${tel}%`,
      });
    }

    ///////////////
    // DEMO SHOP
    //////////////

    if (merchant.slug === process.env.DEMO_MERCHANT_SLUG) {
      customers = await customers.andWhere('customer.tel like :tel', {
        tel: `0000000000`,
      });
    }

    customers = await customers.orderBy('customer.id', 'DESC');

    if (withPagination === 'true') {
      const customersResult = await paginate<Customer>(customers, options);

      return {
        data: customersResult.items,
        meta: customersResult.meta,
      };
    } else {
      const customersResult = await customers.getMany();

      const result = customersResult.map((item) => {
        return CustomerDto.fromEntity(item, {});
      });

      return {
        data: result,
      };
    }
  }

  public async create(
    dto: CreateCustomerDto,
    userId: any,
    merchantSlug: string,
    i18n: I18nContext,
  ) {
    const merchant: Merchant = await this.userService.currentMerchant(
      userId,
      merchantSlug,
    );
    const validateCustomerExistOnMerchant =
      await this.isValidExistCustomOnMerchant(
        dto.tel,
        dto.countryCode,
        merchant,
      );

    if (!validateCustomerExistOnMerchant) {
      throw new Error(i18n.t('errors.TEL_EXISTS'));
    }

    const parentDto = {
      ...dto,
      merchant: merchant,
    };

    return null;
  }

  public async showById(id: number): Promise<CustomerDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    const initCustomer = await this.customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.merchant', 'merchant')
      .leftJoinAndSelect('customer.imageUpload', 'profileImage')
      .leftJoinAndSelect('customer.customerAddresses', 'customerAddress')
      .withDeleted()
      .where('customer.id = :id', { id: id })
      .andWhere('merchant.slug = :slug', { slug: merchant.slug })
      .getOne();

    const customerWithCustomerWallet = await this.customerRepo
      .createQueryBuilder('customer')
      .withDeleted()
      .where('customer.id = :id', { id: initCustomer.id })
      .orderBy('customerWalletTransaction.id', 'DESC')
      .getOne();

    const customerWithOrder = await this.customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'order')
      .leftJoinAndSelect('order.invoice', 'invoice')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.productItem', 'productItem')
      .leftJoinAndSelect('productItem.product', 'product')
      .leftJoinAndSelect('productItem.productDiscount', 'productDiscount')
      .leftJoinAndSelect('product.productImages', 'productImage')
      .leftJoinAndSelect('productImage.imageUpload', 'imageUpload')
      .withDeleted()
      .where('customer.id = :id', { id: initCustomer.id })
      .orderBy('order.id', 'DESC')
      .getOne();

    const customerWithCustomerProductFavorites = await this.customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect(
        'customer.customerProductFavorites',
        'customerProductFavorite',
      )
      .leftJoinAndSelect('customerProductFavorite.product', 'productFavorite')
      .leftJoinAndSelect(
        'productFavorite.productImages',
        'productFavoriteImage',
      )
      .leftJoinAndSelect(
        'productFavorite.productTranslations',
        'customerProductTranslation',
      )
      .leftJoinAndSelect(
        'productFavoriteImage.imageUpload',
        'productFavoriteImageUpload',
      )
      .withDeleted()
      .where('customer.id = :id', { id: initCustomer.id })
      .getOne();

    const customerWithCart = await this.customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.cart', 'cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItem')
      .leftJoinAndSelect('cartItem.productItem', 'cartProductItem')
      .leftJoinAndSelect('cartProductItem.product', 'cartProductItemProduct')
      .leftJoinAndSelect(
        'cartProductItem.productDiscount',
        'cartProductItemProductDiscount',
      )
      .leftJoinAndSelect(
        'cartProductItem.productBigUnitDiscount',
        'cartProductItemProductBigUnitDiscount',
      )
      .leftJoinAndSelect(
        'cartProductItemProduct.productImages',
        'cartProductItemProductProductImage',
      )
      .leftJoinAndSelect(
        'cartProductItemProduct.productTranslations',
        'cartProductTranslation',
      )
      .leftJoinAndSelect(
        'cartProductItemProductProductImage.imageUpload',
        'cartProductItemProductProductImageImageUpload',
      )
      .withDeleted()
      .where('customer.id = :id', { id: initCustomer.id })
      .getOne();

    const customerObject = {
      ...initCustomer,
      customerWallet: null,
      orders: customerWithOrder.orders,
      customerProductFavorites: null,
      cart: customerWithCart.cart,
    };

    const customer = CustomerDto.toEntity(customerObject);

    return null;
  }

  public async update(
    id: number,
    dto: UpdateCustomerDto,
    userId: any,
    merchantSlug: string,
    i18n: I18nContext,
  ): Promise<CustomerDto> {
    const merchant: Merchant = await this.userService.currentMerchant(
      userId,
      merchantSlug,
    );
    const customer: Customer = await this.customerRepo.findOne(id, {
      relations: ['user', 'user.merchants'],
    });

    const validateCustomerExistOnMerchant =
      await this.isValidUpdateExistCustomOnMerchant(
        customer.id,
        dto.tel || customer.tel,
        dto.countryCode || customer.countryCode,
        merchant,
      );

    if (!validateCustomerExistOnMerchant) {
      throw new Error(i18n.t('errors.TEL_EXISTS'));
    }

    const customerUpdated = this.updateCustomer(dto, merchant, customer);

    return customerUpdated.then(async (customer) => {
      await this.createOrUpdateCustomerAddress(dto, customer);

      return customer;
    });
  }

  public async delete(id: number) {
    return await this.customerRepo.softDelete(id);
  }

  public async createCustomerCart(id: number) {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const customer: Customer = await this.customerRepo.findOne({ id });

    const cartDto = {
      customer,
      merchant,
    };

    const cart = await this.cartRepo.save(CartDto.toEntity(cartDto));

    return cart;
  }

  public async updateUserCustomer(id: number, userId: number) {
    const customer: Customer = await this.customerRepo.findOne({ id });
    const user: User = await this.userRepo.findOne({ id: userId });

    const customerDto = {
      ...customer,
      user,
    };

    const customerEntity = await UpdateCustomerDto.toEntity(customerDto);

    await this.customerRepo.save(Object.assign(customer, customerEntity));
  }

  public async manaulCreateCustomerWallet() {
    return 'error.MANUAL_CREATE_CUSTOMER_WALLET_NOT_ALLOW';
  }

  public async getCustomerWallet(id: number) {
    return 'error.CUSTOMER_WALLET_NOT_AVAILABLE';
  }

  private async createOrUpdateCustomerAddress(dto, customer) {
    const customerAddresses = await dto.customerAddressAttributes?.map(
      async (address) => {
        if (address.id) {
          const customerAddress = await this.customerAddressRepo.findOne(
            address.id,
          );

          const dto = {
            ...address,
            customer: customer,
          };

          const customerAddressEntity = await CustomerAddressDto.toEntity(dto);

          const updatedCustomerAddress = await this.customerAddressRepo.save(
            Object.assign(customerAddress, customerAddressEntity),
          );
        } else if (!address.id) {
          const dto: CustomerAddressDto = {
            ...address,
            customer: customer,
          };

          return await this.customerAddressRepo.save(
            CustomerAddressDto.toEntity(dto),
          );
        }
      },
    );

    return customerAddresses;
  }

  private async createCart(customer: Customer, merchant: Merchant) {
    const cartDto = {
      customer,
      merchant,
    };

    await this.cartRepo.save(CartDto.toEntity(cartDto));
  }

  private async createCustomerWallet(customer: Customer) {
    return 'error.MANUAL_CREATE_CUSTOMER_WALLET_NOT_ALLOW';
  }

  private async createCustomerAddress(dto, customer) {
    dto.customerAddressAttributes.forEach(async (customerAddressAttributes) => {
      const dto: CreateCustomerAddressDto = {
        ...customerAddressAttributes,
        customer: customer,
      };

      await this.customerAddressRepo.save(
        CreateCustomerAddressDto.toEntity(dto),
      );
    });
  }

  private async updateCustomer(dto, merchant, customer) {
    const parentDto: CustomerDto = {
      ...dto,
      merchant: merchant,
    };

    const customerEntity = UpdateCustomerDto.toEntity(parentDto);

    return this.customerRepo.save(Object.assign(customer, customerEntity));
  }

  private async isValidExistCustomOnMerchant(tel, countryCode, merchant) {
    const customer = await this.customerRepo.findOne({
      where: {
        tel: tel,
        countryCode: countryCode,
        merchant: merchant,
      },
    });

    if (customer) {
      return false;
    }

    return true;
  }

  private async isValidUpdateExistCustomOnMerchant(
    customerId,
    tel,
    countryCode,
    merchant,
  ) {
    const customer = await this.customerRepo.findOne({
      where: {
        tel: tel,
        countryCode: countryCode,
        merchant: merchant,
        id: Not(customerId),
      },
    });

    if (customer) {
      return false;
    }

    return true;
  }
}
