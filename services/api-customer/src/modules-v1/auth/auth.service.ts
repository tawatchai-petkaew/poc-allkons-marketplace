import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthCenterService } from './auth-center.service';
import { User } from '@/model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@/model/user.entity';
import { RegisterStep, UserStatus } from '@/model/enum/user.enum';
import {
  AccountInfoResponse,
  LoginRequest,
  LoginType,
  VerifySmsOtpRequest,
} from './types/auth-center.type';
import { UserService as UserServiceV0 } from '@/modules/user/user.service';
import {
  detectUsernameType,
  formatPhoneToCompactNational,
} from '@/utils/utils';
import {
  BuyerJwtPayload,
  JwtPayloadInterface,
  MerchantJwtPayload,
} from '@/auth/interfaces/jwt-payload.interface';
import { UserOrganizationService as UserOrganizationServiceV0 } from '@/modules/user-organization/user-organization.service';
import { JwtService } from '@nestjs/jwt';
import { UserMerchantService as UserMerchantServiceV0 } from '@/modules/user-merchant/user-merchant.service';
import { LoginUsernameRequestDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly appIdBuyer = process.env.APP_ID_BUYER;
  private readonly appIdMarketplace = process.env.APP_ID_MARKETPLACE;
  constructor(
    private readonly authCenterService: AuthCenterService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userServiceV0: UserServiceV0,
    private readonly userOrganizationService: UserOrganizationServiceV0,
    private readonly userMerchantService: UserMerchantServiceV0,
    private readonly jwtService: JwtService,
  ) {}

  async registerUserViaAuthCenter({
    countryCode,
    phoneNumber,
    email,
    password,
    isSeller,
  }: {
    countryCode: string;
    phoneNumber: string;
    email?: string | null;
    password: string;
    isSeller?: boolean;
  }) {
    try {
      // call auth-center api to register user
      const tokenResponse = await this.authCenterService.register({
        countryCode,
        phoneNumber,
        password,
      });
      const account = await this.authCenterService.getAccountDetail({
        accessToken: tokenResponse.accessToken,
      });
      // then create user in local database
      const user = this.userRepo.create({
        uuid: account.keycloakUserId,
        tel: phoneNumber,
        countryCode: countryCode,
        email: email,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        registerStep: RegisterStep.REGISTER,
        createdInAuth: new Date(account.createdAt),
        ...(isSeller && { isSeller }), // TODO: Remove isSeller logic
      });

      // return user info
      await this.userRepo.save(user);

      return tokenResponse;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async loginWithPhoneOrEmail(input: LoginUsernameRequestDto) {
    const { loginRequest, convertPhoneNumber } = this.buildLoginRequest(input);

    const tokenResponse = await this.authCenterService.login(loginRequest);
    const account = await this.authCenterService.getAccountDetail({
      accessToken: tokenResponse.accessToken,
    });

    const { userId, userUuid } = await this.findOrCreateUser(
      account,
      convertPhoneNumber,
      tokenResponse.accessToken,
    );

    return { tokenResponse, userId, userUuid, convertPhoneNumber };
  }

  private buildLoginRequest(input: LoginUsernameRequestDto): {
    loginRequest: LoginRequest;
    convertPhoneNumber: string | null;
  } {
    const usernameType = detectUsernameType(input.username);

    if (usernameType === 'unknown') {
      throw new HttpException(
        {
          message:
            'Invalid username format. Must be a valid email or phone number',
          code: 'INVALID_USERNAME_FORMAT',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (usernameType === 'email') {
      return {
        loginRequest: {
          loginType: LoginType.EMAIL,
          email: input.username,
          password: input.password,
        },
        convertPhoneNumber: null,
      };
    }

    // Phone number login
    if (!input.countryCode) {
      throw new HttpException(
        {
          message: 'Country code is required for phone number login',
          code: 'COUNTRY_CODE_REQUIRED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const convertPhoneNumber = formatPhoneToCompactNational(
      input.username,
      input.countryCode,
    );

    return {
      loginRequest: {
        loginType: LoginType.PHONE_NUMBER,
        phoneNumber: input.username,
        countryCode: input.countryCode,
        password: input.password,
      },
      convertPhoneNumber,
    };
  }

  async loginWithPhoneOtp(input: VerifySmsOtpRequest) {
    const tokenResponse = await this.authCenterService.loginWithPhoneOTP(input);
    const account = await this.authCenterService.getAccountDetail({
      accessToken: tokenResponse.accessToken,
    });

    const convertPhoneNumber = formatPhoneToCompactNational(
      input.phoneNumber,
      input.countryCode,
    );

    const { userId, userUuid } = await this.findOrCreateUser(
      account,
      convertPhoneNumber,
      tokenResponse.accessToken,
    );

    return { tokenResponse, userId, userUuid, convertPhoneNumber };
  }

  private async findOrCreateUser(
    account: AccountInfoResponse,
    convertPhoneNumber: string,
    accessToken: string,
  ): Promise<{ userId: number; userUuid: string }> {
    const existingUser = await this.userRepo.findOne({
      where: { uuid: account.keycloakUserId },
    });

    if (existingUser) {
      return { userId: existingUser.id, userUuid: existingUser.uuid };
    }

    // MAP old user with keycloak user id
    // Start
    const userFromPhone = await this.userRepo.findOne({
      where: { tel: account.phoneNumber },
    });
    if (userFromPhone) {
      await this.userRepo.update(
        { id: userFromPhone.id },
        { uuid: account.keycloakUserId },
      );
      return { userId: userFromPhone.id, userUuid: account.keycloakUserId };
    }
    // End

    // User login มาจากระบบอื่น - สร้าง user ใหม่
    const newUser = await this.userServiceV0.createUserFromExternal({
      phoneNumber: account.phoneNumber,
      countryCode: account.countryCode,
      firstName: account.firstName,
      lastName: account.lastName,
      cisNumber: account.cisNumber,
      createdInAuth: account.createdAt ? new Date(account.createdAt) : null,
      uuid: account.keycloakUserId,
    });

    // TODO: Fix flow to redirect user to fill customer information
    const cisNumber = await this.ensureCisNumber(
      account,
      convertPhoneNumber,
      newUser.id,
      accessToken,
    );

    if (cisNumber && cisNumber !== account.cisNumber) {
      await this.userServiceV0.updateUserById({ cisNumber }, newUser.id);
    }

    return { userId: newUser.id, userUuid: newUser.uuid };
  }

  private async ensureCisNumber(
    account: AccountInfoResponse,
    convertPhoneNumber: string,
    userId: number,
    accessToken: string,
  ): Promise<string | null> {
    if (account.cisNumber) {
      return account.cisNumber;
    }

    return this.userServiceV0.createUserToThirdParty(
      convertPhoneNumber,
      {
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber,
        countryCode: account.countryCode,
      },
      userId,
      accessToken,
    );
  }

  async generateRevampToken(
    appId: string,
    userId: number,
    userUuid: string,
    convertPhoneNumber: string,
  ) {
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
        organizeUuid: userOrg?.organization?.uuid || null,
        organizeId: userOrg?.organizeId || null,
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

    return this.jwtService.sign(payload);
  }
}
