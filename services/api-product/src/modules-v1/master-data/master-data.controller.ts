import { Controller, Get, Query, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { MasterDataType } from '@/model/master-data.entity';
import { HttpExceptionFilter } from 'allkons-api-helper';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

@Controller('v1/master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('')
  @UseGuards(ActJwtGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async getMasterData(
    @Query('type') type: MasterDataType,
  ) {
    return await this.masterDataService.getMasterData(type);
  }
}
