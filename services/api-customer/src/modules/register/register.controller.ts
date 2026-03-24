import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { Platform } from '@/model/organization-contact.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseInterceptor } from '../../interceptors/response.interceptors';
import { OrganizationService } from '../organization/organization.service';
import { UserService } from '../user/user.service';
import {
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
import { RegisterService } from './register.service';
import { RegisterCode } from './enum/response-code.enum';
import { AllExceptionsFilter } from '@/filter/all-exceptions.filter';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { AccessToken, GetPlatform } from '@/decorators/request.decorator';

@ApiTags('Register')
@Controller('v1/register')
@UseFilters(new AllExceptionsFilter())
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register with phone number' })
  @ApiCreatedResponse({
    description: 'Register Success',
    type: responseRegisterDto,
  })
  @UseInterceptors(new ResponseInterceptor())
  async registerWithPhoneNumber(@Body() body: RegisterPhoneNumberDto) {
    const result = await this.registerService.registerWithPhoneNumber(body);
    return result;
  }

  @Post('check-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if phone number exists' })
  @UseInterceptors(new ResponseInterceptor())
  async checkPhoneNumber(
    @Body() body: phoneNumberDto,
  ): Promise<{ code: RegisterCode }> {
    const result = await this.registerService.checkPhoneNumber(body);
    return result;
  }

  @Post('otp/send-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SMS OTP' })
  @UseInterceptors(new ResponseInterceptor())
  async sendSmsOtp(@Body() bodyDto: phoneNumberDto) {
    const result = await this.registerService.sendSmsOtp(bodyDto);
    return result;
  }

  @Post('otp/verify-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SMS OTP' })
  @UseInterceptors(new ResponseInterceptor())
  async verifySmsOtp(@Body() bodyDto: verifyOtpSmsDto) {
    const result = await this.registerService.verifySmsOtp(bodyDto);
    return result;
  }

  @Post('id-card/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check Id card' })
  @UseInterceptors(new ResponseInterceptor())
  async checkIdCard(@Body() body: { idCard: string }) {
    const result = await this.userService.findByIdCard(body.idCard);
    return { isExist: result ? true : false };
  }

  @Post('tax-id/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check Id card' })
  @UseInterceptors(new ResponseInterceptor())
  async checkTaxId(@Body() body: { taxId: string }) {
    const result = await this.organizationService.findByTaxId(body.taxId);
    return { isExist: result ? true : false };
  }

  @Post('merchant')
  @ApiOperation({ summary: 'Create merchant' })
  @UseInterceptors(new ResponseInterceptor())
  async createMerchant(@Body() body: CreateShopDto) {
    const result = await this.registerService.createMerchant(body);
    return result;
  }

  @Delete('clear-registered/:tel')
  @ApiOperation({
    summary: 'remove registered user by tel number for testing register',
  })
  @UseInterceptors(new ResponseInterceptor())
  async clearRegistered(
    @Param('tel') tel: string,
    @Query('isDev') isDev?: boolean,
  ) {
    const result = await this.registerService.deleteUserByTel(tel, isDev);
    return result;
  }

  @Post('account')
  @ApiOperation({ summary: 'Create account' })
  @UseInterceptors(new ResponseInterceptor())
  async createAccount(@Body() body: RegisterPhoneNumberDto) {
    const result = await this.registerService.createAccount(body);
    return result;
  }

  @Post('user-profile')
  @UseGuards(ActJwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create user profile' })
  @UseInterceptors(new ResponseInterceptor())
  async createUserProfile(
    @AccessToken() token: string,
    @Body() body: CreateUserProfileDto,
  ) {
    const result = await this.registerService.createUserProfile(body, token);
    return result;
  }

  @Get('user-profile')
  @UseInterceptors(new ResponseInterceptor())
  // @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  // @CacheKeyFrom((req) => {
  //   const { countryCode = '', phoneNumber = '' } = req.query || {};
  //   if (!countryCode || !phoneNumber) return undefined;
  //   const appId = req.headers?.['app-id'] || '';
  //   return `register:user-profile:cc:${countryCode}:pn:${phoneNumber}:app:${appId}`;
  // })
  // @CacheTTL(600)
  async getUserProfileByPhone(@Query() dto: phoneNumberDto) {
    const result = dto.email
      ? await this.registerService.getUserProfileByEmail(
          dto.countryCode,
          dto.email,
        )
      : await this.registerService.getUserProfile(
          dto.countryCode,
          dto.phoneNumber,
        );
    return result;
  }

  @Post('organization-profile')
  @ApiOperation({ summary: 'Create organization profile' })
  @UseGuards(ActJwtGuard)
  @UseInterceptors(new ResponseInterceptor())
  async createOrganizationProfile(
    @GetPlatform() platform: Platform,
    @Body() body: any,
  ) {
    // const platform: Platform = platform || Platform.SELLER;
    const result = await this.registerService.createOrganizationProfile(
      body,
      platform || Platform.SELLER,
    );
    return result;
  }

  @Patch('registration-status')
  @ApiOperation({ summary: 'Update user registration step and status' })
  @ApiOkResponse({
    description: 'User registration status updated successfully',
    type: ResponseRegisterUserDto,
  })
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(PublicApiKeyGuard)
  async updateUserRegistrationStatus(
    @Body() body: UpdateUserRegistrationDto,
  ): Promise<{ success: boolean; successMessage?: string }> {
    const result =
      await this.registerService.updateUserRegistrationStatus(body);
    return result;
  }
}
