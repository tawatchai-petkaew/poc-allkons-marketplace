import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { ResponseInterceptor } from '../../interceptors/response.interceptors';

import { UserIdentityDocument } from '../../model/user-identity-document.entity';
import { DocumentAttachType } from '../cis/enum/cis.enum';
import {
  ApiCheckIdCard,
  ApiGetIdentityVerification,
  ApiUpdateIdentityVerification,
} from './decorators/user-swagger.decorator';
import { ChangeEmailUserDto } from './dto/change-email-user.dto';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import {
  CheckEmailDto,
  SendEmailDto,
  VerifyEmailDto,
  VerifyEmailOtpAuthCenterDto,
} from './dto/check-email/check-email.dto';
import {
  CheckIdCardDto,
  CheckRegistrationNumberDto,
} from './dto/check-id-card/check-id-card.dto';
import { CreateUserOrganizeDto } from './dto/create-user-organize.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateDraftUserDto } from './dto/draft-user.dto';
import {
  IdentityVerificationDto,
  IdentityVerificationResponseDto,
  UploadIdentityVerificationDto,
} from './dto/identity-verification/identity-verification.dto';
import { SetPasswordUserDto } from './dto/set-password-user.dto';
import { UpdateLastAccessedDto } from './dto/update-last-accessed.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadDocumentCisDto } from './dto/upload-document-to-cis.dto';
import { UserDto } from './dto/user.dto';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { UserService } from './user.service';
import { UserUuidParamDto } from './dto/user-uuid-param.dto';
import { GetIdentityDocumentParamDto } from './dto/get-identity-document-param.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import {
  AccessToken,
  CurrentUser,
  GetPlatform,
} from '@/decorators/request.decorator';
import { AuthUser } from '@/types/request.types';
import { Platform } from '@/model/organization-contact.entity';
import { SendChangeEmailDto } from './dto/send-change-email.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(ActJwtGuard)
  @Put('last-accessed')
  @HttpCode(HttpStatus.OK)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  async updateLastAccessed(
    @Body() dto: UpdateLastAccessedDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.userService.updateLastAccessed(dto);
  }

  @Post('/check-id-card')
  @ApiCheckIdCard()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ResponseInterceptor())
  async checkIdCard(
    @Body() body: CheckIdCardDto,
  ): Promise<{ exists: boolean }> {
    return await this.userService.checkIdCardRegistration(body.idCard);
  }

  @Post('/check-regis-number')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new ResponseInterceptor())
  async checkRegisNumber(
    @Body() body: CheckRegistrationNumberDto,
  ): Promise<{ exists: boolean }> {
    return await this.userService.checkRegisNumberExists(
      body.registrationNumber,
    );
  }
  @UseGuards(ActJwtGuard)
  @Get(':uuid')
  @UseFilters(new HttpExceptionFilter())
  async show(@Param() params: UserUuidParamDto) {
    return await this.userService.showByUuid(params.uuid).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid/user-profile')
  @UseFilters(new HttpExceptionFilter())
  async getUserProfile(@Param() params: UserUuidParamDto) {
    return await this.userService.getUserProfile(params.uuid).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Post('/sendAdminChangeEmail')
  @UseFilters(new HttpExceptionFilter())
  async sendChangeEmail(
    @CurrentUser() user: AuthUser,
    @AccessToken() accessToken: string,
    @Body() dto: SendChangeEmailDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.userService
      .sendAdminChangeEmail(dto, user, accessToken, i18n)
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
  @Put('changeUserPassword')
  @UseFilters(new HttpExceptionFilter())
  async changeUserPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.userService
      .changeUserPassword(dto, user, i18n)
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
  @Put('changeUserEmail')
  @UseFilters(new HttpExceptionFilter())
  async changeUserEmail(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangeEmailUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.userService
      .changeUserEmail(dto, user, i18n)
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
  @Put('changeCustomerPassword')
  @UseFilters(new HttpExceptionFilter())
  async changeCustomerPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordUserDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    return await this.userService
      .changeCustomerPassword(dto, user, i18n)
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
  @Put('setCustomerPassword')
  @UseFilters(new HttpExceptionFilter())
  async setCustomerPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: SetPasswordUserDto,
  ): Promise<any> {
    return await this.userService
      .setCustomerPassword(dto, user)
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
  @Put('setAdminPassword')
  @UseFilters(new HttpExceptionFilter())
  async setAdminPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: SetPasswordUserDto,
  ): Promise<any> {
    return await this.userService.setAdminPassword(dto, user).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Put('verifyAdminEmail')
  @UseFilters(new HttpExceptionFilter())
  async verifyAdminEmail(@CurrentUser() user: AuthUser): Promise<any> {
    return await this.userService.verifyAdminEmail(user).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard)
  @Put('setOnboardingStep')
  @UseFilters(new HttpExceptionFilter())
  async setOnboardingStep(
    @CurrentUser() user: AuthUser,
    @Body() dto: any,
  ): Promise<any> {
    return await this.userService
      .setOnboardingStep(dto.onBoardingStep, user)
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
  @Put(':uuid')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param() params: UserUuidParamDto,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file,
    @I18n() i18n: I18nContext,
  ): Promise<UserDto> {
    return await this.userService
      .update(params.uuid, file, dto, i18n)
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
  @Post(':uuid/update-user-profile')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfile(
    @Param() params: UserUuidParamDto,
    @Body() dto: UpdateUserDto,
    @UploadedFile() imageProfileFile,
  ) {
    return await this.userService.updateUserProfile(
      params.uuid,
      imageProfileFile,
      dto,
    );
  }

  @UseGuards(ActJwtGuard)
  @Put(':uuid/identity-verification')
  @ApiUpdateIdentityVerification()
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateIdentityVerification(
    @Param() params: UserUuidParamDto,
    @Body() dto: IdentityVerificationDto,
    @I18n() i18n: I18nContext,
  ): Promise<UserDto> {
    return await this.userService.updateIdentityVerification(
      params.uuid,
      dto,
      i18n,
    );
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid/identity-verification')
  @ApiGetIdentityVerification()
  @HttpCode(HttpStatus.OK)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getIdentityVerification(
    @Param() params: UserUuidParamDto,
  ): Promise<IdentityVerificationResponseDto> {
    return await this.userService.getIdentityVerification(params.uuid);
  }

  @UseGuards(ActJwtGuard)
  @Post('document-identity-verification')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FileInterceptor('file'), new ResponseInterceptor())
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() dto: UploadIdentityVerificationDto,
  ): Promise<string> {
    return await this.userService.uploadIdentityFile(dto, file);
  }

  @Get(':uuid/attach-documents')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ResponseInterceptor)
  async getIdentityDocuments(
    @Param() params: UserUuidParamDto,
  ): Promise<UserIdentityDocument[]> {
    const documents = await this.userService.getIdentityVerifyDocuments(
      params.uuid,
    );
    return documents;
  }

  @Get(':uuid/attach-documents/:documentId')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  async getIdentityDocument(
    @Param() params: GetIdentityDocumentParamDto,
    @Res() res: Response,
  ): Promise<void> {
    const fileData = await this.userService.getFileDocument(
      params.uuid,
      params.documentId,
    );
    res.set({
      'Content-Type': fileData.fileType,
      'Content-Length': fileData.fileSize.toString(),
      'Content-Disposition': `inline; filename="${fileData.fileName}"`,
    });
    res.send(fileData.fileBuffer);
  }

  @Delete(':uuid/attach-documents/:documentId')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  async deleteIdentityDocument(
    @Param() params: GetIdentityDocumentParamDto,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.userService.deleteIdentityDocument(
      params.uuid,
      params.documentId,
    );
    return result;
  }

  @UseGuards(ActJwtGuard)
  @Post('organizations')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async createOrganization(@Body() body: CreateUserOrganizeDto): Promise<any> {
    return await this.userService.createOrganization(body);
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid/check-platform')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkPlatform(
    @Param() params: UserUuidParamDto,
  ): Promise<{ isSeller: boolean }> {
    return await this.userService.checkPlatform(params.uuid);
  }

  @Post('/check-platform')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkPlatformWithPhoneNumber(
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<{ isSeller: boolean }> {
    return await this.userService.checkPlatformWithPhoneNumber(phoneNumber);
  }

  @UseGuards(ActJwtGuard)
  @Post('otp/verify-email')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async verifyEmailOtp(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ status: string; message: string }> {
    return await this.userService.verifyEmailOtp(dto);
  }

  @UseGuards(ActJwtGuard)
  @Post('otp/send-email')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async sendEmailOtp(
    @Body() dto: SendEmailDto,
  ): Promise<{ status: string; refno: string; method: string }> {
    return await this.userService.sendEmailOtp(dto);
  }

  @UseGuards(ActJwtGuard)
  @Post('otp/auth-center/verify-email')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async verifyEmailOtpAuthCenter(
    @AccessToken() token: string,
    @Body() dto: VerifyEmailOtpAuthCenterDto,
  ): Promise<{ status: string; message: string }> {
    return await this.userService.verifyEmailOtpAuthCenter(dto, token);
  }

  @Post('check-email')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async checkEmail(@Body() dto: CheckEmailDto): Promise<{ exists: boolean }> {
    return await this.userService.checkEmailExists(dto);
  }

  @UseGuards(ActJwtGuard)
  @Delete(':uuid')
  async delete(@Param() params: UserUuidParamDto): Promise<any> {
    return await this.userService.deleteByUuid(params.uuid);
  }

  @Get('draft/kyc')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getDraftUser(@CurrentUser() user: AuthUser) {
    return await this.userService.getDraftUser(user.id);
  }

  @Put('draft/kyc')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async updateDraftUser(
    @CurrentUser() user: AuthUser,
    @Body() updateDraftUserDto: UpdateDraftUserDto,
  ) {
    return await this.userService.updateDraftUser(user.id, updateDraftUserDto);
  }

  @Post('approve/kyc')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async approveKyc(
    @CurrentUser() user: AuthUser,
    @GetPlatform() platform: Platform,
  ) {
    return await this.userService.approveKyc(user.id, platform);
  }

  @Post('draft/upload-document-cis')
  @UseGuards(ActJwtGuard)
  @ApiOperation({ summary: 'Upload documents to CIS' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseInterceptors(FilesInterceptor('files', 6))
  async uploadFileToCis(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadDocumentCisDto,
    @CurrentUser() user: AuthUser,
    @GetPlatform() platform: Platform,
  ): Promise<any> {
    return await this.userService.uploadDocumentToCis(
      dto.documentType,
      files,
      user.id,
      platform,
      dto.attachType,
    );
  }

  @Delete('draft/delete-document-cis')
  @UseGuards(ActJwtGuard)
  @ApiOperation({ summary: 'Delete documents from CIS' })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async deleteDocumentCis(
    @Body() body: { documentIds: string[]; attachType: DocumentAttachType },
    @CurrentUser() user: AuthUser,
    @GetPlatform() platform: Platform,
  ): Promise<any> {
    return await this.userService.deleteDocumentCis(
      body.documentIds,
      platform,
      user.id,
      body.attachType,
    );
  }
}
