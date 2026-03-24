import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { Body, Controller, Post, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiSaveUserConsent } from './decorators/user-consent-swagger.decorator';
import { SaveUserConsentResponseDto } from './dto/save-user-consent-response.dto';
import { SaveUserConsentDto } from './dto/save-user-consent.dto';
import { UserConsentService } from './user-consent.service';

@ApiTags('User Consent')
@Controller('v1/user-consent')
export class UserConsentController {
  constructor(private readonly userConsentService: UserConsentService) {}

  @UseGuards(PublicApiKeyGuard)
  @Post()
  @ApiSaveUserConsent()
  @UseInterceptors(new ResponseInterceptor())
  async saveUserConsent(
    @Body(new ValidationPipe({ transform: true })) saveUserConsentDto: SaveUserConsentDto
  ): Promise<SaveUserConsentResponseDto> {
    return await this.userConsentService.saveUserConsent(saveUserConsentDto);
  }
}
