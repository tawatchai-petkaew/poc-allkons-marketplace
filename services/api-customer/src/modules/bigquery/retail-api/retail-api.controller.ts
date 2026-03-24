// google-retail/google-retail.controller.ts

import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { RetailApiService } from './retail-api.service';
import { PredictDto } from './dto/predict-dto'
@Controller('retail-api')
export class RetailApiController {
  constructor(
    private readonly retailApiService: RetailApiService
  ) {}

  @Get('list-catalogs')
  async listCatalogs(): Promise<any> {
    // const projectId = 'your-project-id'; // Replace with your actual project ID
    // const location = 'global'; // Replace with your desired location
    const catalogs = await this.retailApiService.listCatalogs();
    return catalogs;
  }

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('pageSize') pageSize: string,
    @Query('filter') filter: string,
    @Query('offset') offset: string,
    @Query('pageToken') pageToken: string,
  ): Promise<any> {
    const catalogs = await this.retailApiService.callSearch({
      query,
      pageSize: +pageSize,
      filter,
      offset: +offset,
      pageToken,
    });

    return catalogs;
  }
}
