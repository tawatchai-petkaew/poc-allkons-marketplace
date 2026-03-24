import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../filter/http-exception.filter';
import { ResponseInterceptor } from '../../interceptors/response.interceptors';
import { CisService } from './cis.service';
import { MasterDataRequestDto } from './dto/master-data.dto';

@Controller('v1')
export class CisController {
  constructor(private readonly cisService: CisService) {}

  @Post('master-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get master data from CIS' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Successfully retrieved master data'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters'
  })
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(new ResponseInterceptor())
  async findAllMasterData(
    @Body() request: MasterDataRequestDto
  ) {
    return await this.cisService.findAllMasterData(request.masterCode);
  }
}
