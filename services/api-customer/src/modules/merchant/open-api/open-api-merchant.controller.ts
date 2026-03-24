import { ApiKeyGuard } from '@/auth/api-key.guard';
import { Merchant } from '@/model/merchant.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OpenApiMerchantService } from './open-api-merchant.service';

@Controller('v1/merchant')
@ApiTags('Merchant')
@ApiSecurity('X-API-KEY')
export class OpenApiMerchantController {
  constructor(private readonly openApiMerchantService: OpenApiMerchantService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  getCurrentMerchant(): Promise<Merchant> {
    return this.openApiMerchantService.getCurrentMerchant();
  }
}
