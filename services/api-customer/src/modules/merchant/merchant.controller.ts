import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdateResult } from 'typeorm';

import { RequirePermissions } from '@/auth/decorators/organization-permissions.decorator';
import { OrganizationPermissionGuard } from '@/auth/guards/organization-permission.guard';
import { FlexibleCacheInterceptor } from '@/cache/flexible-cache.interceptor';
import { HttpPersonalCacheInterceptor } from '@/cache/personal-cache.interceptor';
import { ApiOkRes } from '@/decorators/api-ok.decorator';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { BaseQueryDto } from '@/utils/dto/pagination.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ApiBody,
  ApiExcludeController,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import {
  AddUsersToMerchantDto,
  AddUsersToMerchantResponseDto,
} from '../user-merchant/dto/add-user-to-merchant.dto';
import { GetMerchantMembersResponseDto } from '../user-merchant/dto/user-merchant.dto';
import { GetUserOrganizationsResponseDto } from '../user-organization/dto/user-organization.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantDto } from './dto/merchant.dto';
import { updateMerchantInfoDto } from './dto/update-merchant-info.dto';
import { UpdateMerchantMemberDto } from './dto/update-merchant-member.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantService } from './merchant.service';
import { UuidParamDto } from '@/modules/organization/dto/uuid-params.dto';
import { GetMerchantListDto } from './dto/get-merchant-list.dto';
import { DeleteMerchantMemberDto } from './dto/delete-merchant-member.dto';
import { ActJwtGuard } from '@/guard/act-jwt.guard';
import { Merchant } from '@/model';
import { RequestMerchant, RequestOrganization } from '@/types/request.types';
import {
  CurrentMerchant,
  CurrentOrganization,
} from '@/decorators/request.decorator';
import { MerchantGuard } from '@/guard/merchant.guard';
import { UserOrgPermissionGuard } from '@/guard/user-org-permission.guard';

@ApiExcludeController()
@Controller('merchant')
@ApiTags('Merchant')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @UseGuards(ActJwtGuard)
  @Post('list')
  @HttpCode(HttpStatus.OK)
  async showAll(@Body() body: GetMerchantListDto) {
    return await this.merchantService.getAll(body);
  }

  @UseGuards(ActJwtGuard)
  @Post()
  async create(
    @Request() req,
    @Body() body: CreateMerchantDto,
  ): Promise<MerchantDto> {
    return await this.merchantService
      .create(body, req.user.userId)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('apiKey')
  async getApiKey(
    @CurrentMerchant()
    merchant: RequestMerchant,
  ): Promise<any> {
    return await this.merchantService.getApiKey(merchant.id);
  }

  @UseGuards(ActJwtGuard)
  @Get(':uuid')
  @UseFilters(new HttpExceptionFilter())
  async show(@Param() params: UuidParamDto) {
    return await this.merchantService.showByUuid(params.uuid).catch((err) => {
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
  // @CacheTTL(600)
  @Get('/currentMerchant/:slug')
  @UseFilters(new HttpExceptionFilter())
  async showBySlug(
    @Param('slug') slug: string,
    @Request() req,
  ): Promise<MerchantDto> {
    try {
      return await this.merchantService.showCurrentMerchant(
        slug,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/checkSlug/:slug')
  @UseFilters(new HttpExceptionFilter())
  async checkSlug(@Param('slug') slug: string, @I18n() i18n: I18nContext) {
    return await this.merchantService.checkSlug(slug, i18n).catch((err) => {
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
  async update(
    @Request() req,
    @Param() params: UuidParamDto,
    @Body() dto: UpdateMerchantDto,
  ): Promise<MerchantDto> {
    return await this.merchantService
      .update(params.uuid, dto, req.user.userId)
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
  @Delete(':uuid')
  async delete(@Param() params: UuidParamDto): Promise<UpdateResult> {
    return await this.merchantService.delete(params.uuid).catch((err) => {
      throw new HttpException(
        {
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/cronJob/startCreateExpenseBill')
  @UseFilters(new HttpExceptionFilter())
  async startCronJobCreateExpenseBill(
    @CurrentMerchant()
    merchant: RequestMerchant,
  ): Promise<any> {
    return await this.merchantService
      .startCronJobCreateExpenseBill(merchant)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @UseGuards(ActJwtGuard, MerchantGuard)
  @Get('/cronJob/manaulCronJobCreateExpenseBill')
  @UseFilters(new HttpExceptionFilter())
  async manaulCronJobCreateExpenseBill(
    @CurrentMerchant()
    merchant: RequestMerchant,
  ): Promise<any> {
    return await this.merchantService
      .manaulCronJobCreateExpenseBill(merchant)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Post('/manaul/createExpenseBill')
  @UseFilters(new HttpExceptionFilter())
  async manaulCreateExpenseBill(@Body() dto: any): Promise<any> {
    return await this.merchantService
      .manaulCreateExpenseBill(dto)
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Post('/migrate/merchantShipmentOnline')
  @UseFilters(new HttpExceptionFilter())
  async migrateMerchantShipmentOnline(): Promise<any> {
    return await this.merchantService
      .migrateMerchantShipmentOnline()
      .catch((err) => {
        throw new HttpException(
          {
            message: err.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      });
  }

  @Get('/:uuid/members')
  @ApiOperation({ summary: 'Get members of a merchant' })
  @ApiOkRes(GetMerchantMembersResponseDto)
  @ApiQuery({ type: BaseQueryDto })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.view_detail')
  async getMemberMerchant(
    @Param() params: UuidParamDto,
    @Query() query: BaseQueryDto,
  ): Promise<GetMerchantMembersResponseDto> {
    const result = await this.merchantService.getMemberMerchant(
      params.uuid,
      query,
    );
    return result;
  }

  @Get('/:uuid/users/available')
  @ApiOperation({ summary: 'Get available users to add to merchant' })
  @ApiQuery({ type: BaseQueryDto })
  @ApiOkRes(GetUserOrganizationsResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FlexibleCacheInterceptor, new ResponseInterceptor())
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.view_detail')
  async getAvailableUsersForMerchant(
    @Param() params: UuidParamDto,
    @Query() query: BaseQueryDto,
  ): Promise<GetUserOrganizationsResponseDto> {
    return await this.merchantService.getAvailableUsersForMerchant(
      params.uuid,
      query,
    );
  }

  @Post('/users')
  @ApiOperation({
    summary: 'Add users to a merchant with specific roles',
    description:
      "Add multiple users to a merchant. Users must be members of the merchant's organization with ACCEPTED status. Automatically creates Admin records and CIS relationships.",
  })
  @ApiBody({ type: AddUsersToMerchantDto })
  @ApiOkRes(AddUsersToMerchantResponseDto)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.assign_member')
  async addUsersToMerchant(
    @Body() dto: AddUsersToMerchantDto,
  ): Promise<AddUsersToMerchantResponseDto> {
    return await this.merchantService.addUsersToMerchant(dto);
  }

  @Put('/:uuid/info')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.update_member')
  async updateStoreNameAndMerchantInfo(
    @Param() params: UuidParamDto,
    @Body() updateMerchantInfo: updateMerchantInfoDto,
  ) {
    return await this.merchantService.updateMerchantInfo(
      params.uuid,
      updateMerchantInfo,
    );
  }

  @Put('/:uuid/member')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(ActJwtGuard, OrganizationPermissionGuard)
  async updateMerchantMember(
    @CurrentOrganization() organization: RequestOrganization,
    @Param() params: UuidParamDto,
    @Body() updateMerchantMemberDto: UpdateMerchantMemberDto,
  ) {
    return await this.merchantService.updateMerchantMember(
      organization.id,
      params.uuid,
      updateMerchantMemberDto,
    );
  }

  @Delete('/:uuid/:userId/member')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @UseGuards(OrganizationPermissionGuard)
  @RequirePermissions('merchant.delete_member')
  async deleteMerchantMember(@Param() params: DeleteMerchantMemberDto) {
    return await this.merchantService.deleteMerchantMember(
      params.uuid,
      params.userId,
    );
  }

  @Get('/organization/merchant-list')
  @UseGuards(ActJwtGuard, UserOrgPermissionGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  @ApiHeader({
    name: 'organization-uuid',
    required: true,
    description: 'Organization UUID',
  })
  async getMerchantListByOrganization(
    @CurrentOrganization() org: RequestOrganization,
  ): Promise<Merchant[]> {
    return await this.merchantService.getMerchantListByOrganizationId(org.id);
  }
}
