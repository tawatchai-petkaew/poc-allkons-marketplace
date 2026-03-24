import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ActJwtGuard } from '../../guard/act-jwt.guard';
import { AuthCenterService } from './auth-center.service';
import {
  RegisterPhoneNumberRequestDto,
  RegisterResponseDto,
} from './dtos/register.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenResponse } from './types/auth-center.type';
import { LoginWithOtpDto } from './dtos/login.dto';
import { AccessToken } from '@/decorators/request.decorator';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';

const isSecureCookie = process.env.NODE_ENV === 'production';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authCenterService: AuthCenterService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary:
      'Register account at authCenter and user in system by phone number',
  })
  @ApiCreatedResponse({
    description: 'Register Success',
    type: RegisterResponseDto,
  })
  @Post('register/account-and-user')
  @UseInterceptors(new ResponseInterceptor())
  async register(
    @Body() body: RegisterPhoneNumberRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerUserViaAuthCenter(body);
    this.setAuthCenterCookieResponse({ res, tokenFromAuthCenter: result });
    return new RegisterResponseDto({
      accessToken: result.accessToken,
      akidAccessToken: result.akidAccessToken,
    });
  }

  @Post('login')
  @UseInterceptors(new ResponseInterceptor())
  async login(
    @Req() req: Request,
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokenResponse, userId, userUuid, convertPhoneNumber } =
      await this.authService.loginWithPhoneOrEmail(body);
    const appIdHeader = req.headers['app-id'];
    if (!appIdHeader || Array.isArray(appIdHeader)) {
      throw new BadRequestException('Missing or invalid app-id in header');
    }
    const appId = appIdHeader;
    const revampToken = await this.authService.generateRevampToken(
      appId,
      userId,
      userUuid,
      convertPhoneNumber,
    );
    this.setAuthCenterCookieResponse({
      res,
      tokenFromAuthCenter: tokenResponse,
    });
    return {
      accessToken: revampToken,
      authCenter: {
        accessToken: tokenResponse.accessToken,
      },
    };
  }

  @Post('login-phone-otp')
  @UseInterceptors(new ResponseInterceptor())
  async loginWithPhoneWithOtp(
    @Req() req: Request,
    @Body() body: LoginWithOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokenResponse, userId, userUuid, convertPhoneNumber } =
      await this.authService.loginWithPhoneOtp(body);
    const appIdHeader = req.headers['app-id'];
    if (!appIdHeader || Array.isArray(appIdHeader)) {
      throw new BadRequestException('Missing or invalid app-id in header');
    }
    const appId = appIdHeader;
    const revampToken = await this.authService.generateRevampToken(
      appId,
      userId,
      userUuid,
      convertPhoneNumber,
    );
    this.setAuthCenterCookieResponse({
      res,
      tokenFromAuthCenter: tokenResponse,
    });
    return {
      accessToken: revampToken,
      authCenter: {
        accessToken: tokenResponse.accessToken,
      },
    };
  }

  @Post('refresh')
  @UseInterceptors(new ResponseInterceptor())
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new HttpException(
        { message: 'Refresh token not found', code: 'REFRESH_TOKEN_MISSING' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.authCenterService.refreshToken({ refreshToken });

    this.setAuthCenterCookieResponse({ res, tokenFromAuthCenter: result });

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @UseInterceptors(new ResponseInterceptor())
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      path: '/',
      // domain: process.env.COOKIE_DOMAIN || undefined,
    });
    res.clearCookie('refreshToken', {
      path: '/',
      // domain: process.env.COOKIE_DOMAIN || undefined,
    });

    return {
      message: 'Logged out successfully',
    };
  }

  @UseGuards(ActJwtGuard)
  @Get('account-info')
  @UseInterceptors(new ResponseInterceptor())
  async getAccountInfo(@AccessToken() accessToken: string) {
    const result = await this.authCenterService.getAccountDetail({
      accessToken,
    });
    return result;
  }

  private setAuthCenterCookieResponse({
    res,
    tokenFromAuthCenter,
  }: {
    res: Response;
    tokenFromAuthCenter: TokenResponse;
  }) {
    res.cookie('accessToken', tokenFromAuthCenter.accessToken, {
      httpOnly: true, // ป้องกัน XSS (JS อ่านไม่ได้)
      secure: isSecureCookie, // HTTPS only
      sameSite: isSecureCookie ? 'strict' : 'lax', // ป้องกัน CSRF (กรณีต้องการ เข้าเว็บจาก platform อื่น สามารถประเป็น LAX ได้ เมื่อต้องการ)
      maxAge: tokenFromAuthCenter.expiresIn * 1000, // แปลงเป็น milliseconds
      path: '/',
      // TODO: After clarify domain in any env
      // domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // Set refresh token cookie
    res.cookie('refreshToken', tokenFromAuthCenter.refreshToken, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: isSecureCookie ? 'strict' : 'lax',
      maxAge: tokenFromAuthCenter.refreshExpiresIn * 1000, // แปลงเป็น milliseconds
      // path: '/v1/auth/refresh', // จำกัด path ที่ใช้ได้
      path: '/', // need to allow for SSR
      // TODO: After clarify domain in any env
      // domain: process.env.COOKIE_DOMAIN || undefined,
    });
  }
}
