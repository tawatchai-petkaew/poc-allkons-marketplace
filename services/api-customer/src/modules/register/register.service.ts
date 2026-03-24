import { RegisterStatus, RegisterStep } from '@/model/enum/user.enum';
import { Platform } from '@/model/organization-contact.entity';
import { clearCacheByPattern } from '@/utils';
import { formatPhoneToCompactNational } from '@/utils/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { User } from '../../model/user.entity';
import {
  UserAlreadyExistsException,
  UserNotFoundByPhoneException,
} from '../../utils/helpers';
import { AuthCenterService } from '../auth-center/auth-center.service';
import { CheckExistRequest } from '../auth-center/interfaces/api-request.interface';
import { CisService } from '../cis/cis.service';
import { CustomerStatusCIS } from '../cis/enum/cis.enum';
import { UpdatePersonalProfileCis } from '../cis/interfaces/api-request.interface';
import { MerchantService } from '../merchant/merchant.service';
import { OrganizationContactService } from '../organization-contact/organization-contact.service';
import { OrganizationBranchType } from '../organization/enum/organization.enum';
import { OrganizationService } from '../organization/organization.service';
import { RoleService } from '../role/role.service';
import { UserAddressService } from '../user-address/user-address.service';
import { UserConsentService } from '../user-consent/user-consent.service';
import { UserMerchantService } from '../user-merchant/user-merchant.service';
import { UserOrganizationService } from '../user-organization/user-organization.service';
import {
  GetUserOrganizationsResponseDto,
  UserWithOrganizationsResponseDto,
} from '../user/dto/get-user-organizations-response.dto';
import { UserService } from '../user/user.service';
import {
  CreateOrganizationProfileDto,
  CreateShopDto,
  CreateUserProfileDto,
  phoneNumberDto,
  RegisterPhoneNumberDto,
  UpdateUserRegistrationDto,
  verifyOtpSmsDto,
} from './dto/create-register.dto';
import {
  responseRegisterDto,
  ResponseRegisterUserDto,
} from './dto/response-register.dto';
import { RegisterOrganizationType } from './enum/register.enum';
import { SendSmsOtp, VerifySmsOtp } from './interface/register.interface';
import { RegisterCode } from './enum/response-code.enum';
import { ErrorCode } from '@/common/enum/global-error-code.enum';
import { Connection } from 'typeorm';

@Injectable()
export class RegisterService {
  constructor(
    private readonly cisService: CisService,
    private readonly authCenterService: AuthCenterService,
    private readonly merchantService: MerchantService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly userOrganizationService: UserOrganizationService,
    private readonly userConsentService: UserConsentService,
    private readonly organizationContactService: OrganizationContactService,
    private readonly userMerchantService: UserMerchantService,
    private readonly userAddressService: UserAddressService,
    private readonly roleService: RoleService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async checkPhoneNumber(
    bodyDto: phoneNumberDto,
  ): Promise<{ code: RegisterCode }> {
    try {
      const body: CheckExistRequest = {
        type: 'PHONE_NUMBER',
        countryCode: bodyDto.countryCode,
        phoneNumber: bodyDto.phoneNumber,
      };
      const result = await this.authCenterService.checkExistValue(body);

      const userInfo = await this.userService.findByPhoneNumber(
        bodyDto.phoneNumber,
      );
      const response = {
        code: userInfo
          ? RegisterCode.CHECK_PHONE_EXISTS_IN_SYSTEM
          : result.isExist
          ? RegisterCode.CHECK_PHONE_EXISTS
          : RegisterCode.CHECK_PHONE_DOES_NOT_EXISTS,
      };
      return response;
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  /**
   * Sends an SMS OTP to the provided phone number.
   * @param bodyDto - The phone number and country code.
   * @returns A promise that resolves to the SMS sending result.
   */
  async sendSmsOtp(bodyDto: phoneNumberDto): Promise<any> {
    try {
      const body: SendSmsOtp = {
        countryCode: bodyDto.countryCode,
        phoneNumber: bodyDto.phoneNumber,
      };
      const smsInfo = await this.authCenterService.sendSmsOtp(body);
      return smsInfo;
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.SEND_SMS_OTP_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async verifySmsOtp(bodyDto: verifyOtpSmsDto): Promise<any> {
    try {
      const body: VerifySmsOtp = {
        pin: bodyDto.otp,
        token: bodyDto.token,
        phoneNumber: bodyDto.phoneNumber,
        countryCode: bodyDto.countryCode,
      };
      const smsInfo = await this.authCenterService.verifySmsOtp(body);
      return smsInfo;
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.VERIFY_SMS_OTP_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async registerWithPhoneNumber(
    bodyDto: RegisterPhoneNumberDto,
  ): Promise<responseRegisterDto> {
    try {
      const phoneNumber = formatPhoneToCompactNational(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );

      const userInfo = await this.userService.findByPhoneNumber(phoneNumber);
      if (userInfo) {
        throw new BadRequestException({
          message: 'Failed to register with phone number',
          code: ErrorCode.USER_ALREADY_EXISTS,
        });
      }
      const result = await this.authCenterService.registerWithPhoneNumber(
        bodyDto,
      );
      await this.userService.createUserWithPhone(
        phoneNumber,
        bodyDto.countryCode,
        bodyDto.password,
        bodyDto.isSeller || false,
      );

      return result;
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.REGISTER_PHONE_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async createMerchant(data: CreateShopDto) {
    try {
      return this.merchantService.createMerchant(data);
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.CREATE_MERCHANT_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async clearRegisteredUser(tel: string, isDev?: boolean): Promise<any> {
    let queryRunner;

    try {
      const user = await this.userService.findByPhoneNumber(tel);
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      // Start database transaction for data consistency
      const { getConnection } = await import('typeorm');
      queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 2. Delete user merchant relations (many-to-many junction table)
        const userMerchants =
          await this.userMerchantService.findUserMerchantByUserId(user.id);
        if (userMerchants?.length) {
          for (const userMerchant of userMerchants) {
            await this.userMerchantService.delete(userMerchant);
          }
        }

        // 3. Delete user addresses
        const userAddresses = await this.userAddressService.findByUserId(
          user.id,
        );
        if (userAddresses?.length) {
          const userAddressIds = mapArrayToArrayIds(userAddresses);
          await this.userAddressService.deleteUserAddressByIds(userAddressIds);
        }

        // 4. Delete user contacts
        const userContacts =
          await this.organizationContactService.findOrganizationContactByUserId(
            user.id,
          );
        if (userContacts?.length) {
          const userContactIds = mapArrayToArrayIds(userContacts);
          await this.organizationContactService.deleteOrganizationContactByIds(
            userContactIds,
          );
        }

        // 5. Delete user consents
        const userConsents =
          await this.userConsentService.findUserConsentByUserId(user.id);
        if (userConsents?.length) {
          const userConsentIds = mapArrayToArrayIds(userConsents);
          await this.userConsentService.deleteUserConsentByIds(userConsentIds);
        }

        // 6. Draft profiles have been removed (no longer needed)

        // 7. Delete draft user addresses (must be before draft user deletion due to FK)
        const draftUser = await this.userService.findDraftUserByUserId(user.id);
        if (draftUser) {
          // Delete draft user addresses first
          await this.userService.deleteDraftUserAddressByDraftUserId(
            draftUser.id,
          );
          // Then delete draft user
          await this.userService.deleteDraftUserById(draftUser.id);
        }

        // 8. Delete user organization relations
        const userOrganizations =
          await this.userOrganizationService.findAllRelatedByUserId(user.id);
        if (userOrganizations?.length) {
          const userOrgIds = mapArrayToArrayIds(userOrganizations);
          await this.userOrganizationService.deleteUserOrganizationByIds(
            userOrgIds,
          );
        }

        // 9. Delete organization leave logs
        await this.organizationService.deleteOrganizationLeaveLogsByUserId(
          user.id,
        );

        // 10. Delete the user itself LAST (invitations will auto-set invitedByUserId to null)
        await this.userService.delete(user.id);

        // Commit transaction
        await queryRunner.commitTransaction();

        // Call external webhook after successful database cleanup
        try {
          await axios.delete(
            `https://tech4-dev.ddns.net/webhook/account-${
              isDev ? 'dev' : 'sit'
            }?phoneNumber=0${tel}`,
          );
        } catch (webhookError) {
          console.error('Error calling external webhook:', webhookError);
          // Don't throw error here as the user has already been deleted from our system
        }

        return {
          statusCode: HttpStatus.OK,
          data: 'Clear registered user successfully',
        };
      } catch (dbError) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        console.error('Database error in clearRegisteredUser:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Error in clearRegisteredUser:', error);

      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.USER_REMOVE_ERROR,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    } finally {
      // Release query runner
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  async deleteUserByTel(tel: string, isDev?: boolean): Promise<string> {
    try {
      const user = await this.userService.findByPhoneNumber(tel);
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      try {
        // === 1. Find Customer by User relation ===
        const customers = await this.connection.query(
          `SELECT id FROM "customer" WHERE "userId" = $1`,
          [user.id],
        );
        const customer = customers?.[0];

        // === 2. Delete Order Related Data FIRST (มี FK ไปที่ customer_address) ===
        // Collect all customer_address IDs first
        let customerAddressIds = [];
        if (customer) {
          const customerAddresses = await this.connection.query(
            `SELECT id FROM "customer_address" WHERE "customerId" = $1`,
            [customer.id],
          );
          customerAddressIds = customerAddresses.map((ca: any) => ca.id);
        }

        // Find ALL orders using raw query
        let allOrderIds = [];

        // Find orders by customerAddressId
        if (customerAddressIds.length > 0) {
          const rawOrders = await this.connection.query(
            `SELECT id FROM "order" 
             WHERE "customerAddressId" IN (${customerAddressIds
               .map((_, i) => `$${i + 1}`)
               .join(',')})`,
            customerAddressIds,
          );
          allOrderIds.push(...rawOrders.map((o: any) => o.id));
        }

        // Find by userId
        const ordersByUserId = await this.connection.query(
          `SELECT id FROM "order" WHERE "userId" = $1`,
          [user.id],
        );
        allOrderIds.push(...ordersByUserId.map((o: any) => o.id));

        // Find by customerId
        if (customer) {
          const ordersByCustomerId = await this.connection.query(
            `SELECT id FROM "order" WHERE "customerId" = $1`,
            [customer.id],
          );
          allOrderIds.push(...ordersByCustomerId.map((o: any) => o.id));
        }

        // Find by cartId (orders that reference user's carts)
        const userCartIds = await this.connection.query(
          `SELECT id FROM "cart" WHERE "userId" = $1`,
          [user.id],
        );
        for (const cart of userCartIds) {
          const ordersByCartId = await this.connection.query(
            `SELECT id FROM "order" WHERE "cartId" = $1`,
            [cart.id],
          );
          allOrderIds.push(...ordersByCartId.map((o: any) => o.id));
        }

        // Deduplicate order IDs
        const uniqueOrderIds = [...new Set(allOrderIds)];

        if (uniqueOrderIds.length > 0) {
          for (const orderId of uniqueOrderIds) {
            // Delete invoice
            await this.connection.query(
              `DELETE FROM "invoice" WHERE "orderId" = $1`,
              [orderId],
            );

            // Get sub_order IDs for this order
            const subOrders = await this.connection.query(
              `SELECT id FROM "sub_order" WHERE "orderId" = $1`,
              [orderId],
            );

            // Delete sub_order_payment (must be before order_item due to potential FK)
            for (const subOrder of subOrders) {
              await this.connection.query(
                `DELETE FROM "sub_order_payment" WHERE "subOrderId" = $1`,
                [subOrder.id],
              );
            }

            // Delete order_item by BOTH orderId AND subOrderId to ensure complete cleanup
            await this.connection.query(
              `DELETE FROM "order_item" WHERE "orderId" = $1`,
              [orderId],
            );

            // Delete remaining order_items that reference any sub_order of this order
            for (const subOrder of subOrders) {
              await this.connection.query(
                `DELETE FROM "order_item" WHERE "subOrderId" = $1`,
                [subOrder.id],
              );
            }

            // Now safe to delete sub_order (no order_items reference it anymore)
            await this.connection.query(
              `DELETE FROM "sub_order" WHERE "orderId" = $1`,
              [orderId],
            );

            // Delete order_payment_slip
            const orderPayments = await this.connection.query(
              `SELECT id FROM "order_payment" WHERE "orderId" = $1`,
              [orderId],
            );
            for (const payment of orderPayments) {
              await this.connection.query(
                `DELETE FROM "order_payment_slip" WHERE "orderPaymentId" = $1`,
                [payment.id],
              );
            }

            // Delete order_payment
            await this.connection.query(
              `DELETE FROM "order_payment" WHERE "orderId" = $1`,
              [orderId],
            );
          }

          // Delete orders
          await this.connection.query(
            `DELETE FROM "order" WHERE id IN (${uniqueOrderIds
              .map((_, i) => `$${i + 1}`)
              .join(',')})`,
            uniqueOrderIds,
          );
        }

        // === 3. Delete Customer Related Data ===
        if (customer) {
          await this.connection.query(
            `DELETE FROM "customer_address" WHERE "customerId" = $1`,
            [customer.id],
          );
        }

        // === 4. Delete Cart Related Data ===
        const carts = await this.connection.query(
          `SELECT id FROM "cart" WHERE "userId" = $1`,
          [user.id],
        );

        for (const cart of carts) {
          await this.connection.query(
            `DELETE FROM "cart_item" WHERE "cartId" = $1`,
            [cart.id],
          );
          await this.connection.query(`DELETE FROM "cart" WHERE id = $1`, [
            cart.id,
          ]);
        }

        // === 5. Delete Customer ===
        if (customer) {
          await this.connection.query(`DELETE FROM "customer" WHERE id = $1`, [
            customer.id,
          ]);
        }

        // === 6. Delete User Direct Relations ===
        await this.connection.query(
          `DELETE FROM "location" WHERE "userId" = $1`,
          [user.id],
        );

        // Delete user_customer_address related to user's projects
        const projects = await this.connection.query(
          `SELECT id FROM "project" WHERE "userId" = $1`,
          [user.id],
        );
        for (const project of projects) {
          await this.connection.query(
            `DELETE FROM "user_customer_address" WHERE "projectId" = $1`,
            [project.id],
          );
        }

        // Delete user_customer_address directly linked to userId (ถ้ามี column userId)
        await this.connection.query(
          `DELETE FROM "user_customer_address" WHERE "userId" = $1`,
          [user.id],
        );

        // Delete project
        await this.connection.query(
          `DELETE FROM "project" WHERE "userId" = $1`,
          [user.id],
        );

        // Delete event_log
        await this.connection.query(
          `DELETE FROM "event_log" WHERE "userId" = $1`,
          [user.id],
        );

        // Delete user_merchant
        const userMerchants =
          await this.userMerchantService.findUserMerchantByUserId(user.id);
        if (userMerchants?.length) {
          for (const userMerchant of userMerchants) {
            await this.userMerchantService.delete(userMerchant);
          }
        }

        // Delete user_address
        const userAddresses = await this.userAddressService.findByUserId(
          user.id,
        );
        if (userAddresses?.length) {
          const userAddressIds = mapArrayToArrayIds(userAddresses);
          await this.userAddressService.deleteUserAddressByIds(userAddressIds);
        }

        // Delete organization_contact
        const userContacts =
          await this.organizationContactService.findOrganizationContactByUserId(
            user.id,
          );
        if (userContacts?.length) {
          const userContactIds = mapArrayToArrayIds(userContacts);
          await this.organizationContactService.deleteOrganizationContactByIds(
            userContactIds,
          );
        }

        // Delete user_consent
        const userConsents =
          await this.userConsentService.findUserConsentByUserId(user.id);
        if (userConsents?.length) {
          const userConsentIds = mapArrayToArrayIds(userConsents);
          await this.userConsentService.deleteUserConsentByIds(userConsentIds);
        }

        // === 7. Delete Draft User ===
        const draftUser = await this.userService.findDraftUserByUserId(user.id);
        if (draftUser) {
          await this.userService.deleteDraftUserAddressByDraftUserId(
            draftUser.id,
          );
          await this.userService.deleteDraftUserById(draftUser.id);
        }

        // === 8. Delete Organization Relations ===
        const userOrganizations =
          await this.userOrganizationService.findAllRelatedByUserId(user.id);
        if (userOrganizations?.length) {
          const userOrgIds = mapArrayToArrayIds(userOrganizations);
          await this.userOrganizationService.deleteUserOrganizationByIds(
            userOrgIds,
          );
        }

        await this.organizationService.deleteOrganizationLeaveLogsByUserId(
          user.id,
        );

        // === 9. Delete User (สุดท้าย) ===
        await this.userService.delete(user.id);

        // Call external webhook after successful database cleanup
        try {
          await axios.delete(
            `https://tech4-dev.ddns.net/webhook/account-${
              isDev ? 'dev' : 'sit'
            }?phoneNumber=0${tel}`,
          );
        } catch (webhookError) {
          console.error('Error calling external webhook:', webhookError);
          // Don't throw error here as the user has already been deleted from our system
        }

        return `User ${tel} and all related data deleted successfully`;
      } catch (dbError) {
        console.error('Database error in testDeleteUserByTel:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Error in testDeleteUserByTel:', error);

      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.USER_REMOVE_ERROR,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async createAccount(
    bodyDto: RegisterPhoneNumberDto,
  ): Promise<responseRegisterDto> {
    try {
      const userInfo = await this.userService.findByPhoneAndCountryCode(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );
      if (userInfo) {
        throw new UserAlreadyExistsException();
      }

      // Register the user to auth center
      const result = await this.authCenterService.registerWithPhoneNumber(
        bodyDto,
      );

      // Create user with phone number
      await this.userService.createUserWithPhone(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
        bodyDto.password,
        bodyDto.isSeller || false,
        RegisterStep.REGISTER,
        result.refreshToken,
      );
      return result;
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.CREATE_ACCOUNT_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async createUserProfile(
    bodyDto: CreateUserProfileDto,
    authToken: string,
  ): Promise<ResponseRegisterUserDto> {
    try {
      const platform = bodyDto.hasOwnProperty('platform')
        ? bodyDto.platform
        : Platform.SELLER;

      // Check if phone number exists
      const user = await this.userService.findByPhoneAndCountryCode(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );
      if (!user) {
        throw new UserNotFoundByPhoneException();
      }

      // Convert phone number to compact national format
      const convertPhoneNumber = await formatPhoneToCompactNational(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );

      // Get user profile from Auth Center
      const authCisNumber = await this.authCenterService.getCisNumber({
        type: 'PHONE_NUMBER',
        phoneNumber: bodyDto.phoneNumber,
        countryCode: bodyDto.countryCode,
      });

      if (authCisNumber.cisNumber && !user.cisNumber) {
        user.cisNumber = authCisNumber.cisNumber;
      }

      // Create user profile in CIS
      if (!user.cisNumber) {
        user.cisNumber = await this.userService.createUserToThirdParty(
          convertPhoneNumber,
          bodyDto.userInfo,
          user.id,
          authToken,
          platform,
        );
      } else {
        const personalProfile: UpdatePersonalProfileCis = {
          app_id: this.configService.get<string>('APP_ID_SELLER'),
          cis_number: user.cisNumber,
          first_name: bodyDto.userInfo.firstName,
          middle_name: bodyDto.userInfo.midName || null,
          last_name: bodyDto.userInfo.lastName,
          customer_status: CustomerStatusCIS.CUSTOMER,
          is_allow_concern: true,
          active_status: true,
        };
        await this.cisService.updatePersonalProfile(personalProfile);
      }

      await this.userService.updateUserToAuthCenter(
        authToken,
        convertPhoneNumber,
        bodyDto.userInfo,
      );

      // Update user info
      const updateUserInfo: Partial<User> = {
        name: `${bodyDto.userInfo.firstName} ${
          bodyDto.userInfo.midName || ''
        } ${bodyDto.userInfo.lastName}`,
        firstNameTh: bodyDto.userInfo.firstName,
        middleNameTh: bodyDto.userInfo.midName || null,
        lastNameTh: bodyDto.userInfo.lastName,
        email: bodyDto.userInfo.email?.toLowerCase(),
        registerStep: RegisterStep.USER_INFO,
        cisNumber: user.cisNumber,
        username: convertPhoneNumber,
      };

      const savedProfile = await this.userService.updateUserById(
        updateUserInfo,
        user.id,
      );

      // Clear cache for user profile and organizations
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `register:user-profile:cc:${bodyDto.countryCode}:pn:${bodyDto.phoneNumber}:app:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `user:organizations:user:${user.id}:*`,
        ),
      ]);

      return ResponseRegisterUserDto.fromUserData(savedProfile);
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.CREATE_USER_PROFILE_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  private async getAuthTokenWithRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Generate new auth access token
      const newToken = await this.authCenterService.generateNewAccessToken(
        refreshToken,
      );
      return {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
      };
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.GET_AUTH_TOKEN_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async createOrganizationProfile(
    bodyDto: CreateOrganizationProfileDto,
    platform: Platform,
  ): Promise<UserWithOrganizationsResponseDto> {
    try {
      // Check if phone number not exists
      const user = await this.userService.findByPhoneAndCountryCode(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );
      if (!user) {
        throw new UserNotFoundByPhoneException();
      }

      // Convert phone number to compact national format
      const convertPhoneNumber = await formatPhoneToCompactNational(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );

      // Check type of organization
      if (bodyDto.orgType === RegisterOrganizationType.PERSONAL) {
        // Check if ID card number exists
        const checkExist =
          await this.organizationService.checkIdCardNumberExists(
            bodyDto.orgPersonalInfo.idCard,
          );
        if (checkExist.exists) {
          throw new BadRequestException({
            message: 'ID Card already exists',
            data: checkExist,
            code: ErrorCode.ID_CARD_ALREADY_EXISTS,
          });
        }

        // Create personal organization profile
        await this.organizationService.createPersonalOrganizationProfile(
          bodyDto.orgPersonalInfo,
          user.id,
          user.cisNumber,
          user.name,
          convertPhoneNumber,
          user.email,
          platform,
        );
      } else if (bodyDto.orgType === RegisterOrganizationType.JURISTIC) {
        if (
          bodyDto.orgJuristicInfo.branchType !==
          OrganizationBranchType.HEAD_OFFICE
        ) {
          throw new BadRequestException({
            message:
              'Only HEAD_OFFICE branch type is allowed for register juristic organization',
            code: ErrorCode.INVALID_BRANCH_TYPE,
          });
        }

        // Check if tax ID exists
        const checkTaxId = await this.organizationService.checkTaxIdExists(
          bodyDto.orgJuristicInfo.taxId,
          bodyDto?.orgJuristicInfo?.branchNumber,
        );
        if (checkTaxId.exists) {
          throw new BadRequestException({
            message: 'Tax ID already exists',
            data: checkTaxId,
            code: ErrorCode.TAX_ID_ALREADY_EXISTS,
          });
        }

        // Create juristic organization profile
        await this.organizationService.createJuristicOrganizationProfile(
          bodyDto.orgJuristicInfo,
          user.id,
          user.cisNumber,
          convertPhoneNumber,
          user.email,
          platform,
        );
      } else if (
        bodyDto.orgType === RegisterOrganizationType.REGISTERED_INDIVIDUAL
      ) {
        // Check registration number exists
        const checkRegistrationNumber =
          await this.organizationService.checkRegistrationNumberExists(
            bodyDto.orgIndividualInfo.registrationNumber,
          );
        if (checkRegistrationNumber.exists) {
          throw new BadRequestException({
            message: 'Registration number already exists',
            data: checkRegistrationNumber,
            code: ErrorCode.REGISTRATION_NUMBER_ALREADY_EXISTS,
          });
        }

        // Create registered individual organization profile
        await this.organizationService.createRegisterIndividualProfile(
          bodyDto.orgIndividualInfo,
          user.id,
          user.cisNumber,
          convertPhoneNumber,
          user.email,
          platform,
        );
      } else {
        throw new BadRequestException({
          message: 'Invalid organization type',
          code: ErrorCode.INVALID_ORGANIZATION_TYPE,
        });
      }

      const payloadUpdateUser = {
        registerStep: RegisterStep.ORG_INFO,
        ...(bodyDto.orgType === RegisterOrganizationType.PERSONAL &&
          !user.idCard && {
            idCard: bodyDto.orgPersonalInfo.idCard,
          }),
      };

      await this.userService.updateUserById(payloadUpdateUser, user.id);

      const organization =
        await this.userOrganizationService.findOrganizationByUserId(user.id);

      if (organization[0].organizeId) {
        try {
          await this.roleService.createRolePermissionDefault(
            organization[0].organizeId,
          );
        } catch (error) {
          console.log('createRolePermissionDefault error', error);
        }
      }

      // Clear cache for user profile and organizations
      await Promise.all([
        clearCacheByPattern(
          this.cacheManager,
          `register:user-profile:cc:${bodyDto.countryCode}:pn:${bodyDto.phoneNumber}:app:*`,
        ),
        clearCacheByPattern(
          this.cacheManager,
          `user:organizations:user:${user.id}:*`,
        ),
      ]);

      return UserWithOrganizationsResponseDto.fromUserOrganizations(
        organization,
      );
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.CREATE_ORG_PROFILE_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async getUserProfile(
    countryCode: string,
    phoneNumber: string,
  ): Promise<GetUserOrganizationsResponseDto> {
    try {
      const user = await this.userService.findUserOrgByCountryAndPhoneNumber(
        countryCode,
        phoneNumber,
      );

      if (!user) {
        throw new UserNotFoundByPhoneException();
      }

      return GetUserOrganizationsResponseDto.fromUserOrganizations(user);
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.GET_USER_PROFILE_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async getUserProfileByEmail(
    countryCode: string,
    email: string,
  ): Promise<GetUserOrganizationsResponseDto> {
    try {
      const user = await this.userService.findUserOrgByCountryAndEmail(
        countryCode,
        email,
      );

      if (!user) {
        throw new UserNotFoundByPhoneException();
      }

      return GetUserOrganizationsResponseDto.fromUserOrganizations(user);
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.GET_USER_PROFILE_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }

  async updateUserRegistrationStatus(
    bodyDto: UpdateUserRegistrationDto,
  ): Promise<{ success: boolean; successMessage?: string }> {
    try {
      // Find user by phone number
      const user = await this.userService.findByPhoneAndCountryCode(
        bodyDto.phoneNumber,
        bodyDto.countryCode,
      );

      if (!user) {
        throw new NotFoundException({
          message: `User with phone number ${bodyDto.phoneNumber} not found`,
          code: ErrorCode.USER_NOT_FOUND,
        });
      }

      // Prepare update data
      const updateData: Partial<User> = {};
      updateData.registerStep = bodyDto.registerStep;
      if (
        bodyDto.registerStatus === RegisterStatus.COMPLETED &&
        bodyDto.registerStep !== RegisterStep.ORG_INFO
      ) {
        throw new BadRequestException({
          message: 'User is not in the correct registration step',
          code: ErrorCode.INVALID_REGISTRATION_STEP,
        });
      }
      updateData.registerStatus = bodyDto.registerStatus;

      // Update user
      await this.userService.updateUserById(updateData, user.id);

      return {
        success: true,
        successMessage: 'User registration status updated successfully',
      };
    } catch (error) {
      if (error?.response?.error?.code) {
        throw error;
      }

      throw new HttpException(
        {
          data: error.response?.data,
          error: {
            code: error.response?.code || ErrorCode.CREATE_ACCOUNT_FAILED,
            message: error?.message,
          },
        },
        error?.status || 500,
      );
    }
  }
}

function mapArrayToArrayIds(array: any[]): number[] {
  return array.map((item) => item.id);
}
