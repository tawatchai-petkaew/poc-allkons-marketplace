import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { I18nContext } from 'nestjs-i18n';

import { Customer } from '../../model/customer.entity';
import { CustomerAddress } from '../../model/customer-address.entity';
import { User, UserRole } from '../../model/user.entity';
import { Merchant } from '../../model/merchant.entity';
import { Cart } from '../../model/cart.entity';
import { ImageUpload } from '../../model/image-upload.entity';

import { RequestContextService } from '../request-context/request-context.service';
import { ImageUploadService } from '../image-upload/image-upload.service';

import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerAddressDto } from './dto/customer-address.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CartDto } from '../customer/dto/cart.dto';
import { ImageUploadDto } from '../image-upload/dto/image-upload.dto';
import { UserDto } from '../user/dto/user.dto';
import { SetTelCustomerDto } from './dto/set-tel-customer.dto';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { CreateCustomerWithTelDto } from './dto/create-customer-with-tel.dto';

require('dotenv').config();

@Injectable()
export class CustomerPublicService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepo: Repository<CustomerAddress>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    private readonly contextService: RequestContextService,
    private imageUploadService: ImageUploadService,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  public async get(): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();

    return {
      data: CustomerDto.fromEntity(customer, {}),
    };
  }

  public async updateRegistrationToken(
    customer: Customer,
    registrationToken: string,
  ): Promise<any> {
    const dto = {
      registrationToken,
    };

    const customerEntity = UpdateCustomerDto.toEntity(dto);

    const customerEntityUpdated = await this.customerRepo.save({
      ...customer,
      ...customerEntity,
    });

    return customerEntityUpdated;
  }

  public async findCustomerByUserId(
    userId: number,
    currentmerchantslug: string,
  ): Promise<any> {
    const merchant: Merchant = await this.merchantRepo.findOne({
      where: {
        slug: currentmerchantslug,
      },
    });
    const user: User = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });
    const customer: Customer = await this.customerRepo.findOne({
      where: {
        merchant,
        user,
      },
      relations: ['merchant'],
    });

    return customer;
  }

  public async createOrLoginOnAppleSignIn(
    data: any,
    merchantSlug: string,
  ): Promise<any> {
    return 'CREATE_OR_LOGIN_ON_APPLE_SIGN_IN_NOT_AVAILABLE';
  }

  public async createOrLogin(
    initDto: CreateCustomerDto,
    merchantSlug: string,
    i18n: I18nContext,
  ): Promise<any> {
    const dto = {
      ...initDto,
      tel: initDto?.tel?.length === 10 ? initDto?.tel : `0${initDto?.tel}`,
    };

    ////////////////////
    /// TEST ACCOUNT
    ////////////////////

    if (dto?.tel === '0000000000' && dto?.pin === '181818') {
      const merchant: Merchant = await this.merchantRepo.findOne({
        where: {
          slug: merchantSlug,
        },
      });
      const userExists = await this.userRepo.find({
        where: {
          role: UserRole.CUSTOMER,
          tel: dto?.tel,
        },
        relations: ['merchants'],
      });
      const userExist = userExists.find((user) =>
        user.merchants.map((merchant) => merchant.id).includes(merchant.id),
      );

      if (userExist) {
        const customerData: Customer = await this.customerRepo.findOne({
          where: {
            user: userExist,
            merchant,
          },
          relations: ['user'],
        });

        const customerDataWithTel: Customer = await this.customerRepo.findOne({
          where: {
            tel: dto?.tel,
            merchant,
          },
          relations: ['user'],
        });

        if (
          customerData &&
          customerDataWithTel &&
          customerData.id === customerDataWithTel.id
        ) {
          return CreateCustomerDto.fromEntity(customerData);
        } else {
          if (customerDataWithTel) {
            const customerDto = {
              user: userExist,
            };
            const customerEntity = UpdateCustomerDto.toEntity(customerDto);
            await this.customerRepo.save({
              ...customerDataWithTel,
              ...customerEntity,
            });

            const updatedCustomerExistOnMerchant =
              await this.customerRepo.findOne({
                where: {
                  id: customerDataWithTel.id,
                },
                relations: ['user'],
              });

            return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
          } else {
            const parentDto = {
              ...dto,
              user: userExist,
              merchant,
            };
            const customer: Customer = await this.customerRepo.save(
              CreateCustomerDto.toEntity(parentDto),
            );
            const customerData: Customer = await this.customerRepo.findOne({
              where: {
                id: customer.id,
              },
              relations: ['user'],
            });

            const cartDto = {
              customer,
              merchant,
            };

            await this.cartRepo.save(CartDto.toEntity(cartDto));

            const customerWalletDto = {
              customer,
            };

            return CreateCustomerDto.fromEntity(customerData);
          }
        }
      } else {
        const userDto = {
          role: UserRole.CUSTOMER,
          locale: null,
          tel: dto?.tel,
          merchants: [merchant],
        };
        const user = User.create(userDto);
        await user.save();

        const customerExistOnMerchant = await this.customerRepo.findOne({
          where: {
            tel: dto?.tel,
            merchant,
          },
          relations: ['user'],
        });

        if (dto.tel && customerExistOnMerchant) {
          const customerDto = {
            user,
          };
          const customerEntity = UpdateCustomerDto.toEntity(customerDto);
          await this.customerRepo.save({
            ...customerExistOnMerchant,
            ...customerEntity,
          });

          const updatedCustomerExistOnMerchant =
            await this.customerRepo.findOne({
              where: {
                id: customerExistOnMerchant.id,
              },
              relations: ['user'],
            });

          return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
        } else {
          const parentDto = {
            ...dto,
            user,
            merchant,
          };
          const customer: Customer = await this.customerRepo.save(
            CreateCustomerDto.toEntity(parentDto),
          );
          const customerData: Customer = await this.customerRepo.findOne({
            where: {
              id: customer.id,
            },
            relations: ['user'],
          });

          const cartDto = {
            customer,
            merchant,
          };

          await this.cartRepo.save(CartDto.toEntity(cartDto));

          const customerWalletDto = {
            customer,
          };

          return CreateCustomerDto.fromEntity(customerData);
        }
      }
    }

    ///////////////////////
    /// END TEST ACCOUNT
    //////////////////////

    const merchant: Merchant = await this.merchantRepo.findOne({
      where: {
        slug: merchantSlug,
      },
    });
    const userExists = await this.userRepo.find({
      where: {
        role: UserRole.CUSTOMER,
        tel: dto?.tel,
      },
      relations: ['merchants'],
    });
    const userExist = userExists.find((user) =>
      user.merchants.map((merchant) => merchant.id).includes(merchant.id),
    );
    await this.httpService
      .get(
        `https://verify.8x8.com/api/v2/subaccounts/${process.env.SMS_SUB_ACCOUNT_ID}/sessions/${dto?.token}?code=${dto?.pin}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SMS_KEY}`,
          },
        },
      )
      .toPromise()
      .then((res) => {
        if (res.data?.status === 'VERIFIED') {
          return null;
        } else {
          throw new Error(i18n.t('errors.ERORR_WRONG_PIN'));
        }
      })
      .catch((err) => {
        console.log(err);
        throw new Error(i18n.t('errors.ERORR_WRONG_PIN'));
      });

    if (userExist) {
      const customerData: Customer = await this.customerRepo.findOne({
        where: {
          user: userExist,
          merchant,
        },
        relations: ['user'],
      });

      const customerDataWithTel: Customer = await this.customerRepo.findOne({
        where: {
          tel: dto?.tel,
          merchant,
        },
        relations: ['user'],
      });

      if (
        customerData &&
        customerDataWithTel &&
        customerData.id === customerDataWithTel.id
      ) {
        return CreateCustomerDto.fromEntity(customerData);
      } else {
        if (customerDataWithTel) {
          const customerDto = {
            user: userExist,
          };
          const customerEntity = UpdateCustomerDto.toEntity(customerDto);
          await this.customerRepo.save({
            ...customerDataWithTel,
            ...customerEntity,
          });

          const updatedCustomerExistOnMerchant =
            await this.customerRepo.findOne({
              where: {
                id: customerDataWithTel.id,
              },
              relations: ['user'],
            });

          return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
        } else {
          const parentDto = {
            ...dto,
            user: userExist,
            merchant,
          };
          const customer: Customer = await this.customerRepo.save(
            CreateCustomerDto.toEntity(parentDto),
          );
          const customerData: Customer = await this.customerRepo.findOne({
            where: {
              id: customer.id,
            },
            relations: ['user'],
          });

          const cartDto = {
            customer,
            merchant,
          };

          await this.cartRepo.save(CartDto.toEntity(cartDto));

          const customerWalletDto = {
            customer,
          };

          return CreateCustomerDto.fromEntity(customerData);
        }
      }
    } else {
      const userDto = {
        role: UserRole.CUSTOMER,
        tel: dto?.tel,
        locale: null,
        merchants: [merchant],
      };
      const user = User.create(userDto);
      await user.save();

      const customerExistOnMerchant = await this.customerRepo.findOne({
        where: {
          tel: dto?.tel,
          merchant,
        },
        relations: ['user'],
      });

      if (dto.tel && customerExistOnMerchant) {
        const customerDto = {
          user,
        };
        const customerEntity = UpdateCustomerDto.toEntity(customerDto);
        await this.customerRepo.save({
          ...customerExistOnMerchant,
          ...customerEntity,
        });

        const updatedCustomerExistOnMerchant = await this.customerRepo.findOne({
          where: {
            id: customerExistOnMerchant.id,
          },
          relations: ['user'],
        });

        return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
      } else {
        const parentDto = {
          ...dto,
          user,
          merchant,
        };
        const customer: Customer = await this.customerRepo.save(
          CreateCustomerDto.toEntity(parentDto),
        );
        const customerData: Customer = await this.customerRepo.findOne({
          where: {
            id: customer.id,
          },
          relations: ['user'],
        });

        const cartDto = {
          customer,
          merchant,
        };

        await this.cartRepo.save(CartDto.toEntity(cartDto));

        const customerWalletDto = {
          customer,
        };

        return CreateCustomerDto.fromEntity(customerData);
      }
    }
  }

  public async createOrLoginWithTel(
    initDto: CreateCustomerWithTelDto,
    merchantSlug: string,
    i18n: I18nContext,
  ): Promise<any> {
    const dto = {
      ...initDto,
      tel: initDto?.tel?.length === 10 ? initDto?.tel : `0${initDto?.tel}`,
    };

    // ////////////////////
    // /// TEST ACCOUNT
    // ////////////////////

    // if (dto?.tel === '0000000000' && dto?.pin === '181818') {
    //   const merchant: Merchant = await this.merchantRepo.findOne({
    //     where: {
    //       slug: merchantSlug
    //     }
    //   });
    //   const userExists = await this.userRepo.find({
    //     where: {
    //       role: UserRole.CUSTOMER,
    //       tel: dto?.tel
    //     },
    //     relations: ['merchants']
    //   });
    //   const userExist = userExists.find((user) =>
    //     user.merchants.map((merchant) => merchant.id).includes(merchant.id)
    //   );

    //   if (userExist) {
    //     const customerData: Customer = await this.customerRepo.findOne({
    //       where: {
    //         user: userExist,
    //         merchant
    //       },
    //       relations: ['user']
    //     });

    //     const customerDataWithTel: Customer = await this.customerRepo.findOne({
    //       where: {
    //         tel: dto?.tel,
    //         merchant
    //       },
    //       relations: ['user']
    //     });

    //     if (
    //       customerData &&
    //       customerDataWithTel &&
    //       customerData.id === customerDataWithTel.id
    //     ) {
    //       return CreateCustomerDto.fromEntity(customerData);
    //     } else {
    //       if (customerDataWithTel) {
    //         const customerDto = {
    //           user: userExist
    //         };
    //         const customerEntity = UpdateCustomerDto.toEntity(customerDto);
    //         await this.customerRepo.save({
    //           ...customerDataWithTel,
    //           ...customerEntity
    //         });

    //         const updatedCustomerExistOnMerchant = await this.customerRepo.findOne(
    //           {
    //             where: {
    //               id: customerDataWithTel.id
    //             },
    //             relations: ['user']
    //           }
    //         );

    //         return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
    //       } else {
    //         const parentDto = {
    //           ...dto,
    //           user: userExist,
    //           merchant
    //         };
    //         const customer: Customer = await this.customerRepo.save(
    //           CreateCustomerDto.toEntity(parentDto)
    //         );
    //         const customerData: Customer = await this.customerRepo.findOne({
    //           where: {
    //             id: customer.id
    //           },
    //           relations: ['user']
    //         });

    //         const cartDto = {
    //           customer,
    //           merchant
    //         };

    //         await this.cartRepo.save(CartDto.toEntity(cartDto));

    //         const customerWalletDto = {
    //           customer
    //         };
    //         await this.customerWalletRepo.save(
    //           CreateCustomerWalletDto.toEntity(customerWalletDto)
    //         );

    //         return CreateCustomerDto.fromEntity(customerData);
    //       }
    //     }
    //   } else {
    //     const userDto = {
    //       role: UserRole.CUSTOMER,
    //       locale: merchant.defaultLocale,
    //       tel: dto?.tel,
    //       merchants: [merchant]
    //     };
    //     const user = User.create(userDto);
    //     await user.save();

    //     const customerExistOnMerchant = await this.customerRepo.findOne({
    //       where: {
    //         tel: dto?.tel,
    //         merchant
    //       },
    //       relations: ['user']
    //     });

    //     if (dto.tel && customerExistOnMerchant) {
    //       const customerDto = {
    //         user
    //       };
    //       const customerEntity = UpdateCustomerDto.toEntity(customerDto);
    //       await this.customerRepo.save({
    //         ...customerExistOnMerchant,
    //         ...customerEntity
    //       });

    //       const updatedCustomerExistOnMerchant = await this.customerRepo.findOne(
    //         {
    //           where: {
    //             id: customerExistOnMerchant.id
    //           },
    //           relations: ['user']
    //         }
    //       );

    //       return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
    //     } else {
    //       const parentDto = {
    //         ...dto,
    //         user,
    //         merchant
    //       };
    //       const customer: Customer = await this.customerRepo.save(
    //         CreateCustomerDto.toEntity(parentDto)
    //       );
    //       const customerData: Customer = await this.customerRepo.findOne({
    //         where: {
    //           id: customer.id
    //         },
    //         relations: ['user']
    //       });

    //       const cartDto = {
    //         customer,
    //         merchant
    //       };

    //       await this.cartRepo.save(CartDto.toEntity(cartDto));

    //       const customerWalletDto = {
    //         customer
    //       };
    //       await this.customerWalletRepo.save(
    //         CreateCustomerWalletDto.toEntity(customerWalletDto)
    //       );

    //       return CreateCustomerDto.fromEntity(customerData);
    //     }
    //   }
    // }

    ///////////////////////
    /// END TEST ACCOUNT
    //////////////////////

    const merchant: Merchant = await this.merchantRepo.findOne({
      where: {
        slug: merchantSlug,
      },
    });
    const userExists = await this.userRepo.find({
      where: {
        role: UserRole.CUSTOMER,
        tel: dto?.tel,
      },
      relations: ['merchants'],
    });
    const userExist = userExists.find((user) =>
      user.merchants.map((merchant) => merchant.id).includes(merchant.id),
    );

    if (userExist) {
      const customerData: Customer = await this.customerRepo.findOne({
        where: {
          user: userExist,
          merchant,
        },
        relations: ['user'],
      });

      const customerDataWithTel: Customer = await this.customerRepo.findOne({
        where: {
          tel: dto?.tel,
          merchant,
        },
        relations: ['user'],
      });

      if (
        customerData &&
        customerDataWithTel &&
        customerData.id === customerDataWithTel.id
      ) {
        return CreateCustomerDto.fromEntity(customerData);
      } else {
        if (customerDataWithTel) {
          const customerDto = {
            user: userExist,
          };
          const customerEntity = UpdateCustomerDto.toEntity(customerDto);
          await this.customerRepo.save({
            ...customerDataWithTel,
            ...customerEntity,
          });

          const updatedCustomerExistOnMerchant =
            await this.customerRepo.findOne({
              where: {
                id: customerDataWithTel.id,
              },
              relations: ['user'],
            });

          return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
        } else {
          const parentDto = {
            ...dto,
            user: userExist,
            merchant,
          };
          const customer: Customer = await this.customerRepo.save(
            CreateCustomerDto.toEntity(parentDto),
          );
          const customerData: Customer = await this.customerRepo.findOne({
            where: {
              id: customer.id,
            },
            relations: ['user'],
          });

          const cartDto = {
            customer,
            merchant,
          };

          await this.cartRepo.save(CartDto.toEntity(cartDto));

          const customerWalletDto = {
            customer,
          };

          return CreateCustomerDto.fromEntity(customerData);
        }
      }
    } else {
      const userDto = {
        role: UserRole.CUSTOMER,
        tel: dto?.tel,
        locale: null,
        merchants: [merchant],
      };
      const user = User.create(userDto);
      await user.save();

      const customerExistOnMerchant = await this.customerRepo.findOne({
        where: {
          tel: dto?.tel,
          merchant,
        },
        relations: ['user'],
      });

      if (dto.tel && customerExistOnMerchant) {
        const customerDto = {
          user,
        };
        const customerEntity = UpdateCustomerDto.toEntity(customerDto);
        await this.customerRepo.save({
          ...customerExistOnMerchant,
          ...customerEntity,
        });

        const updatedCustomerExistOnMerchant = await this.customerRepo.findOne({
          where: {
            id: customerExistOnMerchant.id,
          },
          relations: ['user'],
        });

        return CreateCustomerDto.fromEntity(updatedCustomerExistOnMerchant);
      } else {
        const parentDto = {
          ...dto,
          user,
          merchant,
        };
        const customer: Customer = await this.customerRepo.save(
          CreateCustomerDto.toEntity(parentDto),
        );
        const customerData: Customer = await this.customerRepo.findOne({
          where: {
            id: customer.id,
          },
          relations: ['user'],
        });

        const cartDto = {
          customer,
          merchant,
        };

        await this.cartRepo.save(CartDto.toEntity(cartDto));

        const customerWalletDto = {
          customer,
        };

        return CreateCustomerDto.fromEntity(customerData);
      }
    }
  }

  public async update(
    dto: UpdateCustomerDto,
    file,
    i18n: I18nContext,
  ): Promise<CustomerDto> {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const customer: Customer = await this.contextService.currentCustomer();
    const imageUploadDto: ImageUploadDto = file
      ? await this.imageUploadService.uploadWithoutFolder(file)
      : null;
    const imageUpload: ImageUpload = imageUploadDto
      ? await this.imageUploadRepo.findOne(imageUploadDto?.id)
      : undefined;

    const parentDto = {
      ...dto,
      imageUpload,
    };

    const customerEntity = UpdateCustomerDto.toEntity(parentDto);

    const userDto = {
      name: dto.fullName,
      tel: dto.tel,
      email: dto.email,
      gender: dto.gender,
      birthDate: dto.birthDate,
      imageUpload,
    };

    const validateCustomerExistOnMerchant = await this.customerRepo.findOne({
      where: {
        id: Not(customer.id),
        tel: dto?.tel,
        merchant,
      },
    });

    if (dto.tel && validateCustomerExistOnMerchant) {
      throw new Error(i18n.t('errors.TEL_EXISTS'));
    }

    const userEntity = UserDto.toEntity(userDto);

    await this.userRepo.save({ ...customer.user, ...userEntity });

    const customerUpdated = await this.customerRepo.save({
      ...customer,
      ...customerEntity,
    });

    return null;
  }

  public async setTelCustomer(
    dto: SetTelCustomerDto,
    i18n: I18nContext,
  ): Promise<any> {
    if (dto?.tel !== '0000000000' && dto?.pin !== '181818') {
      await this.httpService
        .get(
          `https://verify.8x8.com/api/v2/subaccounts/${process.env.SMS_SUB_ACCOUNT_ID}/sessions/${dto?.token}?code=${dto?.pin}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SMS_KEY}`,
            },
          },
        )
        .toPromise()
        .then((res) => {
          if (res.data?.status === 'VERIFIED') {
            return null;
          } else {
            throw new Error(i18n.t('errors.ERORR_WRONG_PIN'));
          }
        })
        .catch((err) => {
          console.log(err);
          throw new Error(i18n.t('errors.ERORR_WRONG_PIN'));
        });
    }

    const merchant: Merchant = await this.contextService.currentMerchant();
    const customer: Customer = await this.contextService.currentCustomer();
    const validateCustomerExistOnMerchant = await this.customerRepo.findOne({
      where: {
        id: Not(customer.id),
        tel: dto?.tel,
        merchant,
      },
      relations: ['user'],
    });

    if (dto.tel && validateCustomerExistOnMerchant) {
      const customerDto = {
        ...dto,
        user: validateCustomerExistOnMerchant.user,
      };
      const customerEntity = UpdateCustomerDto.toEntity(customerDto);
      await this.customerRepo.save({
        ...validateCustomerExistOnMerchant,
        ...customerEntity,
      });

      await this.customerRepo.softDelete(customer.id);

      const payload = {
        userId: validateCustomerExistOnMerchant.user.id,
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      const customerDto = {
        ...dto,
      };
      const customerEntity = UpdateCustomerDto.toEntity(customerDto);
      const userDto = {
        tel: dto.tel,
        countryCode: dto.countryCode,
      };
      const userEntity = UserDto.toEntity(userDto);
      await this.userRepo.save({ ...customer.user, ...userEntity });

      await this.customerRepo.save({ ...customer, ...customerEntity });

      const payload = {
        userId: customer.user.id,
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }

  public async deleteAccount(): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();
    const merchant: Merchant = await this.contextService.currentMerchant();

    return null;
  }

  public async getCustomerAddresses(): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();
    const customerAddresses: CustomerAddress[] =
      await this.customerAddressRepo.find({
        where: {
          customer: customer,
        },
      });

    return {
      data: customerAddresses.map((customerAddress) => {
        return CustomerAddressDto.fromEntity(customerAddress);
      }),
    };
  }

  public async getCustomerAddress(id: number): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();
    const customerAddress: CustomerAddress =
      await this.customerAddressRepo.findOne({
        where: {
          id,
          customer,
        },
      });

    return {
      data: CustomerAddressDto.fromEntity(customerAddress),
    };
  }

  public async createCustomerAddress(
    dto: CreateCustomerAddressDto,
  ): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();

    const customerAddressDto: CreateCustomerAddressDto = {
      ...dto,
      customer,
    };

    return await this.customerAddressRepo.save(
      CreateCustomerAddressDto.toEntity(customerAddressDto),
    );
  }

  public async updateCustomerAddress(
    id: number,
    dto: CustomerAddressDto,
  ): Promise<any> {
    const customer: Customer = await this.contextService.currentCustomer();
    const customerAddress = await this.customerAddressRepo.findOne({ id: id });

    const customerAddressDto = {
      ...dto,
      customer,
    };

    const customerAddressEntity = await CustomerAddressDto.toEntity(
      customerAddressDto,
    );

    return await this.customerAddressRepo.save({
      ...customerAddress,
      ...customerAddressEntity,
    });
  }

  public async deleteCustomerAddress(id: number) {
    return await this.customerAddressRepo.softDelete(id);
  }

  public async getCustomerCreditCards(): Promise<any> {
    return 'error.CREDIT_CARD_NOT_AVAILABLE';
  }

  public async getCustomerCreditCard(id: number): Promise<any> {
    return 'error.CREDIT_CARD_NOT_AVAILABLE';
  }

  public async createCustomerCreditCard(
    dto: string,
    i18n: I18nContext,
  ): Promise<any> {
    return 'errors.CREDIT_CARD_NOT_AVAILABLE';
  }

  public async updateCustomerCreditCard(id: number, dto: string): Promise<any> {
    return 'errors.CREDIT_CARD_NOT_AVAILABLE';
  }

  public async deleteCustomerCreditCard(id: number) {
    return 'errors.CREDIT_CARD_NOT_AVAILABLE';
  }

  public async getCustomerWallet(
    options: IPaginationOptions,
    withPagination: string = 'true',
    type: string = '',
  ) {
    return 'error.CUSTOMER_WALLET_NOT_AVAILABLE';
  }
}
