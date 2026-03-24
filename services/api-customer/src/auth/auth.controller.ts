import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  UseFilters,
  HttpException,
  HttpStatus,
  UseInterceptors,
  CacheTTL,
} from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { UserService } from '../modules/user/user.service';
import { HttpExceptionFilter } from '../filter/http-exception.filter';

import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginUsernameDto } from './dto/auth-login-username.dto';
import { CreateCustomerDto } from '../modules/customer-public/dto/create-customer.dto';
import { AuthLoginTelDto } from './dto/auth-login-tel.dto';
import { SendResetPasswordDto } from '../modules/user/dto/send-reset-password.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { LogoutDto } from './dto/logout.dto';
import { Throttle } from '@nestjs/throttler';
import { CreateCustomerWithTelDto } from '../modules/customer-public/dto/create-customer-with-tel.dto';
import { HttpPersonalCacheInterceptor } from '@/cache/personal-cache.interceptor';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import {
  OrganizationAuthDto,
  OrganizationTokenResponseDto,
} from './dto/organization-auth.dto';
import { ResponseLoginDto } from './dto/response-dto/response-login.dto';
import { ApiOkRes } from '@/decorators/api-ok.decorator';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { CurrentUser } from '@/decorators/request.decorator';
import { AuthUser } from '@/types/request.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async login(@Body() authLoginDto: AuthLoginDto, @I18n() i18n: I18nContext) {
    return this.authService.login(authLoginDto, i18n).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Post('loginSuperAdmin')
  async loginSuperAdmin(
    @Body() authLoginDto: AuthLoginDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.loginSuperAdmin(authLoginDto, i18n).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Get('/checkRegisterToken')
  async checkRegisterToken(@Query('token') token: string) {
    return this.authService.checkRegisterToken(token).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Get('/checkCreateMerchantToken')
  async checkCreateMerchantToken(@Query('token') token: string) {
    return this.authService.checkCreateMerchantToken(token).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Post('loginWithTelCustomer')
  async loginWithTelCustomer(
    @Body() authLoginTelDto: AuthLoginTelDto,
    @Headers('currentmerchantslug') currentmerchantslug: string,
  ) {
    return this.authService
      .loginCustomerWithTel(authLoginTelDto, currentmerchantslug)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Post('loginWithOTP')
  async loginWithOTP(
    @Body() createCustomerDto: CreateCustomerDto,
    @Headers('currentmerchantslug') currentmerchantslug: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService
      .loginWithOTP(createCustomerDto, currentmerchantslug, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Post('loginWithTel')
  async loginWithTel(
    @Body() createCustomerDto: CreateCustomerWithTelDto,
    @Headers('currentmerchantslug') currentmerchantslug: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService
      .loginWithTel(createCustomerDto, currentmerchantslug, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  @Post('verifyOTP')
  async verifyOTP(
    @Body() requestOTPDto: VerifyOTPDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.verifyOTP(requestOTPDto, i18n).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Post('/sendAdminResetPassword')
  @UseFilters(new HttpExceptionFilter())
  sendResetPassword(
    @Body() dto: SendResetPasswordDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return this.authService
      .sendAdminEmailResetPassword(dto, i18n)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(ActJwtGuard)
  @UseInterceptors(HttpPersonalCacheInterceptor)
  @CacheTTL(600)
  @Get()
  async test(@CurrentUser() user: AuthUser) {
    // console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
    return this.userService.showById(user.id).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @Post('login-otp')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  async loginWithPhoneOtp(
    @Request() req,
    @Body() loginWithOtpDto: LoginWithOtpDto,
  ) {
    const appId = req.headers['app-id'];
    return await this.authService.loginWithPhoneNumberOtp(
      loginWithOtpDto,
      appId,
    );
  }

  @Post('logoutWithRefreshToken')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  async logoutWithRefreshToken(@Body() logoutDto: LogoutDto) {
    return this.authService.logoutWithRefreshToken(logoutDto);
  }

  @Post('organization-token')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  async generateOrganizationToken(
    @Body() organizationAuthDto: OrganizationAuthDto,
  ): Promise<OrganizationTokenResponseDto> {
    return this.authService.generateOrganizationToken(organizationAuthDto);
  }

  @Post('login')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiOkRes(ResponseLoginDto)
  async loginWithUsername(
    @Request() req,
    @Body() dto: AuthLoginUsernameDto,
  ): Promise<ResponseLoginDto> {
    const appId = req.headers['app-id'];
    return this.authService.loginWithUsername(dto, appId);
  }
}
