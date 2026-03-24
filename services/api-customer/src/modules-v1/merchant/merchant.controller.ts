import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBadRequestResponse } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { CurrentMerchant, CurrentUser } from '@/decorators/request.decorator';
import { MerchantGuard } from '../../guard/merchant.guard';
import { AuthUser, RequestMerchant } from '@/types/request.types';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';

@ApiTags('Merchant')
@Controller('v1/merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('current-merchant')
  @UseInterceptors(new ResponseInterceptor())
  @ApiOperation({ summary: 'Get current merchant by slug' })
  @ApiBadRequestResponse({ description: 'Invalid slug format' })
  async getMerchantData(
    @CurrentUser() user: AuthUser,
    @CurrentMerchant() merchant: RequestMerchant,
  ) {
    return this.merchantService.getCurrentMerchantAndTriggerLastAccess({
      slug: merchant.slug,
      userId: user.id,
    });
  }
}
