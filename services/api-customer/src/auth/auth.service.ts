import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Cart } from '../model/cart.entity';
import { Customer } from '../model/customer.entity';
import { Merchant } from '../model/merchant.entity';
import { User, UserRole } from '../model/user.entity';

import { MailService } from '../mail/mail.service';
import { CustomerPublicService } from '../modules/customer-public/customer-public.service';
import { UserService } from '../modules/user/user.service';

import { VerifySmsOtp } from '@/modules/register/interface/register.interface';
import { UserOrganizationService } from '@/modules/user-organization/user-organization.service';
import { DataNotFoundException } from '@/utils/helpers';
import {
  formatPhoneToCompactNational,
  detectUsernameType,
} from '@/utils/utils';
import { Organization } from '@/model/organization.entity';
import { AuthCenterService } from '../modules/auth-center/auth-center.service';
import { CreateCustomerWithTelDto } from '../modules/customer-public/dto/create-customer-with-tel.dto';
import { CreateCustomerDto } from '../modules/customer-public/dto/create-customer.dto';
import { UserMerchantService } from '../modules/user-merchant/user-merchant.service';
import { SendResetPasswordDto } from '../modules/user/dto/send-reset-password.dto';
import { UserDto } from '../modules/user/dto/user.dto';
import { AuthLoginTelDto } from './dto/auth-login-tel.dto';
import { AuthLoginUsernameDto } from './dto/auth-login-username.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  OrganizationAuthDto,
  OrganizationTokenResponseDto,
} from './dto/organization-auth.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import {
  BuyerJwtPayload,
  JwtPayloadInterface,
  MerchantJwtPayload,
} from './interfaces/jwt-payload.interface';
import { ResponseLoginDto } from './dto/response-dto/response-login.dto';
import { LoginRequest } from '@/modules/auth-center/interfaces/api-request.interface';
import { LoginType } from '@/modules/auth-center/enum/auth-center.enum';
import { AutoTrace } from 'allkons-api-helper';

require('dotenv').config();

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private usersService: UserService,
    private jwtService: JwtService,
    private customerPublicService: CustomerPublicService,
    private httpService: HttpService,
    private mailService: MailService,
    private authCenterService: AuthCenterService,
    private userMerchantService: UserMerchantService,
    private userOrganizationService: UserOrganizationService,
    @Inject('APP_ID_BUYER') private readonly appIdBuyer: string,
    @Inject('APP_ID_MARKETPLACE') private readonly appIdMarketplace: string,
  ) {}

  public async sendAdminEmailResetPassword(
    dto: SendResetPasswordDto,
    i18n: I18nContext,
  ) {
    const user: User = await this.userRepo.findOne({
      where: {
        email: dto?.email,
        role: UserRole.ADMIN,
      },
    });

    if (!user) {
      throw new Error(i18n.t('errors.USER_NOT_FOUND'));
    }

    const payload = {
      userId: user?.id,
    };
    const access_token = this.jwtService.sign(payload);
    this.mailService.sendAdminUserResetPassword(user, access_token);
  }

  public async loginWithOTP(
    dto: CreateCustomerDto,
    merchantSlug: string,
    i18n: I18nContext,
  ) {
    const data = await this.customerPublicService
      .createOrLogin(dto, merchantSlug, i18n)
      .then(async (customer) => {
        const payload = {
          userId: customer?.user?.id,
        };

        if (
          customer.registrationToken === null ||
          customer.registrationToken === undefined
        ) {
          const registrationToken = await this.generateRegistrationToken();
          const resultRegistrationToken = `${merchantSlug}-CUSTOMER-ID-${customer.id}-${registrationToken}`;

          await this.customerPublicService.updateRegistrationToken(
            customer,
            resultRegistrationToken,
          );
        }

        return {
          access_token: this.jwtService.sign(payload),
        };
      });

    return data;
  }

  public async loginWithTel(
    dto: CreateCustomerWithTelDto,
    merchantSlug: string,
    i18n: I18nContext,
  ) {
    const data = await this.customerPublicService
      .createOrLoginWithTel(dto, merchantSlug, i18n)
      .then(async (customer) => {
        const payload = {
          userId: customer?.user?.id,
        };

        if (
          customer.registrationToken === null ||
          customer.registrationToken === undefined
        ) {
          const registrationToken = await this.generateRegistrationToken();
          const resultRegistrationToken = `${merchantSlug}-CUSTOMER-ID-${customer.id}-${registrationToken}`;

          await this.customerPublicService.updateRegistrationToken(
            customer,
            resultRegistrationToken,
          );
        }

        return {
          access_token: this.jwtService.sign(payload),
        };
      });

    return data;
  }

  public async verifyOTP(dto: VerifyOTPDto, i18n: I18nContext) {
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

  public async login(authLoginDto: AuthLoginDto, i18n: I18nContext) {
    const user = await this.validateUser(authLoginDto);

    if (authLoginDto?.adminId && authLoginDto?.adminId !== '') {
      const userDto = {
        merchants: [...user?.merchants],
      };
      const userEntity = UserDto.toEntity(userDto);
      await this.userRepo.save({ ...user, ...userEntity });
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new Error(i18n.t('errors.USER_NOT_FOUND'));
    }

    const payload = {
      userId: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async loginSuperAdmin(authLoginDto: AuthLoginDto, i18n: I18nContext) {
    const user = await this.validateSuperAdmin(authLoginDto);

    if (user.role === UserRole.ADMIN || user.role === UserRole.CUSTOMER) {
      throw new Error(i18n.t('errors.USER_NOT_FOUND'));
    }

    const payload = {
      userId: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async loginCustomerWithTel(
    authLoginTelDto: AuthLoginTelDto,
    currentmerchantslug: string,
  ) {
    const user = await this.validateCustomerUserWithTel(
      authLoginTelDto,
      currentmerchantslug,
    );

    const payload = {
      userId: user.id,
    };

    const customer: Customer =
      await this.customerPublicService.findCustomerByUserId(
        user.id,
        currentmerchantslug,
      );

    if (
      customer.registrationToken === null ||
      customer.registrationToken === undefined
    ) {
      const registrationToken = await this.generateRegistrationToken();
      const resultRegistrationToken = `${customer.merchant.slug}-CUSTOMER-ID-${customer.id}-${registrationToken}`;

      await this.customerPublicService.updateRegistrationToken(
        customer,
        resultRegistrationToken,
      );
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public createAdminToken(user: User, payload: any) {
    const access_token = this.jwtService.sign(payload);
    this.mailService.sendAdminUserEmailVerify(user, access_token);
  }

  public async checkRegisterToken(token: string) {
    const data = {
      tokenStatus: token === process.env.REGISTER_TOKEN ? true : false,
    };

    return data;
  }

  public async checkCreateMerchantToken(token: string) {
    const data = {
      tokenStatus: token === process.env.CREATE_MERCHANT_TOKEN ? true : false,
    };

    return data;
  }

  public async logoutWithRefreshToken(dto: LogoutDto): Promise<any> {
    const logoutData = {
      refreshToken: dto.refreshToken,
    };

    const authResult = await this.authCenterService.logoutWithRefreshToken(
      logoutData,
    );
    if (!authResult.isSuccess) {
      throw new HttpException(
        {
          message: 'Logout failed with auth center',
          data: { code: 'AUTH_CENTER_LOGOUT_FAILED' },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  public async loginWithPhoneNumberOtp(
    loginDto: LoginWithOtpDto,
    appId: string,
  ): Promise<any> {
    // Format phone number
    const convertPhoneNumber = formatPhoneToCompactNational(
      loginDto.phoneNumber,
      loginDto.countryCode,
    );

    // Login with OTP auth center
    const otpVerifyData: VerifySmsOtp = {
      pin: loginDto.otp,
      token: loginDto.otpToken,
      phoneNumber: loginDto.phoneNumber,
      countryCode: loginDto.countryCode,
    };
    const result = await this.authCenterService.loginWithOTP(otpVerifyData);

    if (result?.code !== 'SUCCESS' || result?.statusCode !== 200) {
      throw new HttpException(
        {
          message: 'Login With OTP failed',
          data: { code: 'LOGIN_WITH_OTP_FAILED' },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if user exists in our system
    const user = await this.usersService.findByPhoneAndCountryCode(
      loginDto.phoneNumber,
      loginDto.countryCode,
    );
    let userId: number;
    let userUuid: string;
    if (!user) {
      // Get user information from auth center
      const authUser = await this.authCenterService.getAccountInformation(
        result?.data?.accessToken,
      );

      // If user does not exist, create a new user
      const newUser = await this.usersService.createUserFromExternal(
        {
          phoneNumber: loginDto.phoneNumber,
          countryCode: loginDto.countryCode,
          firstName: authUser?.firstName,
          lastName: authUser?.lastName,
          cisNumber: authUser?.cisNumber,
          createdInAuth: authUser?.createdAt
            ? new Date(authUser.createdAt)
            : null,
        },
        result?.data?.refreshToken,
      );
      userId = newUser.id;
      userUuid = newUser.uuid;

      const userInfo = {
        firstName: authUser?.firstName,
        lastName: authUser?.lastName,
        phoneNumber: loginDto.phoneNumber,
        countryCode: loginDto.countryCode,
      };

      if (!authUser?.cisNumber) {
        authUser.cisNumber = await this.usersService.createUserToThirdParty(
          convertPhoneNumber,
          userInfo,
          userId,
          result?.data?.accessToken,
        );
      }

      await this.usersService.updateUserById(
        { cisNumber: authUser.cisNumber },
        newUser.id,
      );
    } else {
      userId = user.id;
      userUuid = user.uuid;
    }

    try {
      let payload: JwtPayloadInterface;
      if (appId === this.appIdBuyer || appId === this.appIdMarketplace) {
        // Handle buyer-specific logic
        const userOrg =
          await this.userOrganizationService.findUserOrganizationOwner(userId);
        const buyerPayload: BuyerJwtPayload = {
          userId: userId,
          userUuid: userUuid,
          sub: userId.toString(),
          phoneNumber: convertPhoneNumber,
          organizationId: userOrg?.organizeId || null,
          organizeId: userOrg?.organizeId || null,
          organizeUuid: userOrg?.organization?.uuid || null,
        };
        payload = buyerPayload;
      } else {
        const lastAccessedMerchant =
          await this.userMerchantService.getLastAccessedMerchant(userId);
        const { merchantId, lastAccessedAt, merchant } = lastAccessedMerchant
          ? lastAccessedMerchant
          : { merchantId: null, lastAccessedAt: null, merchant: null };

        const merchantPayload: MerchantJwtPayload = {
          userId: userId,
          userUuid: userUuid,
          sub: userId.toString(),
          phoneNumber: convertPhoneNumber,
          merchantId: merchantId,
          merchantUuid: merchant ? merchant.uuid : null,
          merchantSlug: merchant ? merchant.slug : null,
          lastAccessedAt: lastAccessedAt ? lastAccessedAt.toISOString() : null,
        };

        payload = merchantPayload;
      }
      // Prepare response
      const response: any = {
        accessToken: this.jwtService.sign(payload),
        authCenter: {
          accessToken: result?.data?.accessToken,
          refreshToken: result?.data?.refreshToken,
          expiresIn: result?.data?.expiresIn,
          refreshExpiresIn: result?.data?.refreshExpiresIn,
        },
      };

      return response;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error retrieving last accessed merchant',
          code: 'LAST_MERCHANT_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateUser(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;

    const user = await this.usersService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async validateSuperAdmin(authLoginDto: AuthLoginDto): Promise<User> {
    const { email, password } = authLoginDto;

    const user = await this.usersService.findSuperAdminByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async validateCustomerUserWithTel(
    authLoginTelDto: AuthLoginTelDto,
    currentmerchantslug: string,
  ): Promise<User> {
    const { tel, password } = authLoginTelDto;

    const user = await this.usersService.findByCustomerTel(
      tel,
      currentmerchantslug,
    );
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async generateRegistrationToken() {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
  }

  /**
   * Generate JWT token for organization authentication
   * @param dto Organization authentication data
   * @param i18n Internationalization context
   * @returns Organization token response
   */
  public async generateOrganizationToken(
    dto: OrganizationAuthDto,
  ): Promise<OrganizationTokenResponseDto> {
    // Verify user exists
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new DataNotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Verify organization exists
    const organization = await this.organizationRepo.findOne({
      where: { id: dto.organizationId },
    });

    if (!organization) {
      throw new DataNotFoundException(
        'Organization not found',
        'ORGANIZATION_NOT_FOUND',
      );
    }

    // Verify user has access to the organization
    const userOrganization =
      await this.userOrganizationService.findUserOrganizationByUserIdAndOrgId(
        dto.userId,
        dto.organizationId,
      );

    if (!userOrganization) {
      throw new DataNotFoundException(
        'User organization not found',
        'USER_ORG_NOT_FOUND',
      );
    }

    // Create JWT payload
    const payload = {
      userId: dto.userId,
      organizationId: dto.organizationId,
      organizationName: organization.organizeName,
      userEmail: user.email,
      context: dto.context || 'organization_access',
      type: 'organization_token',
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 28800,
    };
  }

  /**
   * Login with username (phone number or email) and password
   * @param dto Login credentials with username
   * @param appId API key to determine buyer or merchant context
   * @returns Login response with tokens
   */
  async loginWithUsername(
    dto: AuthLoginUsernameDto,
    appId: string,
  ): Promise<ResponseLoginDto> {
    // Detect username type
    const usernameType = detectUsernameType(dto.username);

    if (usernameType === 'unknown') {
      throw new HttpException(
        {
          message:
            'Invalid username format. Must be a valid email or phone number',
          data: { code: 'INVALID_USERNAME_FORMAT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let loginData: LoginRequest;
    let convertPhoneNumber: string | null = null;
    let phoneNumber: string | null = null;
    let countryCode: string | null = null;

    if (usernameType === 'email') {
      // Login with email
      loginData = {
        loginType: LoginType.EMAIL,
        email: dto.username,
        password: dto.password,
      };
    } else {
      // Login with phone number
      if (!dto.countryCode) {
        throw new HttpException(
          {
            message: 'Country code is required for phone number login',
            data: { code: 'COUNTRY_CODE_REQUIRED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      phoneNumber = dto.username;
      countryCode = dto.countryCode;

      // Format phone number
      convertPhoneNumber = formatPhoneToCompactNational(
        phoneNumber,
        countryCode,
      );

      loginData = {
        loginType: LoginType.PHONE_NUMBER,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        password: dto.password,
      };
    }

    // Call auth center to authenticate
    const result = await this.authCenterService.loginPhoneOrEmail(loginData);

    // Find or create user in our system
    let user: User | null = null;
    let userId: number;
    let userUuid: string;

    if (usernameType === 'email') {
      // Find user by email
      user = await this.usersService.findByEmail(dto.username);
    } else {
      // Find user by phone number
      user = await this.usersService.findByPhoneAndCountryCode(
        phoneNumber,
        countryCode,
      );
    }

    if (!user) {
      // Get user information from auth center
      const authUser = await this.authCenterService.getAccountInformation(
        result?.accessToken,
      );

      // Create new user
      const newUser = await this.usersService.createUserFromExternal(
        {
          phoneNumber: authUser?.phoneNumber || phoneNumber,
          countryCode: authUser?.countryCode || countryCode,
          firstName: authUser?.firstName,
          lastName: authUser?.lastName,
          cisNumber: authUser?.cisNumber,
          createdInAuth: authUser?.createdAt
            ? new Date(authUser.createdAt)
            : null,
        },
        result?.refreshToken,
      );
      userId = newUser.id;
      userUuid = newUser.uuid;

      const userInfo = {
        firstName: authUser?.firstName,
        lastName: authUser?.lastName,
        phoneNumber: authUser?.phoneNumber || phoneNumber,
        countryCode: authUser?.countryCode || countryCode,
      };

      // Create user in third-party system if no CIS number
      if (!authUser?.cisNumber && convertPhoneNumber) {
        authUser.cisNumber = await this.usersService.createUserToThirdParty(
          convertPhoneNumber,
          userInfo,
          userId,
          result?.accessToken,
        );
        await this.usersService.updateUserById(
          { cisNumber: authUser.cisNumber },
          newUser.id,
        );
      }
    } else {
      userId = user.id;
      userUuid = user.uuid;
    }

    try {
      let payload: JwtPayloadInterface;
      const finalPhoneNumber = convertPhoneNumber || user?.tel || null;

      if (appId === this.appIdBuyer || appId === this.appIdMarketplace) {
        // Handle buyer-specific logic
        const userOrg =
          await this.userOrganizationService.findUserOrganizationOwner(userId);
        const buyerPayload: BuyerJwtPayload = {
          userId: userId,
          userUuid: userUuid,
          sub: userId.toString(),
          phoneNumber: finalPhoneNumber,
          organizationId: userOrg?.organizeId || null,
          organizeId: userOrg?.organizeId || null,
          organizeUuid: userOrg?.organization?.uuid || null,
        };
        payload = buyerPayload;
      } else {
        const lastAccessedMerchant =
          await this.userMerchantService.getLastAccessedMerchant(userId);
        const { merchantId, lastAccessedAt, merchant } = lastAccessedMerchant
          ? lastAccessedMerchant
          : { merchantId: null, lastAccessedAt: null, merchant: null };

        const merchantPayload: MerchantJwtPayload = {
          userId: userId,
          userUuid: userUuid,
          sub: userId.toString(),
          phoneNumber: finalPhoneNumber,
          merchantId: merchantId,
          merchantUuid: merchant ? merchant.uuid : null,
          merchantSlug: merchant ? merchant.slug : null,
          lastAccessedAt: lastAccessedAt ? lastAccessedAt.toISOString() : null,
        };

        payload = merchantPayload;
      }

      // Prepare response
      const response: ResponseLoginDto = {
        accessToken: this.jwtService.sign(payload),
        authCenter: {
          accessToken: result?.accessToken,
          refreshToken: result?.refreshToken,
          expiresIn: result?.expiresIn,
          refreshExpiresIn: result?.refreshExpiresIn,
        },
      };

      return response;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error retrieving last accessed merchant',
          code: 'LAST_MERCHANT_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
