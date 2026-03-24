import { PublicApiKeyGuard } from '@/auth/api-key.guard';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { Body, Controller, Post, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiSaveOrganizationConsent } from './decorators/organization-consent-swagger.decorator';
import { SaveOrganizationConsentResponseDto } from './dto/save-organization-consent-response.dto';
import { SaveOrganizationConsentDto } from './dto/save-organization-consent.dto';
import { OrganizationConsentService } from './organization-consent.service';

@ApiTags('Organization Consent')
@Controller('v1/organization-consent')
export class OrganizationConsentController {
  constructor(private readonly organizationConsentService: OrganizationConsentService) {}

  @UseGuards(PublicApiKeyGuard)
  @Post()
  @ApiSaveOrganizationConsent()
  @UseInterceptors(new ResponseInterceptor())
  async saveOrganizationConsent(
    @Body(new ValidationPipe({ transform: true })) saveOrganizationConsentDto: SaveOrganizationConsentDto
  ): Promise<SaveOrganizationConsentResponseDto> {
    return this.organizationConsentService.saveOrganizationConsent(saveOrganizationConsentDto);
  }
}
