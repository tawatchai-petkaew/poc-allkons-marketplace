import { Body, Controller, Post, Headers } from '@nestjs/common';

import { BigqueryService } from './bigquery.service';

@Controller('bigquery')
export class BigqueryController {
  constructor(private readonly bigQueryService: BigqueryService) {}

  @Post('event')
  async createEvent(
    @Body() eventData: any,
    @Headers('currentmerchantslug') currentmerchantslug: string
  ) {
    try {
      const response = await this.bigQueryService.insertEvent(eventData, currentmerchantslug);
      return { message: 'Event stored in BigQuery', response };
    } catch (error) {
      return { error: 'Failed to store event', message: error.message };
    }
  }
}
